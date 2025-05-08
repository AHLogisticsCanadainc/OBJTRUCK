import { create } from "zustand"

type NavigationState = {
  pendingNavigation: string | null
  lastNavigation: string | null
  navigationAttempts: Record<string, number>
  setPendingNavigation: (path: string | null) => void
  setLastNavigation: (path: string | null) => void
  incrementNavigationAttempt: (path: string) => number
  resetNavigationAttempt: (path: string) => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  pendingNavigation: null,
  lastNavigation: null,
  navigationAttempts: {},
  setPendingNavigation: (path) => set({ pendingNavigation: path }),
  setLastNavigation: (path) => set({ lastNavigation: path }),
  incrementNavigationAttempt: (path) => {
    const currentAttempts = get().navigationAttempts[path] || 0
    const newAttempts = currentAttempts + 1
    set({
      navigationAttempts: {
        ...get().navigationAttempts,
        [path]: newAttempts,
      },
    })
    return newAttempts
  },
  resetNavigationAttempt: (path) => {
    const navigationAttempts = { ...get().navigationAttempts }
    delete navigationAttempts[path]
    set({ navigationAttempts })
  },
}))
