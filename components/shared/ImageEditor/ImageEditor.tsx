// components/shared/ImageEditor/ImageEditor.tsx
'use client'

import React, { useState, useCallback, useRef, useEffect, memo } from 'react'
import { ImageDisplay } from './ImageDisplay'
import { ImageResizeHandle } from './ImageResizeHandle'
import { ImageCropModal } from './ImageCropModal'
import type { ImageEditorProps, ImageItem } from './types'
import { 
  safeDivide, 
  calculateDisplayDimensionsAfterCrop,
  sanitizeCrop,
  isValidCrop
} from './utils'

// ✅ Wrappé avec React.memo pour éviter re-renders inutiles
export const ImageEditor = memo(function ImageEditor({
  image,
  onUpdate,
  maxWidth = 309,
  minWidth = 50,
  minHeight = 30,
  isActive = false,
  onActivate,
  onDeactivate,
  className
}: ImageEditorProps) {
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ========== GESTION DU CLIC EXTÉRIEUR ==========
  useEffect(() => {
    if (!isActive || isCropModalOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (containerRef.current && !containerRef.current.contains(target)) {
        onDeactivate?.()
      }
    }

    // Délai pour éviter de désactiver immédiatement après activation
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isActive, isCropModalOpen, onDeactivate])

  // ========== GESTION DU CLIC / DOUBLE-CLIC ==========
  // Utilise un timer pour distinguer clic simple vs double-clic
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()

    if (clickTimeoutRef.current) {
      // Double-clic détecté (deuxième clic avant timeout)
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
      onActivate?.() // ✅ Activer avant d'ouvrir le modal
      setIsCropModalOpen(true)
    } else {
      // Premier clic - attendre pour voir si c'est un double-clic
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null
        // Simple clic confirmé → activer
        onActivate?.()
      }, 250)
    }
  }, [onActivate])

  // Cleanup du timer au démontage
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  // ========== GESTION DU RESIZE ==========
  const handleResize = useCallback((newDisplayWidth: number) => {
    // Vérifier que le crop est valide
    const crop = isValidCrop(image.crop) ? image.crop : {
      x: 0,
      y: 0,
      width: image.sourceWidth,
      height: image.sourceHeight
    }

    // Calcul proportionnel basé sur le CROP actuel (pas source)
    const cropAspectRatio = safeDivide(crop.height, crop.width, 1)
    let calculatedWidth = newDisplayWidth
    let calculatedHeight = Math.round(calculatedWidth * cropAspectRatio)
    
    // ✅ Vérifier minHeight et ajuster width si nécessaire
    if (calculatedHeight < minHeight) {
      calculatedHeight = minHeight
      calculatedWidth = Math.round(calculatedHeight / cropAspectRatio)
    }
    
    // Appliquer les contraintes de largeur
    calculatedWidth = Math.max(minWidth, Math.min(maxWidth, calculatedWidth))
    calculatedHeight = Math.round(calculatedWidth * cropAspectRatio)
    
    onUpdate({
      ...image,
      displayWidth: calculatedWidth,
      displayHeight: calculatedHeight
    })
  }, [image, onUpdate, maxWidth, minWidth, minHeight])

  // ========== GESTION DU CROP ==========
  const handleCropConfirm = useCallback((newCrop: ImageItem['crop']) => {
    // Sanitize le crop pour éviter les valeurs aberrantes
    const sanitizedCrop = sanitizeCrop(newCrop, image.sourceWidth, image.sourceHeight)
    
    // Recalculer displayWidth/Height pour correspondre au nouveau crop
    const { displayWidth, displayHeight } = calculateDisplayDimensionsAfterCrop(
      image.displayWidth,
      sanitizedCrop,
      minWidth,
      maxWidth,
      minHeight
    )
    
    onUpdate({
      ...image,
      crop: sanitizedCrop,
      displayWidth,
      displayHeight
    })
    
    setIsCropModalOpen(false)
  }, [image, onUpdate, minWidth, maxWidth, minHeight])

  // ========== RENDU ==========
  return (
    <>
      <div 
        ref={containerRef}
        className={`relative inline-block cursor-pointer ${className || ''}`}
        onClick={handleClick}
      >
        {/* Affichage de l'image avec crop appliqué */}
        <ImageDisplay 
          image={image} 
          cadre={(image as any).cadre}
        />
        
        {/* Bordure de sélection (visible si actif ET si bordure/arrondi ne sont pas activés) */}
        {isActive && (() => {
          const cadre = (image as any).cadre
          const hasBorder = cadre?.border?.enabled === true
          const hasBorderRadius = cadre?.borderRadiusEnabled === true
          
          // Masquer le cadre de sélection si bordure ou arrondi sont activés
          if (hasBorder || hasBorderRadius) {
            return null
          }
          
          return <div className="absolute inset-0 border-2 border-purple-500 rounded pointer-events-none" />
        })()}
        
        {/* Poignée de resize (visible si actif) */}
        {isActive && (
          <ImageResizeHandle
            currentWidth={image.displayWidth}
            onResize={handleResize}
            minWidth={minWidth}
            maxWidth={maxWidth}
          />
        )}
      </div>

      {/* Modal de crop (plein écran) */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        image={image}
        onConfirm={handleCropConfirm}
        onCancel={() => setIsCropModalOpen(false)}
      />
    </>
  )
})

