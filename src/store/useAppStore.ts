import { create } from 'zustand'
import type { ViewType } from '@/types/cms'

interface AppState {
  currentView: ViewType
  selectedProjectId: string | null
  sidebarOpen: boolean
  setCurrentView: (view: ViewType) => void
  setSelectedProjectId: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()((set) => ({
  currentView: 'dashboard',
  selectedProjectId: null,
  sidebarOpen: true,
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
