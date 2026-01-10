// components/shared/ImageEditor/index.ts

// Composants
export { ImageEditor } from './ImageEditor'
export { ImageDisplay } from './ImageDisplay'
export { ImageCropModal } from './ImageCropModal'
export { ImageResizeHandle } from './ImageResizeHandle'

// Types
export type { 
  ImageItem, 
  ImageEditorProps, 
  CropModalProps,
  ResizeHandleProps,
  ImageDisplayProps 
} from './types'

// Utilitaires (si besoin d'utiliser ailleurs)
export { 
  createDefaultCrop,
  calculateDisplayHeight,
  safeDivide,
  sanitizeCrop,
  isValidCrop
} from './utils'







