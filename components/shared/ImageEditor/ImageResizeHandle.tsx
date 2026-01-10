// components/shared/ImageEditor/ImageResizeHandle.tsx
'use client'

import React, { useCallback, useRef, useEffect } from 'react'
import type { ResizeHandleProps } from './types'
import { getPointerPosition } from './utils'

export function ImageResizeHandle({
  currentWidth,
  onResize,
  minWidth,
  maxWidth
}: ResizeHandleProps) {
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  // Début du drag (souris ou touch)
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    isDragging.current = true
    const pos = getPointerPosition(e)
    startX.current = pos.x
    startWidth.current = currentWidth
  }, [currentWidth])

  useEffect(() => {
    // Mouvement (souris ou touch)
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return
      
      const pos = getPointerPosition(e)
      const deltaX = pos.x - startX.current
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth.current + deltaX))
      onResize(newWidth)
    }

    // Fin du drag
    const handlePointerUp = () => {
      isDragging.current = false
    }

    // Events souris
    document.addEventListener('mousemove', handlePointerMove)
    document.addEventListener('mouseup', handlePointerUp)
    
    // Events tactiles
    document.addEventListener('touchmove', handlePointerMove, { passive: false })
    document.addEventListener('touchend', handlePointerUp)
    document.addEventListener('touchcancel', handlePointerUp)

    return () => {
      document.removeEventListener('mousemove', handlePointerMove)
      document.removeEventListener('mouseup', handlePointerUp)
      document.removeEventListener('touchmove', handlePointerMove)
      document.removeEventListener('touchend', handlePointerUp)
      document.removeEventListener('touchcancel', handlePointerUp)
    }
  }, [onResize, minWidth, maxWidth])

  // Gestion du clavier pour accessibilité
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      onResize(Math.min(maxWidth, currentWidth + step))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      onResize(Math.max(minWidth, currentWidth - step))
    }
  }, [currentWidth, onResize, minWidth, maxWidth])

  return (
    <div
      className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-purple-500 rounded-full cursor-se-resize z-10 hover:bg-purple-100 hover:scale-110 transition-all shadow-md"
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      role="slider"
      aria-label="Redimensionner l'image"
      aria-valuenow={currentWidth}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      tabIndex={0}
      title="Glisser pour redimensionner (ou utiliser les flèches du clavier)"
    />
  )
}







