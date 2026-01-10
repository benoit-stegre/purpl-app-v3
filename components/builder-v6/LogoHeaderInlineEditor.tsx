'use client'

import React, { useRef, useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { DesignConfigV6, LogoItem as LogoItemType } from '@/types/design-v6'
import { ImageEditor } from '@/components/shared/ImageEditor'
import FloatingToolbar from './FloatingToolbar'
import SidePanel from './SidePanel'
import { useInlineEditor } from '@/hooks/useInlineEditor'
import { addColorToPalette } from '@/lib/addColorToPalette'
import { getStandardToolbarPosition } from '@/lib/utils/toolbarPosition'
import { compressImageWithMetadata, validateImageFile } from '@/lib/utils/image'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/shared/ConfirmModal'

const DEFAULT_LOGO_CADRE = {
  enabled: false,
  backgroundColor: 'transparent',
  borderRadius: 8,
  borderRadiusEnabled: false,  // ✅ Par défaut, arrondi désactivé
  syncWithGlobal: true,  // ✅ Par défaut, synchronisé avec les autres images
  padding: 16,
  border: {
    enabled: false,
    color: '#000000',
    width: 2
  }
}

interface LogoHeaderInlineEditorProps {
  designConfig: DesignConfigV6
  onUpdate: (updates: Partial<DesignConfigV6>) => void
  concertationId: string
}

interface SortableLogoProps {
  logo: LogoItemType
  isActive: boolean
  maxWidth: number
  onUpdate: (updatedLogo: LogoItemType) => void
  onClick: () => void
  onDelete: () => void
  canDelete: boolean
}

function SortableLogo({ 
  logo, 
  isActive,
  maxWidth,
  onUpdate,
  onClick,
  onDelete,
  canDelete
}: SortableLogoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: logo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const alignment = logo.alignment || 'center'

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="relative group"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute left-[-27px] top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Déplacer le logo"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Conteneur avec alignement appliqué */}
      <div
        style={{
          width: maxWidth + 'px',
          textAlign: alignment,
          lineHeight: 0
        }}
      >
        <ImageEditor
          image={logo}
          onUpdate={onUpdate}
          maxWidth={maxWidth}
          isActive={isActive}
          onActivate={onClick}
          onDeactivate={() => {}}
        />
      </div>

      {canDelete && (
        <button
          onClick={onDelete}
          className="absolute right-[-28px] top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Supprimer le logo"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export default function LogoHeaderInlineEditor({
  designConfig,
  onUpdate,
  concertationId
}: LogoHeaderInlineEditorProps) {
  
  // ✅ Fonction pour toggle la synchronisation avec les réglages globaux
  const handleToggleSyncWithGlobal = () => {
    if (!activeLogoId || !activeLogo) return
    
    const currentCadre = activeLogo.cadre
    if (!currentCadre) return
    
    // Toggle l'état de synchronisation pour ce logo uniquement
    const newSyncState = currentCadre.syncWithGlobal === false ? true : false
    
    const updatedLogos = logos.map(logo => {
      if (logo.id === activeLogoId) {
        return {
          ...logo,
          cadre: {
            ...logo.cadre,
            syncWithGlobal: newSyncState
          }
        }
      }
      return logo
    })
    
    // Si on synchronise, appliquer les réglages globaux (d'un autre logo synchronisé ou de la photo)
    if (newSyncState) {
      // Trouver un autre logo synchronisé (pas celui qu'on modifie) ou la photo pour récupérer les réglages globaux
      const globalCadre = logos.find(l => l.id !== activeLogoId && l.cadre?.syncWithGlobal !== false)?.cadre || 
                         designConfig.photo?.cadre
      
      if (globalCadre) {
        const updatedLogosWithSync = updatedLogos.map(logo => {
          if (logo.id === activeLogoId) {
            return {
              ...logo,
              cadre: {
                ...logo.cadre,
                syncWithGlobal: true,
                backgroundColor: globalCadre.backgroundColor,
                borderRadius: globalCadre.borderRadius,
                borderRadiusEnabled: globalCadre.borderRadiusEnabled,
                border: {
                  ...logo.cadre?.border,
                  enabled: globalCadre.border?.enabled || false,
                  color: globalCadre.border?.color || '#000000',
                  width: globalCadre.border?.width || 2
                }
              }
            }
          }
          return logo
        })
        onUpdate({ logoHeader: updatedLogosWithSync })
        return
      }
      // Si aucun autre logo synchronisé ni photo, garder les réglages actuels du logo
    }
    
    onUpdate({ logoHeader: updatedLogos })
  }
  
  const containerRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const sidePanelRef = useRef<HTMLDivElement>(null)
  const justClickedLogoRef = useRef(false)
  
  const { 
    activeRubrique, 
    activateRubrique, 
    deactivateRubrique,
    toolbarPosition, 
    setToolbarPosition,
    sidePanelOpen, 
    setSidePanelOpen,
    sidePanelType,
    setSidePanelType
  } = useInlineEditor()

  const [activeLogoId, setActiveLogoId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [tempBackgroundColor, setTempBackgroundColor] = useState<string | null>(null)
  const [tempBorderColor, setTempBorderColor] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [logoToDelete, setLogoToDelete] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const logos = designConfig.logoHeader.sort((a, b) => a.order - b.order)
  const isActive = activeRubrique === 'logoHeader'
  const activeLogo = logos.find(l => l.id === activeLogoId)

  const PHONE_WIDTH = 309

  const getMaxLogoWidth = (logoCount: number, logoIndex?: number) => {
    if (logoCount === 1) return PHONE_WIDTH
    if (logoCount === 2) {
      const totalWidth = logos.reduce((sum, l) => sum + l.displayWidth, 0)
      if (logoIndex !== undefined) {
        const logo = logos[logoIndex]
        const proportion = logo.displayWidth / totalWidth
        return Math.floor(PHONE_WIDTH * proportion) - 8
      }
      return Math.floor(PHONE_WIDTH / 2) - 8
    }
    return PHONE_WIDTH
  }

  const handleContainerClick = () => {
    if (!isActive) {
      if (logos.length > 0) {
        setActiveLogoId(logos[0].id)
      }
      // Essayer de définir la position immédiatement (synchrone)
      const position = getStandardToolbarPosition()
      if (position) {
        setToolbarPosition(position)
      }
      activateRubrique('logoHeader')
    }
  }

  const handleLogoClick = (logoId: string) => {
    justClickedLogoRef.current = true
    
    flushSync(() => {
      setActiveLogoId(logoId)
    })
    
    // Essayer de définir la position immédiatement (synchrone)
    const position = getStandardToolbarPosition()
    if (position) {
      setToolbarPosition(position)
    }
    activateRubrique('logoHeader')
  }

  // Mettre à jour la position quand la rubrique devient active
  useEffect(() => {
    if (!isActive) return

    const updatePosition = () => {
      const position = getStandardToolbarPosition()
      if (position) {
        setToolbarPosition(position)
      }
    }

    // Essayer immédiatement
    updatePosition()

    const timeoutId = setTimeout(updatePosition, 50)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isActive, setToolbarPosition]) // Retirer toolbarPosition des dépendances pour éviter la boucle infinie

  const handleLogoUpdate = (logoId: string, updatedLogo: LogoItemType) => {
    const newLogos = logos.map(l => {
      if (l.id === logoId) {
        // ✅ Préserver alignment et cadre : utiliser les nouvelles valeurs si présentes, sinon garder les anciennes
        return { 
          ...updatedLogo, 
          order: l.order, 
          alignment: updatedLogo.alignment ?? l.alignment, 
          cadre: updatedLogo.cadre ?? l.cadre 
        }
      }
      return l
    })
    onUpdate({ logoHeader: newLogos })
  }

  const handleDeleteLogo = (logoId: string) => {
    const newLogos = logos
      .filter(l => l.id !== logoId)
      .map((l, i) => ({ ...l, order: i }))
    
    if (activeLogoId === logoId) {
      setActiveLogoId(null)
      deactivateRubrique()
    }
    
    onUpdate({ logoHeader: newLogos })
  }

  const handleResetLogo = (logoId: string) => {
    const logo = logos.find(l => l.id === logoId)
    if (!logo) return

    const aspectRatio = logo.sourceWidth / logo.sourceHeight
    const maxLogoWidth = getMaxLogoWidth(logos.length, logos.findIndex(l => l.id === logoId))
    
    let displayWidth = logo.sourceWidth
    let displayHeight = logo.sourceHeight
    
    if (displayWidth > maxLogoWidth) {
      displayWidth = maxLogoWidth
      displayHeight = Math.round(displayWidth / aspectRatio)
    }
    
    const resetLogo: LogoItemType = {
      ...logo,
      crop: { x: 0, y: 0, width: logo.sourceWidth, height: logo.sourceHeight },
      displayWidth,
      displayHeight
    }
    
    const newLogos = logos.map(l => 
      l.id === logoId ? resetLogo : l
    )
    onUpdate({ logoHeader: newLogos })
  }

  const handleDeleteClick = (logoId: string) => {
    setLogoToDelete(logoId)
    setDeleteModalOpen(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = logos.findIndex(l => l.id === active.id)
      const newIndex = logos.findIndex(l => l.id === over.id)
      
      const reorderedLogos = arrayMove(logos, oldIndex, newIndex).map((logo, i) => ({
        ...logo,
        order: i
      }))
      
      onUpdate({ logoHeader: reorderedLogos })
    }
  }

  const handleUploadClick = () => {
    setSidePanelType('upload')
    setSidePanelOpen(true)
  }

  const handleCropClick = () => {
  }

  const handleAlignClick = () => {
    setSidePanelType('logo-alignment' as any)
    setSidePanelOpen(true)
  }

  const handleLogoAlignChange = (alignment: 'left' | 'center' | 'right') => {
    if (!activeLogoId) return
    
    const newLogos = logos.map(l => 
      l.id === activeLogoId ? { ...l, alignment } : l
    )
    
    onUpdate({ logoHeader: newLogos })
  }

  const handleCadreClick = () => {
    if (!activeLogoId && logos.length > 0) {
      setActiveLogoId(logos[0].id)
    }
    setSidePanelType('cadre')
    setSidePanelOpen(true)
  }

  const handleCadreToggle = () => {
    if (!activeLogoId) return
    
    const newLogos = logos.map(l => {
      if (l.id === activeLogoId) {
        return {
          ...l,
          cadre: {
            enabled: false,
            backgroundColor: 'transparent',
            borderRadius: l.cadre?.borderRadius || 8,
            padding: l.cadre?.padding || 16,
            border: {
              enabled: !l.cadre?.border?.enabled,
              color: l.cadre?.border?.color || '#000000',
              width: l.cadre?.border?.width || 2
            }
          }
        }
      }
      return l
    })
    
    onUpdate({ logoHeader: newLogos })
  }

  const handleCadreChange = (cadreUpdates: any) => {
    if (!activeLogoId || !activeLogo) return
    
    // ✅ Stocker les couleurs modifiées pour les ajouter à la palette à la fermeture
    if (cadreUpdates.backgroundColor && cadreUpdates.backgroundColor !== activeLogo?.cadre?.backgroundColor) {
      setTempBackgroundColor(cadreUpdates.backgroundColor)
    }
    
    if (cadreUpdates.border?.color && cadreUpdates.border.color !== activeLogo?.cadre?.border?.color) {
      setTempBorderColor(cadreUpdates.border.color)
    }
    
    const currentCadre = activeLogo.cadre
    const isSynced = currentCadre?.syncWithGlobal !== false
    
    // Construire le nouveau cadre pour l'image active
    const newCadre = {
      enabled: false,
      backgroundColor: 'transparent',
      ...currentCadre,
      ...cadreUpdates,
      border: {
        ...currentCadre?.border,
        ...cadreUpdates.border
      }
    }
    
    // Si l'image est synchronisée, appliquer les changements à toutes les images synchronisées
    if (isSynced) {
      const newLogos = logos.map(l => {
        // Appliquer à toutes les images synchronisées (y compris celle active)
        if (l.cadre?.syncWithGlobal !== false) {
          return {
            ...l,
            cadre: {
              ...l.cadre,
              backgroundColor: newCadre.backgroundColor,
              borderRadius: newCadre.borderRadius,
              borderRadiusEnabled: newCadre.borderRadiusEnabled,
              border: {
                ...l.cadre?.border,
                enabled: newCadre.border?.enabled || false,
                color: newCadre.border?.color || '#000000',
                width: newCadre.border?.width || 2
              }
            }
          }
        }
        return l
      })
      
      // Appliquer aussi à la photo si elle est synchronisée
      const updatedPhoto = designConfig.photo?.cadre?.syncWithGlobal !== false ? {
        ...designConfig.photo,
        cadre: {
          ...designConfig.photo.cadre,
          backgroundColor: newCadre.backgroundColor,
          borderRadius: newCadre.borderRadius,
          borderRadiusEnabled: newCadre.borderRadiusEnabled,
          border: {
            ...designConfig.photo.cadre?.border,
            enabled: newCadre.border?.enabled || false,
            color: newCadre.border?.color || '#000000',
            width: newCadre.border?.width || 2
          }
        }
      } : designConfig.photo
      
      onUpdate({ 
        logoHeader: newLogos,
        ...(updatedPhoto && { photo: updatedPhoto })
      })
    } else {
      // Si l'image est indépendante, mettre à jour seulement cette image
      const newLogos = logos.map(l => {
        if (l.id === activeLogoId) {
          return {
            ...l,
            cadre: newCadre
          }
        }
        return l
      })
      
      onUpdate({ logoHeader: newLogos })
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploadError(null)
    
    const validationError = validateImageFile(file, ['.jpg', '.jpeg', '.png', '.svg', '.webp'], 5 * 1024 * 1024)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    setUploading(true)

    try {
      const result = await compressImageWithMetadata(file, 2000, 2000)
      const compressedFile = new File([result.blob], file.name, { type: 'image/webp' })

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('concertationId', concertationId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      if (activeLogoId) {
        const oldLogo = logos.find(l => l.id === activeLogoId)!
        const maxLogoWidth = getMaxLogoWidth(logos.length, logos.findIndex(l => l.id === activeLogoId))
        
        let displayWidth = result.displayWidth
        let displayHeight = result.displayHeight
        
        if (displayWidth > maxLogoWidth) {
          const aspectRatio = result.sourceWidth / result.sourceHeight
          displayWidth = maxLogoWidth
          displayHeight = Math.round(displayWidth / aspectRatio)
        }
        
        const replacedLogo: LogoItemType = {
          id: oldLogo.id,
          url: data.url,
          sourceWidth: result.sourceWidth,
          sourceHeight: result.sourceHeight,
          displayWidth,
          displayHeight,
          crop: { x: 0, y: 0, width: result.sourceWidth, height: result.sourceHeight },
          order: oldLogo.order,
          alignment: oldLogo.alignment,
          cadre: oldLogo.cadre || DEFAULT_LOGO_CADRE  // ✅ Préserver le cadre existant ou utiliser le défaut
        }
        
        const newLogos = logos.map(l => 
          l.id === activeLogoId ? replacedLogo : l
        )
        onUpdate({ logoHeader: newLogos })
      } else {
        const newLogoId = 'logo-' + Date.now()
        const maxLogoWidth = logos.length === 0 ? PHONE_WIDTH : Math.floor(PHONE_WIDTH / 2) - 8
        
        let displayWidth = result.displayWidth
        let displayHeight = result.displayHeight
        
        if (displayWidth > maxLogoWidth) {
          const aspectRatio = result.sourceWidth / result.sourceHeight
          displayWidth = maxLogoWidth
          displayHeight = Math.round(displayWidth / aspectRatio)
        }
        
        const placeholderLogo: LogoItemType = {
          id: newLogoId,
          url: data.url,
          sourceWidth: result.sourceWidth,
          sourceHeight: result.sourceHeight,
          displayWidth,
          displayHeight,
          crop: { x: 0, y: 0, width: result.sourceWidth, height: result.sourceHeight },
          order: logos.length,
          cadre: DEFAULT_LOGO_CADRE  // ✅ Nouveau logo : utiliser le cadre par défaut avec syncWithGlobal: true
        }

        onUpdate({ logoHeader: [...logos, placeholderLogo] })
        setActiveLogoId(newLogoId)
      }

      setSidePanelOpen(false)
    } catch (err) {
      setUploadError('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = () => {
    if (activeLogoId) {
      setLogoToDelete(activeLogoId)
      setDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = () => {
    if (logoToDelete) {
      handleDeleteLogo(logoToDelete)
      setSidePanelOpen(false)
      setDeleteModalOpen(false)
      setLogoToDelete(null)
    }
  }

  const handleClose = () => {
    deactivateRubrique()
    setSidePanelOpen(false)
    setActiveLogoId(null)
  }

  // ✅ Ajouter les couleurs utilisées dans le cadre à la palette à la fermeture du panel
  useEffect(() => {
    if (!sidePanelOpen && isActive) {
      let newColors = [...designConfig.projectColors]
      
      if (tempBackgroundColor) {
        newColors = addColorToPalette(newColors, tempBackgroundColor)
        setTempBackgroundColor(null)
      }
      if (tempBorderColor) {
        newColors = addColorToPalette(newColors, tempBorderColor)
        setTempBorderColor(null)
      }
      
      if (newColors.length !== designConfig.projectColors.length) {
        onUpdate({ projectColors: newColors })
      }
    }
  }, [sidePanelOpen, isActive, designConfig.projectColors, tempBackgroundColor, tempBorderColor, onUpdate])

  useEffect(() => {
    if (justClickedLogoRef.current) {
      requestAnimationFrame(() => {
        justClickedLogoRef.current = false
      })
    }
  }, [isActive])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isActive) return
      
      const target = event.target as Node
      const targetElement = event.target as HTMLElement
      
      if (justClickedLogoRef.current) {
        justClickedLogoRef.current = false
        return
      }
      
      if (targetElement?.classList?.contains('crop-handle') || 
          targetElement?.classList?.contains('resize-handle') ||
          targetElement?.closest('.crop-handle') ||
          targetElement?.closest('.resize-handle')) {
        return
      }
      
      const clickedInContainer = containerRef.current?.contains(target)
      const clickedInToolbar = toolbarRef.current?.contains(target)
      const clickedInSidePanel = sidePanelRef.current?.contains(target)

      if (clickedInContainer || clickedInToolbar || clickedInSidePanel) {
        return
      }

      if (sidePanelOpen) {
        setSidePanelOpen(false)
      } else {
        deactivateRubrique()
        setActiveLogoId(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isActive, sidePanelOpen])

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-[80px]"
      onClick={handleContainerClick}
    >
      {logos.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={logos.map(l => l.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex items-center justify-start gap-4 flex-wrap">
              {logos.map((logo, index) => (
                <SortableLogo
                  key={logo.id}
                  logo={logo}
                  isActive={activeLogoId === logo.id}
                  maxWidth={getMaxLogoWidth(logos.length, index)}
                  onUpdate={(updatedLogo) => handleLogoUpdate(logo.id, updatedLogo)}
                  onClick={() => handleLogoClick(logo.id)}
                  onDelete={() => handleDeleteClick(logo.id)}
                  canDelete={logos.length > 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="w-full h-20" />
      )}

      {isActive && toolbarPosition && (
        <div ref={toolbarRef}>
          <FloatingToolbar
            position={toolbarPosition}
            mode="image"
            onUploadClick={handleUploadClick}
            onImageAlignClick={handleAlignClick}
            onImageCadreClick={handleCadreClick}
            imageCadreEnabled={false}
            onClose={handleClose}
          />
        </div>
      )}

      {isActive && sidePanelOpen && toolbarPosition && (
        <div ref={sidePanelRef}>
          <SidePanel
            type={sidePanelType}
            position={toolbarPosition}
            currentImageUrl={activeLogo?.url}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            acceptedFormats={['.jpg', '.jpeg', '.png', '.svg', '.webp']}
            maxSize={5 * 1024 * 1024}
            uploadError={uploadError}
            logoAlignment={activeLogo?.alignment}
            onLogoAlignChange={handleLogoAlignChange}
            cadre={sidePanelType === 'cadre' ? (activeLogo?.cadre || DEFAULT_LOGO_CADRE) : undefined}
            isLogoMode={true}
            projectColors={designConfig.projectColors}
            onCadreToggle={handleCadreToggle}
            onCadreChange={handleCadreChange}
            onToggleSyncWithGlobal={handleToggleSyncWithGlobal}
            onClose={() => setSidePanelOpen(false)}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setLogoToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le logo"
        message="Êtes-vous sûr de vouloir supprimer ce logo ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
      />
    </div>
  )
}
