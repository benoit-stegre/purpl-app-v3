'use client'

import React, { useRef, useState, useEffect } from 'react'
import { DesignConfigV6, PhotoItem } from '@/types/design-v6'
import { ImageEditor } from '@/components/shared/ImageEditor'
import FloatingToolbar from './FloatingToolbar'
import SidePanel from './SidePanel'
import { useInlineEditor } from '@/hooks/useInlineEditor'
import { Upload } from 'lucide-react'
import { compressImageWithMetadata } from '@/lib/utils/image'
import { addColorToPalette } from '@/lib/addColorToPalette'
import { getStandardToolbarPosition } from '@/lib/utils/toolbarPosition'
import ConfirmModal from '@/components/shared/ConfirmModal'

interface PhotoInlineEditorProps {
  designConfig: DesignConfigV6
  onUpdate: (updates: Partial<DesignConfigV6>) => void
  concertationId: string
}

export default function PhotoInlineEditor({
  designConfig,
  onUpdate,
  concertationId
}: PhotoInlineEditorProps) {
  
  const containerRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const sidePanelRef = useRef<HTMLDivElement>(null)
  
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

  const [uploading, setUploading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [tempBackgroundColor, setTempBackgroundColor] = useState<string | null>(null)
  const [tempBorderColor, setTempBorderColor] = useState<string | null>(null)
  const maxWidth = 309  // ✅ Changé de 319 à 309 (largeur réelle disponible)

  const isActive = activeRubrique === 'photo'
  

  const handleContainerClick = () => {
    if (!isActive) {
      // Essayer de définir la position immédiatement (synchrone)
      const position = getStandardToolbarPosition()
      if (position) {
        setToolbarPosition(position)
      }
      activateRubrique('photo')
    }
  }

  const handleClick = () => {
    // Essayer de définir la position immédiatement (synchrone)
    const position = getStandardToolbarPosition()
    if (position) {
      setToolbarPosition(position)
    }
    activateRubrique('photo')
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

  const handleUploadClick = () => {
    setSidePanelType('upload')
    setSidePanelOpen(true)
  }

  const handleCadreClick = () => {
    setSidePanelType('cadre')
    setSidePanelOpen(true)
  }

  const DEFAULT_PHOTO_CADRE = {
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

  const handleCadreToggle = () => {
    if (!designConfig.photo) return
    const prev = (designConfig.photo as any).cadre || DEFAULT_PHOTO_CADRE
    const updated = { ...prev, enabled: !prev.enabled }
    onUpdate({
      photo: {
        ...designConfig.photo,
        cadre: updated
      } as any
    })
  }

  const handleCadreChange = (cadreUpdates: any) => {
    if (!designConfig.photo) return
    
    // ✅ Stocker les couleurs modifiées pour les ajouter à la palette à la fermeture
    if (cadreUpdates.backgroundColor && cadreUpdates.backgroundColor !== designConfig.photo.cadre?.backgroundColor) {
      setTempBackgroundColor(cadreUpdates.backgroundColor)
    }
    
    if (cadreUpdates.border?.color && cadreUpdates.border.color !== designConfig.photo.cadre?.border?.color) {
      setTempBorderColor(cadreUpdates.border.color)
    }
    
    const prev = (designConfig.photo as any).cadre || DEFAULT_PHOTO_CADRE
    const merged = {
      ...prev,
      ...cadreUpdates,
      border: {
        ...prev.border,
        ...(cadreUpdates?.border || {})
      }
    }
    
    const isSynced = prev.syncWithGlobal !== false
    
    // Si la photo est synchronisée, appliquer les changements à toutes les images synchronisées
    if (isSynced) {
      const updatedLogos = designConfig.logoHeader.map(logo => {
        // Appliquer à toutes les images synchronisées
        if (logo.cadre?.syncWithGlobal !== false) {
          return {
            ...logo,
            cadre: {
              ...logo.cadre,
              backgroundColor: merged.backgroundColor,
              borderRadius: merged.borderRadius,
              borderRadiusEnabled: merged.borderRadiusEnabled,
              border: {
                ...logo.cadre?.border,
                enabled: merged.border?.enabled || false,
                color: merged.border?.color || '#000000',
                width: merged.border?.width || 2
              }
            }
          }
        }
        return logo
      })
      
      onUpdate({
        logoHeader: updatedLogos,
        photo: {
          ...designConfig.photo,
          cadre: merged
        } as any
      })
    } else {
      // Si la photo est indépendante, mettre à jour seulement la photo
      onUpdate({
        photo: {
          ...designConfig.photo,
          cadre: merged
        } as any
      })
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      console.log('📤 Upload photo démarré:', file.name)

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

      // ✅ OPTION A : displayWidth et displayHeight sont maintenant dans result
      // (déjà contraints à 319px par compressImageWithMetadata)
      const photoItem: PhotoItem = {
        id: 'photo-' + Date.now(),
        url: data.url,
        sourceWidth: result.sourceWidth,
        sourceHeight: result.sourceHeight,
        displayWidth: result.displayWidth,    // ✅ Utilise la valeur déjà contrainte
        displayHeight: result.displayHeight,  // ✅ Proportions préservées
        crop: {
          x: 0,
          y: 0,
          width: result.sourceWidth,
          height: result.sourceHeight
        },
        alignment: 'center',
        cadre: DEFAULT_PHOTO_CADRE  // ✅ Nouvelle photo : utiliser le cadre par défaut avec syncWithGlobal: true
      }

      console.log('📸 PhotoInlineEditor - Photo uploadée:', {
        sourceWidth: result.sourceWidth,
        sourceHeight: result.sourceHeight,
        displayWidth: result.displayWidth,
        displayHeight: result.displayHeight,
        photoItem
      })

      onUpdate({ photo: photoItem })
      handleClick()

    } catch (error) {
      console.error('❌ Erreur upload:', error)
      alert('Erreur upload: ' + (error as any).message)
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleImageUpload(file)
  }

  const handleImageRemove = () => {
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onUpdate({ photo: undefined })
    setSidePanelOpen(false)
    setDeleteModalOpen(false)
  }

  const handlePhotoUpdate = (updatedPhoto: PhotoItem) => {
    // ✅ Préserver le cadre et l'alignement existants : utiliser les nouvelles valeurs si présentes, sinon garder les anciennes
    const currentPhoto = designConfig.photo
    onUpdate({ 
      photo: {
        ...updatedPhoto,
        alignment: updatedPhoto.alignment ?? currentPhoto?.alignment ?? 'center',
        cadre: updatedPhoto.cadre ?? currentPhoto?.cadre
      }
    })
  }

  // ✅ Fonction pour toggle la synchronisation avec les réglages globaux
  const handleToggleSyncWithGlobal = () => {
    if (!designConfig.photo?.cadre) return
    
    const currentCadre = designConfig.photo.cadre
    const newSyncState = currentCadre.syncWithGlobal === false ? true : false
    
    // Toggle l'état de synchronisation pour la photo
    const updatedPhoto = {
      ...designConfig.photo,
      cadre: {
        ...currentCadre,
        syncWithGlobal: newSyncState
      }
    }
    
    // Si on synchronise, appliquer les réglages globaux (du premier logo synchronisé)
    if (newSyncState) {
      const globalCadre = designConfig.logoHeader.find(l => l.cadre?.syncWithGlobal !== false)?.cadre
      
      if (globalCadre) {
        const syncedPhoto = {
          ...updatedPhoto,
          cadre: {
            ...updatedPhoto.cadre,
            syncWithGlobal: true,
            backgroundColor: globalCadre.backgroundColor,
            borderRadius: globalCadre.borderRadius,
            borderRadiusEnabled: globalCadre.borderRadiusEnabled,
            border: {
              ...updatedPhoto.cadre?.border,
              enabled: globalCadre.border?.enabled || false,
              color: globalCadre.border?.color || '#000000',
              width: globalCadre.border?.width || 2
            }
          }
        }
        onUpdate({ photo: syncedPhoto })
        return
      }
    }
    
    onUpdate({ photo: updatedPhoto })
  }

  const handleAlignClick = () => {
    setSidePanelType('logo-alignment' as any)
    setSidePanelOpen(true)
  }

  const handleLogoAlignChange = (alignment: 'left' | 'center' | 'right') => {
    if (!designConfig.photo) return
    
    onUpdate({
      photo: {
        ...designConfig.photo,
        alignment
      }
    })
  }

  const handleClose = () => {
    deactivateRubrique()
    setSidePanelOpen(false)
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
    const handleClickOutside = (event: MouseEvent) => {
      if (!isActive) return

      const target = event.target as Node
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
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isActive, sidePanelOpen])

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-[80px]"
      onClick={handleContainerClick}
    >
      {!designConfig.photo ? (
        <div className="w-full h-20">
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      ) : (
        <div
          style={{
            width: maxWidth + 'px',
            textAlign: designConfig.photo.alignment || 'center',
            lineHeight: 0,
            margin: '0 auto'
          }}
        >
          <ImageEditor
            image={designConfig.photo}
            onUpdate={handlePhotoUpdate}
            maxWidth={maxWidth}
            isActive={isActive}
            onActivate={handleClick}
            onDeactivate={() => {}}
          />
        </div>
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
            currentImageUrl={designConfig.photo?.url}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            acceptedFormats={['.jpg', '.jpeg', '.png', '.svg', '.webp']}
            maxSize={5 * 1024 * 1024}
            logoAlignment={designConfig.photo?.alignment}
            onLogoAlignChange={handleLogoAlignChange}
            projectColors={designConfig.projectColors}
            cadre={sidePanelType === 'cadre' ? (((designConfig.photo as any)?.cadre) || DEFAULT_PHOTO_CADRE) : undefined}
            onCadreToggle={handleCadreToggle}
            onCadreChange={handleCadreChange}
            onToggleSyncWithGlobal={handleToggleSyncWithGlobal}
            isLogoMode={true}
            onClose={() => setSidePanelOpen(false)}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'image"
        message="Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
      />
    </div>
  )
}