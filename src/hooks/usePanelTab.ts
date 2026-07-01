'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

/**
 * Hook for panels to sync their active tab from the sidebar navigation store.
 * Returns the store-driven tab and a handler that clears it after consuming.
 *
 * Usage in panel:
 *   const { storeTab, handleTabChange } = usePanelTab('default-tab-id', VALID_TABS)
 *   const [activeTab, setActiveTab] = useState(storeTab)
 *   const derivedTab = activePanelTab && VALID_TABS.includes(activePanelTab) ? activePanelTab : activeTab
 *   // ...
 *   <Tabs value={derivedTab} onValueChange={(t) => { setActiveTab(t); handleTabChange() }}>
 */
export function usePanelTab(defaultTab: string, validTabs: string[] = []) {
  const activePanelTab = useAppStore((s) => s.activePanelTab)
  const setPanelTab = useAppStore((s) => s.setPanelTab)

  // Clear store tab after consuming (no React setState here, only external store update)
  useEffect(() => {
    if (activePanelTab) {
      const id = requestAnimationFrame(() => setPanelTab(null))
      return () => cancelAnimationFrame(id)
    }
  }, [activePanelTab, setPanelTab])

  // Derive: use store tab if valid, else default
  const storeTab = (activePanelTab && (validTabs.length === 0 || validTabs.includes(activePanelTab)))
    ? activePanelTab
    : defaultTab

  const handleTabChange = () => {
    if (activePanelTab) setPanelTab(null)
  }

  return { storeTab, handleTabChange }
}