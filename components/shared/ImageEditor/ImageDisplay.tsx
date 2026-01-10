// components/shared/ImageEditor/ImageDisplay.tsx
'use client'

import React from 'react'
import type { ImageDisplayProps } from './types'
import { safeDivide } from './utils'

export function ImageDisplay({ image, className, cadre }: ImageDisplayProps) {
  // Protection contre division par zéro
  const cropWidth = image.crop.width > 0 ? image.crop.width : image.sourceWidth
  const cropHeight = image.crop.height > 0 ? image.crop.height : image.sourceHeight
  
  // ✅ Calcul de la hauteur basé sur le crop actuel (toujours synchronisé)
  const cropAspectRatio = safeDivide(cropHeight, cropWidth, 1)
  const calculatedHeight = Math.round(image.displayWidth * cropAspectRatio)
  
  // Calcul du scale pour passer des coordonnées source aux coordonnées display
  const displayScale = safeDivide(image.displayWidth, cropWidth, 1)
  
  // Position du background (négatif car on décale l'image)
  const bgPositionX = -image.crop.x * displayScale
  const bgPositionY = -image.crop.y * displayScale
  
  // Taille du background (image source scalée)
  const bgWidth = image.sourceWidth * displayScale
  const bgHeight = image.sourceHeight * displayScale

  // ✅ Appliquer borderRadius et bordure selon le cadre
  // borderRadius seulement si borderRadiusEnabled est true
  const borderRadius = cadre?.borderRadiusEnabled ? (cadre.borderRadius ?? 8) : 0
  
  const borderStyle = cadre?.border?.enabled
    ? {
        boxShadow: `inset 0 0 0 ${cadre.border.width}px ${cadre.border.color}`
      }
    : {}

  return (
    <div
      className={`bg-no-repeat overflow-hidden ${className || ''}`}
      style={{
        width: image.displayWidth,
        height: calculatedHeight,
        backgroundImage: `url(${image.url})`,
        backgroundPosition: `${bgPositionX}px ${bgPositionY}px`,
        backgroundSize: `${bgWidth}px ${bgHeight}px`,
        borderRadius: `${borderRadius}px`,
        ...borderStyle
      }}
      aria-label="Image"
      role="img"
    />
  )
}

