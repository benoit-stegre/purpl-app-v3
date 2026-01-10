import { create } from 'zustand'

type RubriqueType = 
  | 'logoHeader'
  | 'titre' 
  | 'photo'
  | 'explanationCourte' 
  | 'texteObligatoire'
  | 'explanationLongue'
  | 'buttons'
  | 'bouton'
  | 'logosPartenaires'
  | 'fond'
  | null

type SidePanelType = 'upload' | 'color' | 'alignment' | 'cadre' | 'logo-alignment'

interface InlineEditorStore {
  activeRubrique: RubriqueType
  toolbarPosition: { top: number; left: number } | null
  sidePanelOpen: boolean
  sidePanelType: SidePanelType
  activateRubrique: (rubrique: RubriqueType) => void
  deactivateRubrique: () => void
  setToolbarPosition: (position: { top: number; left: number } | null) => void
  setSidePanelOpen: (open: boolean) => void
  setSidePanelType: (type: SidePanelType) => void
}

export const useInlineEditor = create<InlineEditorStore>((set) => ({
  activeRubrique: null,
  toolbarPosition: null,
  sidePanelOpen: false,
  sidePanelType: 'color',
  
  activateRubrique: (rubrique) => set({ activeRubrique: rubrique }),
  
  deactivateRubrique: () => set({
    activeRubrique: null,
    toolbarPosition: null,
    sidePanelOpen: false
  }),
  
  setToolbarPosition: (position) => set({ toolbarPosition: position }),
  
  setSidePanelOpen: (open) => set({ sidePanelOpen: open }),
  
  setSidePanelType: (type) => set({ sidePanelType: type })
}))
