'use client'

import { useState, useRef, useEffect } from 'react'
import { PhotoItem } from '@/types/design-v6'
import { RotateCcw, Trash2 } from 'lucide-react'

interface PhotoItemEditorProps {
  photo: PhotoItem
  isActive: boolean
  maxWidth: number
  onResize: (width: number, height: number) => void
  onCropSave: (photo: PhotoItem) => void
  onClick: () => void
  onDelete?: () => void
}

type Mode = 'normal' | 'resize' | 'crop'
type ResizeCorner = 'tl' | 'tr' | 'bl' | 'br'
type CropSide = 'top' | 'right' | 'bottom' | 'left'

export default function PhotoItemEditor({
  photo,
  isActive,
  maxWidth,
  onResize,
  onCropSave,
  onClick,
  onDelete
}: PhotoItemEditorProps) {
  const [mode, setMode] = useState<Mode>('normal')
  const [tempCrop, setTempCrop] = useState(photo.crop)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Synchroniser tempCrop avec photo.crop quand photo change
  useEffect(() => {
    setTempCrop(photo.crop)
  }, [photo.crop])
  const dragStateRef = useRef<{
    type: 'resize' | 'crop'
    corner?: ResizeCorner
    side?: CropSide
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    startCrop?: { x: number; y: number; width: number; height: number }
  } | null>(null)

  // Calcul des dimensions d'affichage effectives (mode normal/resize)
  const effectiveWidth = Math.min(photo.displayWidth, maxWidth)
  const cropAspectRatio = photo.crop.width / photo.crop.height
  const effectiveHeight = effectiveWidth / cropAspectRatio

  // Calcul pour l'affichage avec crop (CSS background) - mode normal/resize
  const scaleX = effectiveWidth / photo.crop.width
  const scaleY = effectiveHeight / photo.crop.height
  const bgWidth = photo.sourceWidth * scaleX
  const bgHeight = photo.sourceHeight * scaleY
  const bgX = photo.crop.x * scaleX
  const bgY = photo.crop.y * scaleY

  // Calcul pour le mode crop : container affiche l'image source complète
  const sourceAspectRatio = photo.sourceWidth / photo.sourceHeight
  let cropContainerWidth = photo.sourceWidth
  let cropContainerHeight = photo.sourceHeight
  
  // Adapter à maxWidth si nécessaire
  if (cropContainerWidth > maxWidth) {
    cropContainerWidth = maxWidth
    cropContainerHeight = cropContainerWidth / sourceAspectRatio
  }
  
  // Ratio de conversion pour le mode crop
  const cropScaleX = cropContainerWidth / photo.sourceWidth
  const cropScaleY = cropContainerHeight / photo.sourceHeight

  // Calcul pour les poignées de crop (en pourcentage du container en mode crop)
  const cropLeftPercent = (tempCrop.x / photo.sourceWidth) * 100
  const cropTopPercent = (tempCrop.y / photo.sourceHeight) * 100
  const cropRightPercent = ((tempCrop.x + tempCrop.width) / photo.sourceWidth) * 100
  const cropBottomPercent = ((tempCrop.y + tempCrop.height) / photo.sourceHeight) * 100

  // Handler: Simple clic → Mode Resize
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
  }

  // Activer automatiquement le mode resize quand isActive devient true
  useEffect(() => {
    if (isActive && mode === 'normal') {
      setMode('resize')
    }
  }, [isActive, mode])

  // Handler: Double-clic → Mode Crop
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (mode === 'resize') {
      setMode('crop')
      setTempCrop({ ...photo.crop })
    }
  }

  // Handler: Clic extérieur → Valide et sort du mode
  useEffect(() => {
    if (mode === 'normal') return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Ignorer les clics sur les poignées
      if (target.classList.contains('crop-handle') || target.classList.contains('resize-handle')) {
        return
      }

      if (!containerRef.current?.contains(target)) {
        if (mode === 'crop') {
          // Sauvegarder le crop
          const cropChanged = 
            photo.crop.x !== tempCrop.x ||
            photo.crop.y !== tempCrop.y ||
            photo.crop.width !== tempCrop.width ||
            photo.crop.height !== tempCrop.height

          if (cropChanged) {
            // Recalculer displayWidth/Height en fonction du nouveau crop
            // En mode crop, le container affiche l'image source complète à l'échelle cropContainerWidth
            // On calcule le ratio: combien de pixels display pour 1 pixel source du crop
            const cropScale = cropContainerWidth / photo.sourceWidth
            let newDisplayWidth = tempCrop.width * cropScale
            let newDisplayHeight = tempCrop.height * cropScale

            // Limiter à maxWidth si nécessaire
            if (newDisplayWidth > maxWidth) {
              const scale = maxWidth / newDisplayWidth
              newDisplayWidth = maxWidth
              newDisplayHeight = newDisplayHeight * scale
            }

            onCropSave({
              ...photo,
              crop: tempCrop,
              displayWidth: Math.round(newDisplayWidth),
              displayHeight: Math.round(newDisplayHeight)
            })
          }
        }
        
        setMode('normal')
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [mode, tempCrop, photo, effectiveWidth, maxWidth, onCropSave])

  // Handler: Resize (poignées rondes aux 4 coins)
  const handleResizeMouseDown = (corner: ResizeCorner, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    dragStateRef.current = {
      type: 'resize',
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: photo.displayWidth,
      startHeight: photo.displayHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current) return

      const deltaX = e.clientX - dragStateRef.current.startX
      const deltaY = e.clientY - dragStateRef.current.startY
      
      let newWidth = dragStateRef.current.startWidth
      let newHeight = dragStateRef.current.startHeight

      // Calcul selon le coin
      if (corner === 'br' || corner === 'tr') {
        newWidth = dragStateRef.current.startWidth + deltaX
      } else if (corner === 'bl' || corner === 'tl') {
        newWidth = dragStateRef.current.startWidth - deltaX
      }

      // Garder les proportions du crop
      const aspectRatio = photo.crop.width / photo.crop.height
      newHeight = newWidth / aspectRatio

      // Limites
      if (newWidth > maxWidth) {
        newWidth = maxWidth
        newHeight = newWidth / aspectRatio
      }
      if (newWidth < 50) {
        newWidth = 50
        newHeight = newWidth / aspectRatio
      }

      onResize(Math.round(newWidth), Math.round(newHeight))
    }

    const handleMouseUp = () => {
      dragStateRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Handler: Crop (poignées bleues sur 4 côtés, indépendants)
  const handleCropMouseDown = (side: CropSide, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    dragStateRef.current = {
      type: 'crop',
      side,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: 0,
      startHeight: 0,
      startCrop: { ...tempCrop }
    }

    // Ratio de conversion: pixels display → pixels source (en mode crop)
    const scaleX = photo.sourceWidth / cropContainerWidth
    const scaleY = photo.sourceHeight / cropContainerHeight

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current?.startCrop) return

      const deltaX = (e.clientX - dragStateRef.current.startX) * scaleX
      const deltaY = (e.clientY - dragStateRef.current.startY) * scaleY

      let newCrop = { ...dragStateRef.current.startCrop }

      switch (side) {
        case 'top':
          newCrop.y = Math.max(0, Math.min(dragStateRef.current.startCrop.y + deltaY, photo.sourceHeight - 50))
          newCrop.height = Math.max(50, dragStateRef.current.startCrop.height - deltaY)
          break
        case 'right':
          newCrop.width = Math.max(50, Math.min(dragStateRef.current.startCrop.width + deltaX, photo.sourceWidth - dragStateRef.current.startCrop.x))
          break
        case 'bottom':
          newCrop.height = Math.max(50, Math.min(dragStateRef.current.startCrop.height + deltaY, photo.sourceHeight - dragStateRef.current.startCrop.y))
          break
        case 'left':
          newCrop.x = Math.max(0, Math.min(dragStateRef.current.startCrop.x + deltaX, photo.sourceWidth - 50))
          newCrop.width = Math.max(50, dragStateRef.current.startCrop.width - deltaX)
          break
      }

      setTempCrop(newCrop)
    }

    const handleMouseUp = () => {
      dragStateRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Handler: Reset à l'image initiale (comme au moment du téléchargement)
  const handleReset = () => {
    console.log('🔄 Reset image - État actuel:', {
      sourceWidth: photo.sourceWidth,
      sourceHeight: photo.sourceHeight,
      displayWidth: photo.displayWidth,
      displayHeight: photo.displayHeight,
      crop: photo.crop
    })

    // Remettre le crop à l'image complète
    const resetCrop = {
      x: 0,
      y: 0,
      width: photo.sourceWidth,
      height: photo.sourceHeight
    }

    // Calculer les dimensions display comme lors de l'upload initial
    // (même logique que compressImageWithMetadata)
    const aspectRatio = photo.sourceWidth / photo.sourceHeight
    let newDisplayWidth = photo.sourceWidth
    let newDisplayHeight = photo.sourceHeight

    // Contrainte à maxWidth (309px) comme lors de l'upload
    if (newDisplayWidth > maxWidth) {
      newDisplayWidth = maxWidth
      newDisplayHeight = Math.round(newDisplayWidth / aspectRatio)
    }

    const resetPhoto = {
      ...photo,
      crop: resetCrop,
      displayWidth: newDisplayWidth,
      displayHeight: newDisplayHeight
    }

    console.log('🔄 Reset image - Nouvel état:', {
      crop: resetCrop,
      displayWidth: newDisplayWidth,
      displayHeight: newDisplayHeight
    })

    // Sauvegarder et réinitialiser le mode
    onCropSave(resetPhoto)
    
    // Réinitialiser le mode pour sortir du mode resize
    setMode('normal')
  }

  const alignment = photo.alignment || 'center'

  return (
    <div
      className="relative"
      style={{
        width: maxWidth + 'px',
        minHeight: effectiveHeight + 'px',
        textAlign: alignment,
        lineHeight: 0
      }}
    >
      {/* Boutons Reset et Delete */}
      {isActive && mode === 'resize' && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleReset()
            }}
            className="absolute top-1 left-1 p-1 bg-white rounded hover:bg-gray-50 transition-colors z-50 shadow-sm"
            title="Remettre l'image à sa taille originale"
            aria-label="Reset image"
          >
            <RotateCcw className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
          </button>
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="absolute top-1 right-1 p-1 bg-white rounded hover:bg-red-50 transition-colors z-50 shadow-sm"
              aria-label="Supprimer la photo"
              title="Supprimer"
            >
              <Trash2 className="w-5 h-5 text-red-600" strokeWidth={2.5} />
            </button>
          )}
        </>
      )}

      {/* Container image */}
      <div
        ref={containerRef}
        className="relative cursor-pointer inline-block"
        style={{
          width: mode === 'crop' ? Math.round(cropContainerWidth) + 'px' : Math.round(effectiveWidth) + 'px',
          height: mode === 'crop' ? Math.round(cropContainerHeight) + 'px' : Math.round(effectiveHeight) + 'px',
          maxWidth: '100%'
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Image avec crop appliqué (mode normal/resize) ou image complète (mode crop) */}
        <div className="relative w-full h-full overflow-hidden rounded">
          {mode === 'crop' ? (
            // Mode crop : afficher l'image source complète
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${photo.url})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
          ) : (
            // Mode normal/resize : afficher avec crop appliqué
            <div
              className={mode === 'resize' ? 'ring-4 ring-blue-500 rounded' : ''}
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${photo.url})`,
                backgroundSize: `${bgWidth}px ${bgHeight}px`,
                backgroundPosition: `-${bgX}px -${bgY}px`,
                backgroundRepeat: 'no-repeat',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {/* Poignées Resize (rondes, 4 coins) - Mode resize uniquement */}
        {mode === 'resize' && (
          <>
            <div
              className="resize-handle absolute -top-2 -left-2 w-5 h-5 bg-white border-4 border-blue-500 rounded-full cursor-nw-resize hover:scale-110 transition-transform z-30"
              onMouseDown={(e) => handleResizeMouseDown('tl', e)}
            />
            <div
              className="resize-handle absolute -top-2 -right-2 w-5 h-5 bg-white border-4 border-blue-500 rounded-full cursor-ne-resize hover:scale-110 transition-transform z-30"
              onMouseDown={(e) => handleResizeMouseDown('tr', e)}
            />
            <div
              className="resize-handle absolute -bottom-2 -left-2 w-5 h-5 bg-white border-4 border-blue-500 rounded-full cursor-sw-resize hover:scale-110 transition-transform z-30"
              onMouseDown={(e) => handleResizeMouseDown('bl', e)}
            />
            <div
              className="resize-handle absolute -bottom-2 -right-2 w-5 h-5 bg-white border-4 border-blue-500 rounded-full cursor-se-resize hover:scale-110 transition-transform z-30"
              onMouseDown={(e) => handleResizeMouseDown('br', e)}
            />
          </>
        )}

        {/* Overlay et poignées Crop (bleues, 4 côtés) - Mode crop uniquement */}
        {mode === 'crop' && (
          <>
            {/* Overlay sombre avec zone transparente */}
            <div
              className="absolute inset-0 pointer-events-none z-40"
              style={{
                background: `linear-gradient(
                  to bottom,
                  rgba(0,0,0,0.5) 0%,
                  rgba(0,0,0,0.5) ${cropTopPercent}%,
                  transparent ${cropTopPercent}%,
                  transparent ${cropBottomPercent}%,
                  rgba(0,0,0,0.5) ${cropBottomPercent}%,
                  rgba(0,0,0,0.5) 100%
                ),
                linear-gradient(
                  to right,
                  rgba(0,0,0,0.5) 0%,
                  rgba(0,0,0,0.5) ${cropLeftPercent}%,
                  transparent ${cropLeftPercent}%,
                  transparent ${cropRightPercent}%,
                  rgba(0,0,0,0.5) ${cropRightPercent}%,
                  rgba(0,0,0,0.5) 100%
                )`
              }}
            />

            {/* Poignée Top */}
            <div
              className="crop-handle absolute h-1 bg-blue-500 cursor-ns-resize hover:bg-blue-600 rounded-full z-50"
              style={{
                top: `${cropTopPercent}%`,
                left: `${(cropLeftPercent + cropRightPercent) / 2}%`,
                width: '60px',
                transform: 'translate(-50%, -50%)'
              }}
              onMouseDown={(e) => handleCropMouseDown('top', e)}
            />

            {/* Poignée Right */}
            <div
              className="crop-handle absolute w-1 bg-blue-500 cursor-ew-resize hover:bg-blue-600 rounded-full z-50"
              style={{
                right: `${100 - cropRightPercent}%`,
                top: `${(cropTopPercent + cropBottomPercent) / 2}%`,
                height: '60px',
                transform: 'translate(50%, -50%)'
              }}
              onMouseDown={(e) => handleCropMouseDown('right', e)}
            />

            {/* Poignée Bottom */}
            <div
              className="crop-handle absolute h-1 bg-blue-500 cursor-ns-resize hover:bg-blue-600 rounded-full z-50"
              style={{
                bottom: `${100 - cropBottomPercent}%`,
                left: `${(cropLeftPercent + cropRightPercent) / 2}%`,
                width: '60px',
                transform: 'translate(-50%, 50%)'
              }}
              onMouseDown={(e) => handleCropMouseDown('bottom', e)}
            />

            {/* Poignée Left */}
            <div
              className="crop-handle absolute w-1 bg-blue-500 cursor-ew-resize hover:bg-blue-600 rounded-full z-50"
              style={{
                left: `${cropLeftPercent}%`,
                top: `${(cropTopPercent + cropBottomPercent) / 2}%`,
                height: '60px',
                transform: 'translate(-50%, -50%)'
              }}
              onMouseDown={(e) => handleCropMouseDown('left', e)}
            />
          </>
        )}
      </div>
    </div>
  )
}

