// types/design-v6.ts - Version 7.4 avec PhotoItem

// ========== NOUVELLE INTERFACE DE BASE ==========
export interface ImageItemBase {
  id: string
  url: string
  
  // Dimensions source (immuables - image originale)
  sourceWidth: number
  sourceHeight: number
  
  // Dimensions d'affichage (modifiables via resize)
  displayWidth: number
  displayHeight: number
  
  // Zone de crop (coordonnées en pixels source)
  crop: {
    x: number      // Position X dans l'image source
    y: number      // Position Y dans l'image source
    width: number  // Largeur du viewport
    height: number // Hauteur du viewport
  }
}

// ========== MODIFIER LogoItem pour étendre ImageItemBase ==========
export interface LogoItem extends ImageItemBase {
  order: number
  alignment?: 'left' | 'center' | 'right'
  cadre?: CadreConfig
}

// ========== MODIFIER PhotoItem pour étendre ImageItemBase ==========
export interface PhotoItem extends ImageItemBase {
  alignment?: 'left' | 'center' | 'right'
  cadre?: CadreConfig
}

export interface CadreConfig {
  enabled: boolean
  backgroundColor: string
  borderRadius: number
  borderRadiusEnabled?: boolean  // ✅ Nouveau : contrôle si l'arrondi est activé
  padding: number
  syncWithGlobal?: boolean  // ✅ Nouveau : si true, l'image suit les réglages globaux
  border?: {
    enabled: boolean
    color: string
    width: number
  }
}

export interface TextConfig {
  text: string
  font: string
  fontSize: number
  color: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  bold: boolean
  italic: boolean
  underline: boolean
  cadre: CadreConfig
}

export interface RichTextConfig {
  content: string  // HTML formaté (avec <strong>, <em>, <u>)
  font: string
  fontSize: number
  color: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  cadre: CadreConfig
}

export interface ExplanationLongueBlock {
  id: string
  content: string  // HTML formaté (avec <strong>, <em>, <u>)
  font: string
  fontSize: number
  color: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  order: number
  cadre: CadreConfig
}

export interface ButtonConfig {
  text: string
  
  // FOND
  backgroundColor: string
  hasBackground: boolean
  
  // BORDURE
  border: {
    width: number
    color: string
    hasBorder: boolean
    radius: number
  }
  
  // TEXTE
  textColor: string
  fontFamily: string
  fontSize: number
  bold: boolean
  
  // OMBRE
  shadow: {
    enabled: boolean
    blur: number
    offsetY: number
    color: string
  }
}

// Valeurs par défaut pour le bouton
export const DEFAULT_BUTTON_CONFIG: ButtonConfig = {
  text: 'Commencer le questionnaire',
  
  backgroundColor: '#F5F5F5',
  hasBackground: true,
  
  border: {
    width: 1,
    color: '#000000',
    hasBorder: true,
    radius: 10
  },
  
  textColor: '#000000',
  fontFamily: 'Inter',
  fontSize: 16,
  bold: false,
  
  shadow: {
    enabled: false,
    blur: 8,
    offsetY: 4,
    color: 'rgba(0, 0, 0, 0.15)'
  }
}

export interface FondConfig {
  type: 'color' | 'image'
  value: string
}

export interface DesignConfigV6 {
  projectColors: string[]
  
  logoHeader: LogoItem[]
  
  titre: TextConfig
  
  photo: PhotoItem | null
  
  explanationCourte: RichTextConfig
  
  explanationLongue: ExplanationLongueBlock[]
  
  
  bouton: ButtonConfig
  
  texteObligatoire: RichTextConfig
  
  logosPartenaires: LogoItem[]
  
  fond: FondConfig
}

// Type pour les rubriques
export type RubriqueType = 
  | 'logoHeader'
  | 'titre'
  | 'photo'
  | 'explanationCourte'
  | 'explanationLongue'
  | 'buttons'
  | 'bouton'
  | 'texteObligatoire'
  | 'logosPartenaires'
  | 'fond'

// Configuration par défaut
export const DEFAULT_DESIGN_V6: DesignConfigV6 = {
  projectColors: ['#000000'],
  
  logoHeader: [],
  
  titre: {
    text: '',
    font: 'Inter',
    fontSize: 32,
    color: '#000000',
    textAlign: 'center',
    bold: false,
    italic: false,
    underline: false,
    cadre: {
      enabled: false,
      backgroundColor: 'transparent',
      borderRadius: 8,
      padding: 16,
      border: {
        enabled: false,
        color: '#000000',
        width: 1
      }
    }
  },
  
  photo: null,
  
  explanationCourte: {
    content: '',
    font: 'Inter',
    fontSize: 16,
    color: '#000000',
    textAlign: 'left',
    cadre: {
      enabled: false,
      backgroundColor: 'transparent',
      borderRadius: 8,
      padding: 16,
      border: {
        enabled: false,
        color: '#000000',
        width: 1
      }
    }
  },
  
  explanationLongue: [{
    id: 'block-1',
    content: '',
    font: 'Inter',
    fontSize: 16,
    color: '#000000',
    textAlign: 'left',
    order: 0,
    cadre: {
      enabled: false,
      backgroundColor: 'transparent',
      borderRadius: 8,
      padding: 16,
      border: {
        enabled: false,
        color: '#000000',
        width: 1
      }
    }
  }],
  
  
  bouton: {
    text: 'Commencer le questionnaire',
    
    backgroundColor: '#F5F5F5',
    hasBackground: true,
    
    border: {
      width: 1,
      color: '#000000',
      hasBorder: true,
      radius: 10
    },
    
    textColor: '#000000',
    fontFamily: 'Inter',
    fontSize: 16,
    bold: false,
    
    shadow: {
      enabled: false,
      blur: 8,
      offsetY: 4,
      color: 'rgba(0, 0, 0, 0.15)'
    }
  },
  
  texteObligatoire: {
    content: '',
    font: 'Inter',
    fontSize: 10,
    color: '#000000',
    textAlign: 'center',
    cadre: {
      enabled: false,
      backgroundColor: 'transparent',
      borderRadius: 8,
      padding: 16,
      border: {
        enabled: false,
        color: '#000000',
        width: 1
      }
    }
  },
  
  logosPartenaires: [],
  
  fond: {
    type: 'color',
    value: '#FFFFFF'
  }
}
