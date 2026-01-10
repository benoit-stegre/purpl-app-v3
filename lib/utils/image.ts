export async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // ⚠️ IMPORTANT : On NE redimensionne PAS l'image physiquement ici
        // Le redimensionnement se fait uniquement à l'affichage
        // On préserve les dimensions originales pour le système crop/resize
        
        // Note: Si tu veux limiter la taille du fichier uploadé,
        // fais-le AVANT cet étape ou utilise maxWidth/maxHeight canvas
        // mais GARDE les dimensions source dans la structure LogoItem
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Compression failed'))
            }
          },
          'image/webp',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}

export function validateImageFile(file: File, acceptedFormats: string[], maxSize: number): string | null {
  // Normaliser l'extension en minuscules pour la comparaison
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  const normalizedFormats = acceptedFormats.map(f => f.toLowerCase())
  
  if (!normalizedFormats.includes(fileExtension)) {
    return `Format non accepté. Formats autorisés : ${acceptedFormats.join(', ')}`
  }
  
  if (file.size > maxSize) {
    return `Fichier trop volumineux. Taille max : ${(maxSize / (1024 * 1024)).toFixed(1)} MB`
  }
  
  return null
}

// ============================================
// ÉTAPE 1a : Nouvelle fonction avec metadata
// ============================================

const MAX_RUBRIQUE_WIDTH = 309 // Largeur max rubrique PhonePreview (mesurée: 309px comme le Titre)

export interface CompressedImageResult {
  blob: Blob
  sourceWidth: number
  sourceHeight: number
  displayWidth: number   // ✅ NOUVEAU: Dimensions affichage (contraintes à 309px max)
  displayHeight: number  // ✅ NOUVEAU
}

export async function compressImageWithMetadata(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.85
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Préserve les dimensions originales
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // ✅ CALCUL DES DIMENSIONS DISPLAY AVEC CONTRAINTE 309px
              let displayWidth = width
              let displayHeight = height
              
              console.log('🖼️ compressImageWithMetadata - AVANT contrainte:', {
                width,
                height,
                displayWidth,
                displayHeight,
                MAX_RUBRIQUE_WIDTH
              })
              
              if (displayWidth > MAX_RUBRIQUE_WIDTH) {
                const ratio = MAX_RUBRIQUE_WIDTH / displayWidth
                displayWidth = MAX_RUBRIQUE_WIDTH
                displayHeight = Math.round(displayHeight * ratio)
                
                console.log('🖼️ compressImageWithMetadata - APRÈS contrainte:', {
                  ratio,
                  displayWidth,
                  displayHeight
                })
              } else {
                console.log('🖼️ compressImageWithMetadata - PAS de contrainte (< 309px)')
              }
              
              resolve({ 
                blob, 
                sourceWidth: width, 
                sourceHeight: height,
                displayWidth,      // ✅ Contraint à 319px max
                displayHeight      // ✅ Proportions préservées
              })
            } else {
              reject(new Error('Compression failed'))
            }
          },
          'image/webp',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}