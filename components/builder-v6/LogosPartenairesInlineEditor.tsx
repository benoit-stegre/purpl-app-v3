'use client'

import React, { useRef, useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { DesignConfigV6, LogoItem as LogoItemType } from '@/types/design-v6'
import LogoItemWithCrop from './LogoItemWithCrop'
import FloatingToolbar from './FloatingToolbar'
import SidePanel from './SidePanel'
import { useInlineEditor } from '@/hooks/useInlineEditor'
import { addColorToPalette } from '@/lib/addColorToPalette'
import { getStandardToolbarPosition } from '@/lib/utils/toolbarPosition'
import { compressImageWithMetadata, validateImageFile } from '@/lib/utils/image'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Plus } from 'lucide-react'
import ConfirmModal from '@/components/shared/ConfirmModal'

const DEFAULT_LOGO_CADRE = {
  enabled: false,
  backgroundColor: 'transparent',
  borderRadius: 8,
  padding: 16,
  border: {
    enabled: false,
    color: '#000000',
    width: 2
  }
}

// Constantes pour les logos partenaires
const MAX_LOGOS = 4
const MIN_LOGO_SIZE = 45  // Taille minimum pour rester lisible (px)
const MAX_LOGO_SIZE = 60  // Taille maximum pour logos partenaires (px)
const PHONE_WIDTH = 309   // Largeur disponible dans le téléphone

interface LogosPartenairesInlineEditorProps {
  designConfig: DesignConfigV6
  onUpdate: (updates: Partial<DesignConfigV6>) => void
  concertationId: string
}

interface SortableLogoProps {
  logo: LogoItemType
  isActive: boolean
  maxWidth: number
  onResize: (newWidth: number, newHeight: number) => void
  onCropSave: (logoData: any) => void
  onClick: () => void
  onDelete: () => void
  canDelete: boolean
}

function SortableLogo({ 
  logo, 
  isActive,
  maxWidth,
  onResize,
  onCropSave,
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

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="relative group flex items-center"
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

      <LogoItemWithCrop
        logo={logo}
        isActive={isActive}
        maxWidth={maxWidth}
        onResize={onResize}
        onCropSave={onCropSave}
        onClick={onClick}
        onDelete={onDelete}
        showResizeHandles={false}
      />

      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute right-[-28px] top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Supprimer le logo"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export default function LogosPartenairesInlineEditor({
  designConfig,
  onUpdate,
  concertationId
}: LogosPartenairesInlineEditorProps) {
  
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
  const [isAddingNewLogo, setIsAddingNewLogo] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [logoToDelete, setLogoToDelete] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const logos = designConfig.logosPartenaires.sort((a, b) => a.order - b.order)
  const isActive = activeRubrique === 'logosPartenaires'
  const activeLogo = logos.find(l => l.id === activeLogoId)

  /**
   * Calcule la taille max d'un logo partenaire
   * - Maximum 4 logos
   * - Disposition sur 2 lignes max (2 logos par ligne)
   * - Taille entre 45px et 60px pour rester lisible
   */
  const getMaxLogoWidth = (logoCount: number): number => {
    // Pour les logos partenaires, on veut toujours une taille fixe entre MIN et MAX
    // qui permet de mettre 2 logos par ligne
    const gap = 16 // gap-4 = 16px
    const padding = 24 // padding container estimé
    const availableWidth = PHONE_WIDTH - padding - gap
    const maxWidthForTwoPerLine = Math.floor(availableWidth / 2)
    
    // Limiter entre MIN et MAX pour garder la lisibilité
    const calculatedWidth = Math.min(maxWidthForTwoPerLine, MAX_LOGO_SIZE)
    return Math.max(calculatedWidth, MIN_LOGO_SIZE)
  }

  const handleContainerClick = () => {
    if (!isActive) {
      // Si on a des logos, activer le premier automatiquement
      if (logos.length > 0) {
        setActiveLogoId(logos[0].id)
      }
      // Essayer de définir la position immédiatement (synchrone)
      const position = getStandardToolbarPosition()
      if (position) {
        setToolbarPosition(position)
      }
      activateRubrique('logosPartenaires')
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
    activateRubrique('logosPartenaires')
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

    // Si la position n'est pas déjà définie, essayer de la trouver
    if (!toolbarPosition) {
      updatePosition()
    }

    const timeoutId = setTimeout(updatePosition, 50)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isActive, setToolbarPosition]) // Retirer toolbarPosition des dépendances pour éviter la boucle infinie

  const handleLogoResize = (logoId: string, newWidth: number, newHeight: number) => {
    // Limiter la taille entre MIN et MAX
    const maxWidth = getMaxLogoWidth(logos.length)
    const constrainedWidth = Math.min(Math.max(newWidth, MIN_LOGO_SIZE), maxWidth)
    const aspectRatio = newHeight / newWidth
    const constrainedHeight = Math.round(constrainedWidth * aspectRatio)

    const newLogos = logos.map(l => 
      l.id === logoId ? { ...l, displayWidth: constrainedWidth, displayHeight: constrainedHeight } : l
    )
    onUpdate({ logosPartenaires: newLogos })
  }

  const handleCropSave = (logoId: string, logoData: any) => {
    // Si logoData est un LogoItem complet (nouveau système)
    if (logoData.sourceWidth !== undefined && logoData.displayWidth !== undefined) {
      // Limiter la taille display
      const maxWidth = getMaxLogoWidth(logos.length)
      let displayWidth = logoData.displayWidth
      let displayHeight = logoData.displayHeight

      if (displayWidth > maxWidth) {
        const aspectRatio = logoData.sourceWidth / logoData.sourceHeight
        displayWidth = maxWidth
        displayHeight = Math.round(displayWidth / aspectRatio)
      } else if (displayWidth < MIN_LOGO_SIZE) {
        const aspectRatio = logoData.sourceWidth / logoData.sourceHeight
        displayWidth = MIN_LOGO_SIZE
        displayHeight = Math.round(displayWidth / aspectRatio)
      }

      const newLogos = logos.map(l => 
        l.id === logoId ? { ...logoData, id: logoId, order: l.order, displayWidth, displayHeight } : l
      )
      onUpdate({ logosPartenaires: newLogos })
    } else {
      // Ancien système (cropData uniquement)
      const newLogos = logos.map(l => 
        l.id === logoId ? { ...l, crop: logoData } : l
      )
      onUpdate({ logosPartenaires: newLogos })
    }
  }

  const handleDeleteLogo = (logoId: string) => {
    setLogoToDelete(logoId)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!logoToDelete) return

    const newLogos = logos
      .filter(l => l.id !== logoToDelete)
      .map((l, i) => ({ ...l, order: i }))
    
    if (activeLogoId === logoToDelete) {
      setActiveLogoId(null)
      deactivateRubrique()
    }
    
    onUpdate({ logosPartenaires: newLogos })
    setDeleteModalOpen(false)
    setLogoToDelete(null)
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
      
      onUpdate({ logosPartenaires: reorderedLogos })
    }
  }

  const handleUploadClick = () => {
    // Vérifier la limite de 4 logos
    if (logos.length >= MAX_LOGOS) {
      alert(`Maximum ${MAX_LOGOS} logos partenaires autorisés. Supprimez un logo avant d'en ajouter un nouveau.`)
      return
    }
    setSidePanelType('upload')
    setSidePanelOpen(true)
  }

  const handleAddButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Empêcher le clic de se propager au container
    
    // Vérifier la limite de 4 logos
    if (logos.length >= MAX_LOGOS) {
      alert(`Maximum ${MAX_LOGOS} logos partenaires autorisés. Supprimez un logo avant d'en ajouter un nouveau.`)
      return
    }

    // Marquer qu'on ajoute un nouveau logo (pas de remplacement)
    setIsAddingNewLogo(true)

    // Activer la rubrique si elle n'est pas active
    if (!isActive) {
      activateRubrique('logosPartenaires')
      
      // Attendre un peu que la rubrique soit activée avant d'ouvrir le panel
      setTimeout(() => {
        setSidePanelType('upload')
        setSidePanelOpen(true)
      }, 100)
    } else {
      // Rubrique déjà active, ouvrir directement le panel d'upload
      setSidePanelType('upload')
      setSidePanelOpen(true)
    }
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
    
    onUpdate({ logosPartenaires: newLogos })
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
    
    onUpdate({ logosPartenaires: newLogos })
  }

  const handleCadreChange = (cadreUpdates: any) => {
    if (!activeLogoId) return
    
    if (cadreUpdates.border?.color && cadreUpdates.border.color !== activeLogo?.cadre?.border?.color) {
      setTempBorderColor(cadreUpdates.border.color)
    }
    
    const newLogos = logos.map(l => {
      if (l.id === activeLogoId) {
        return {
          ...l,
          cadre: {
            enabled: false,
            backgroundColor: 'transparent',
            ...l.cadre,
            ...cadreUpdates,
            border: {
              ...l.cadre?.border,
              ...cadreUpdates.border
            }
          }
        }
      }
      return l
    })
    
    onUpdate({ logosPartenaires: newLogos })
  }

  const handleImageUpload = async (file: File) => {
    // Vérifier la limite de 4 logos
    if (logos.length >= MAX_LOGOS) {
      setUploadError(`Maximum ${MAX_LOGOS} logos partenaires autorisés.`)
      return
    }

    setUploadError(null)
    
    const validationError = validateImageFile(file, ['.jpg', '.jpeg', '.png', '.svg', '.webp'], 5 * 1024 * 1024)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    setUploading(true)

    try {
      // Compresser à une taille max raisonnable pour les logos partenaires
      const result = await compressImageWithMetadata(file, 400, 400)
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

      // Toujours ajouter un nouveau logo (pas remplacer)
      const newLogoId = 'logo-partenaire-' + Date.now()
      const maxLogoWidth = getMaxLogoWidth(logos.length + 1) // +1 car on ajoute un logo
      
      let displayWidth = result.displayWidth
      let displayHeight = result.displayHeight
      
      if (displayWidth > maxLogoWidth) {
        const aspectRatio = result.sourceWidth / result.sourceHeight
        displayWidth = maxLogoWidth
        displayHeight = Math.round(displayWidth / aspectRatio)
      } else if (displayWidth < MIN_LOGO_SIZE) {
        const aspectRatio = result.sourceWidth / result.sourceHeight
        displayWidth = MIN_LOGO_SIZE
        displayHeight = Math.round(displayWidth / aspectRatio)
      }
      
      const newLogo: LogoItemType = {
        id: newLogoId,
        url: data.url,
        sourceWidth: result.sourceWidth,
        sourceHeight: result.sourceHeight,
        displayWidth,
        displayHeight,
        crop: { x: 0, y: 0, width: result.sourceWidth, height: result.sourceHeight },
        order: logos.length
      }

      onUpdate({ logosPartenaires: [...logos, newLogo] })
      
      // Sélectionner automatiquement le nouveau logo
      setActiveLogoId(newLogoId)
      
      // Activer la rubrique si elle n'est pas active
      if (!isActive) {
        activateRubrique('logosPartenaires')
      }

      setSidePanelOpen(false)
      setIsAddingNewLogo(false)
    } catch (err) {
      setUploadError('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = () => {
    if (activeLogoId) {
      handleDeleteLogo(activeLogoId)
    }
  }

  const handleClose = () => {
    deactivateRubrique()
    setSidePanelOpen(false)
    setActiveLogoId(null)
    setIsAddingNewLogo(false)
  }

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
      
      const isDraggingCropHandle = targetElement?.classList?.contains('bg-blue-500')
      if (isDraggingCropHandle) {
        return
      }
      
      const isCropMode = document.querySelector('.crop-handle')
      if (isCropMode) {
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
        setIsAddingNewLogo(false)
      } else {
        deactivateRubrique()
        setActiveLogoId(null)
        setIsAddingNewLogo(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isActive, sidePanelOpen])

  const maxLogoWidth = getMaxLogoWidth(logos.length)

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-[120px] py-2"
      onClick={handleContainerClick}
    >
      {logos.length > 0 ? (
        <div className="relative flex items-center justify-center gap-4 flex-wrap max-w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={logos.map(l => l.id)}
              strategy={rectSortingStrategy}
            >
              <>
                {logos.map((logo) => (
                  <SortableLogo
                    key={logo.id}
                    logo={logo}
                    isActive={activeLogoId === logo.id}
                    maxWidth={maxLogoWidth}
                    onResize={(w, h) => handleLogoResize(logo.id, w, h)}
                    onCropSave={(logoData) => handleCropSave(logo.id, logoData)}
                    onClick={() => handleLogoClick(logo.id)}
                    onDelete={() => handleDeleteLogo(logo.id)}
                    canDelete={logos.length > 1}
                  />
                ))}
              </>
            </SortableContext>
          </DndContext>
          {/* Petit bouton "+" positionné en absolu à droite - ne gêne pas la disposition */}
          {logos.length < MAX_LOGOS && (
            <button
              onClick={handleAddButtonClick}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-600 hover:text-white flex items-center justify-center text-gray-600 transition-colors z-10 shadow-sm"
              title="Ajouter un logo partenaire"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      ) : (
        <div className="w-full h-24" />
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
            currentImageUrl={isAddingNewLogo ? undefined : activeLogo?.url}
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
        title="Supprimer le logo partenaire"
        message="Êtes-vous sûr de vouloir supprimer ce logo partenaire ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
      />
    </div>
  )
}

