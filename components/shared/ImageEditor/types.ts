// components/shared/ImageEditor/types.ts
import type { ImageItemBase } from '@/types/design-v6'

// Réexporter pour usage local
export type ImageItem = ImageItemBase

export interface ImageEditorProps {
  /** L'image à éditer */
  image: ImageItem
  
  /** Callback appelé à chaque modification (resize, crop) */
  onUpdate: (updatedImage: ImageItem) => void
  
  /** Largeur max autorisée (défaut: 309px) */
  maxWidth?: number
  
  /** Largeur min autorisée (défaut: 50px) */
  minWidth?: number
  
  /** Hauteur min autorisée (défaut: 30px) */
  minHeight?: number
  
  /** Si true, affiche les contrôles (poignée resize) */
  isActive?: boolean
  
  /** Callback au clic sur l'image (pour l'activer) */
  onActivate?: () => void
  
  /** Callback au clic extérieur (pour désactiver) */
  onDeactivate?: () => void
  
  /** Classes CSS additionnelles */
  className?: string
}

export interface CropModalProps {
  /** Si true, le modal est visible */
  isOpen: boolean
  
  /** L'image à cropper */
  image: ImageItem
  
  /** Callback à la validation du crop */
  onConfirm: (crop: ImageItem['crop']) => void
  
  /** Callback à l'annulation */
  onCancel: () => void
}

export interface ResizeHandleProps {
  /** Largeur actuelle */
  currentWidth: number
  
  /** Callback à chaque changement de taille */
  onResize: (newWidth: number) => void
  
  /** Largeur minimum */
  minWidth: number
  
  /** Largeur maximum */
  maxWidth: number
}

export interface ImageDisplayProps {
  /** L'image à afficher */
  image: ImageItem
  
  /** Classes CSS additionnelles */
  className?: string
  
  /** Configuration du cadre (bordures, arrondis) */
  cadre?: {
    enabled: boolean
    backgroundColor: string
    borderRadius: number
    padding: number
    border?: {
      enabled: boolean
      color: string
      width: number
    }
  }
}

