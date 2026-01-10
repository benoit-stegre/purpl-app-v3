// components/shared/ImageEditor/utils.ts
import React from 'react'
import type { ImageItem } from './types'

/**
 * Crée un crop par défaut (image entière)
 */
export function createDefaultCrop(sourceWidth: number, sourceHeight: number): ImageItem['crop'] {
  return {
    x: 0,
    y: 0,
    width: sourceWidth,
    height: sourceHeight
  }
}

/**
 * Calcule la hauteur d'affichage en préservant l'aspect ratio du crop
 */
export function calculateDisplayHeight(
  displayWidth: number,
  cropWidth: number,
  cropHeight: number
): number {
  if (cropWidth <= 0) return displayWidth // Fallback si division par zéro
  const aspectRatio = cropHeight / cropWidth
  return Math.round(displayWidth * aspectRatio)
}

/**
 * Division sécurisée (évite division par zéro)
 */
export function safeDivide(numerator: number, denominator: number, fallback: number = 1): number {
  if (denominator === 0 || !isFinite(denominator)) return fallback
  return numerator / denominator
}

/**
 * Valide et corrige un crop pour éviter les valeurs aberrantes
 */
export function sanitizeCrop(
  crop: ImageItem['crop'],
  sourceWidth: number,
  sourceHeight: number
): ImageItem['crop'] {
  return {
    x: Math.max(0, Math.min(crop.x, sourceWidth - 1)),
    y: Math.max(0, Math.min(crop.y, sourceHeight - 1)),
    width: Math.max(1, Math.min(crop.width, sourceWidth - crop.x)),
    height: Math.max(1, Math.min(crop.height, sourceHeight - crop.y))
  }
}

/**
 * Vérifie si un crop est valide
 */
export function isValidCrop(crop: ImageItem['crop']): boolean {
  return (
    crop.width > 0 &&
    crop.height > 0 &&
    crop.x >= 0 &&
    crop.y >= 0 &&
    isFinite(crop.x) &&
    isFinite(crop.y) &&
    isFinite(crop.width) &&
    isFinite(crop.height)
  )
}

/**
 * Calcule les nouvelles dimensions d'affichage après un crop
 * en respectant les contraintes min/max
 */
export function calculateDisplayDimensionsAfterCrop(
  currentDisplayWidth: number,
  newCrop: ImageItem['crop'],
  minWidth: number,
  maxWidth: number,
  minHeight: number
): { displayWidth: number; displayHeight: number } {
  const cropAspectRatio = safeDivide(newCrop.height, newCrop.width, 1)
  
  let displayWidth = currentDisplayWidth
  let displayHeight = Math.round(displayWidth * cropAspectRatio)
  
  // Si hauteur trop petite, ajuster
  if (displayHeight < minHeight) {
    displayHeight = minHeight
    displayWidth = Math.round(displayHeight / cropAspectRatio)
  }
  
  // Respecter les contraintes de largeur
  displayWidth = Math.max(minWidth, Math.min(maxWidth, displayWidth))
  displayHeight = Math.round(displayWidth * cropAspectRatio)
  
  return { displayWidth, displayHeight }
}

/**
 * Extrait les coordonnées d'un événement souris ou touch
 * Compatible avec MouseEvent, TouchEvent et leurs variantes React
 */
export function getPointerPosition(
  e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
): { x: number; y: number } {
  // Événement tactile
  if ('touches' in e && e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  // Événement souris
  if ('clientX' in e) {
    return { x: e.clientX ?? 0, y: e.clientY ?? 0 }
  }
  // Fallback
  return { x: 0, y: 0 }
}

