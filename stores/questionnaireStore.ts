import { create } from 'zustand'

export interface Question {
  id: string
  concertation_id: string
  ordre: number
  type: 'choix_unique' | 'choix_multiple' | 'texte_libre' | 'echelle'
  question_text: string
  obligatoire: boolean
  options: {
    options?: string[]
    min?: number
    max?: number
    label_min?: string
    label_max?: string
  } | null
  photo_autorisee: boolean
  image_url?: string | null
  created_at: string
}

interface QuestionnaireState {
  questions: Question[]
  selectedQuestionId: string | null
  concertationId: string | null
  
  setQuestions: (questions: Question[]) => void
  addQuestion: (question: Question) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  deleteQuestion: (id: string) => void
  reorderQuestions: (newOrder: Question[]) => void
  selectQuestion: (id: string | null) => void
  setConcertationId: (id: string) => void
  getSelectedQuestion: () => Question | null
}

export const useQuestionnaireStore = create<QuestionnaireState>((set, get) => ({
  questions: [],
  selectedQuestionId: null,
  concertationId: null,

  setQuestions: (questions) => {
    set({ questions })
  },

  addQuestion: (question) => {
    set((state) => ({
      questions: [...state.questions, question],
      selectedQuestionId: question.id
    }))
  },

  updateQuestion: (id, updates) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      )
    }))
  },

  deleteQuestion: (id) => {
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== id),
      selectedQuestionId: state.selectedQuestionId === id ? null : state.selectedQuestionId
    }))
  },

  reorderQuestions: (newOrder) => {
    set({ questions: newOrder })
  },

  selectQuestion: (id) => {
    set({ selectedQuestionId: id })
  },

  setConcertationId: (id) => {
    set({ concertationId: id })
  },

  getSelectedQuestion: () => {
    const state = get()
    return state.questions.find((q) => q.id === state.selectedQuestionId) || null
  }
}))