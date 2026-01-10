import { create } from 'zustand'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

interface HistoryActions<T> {
  set: (newPresent: T) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  reset: (initialState: T) => void
}

const MAX_HISTORY = 50

export function createHistoryStore<T>(initialState: T) {
  return create<HistoryState<T> & HistoryActions<T>>((set, get) => ({
    past: [],
    present: initialState,
    future: [],

    set: (newPresent: T) => {
      const { present, past } = get()
      
      // Ne pas ajouter si l'état n'a pas changé
      if (JSON.stringify(present) === JSON.stringify(newPresent)) {
        return
      }

      set({
        past: [...past.slice(-MAX_HISTORY + 1), present],
        present: newPresent,
        future: []
      })
    },

    undo: () => {
      const { past, present, future } = get()
      if (past.length === 0) return

      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)

      set({
        past: newPast,
        present: previous,
        future: [present, ...future]
      })
    },

    redo: () => {
      const { past, present, future } = get()
      if (future.length === 0) return

      const next = future[0]
      const newFuture = future.slice(1)

      set({
        past: [...past, present],
        present: next,
        future: newFuture
      })
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    reset: (initialState: T) => {
      set({
        past: [],
        present: initialState,
        future: []
      })
    }
  }))
}