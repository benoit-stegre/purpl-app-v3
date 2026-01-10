'use client'

import { useRef, useState, useEffect } from 'react'
import { ensureValidLogoItem } from '@/lib/utils/image-logo'
import type { LogoItem as LogoItemType } from '@/types/design-v6'
import { RotateCcw, Trash2 } from 'lucide-react'

interface LogoItemProps {
  logo: any
  isActive: boolean
  maxWidth: number
  onResize: (newWidth: number, newHeight: number) => void
  onDoubleClick: () => void
  onClick: () => void
  isEditingCrop?: boolean
  onReset?: () => void
  onDelete?: () => void
}

export default function LogoItem({
  logo: logoProp,
  isActive,
  maxWidth,
  onResize,
  onDoubleClick,
  onClick,
  isEditingCrop = false,
  onReset,
  onDelete
}: LogoItemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const logoNormalized: LogoItemType = ensureValidLogoItem(logoProp, maxWidth)
  const logo: LogoItemType = {
    ...logoNormalized,
    cadre: logoProp.cadre
  }
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragCorner, setDragCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })

  const aspectRatio = logo.sourceWidth / logo.sourceHeight

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
    setStartSize({ width: logo.displayWidth, height: logo.displayHeight })
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

  const shouldShowCrop = logo.crop && !isEditingCrop

  const alignment = logo.alignment || 'center'

  const effectiveWidth = Math.min(logo.displayWidth, maxWidth)
  
  let effectiveHeight: number
  if (logo.crop) {
    const cropAspectRatio = logo.crop.width / logo.crop.height
    effectiveHeight = Math.round(effectiveWidth / cropAspectRatio)
  } else {
    effectiveHeight = logo.displayHeight
  }

  return (
    <div
      className="relative"
      style={{
        width: maxWidth + 'px',
        minHeight: logo.displayHeight + 'px',
        textAlign: alignment,
        lineHeight: 0
      }}
    >
      {isActive && onReset && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onReset()
          }}
          className="absolute top-1 left-1 p-1 bg-white rounded hover:bg-gray-50 transition-colors z-50 shadow-sm"
          title="Remettre l'image à sa taille originale"
          aria-label="Reset image"
        >
          <RotateCcw className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
        </button>
      )}
      
      {isActive && onDelete && (
        <button
          onClick={(e) => { 
            e.stopPropagation()
            onDelete()
          }}
          className="absolute top-1 right-1 p-1 bg-white rounded hover:bg-red-50 transition-colors z-50 shadow-sm"
          aria-label="Supprimer le logo"
          title="Supprimer"
        >
          <Trash2 className="w-5 h-5 text-red-600" strokeWidth={2.5} />
        </button>
      )}
      
      <div style={{ display: 'inline-block' }}>
        <div
          ref={containerRef}
          className="relative cursor-pointer inline-block"
          style={{
            width: effectiveWidth + 'px',
            height: effectiveHeight + 'px',
          }}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              borderRadius: `${logo.cadre?.borderRadius ?? 8}px`
            }}
          >
            {shouldShowCrop ? (
              (() => {
                // ✅ ÉTAPE 1 : Calcul simplifié basé sur sourceWidth (pas crop.width)
                // Échelle globale : combien de pixels display pour 1 pixel source
                const displayScale = logo.displayWidth / logo.sourceWidth
                
                // Taille de l'image source complète dans l'espace display
                const bgWidth = logo.sourceWidth * displayScale
                const bgHeight = logo.sourceHeight * displayScale
                
                // Position du crop (en coordonnées source) dans l'espace display
                const cropX = logo.crop.x * displayScale
                const cropY = logo.crop.y * displayScale
                
                // Variables pour compatibilité avec le code existant
                const bgX = cropX
                const bgY = cropY
                
                return (
                  <div
                    className={isActive ? 'ring-4 ring-blue-500' : ''}
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${logo.url})`,
                      backgroundSize: `${bgWidth}px ${bgHeight}px`,
                      backgroundPosition: `-${bgX}px -${bgY}px`,
                      backgroundRepeat: 'no-repeat',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      borderRadius: `${logo.cadre?.borderRadius ?? 8}px`,
                      boxShadow: (logo.cadre?.border?.enabled && !isEditingCrop)
                        ? `inset 0 0 0 ${logo.cadre.border.width}px ${logo.cadre.border.color}`
                        : undefined
                    }}
                  />
                )
              })()
            ) : (
              <img
                src={logo.url}
                alt="Logo"
                className={isActive ? 'ring-4 ring-blue-500' : ''}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  borderRadius: `${logo.cadre?.borderRadius ?? 8}px`,
                  boxShadow: (logo.cadre?.border?.enabled && !isEditingCrop)
                    ? `inset 0 0 0 ${logo.cadre.border.width}px ${logo.cadre.border.color}`
                    : undefined
                }}
                draggable={false}
              />
            )}
          </div>

          {isActive && !isEditingCrop && (
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
    </div>
  )
}
