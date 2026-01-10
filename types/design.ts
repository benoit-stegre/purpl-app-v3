export type LogoSize = 'small' | 'medium' | 'large'
export type FondType = 'color' | 'image'

export interface CadreConfig {
  enabled: boolean
  backgroundColor: string
  borderRadius: number
  padding: number
}

export interface ButtonCadreConfig {
  enabled: boolean
  borderColor: string
  borderWidth: number
}

export interface CropConfig {
  x: number
  y: number
  scale: number
}

export interface TextBlockConfig {
  id: string
  text: string
  font: string
  fontSize: number
  color: string
  cadre: CadreConfig
}

export interface LogoPartenaireConfig {
  id: string
  url: string
  size: LogoSize
}

export interface DesignConfig {
  logo: {
    url: string | null
    size: LogoSize
  }
  
  titre: {
    text: string
    font: string
    fontSize: number
    color: string
    cadre: CadreConfig
  }
  
  photo: {
    url: string | null
    crop: CropConfig
  }
  
  explanationCourte: {
    text: string
    font: string
    fontSize: number
    color: string
    cadre: CadreConfig
  }
  
  explanationLongue: TextBlockConfig[]
  
  buttons: {
    button1Text: string
    button2Text: string
    font: string
    fontSize: number
    textColor: string
    backgroundColor: string
    borderRadius: number
    padding: number
    cadre: ButtonCadreConfig
  }
  
  texteObligatoire: {
    text: string
    font: string
    fontSize: number
    color: string
  }
  
  logosPartenaires: LogoPartenaireConfig[]
  
  fond: {
    type: FondType
    value: string
  }
}

// Configuration par défaut
export const DEFAULT_DESIGN_CONFIG: DesignConfig = {
  logo: {
    url: null,
    size: 'medium'
  },
  titre: {
    text: 'Titre de la concertation',
    font: 'Inter',
    fontSize: 32,
    color: '#000000',
    cadre: {
      enabled: false,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 16
    }
  },
  photo: {
    url: null,
    crop: {
      x: 0,
      y: 0,
      scale: 1
    }
  },
  explanationCourte: {
    text: 'Explication courte de la concertation',
    font: 'Inter',
    fontSize: 16,
    color: '#333333',
    cadre: {
      enabled: false,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 16
    }
  },
  explanationLongue: [
    {
      id: 'block-1',
      text: 'Premier paragraphe de l\'explication détaillée',
      font: 'Inter',
      fontSize: 16,
      color: '#333333',
      cadre: {
        enabled: false,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16
      }
    }
  ],
  buttons: {
    button1Text: 'Commencer',
    button2Text: 'En savoir plus',
    font: 'Inter',
    fontSize: 16,
    textColor: '#ffffff',
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 16,
    cadre: {
      enabled: false,
      borderColor: '#000000',
      borderWidth: 2
    }
  },
  texteObligatoire: {
    text: 'Informations légales ou mentions obligatoires',
    font: 'Inter',
    fontSize: 12,
    color: '#666666'
  },
  logosPartenaires: [],
  fond: {
    type: 'color',
    value: '#f5f5f5'
  }
}