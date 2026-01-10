'use client'

import { useRef, useState, useEffect } from 'react'
import { PhotoItem as PhotoItemType } from '@/types/design-v6'
import { RotateCcw, Trash2 } from 'lucide-react'

interface PhotoItemProps {
  photo: PhotoItemType
  isActive: boolean
  maxWidth: number
  onResize: (newWidth: number, newHeight: number) => void
  onDoubleClick: () => void
  onClick: () => void
  isEditingCrop?: boolean
  onReset?: () => void
  onDelete?: () => void
}

export default function PhotoItem({
  photo,
  isActive,
  maxWidth,
  onResize,
  onDoubleClick,
  onClick,
  isEditingCrop = false,
  onReset,
  onDelete
}: PhotoItemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragCorner, setDragCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })

  const aspectRatio = photo.sourceWidth / photo.sourceHeight

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDoubleClick()
  }

  const handleCornerMouseDown = (corner: 'tl' | 'tr' | 'bl' | 'br', e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
    setDragCorner(corner)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartSize({ width: photo.displayWidth, height: photo.displayHeight })
  }

  useEffect(() => {
    if (!isDragging || !dragCorner) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x
      let newWidth = startSize.width

      if (dragCorner === 'br' || dragCorner === 'tr') {
        newWidth = startSize.width + deltaX
      } else if (dragCorner === 'bl' || dragCorner === 'tl') {
        newWidth = startSize.width - deltaX
      }

      let newHeight = newWidth / aspectRatio

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
      setIsDragging(false)
      setDragCorner(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragCorner, startPos, startSize, aspectRatio, maxWidth, onResize])

  const shouldShowCrop = photo.crop && !isEditingCrop
  const alignment = photo.alignment || 'center'

  // ✅ FIX BUG BLANCS: Calcul selon modèle Canva
  // Le container doit TOUJOURS avoir les proportions exactes du crop
  // displayWidth/displayHeight peuvent avoir des arrondis qui ne correspondent pas exactement au crop
  const effectiveWidth = Math.min(photo.displayWidth, maxWidth)
  
  // ✅ CRITIQUE: TOUJOURS utiliser les proportions du crop pour calculer effectiveHeight
  // Car le container affiche le crop, donc il doit avoir les proportions du crop
  // Ne JAMAIS utiliser displayAspectRatio qui peut avoir des arrondis
  // IMPORTANT: Utiliser les dimensions EXACTES du crop, pas celles sauvegardées (qui peuvent avoir des arrondis)
  let effectiveHeight: number
  if (photo.crop) {
    // Utiliser les proportions exactes du crop pour garantir la cohérence
    const cropAspectRatio = photo.crop.width / photo.crop.height
    // Calculer effectiveHeight à partir de effectiveWidth et cropAspectRatio
    // Utiliser Math.round pour éviter les problèmes d'affichage avec des valeurs décimales
    effectiveHeight = Math.round(effectiveWidth / cropAspectRatio)
    
    // 🔍 DEBUG: Vérifier la cohérence
    const expectedDisplayHeight = Math.round(photo.displayWidth / cropAspectRatio)
    if (Math.abs(effectiveHeight - expectedDisplayHeight) > 1) {
      console.warn('⚠️ Incohérence effectiveHeight:', {
        effectiveHeight,
        expectedDisplayHeight,
        displayWidth: photo.displayWidth,
        displayHeight: photo.displayHeight,
        cropAspectRatio: cropAspectRatio.toFixed(4)
      })
    }
  } else {
    // Pas de crop : utiliser displayHeight
    effectiveHeight = photo.displayHeight
  }

  return (
    <div
      className="relative"
      style={{
        width: maxWidth + 'px',
        minHeight: photo.displayHeight + 'px',
        textAlign: alignment,
        lineHeight: 0
      }}
    >
      {/* Bouton Reset - En haut à gauche, fixe par rapport à maxWidth */}
      {isActive && onReset && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="absolute top-1 left-1 p-1 bg-transparent rounded hover:bg-gray-50 transition-colors z-50"
          title="Remettre l'image à sa taille originale"
          aria-label="Reset image"
        >
          <RotateCcw className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
        </button>
      )}
      
      {/* Corbeille - En haut à droite, fixe par rapport à maxWidth */}
      {isActive && onDelete && (
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete();
          }}
          className="absolute top-1 right-1 p-1 bg-transparent rounded hover:bg-red-50 transition-colors z-50"
          aria-label="Supprimer la photo"
          title="Supprimer"
        >
          <Trash2 className="w-5 h-5 text-red-600" strokeWidth={2.5} />
        </button>
      )}
      
      <div
        ref={containerRef}
        className="relative cursor-pointer inline-block"
        style={{
          width: photo.displayWidth + 'px',
          height: photo.displayHeight + 'px',
          maxWidth: '100%'
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="relative w-full h-full overflow-hidden rounded">
          {shouldShowCrop ? (
            (() => {
              const containerWidth = effectiveWidth
              const containerHeight = effectiveHeight
              
              // ✅ ÉTAPE 1b : Calcul simplifié basé sur sourceWidth (pas crop.width)
              // Échelle globale : combien de pixels display pour 1 pixel source
              const displayScale = photo.displayWidth / photo.sourceWidth
              
              // Taille de l'image source complète dans l'espace display
              const bgWidth = photo.sourceWidth * displayScale
              const bgHeight = photo.sourceHeight * displayScale
              
              // Position du crop (en coordonnées source) dans l'espace display
              const cropX = photo.crop.x * displayScale
              const cropY = photo.crop.y * displayScale
              
              // Variables pour compatibilité avec le code existant
              const bgX = cropX
              const bgY = cropY
              
              return (
                <div
                  className={isActive ? 'ring-4 ring-blue-500 rounded' : ''}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${photo.url})`,
                    backgroundSize: `${Math.round(bgWidth)}px ${Math.round(bgHeight)}px`,
                    backgroundPosition: `-${Math.round(bgX)}px -${Math.round(bgY)}px`,
                    backgroundRepeat: 'no-repeat',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                />
              )
            })()
          ) : (
            <img
              src={photo.url}
              alt="Photo"
              className={isActive ? 'ring-4 ring-blue-500 rounded' : ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
              draggable={false}
            />
          )}
        </div>

        {isActive && (
          <>
            <div
              className="absolute -top-2 -left-2 w-5 h-5 bg-white border-4 border-blue-500 rounded-full cursor-nw-resize hover:scale-110 transition-transform z-30"
              onMouseDown={(e) => handleCornerMouseDown('tl', e)}
            />
            <div
              className="absolute -top-2 -right-2 w-5 h-5 bg-white border-4 border-blue-500 rounded-full cursor-ne-resize hover:scale-110 transition-transform z-30"
              onMouseDown={(e) => handleCornerMouseDown('tr', e)}
            />
            <div
              className="absolute -bottom-2 -left-2 w-5 h-5 bg-white border-4 border-blue-500 rounded-full cursor-sw-resize hover:scale-110 transition-transform z-30"
              onMouseDown={(e) => handleCornerMouseDown('bl', e)}
            />
            <div
              className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-4 border-blue-500 rounded-full cursor-se-resize hover:scale-110 transition-transform z-30"
              onMouseDown={(e) => handleCornerMouseDown('br', e)}
            />
          </>
        )}
      </div>
    </div>
  )
}