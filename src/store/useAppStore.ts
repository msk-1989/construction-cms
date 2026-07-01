import { create } from 'zustand'
import type { ViewType } from '@/types/cms'

interface AppState {
  currentView: ViewType
  selectedProjectId: string | null
  sidebarOpen: boolean
  activePanelTab: string | null
  lastNavTab: string | null
  setCurrentView: (view: ViewType) => void
  setSelectedProjectId: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setPanelTab: (tab: string | null) => void
  setLastNavTab: (tab: string | null) => void
}

export const useAppStore = create<AppState>()((set) => ({
  currentView: 'dashboard',
  selectedProjectId: null,
  sidebarOpen: true,
  activePanelTab: null,
  lastNavTab: null,
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setPanelTab: (tab) => set({ activePanelTab: tab }),
  setLastNavTab: (tab) => set({ lastNavTab: tab }),
}))
