import { create } from 'zustand'

export type BuilderType = 
  | 'logoHeader'
  | 'titre'
  | 'photo'
  | 'explanationCourte'
  | 'button1'
  | 'button2'
  | 'explanationLongue'
  | 'texteObligatoire'
  | 'logosPartenaires'
  | 'fond'
  | null

export type BuilderSize = 'small' | 'sidebar'

interface BuilderState {
  // État actuel
  activeBuilder: BuilderType
  builderSize: BuilderSize
  builderData: any // Données spécifiques au builder actif
  
  // Actions
  openBuilder: (type: BuilderType, size: BuilderSize, data?: any) => void
  closeBuilder: () => void
  updateBuilderData: (data: any) => void
}

export const useBuilder = create<BuilderState>((set) => ({
  // État initial
  activeBuilder: null,
  builderSize: 'small',
  builderData: null,
  
  // Ouvrir un builder
  openBuilder: (type, size, data = null) => {
    set({
      activeBuilder: type,
      builderSize: size,
      builderData: data,
    })
  },
  
  // Fermer le builder actif
  closeBuilder: () => {
    set({
      activeBuilder: null,
      builderSize: 'small',
      builderData: null,
    })
  },
  
  // Mettre à jour les données du builder
  updateBuilderData: (data) => {
    set((state) => ({
      builderData: { ...state.builderData, ...data },
    }))
  },
}))