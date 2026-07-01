import { create } from 'zustand'
import type { ViewType } from '@/types/cms'

interface AppState {
  currentView: ViewType
  selectedProjectId: string | null
  sidebarOpen: boolean
  activePanelTab: string | null
  setCurrentView: (view: ViewType) => void
  setSelectedProjectId: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setPanelTab: (tab: string | null) => void
}

export const useAppStore = create<AppState>()((set) => ({
  currentView: 'dashboard',
  selectedProjectId: null,
  sidebarOpen: true,
  activePanelTab: null,
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setPanelTab: (tab) => set({ activePanelTab: tab }),
}))
