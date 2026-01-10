// lib/utils/image-logo.ts
// Helpers pour logos SANS blancs - Container = Image exactement

import type { LogoItem } from '@/types/design-v6'

/**
 * Crée un LogoItem après upload - SANS BLANCS
 * Container colle exactement à l'image
 */
export async function createInitialLogoItem(
  imageUrl: string,
  maxWidth: number,
  order: number = 0
): Promise<LogoItem> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const sourceWidth = img.naturalWidth
      const sourceHeight = img.naturalHeight
      const aspectRatio = sourceWidth / sourceHeight
      
      // Calcul display : adapter à maxWidth SANS créer de blancs
      let displayWidth = sourceWidth
      let displayHeight = sourceHeight
      
      // Si plus large que maxWidth, réduire en gardant ratio
      if (displayWidth > maxWidth) {
        displayWidth = maxWidth
        displayHeight = Math.round(displayWidth / aspectRatio)
      }
      
      // Crop initial = image complète
      const cropInitial = {
        x: 0,
        y: 0,
        width: sourceWidth,
        height: sourceHeight
      }
      
      const logoItem: LogoItem = {
        id: `logo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        sourceWidth,
        sourceHeight,
        displayWidth,
        displayHeight,
        crop: cropInitial,
        order
      }
      
      console.log('✅ LogoItem créé (SANS BLANCS):', {
        source: `${sourceWidth}x${sourceHeight}`,
        display: `${displayWidth}x${displayHeight}`,
        ratio: aspectRatio.toFixed(2),
        crop: 'image complète'
      })
      
      resolve(logoItem)
    }
    
    img.onerror = () => {
      reject(new Error(`Impossible de charger: ${imageUrl}`))
    }
    
    img.src = imageUrl
  })
}

/**
 * Normalise un LogoItem (compatibilité anciennes structures)
 */
export function ensureValidLogoItem(
  logo: any,
  maxWidth: number
): LogoItem {
  // Déjà au bon format
  if (
    logo.sourceWidth !== undefined &&
    logo.displayWidth !== undefined &&
    logo.crop !== undefined
  ) {
    return logo as LogoItem
  }
  
  console.warn('⚠️ Migration LogoItem depuis ancienne structure')
  
  // Ancienne structure : width/height sont display
  const displayWidth = logo.width || 200
  const displayHeight = logo.height || 200
  
  // Estimer source (approximation si pas d'info)
  const sourceWidth = displayWidth
  const sourceHeight = displayHeight
  
  // Crop par défaut
  const crop = {
    x: 0,
    y: 0,
    width: sourceWidth,
    height: sourceHeight
  }
  
  return {
    id: logo.id || `logo-migrated-${Date.now()}`,
    url: logo.url,
    sourceWidth,
    sourceHeight,
    displayWidth,
    displayHeight,
    crop,
    order: logo.order || 0
  }
}