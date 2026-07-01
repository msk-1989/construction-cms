'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { LoginView } from '@/components/cms/LoginView'
import { Sidebar } from '@/components/cms/Sidebar'
import { Header } from '@/components/cms/Header'
import { DashboardView } from '@/components/cms/DashboardView'
import { ProjectsView } from '@/components/cms/ProjectsView'
import { ProjectDetailView } from '@/components/cms/ProjectDetailView'
import { TasksView } from '@/components/cms/TasksView'
import { TeamView } from '@/components/cms/TeamView'
import { ReportsView } from '@/components/cms/ReportsView'
import { SettingsView } from '@/components/cms/SettingsView'
import { NotificationsView } from '@/components/cms/NotificationsView'
import { AdminDashboardView } from '@/components/cms/AdminDashboardView'
import { CorporatePanel } from '@/components/cms/CorporatePanel'
import { SitePanel } from '@/components/cms/SitePanel'
import { ExternalPanel } from '@/components/cms/ExternalPanel'
import { ChatView } from '@/components/cms/ChatView'
import { ProcurementPanel } from '@/components/cms/ProcurementPanel'
import { HRPanel } from '@/components/cms/HRPanel'
import { FinancePanel } from '@/components/cms/FinancePanel'
import { QAPanel } from '@/components/cms/QAPanel'
import { SafetyPanel } from '@/components/cms/SafetyPanel'
import { StorePanel } from '@/components/cms/StorePanel'
import { AIChatPanel } from '@/components/cms/AIChatPanel'
import { Toaster } from '@/components/ui/sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { HardHat, Phone } from 'lucide-react'
import { OnboardingTour } from '@/components/cms/OnboardingTour'
import type { ViewType } from '@/types/cms'

const VIEW_TITLES: Record<ViewType, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  'project-detail': 'Project Details',
  tasks: 'Tasks',
  team: 'Team',
  reports: 'Reports',
  settings: 'Settings',
  notifications: 'Notifications',
  admin: 'Super Admin',
  chat: 'Chat',
  corporate: 'Corporate',
  site: 'Site Operations',
  external: 'External Portal',
  procurement: 'Procurement',
  hr: 'HR Management',
  finance: 'Financial Management',
  qa: 'Quality Assurance',
  safety: 'Safety Management',
  'store-panel': 'Store Management',
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
}

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const currentView = useAppStore((s) => s.currentView)

  // Dynamic page title
  useEffect(() => {
    if (isAuthenticated) {
      document.title = `${VIEW_TITLES[currentView] || 'Dashboard'} — CBOS`
    } else {
      document.title = 'Sign In — CBOS'
    }
  }, [currentView, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <>
        <AnimatePresence mode="wait">
          <motion.div
            key="login"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <LoginView />
          </motion.div>
        </AnimatePresence>
        <Toaster position="top-center" richColors />
      </>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />
      case 'projects': return <ProjectsView />
      case 'project-detail': return <ProjectDetailView />
      case 'tasks': return <TasksView />
      case 'team': return <TeamView />
      case 'reports': return <ReportsView />
      case 'settings': return <SettingsView />
      case 'notifications': return <NotificationsView />
      case 'admin': return <AdminDashboardView />
      case 'chat': return <ChatView />
      case 'corporate': return <CorporatePanel />
      case 'site': return <SitePanel />
      case 'external': return <ExternalPanel />
      case 'procurement': return <ProcurementPanel />
      case 'hr': return <HRPanel />
      case 'finance': return <FinancePanel />
      case 'qa': return <QAPanel />
      case 'safety': return <SafetyPanel />
      case 'store-panel': return <StorePanel />
      default: return <DashboardView />
    }
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-50/50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
          <footer className="border-t bg-card px-6 py-3 mt-auto">
            <div className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground sm:flex-row sm:gap-3">
              <span className="flex items-center gap-1.5 font-medium text-foreground/70">
                <HardHat className="h-3.5 w-3.5" />
                CBOS Construction ERP
              </span>
              <span className="hidden sm:block h-3 w-px bg-border" />
              <span>&copy; 2026 CBOS Construction ERP. All Rights Reserved. | Version 1.0.0</span>
              <span className="hidden sm:block h-3 w-px bg-border" />
              <span>Developed, Managed &amp; Maintained by <span className="font-medium text-foreground/70">MultiNex Multi Solution's LLP</span></span>
              <span className="hidden sm:block h-3 w-px bg-border" />
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Contact: +91 98903 72241
              </span>
            </div>
          </footer>
        </div>
      </div>
      <Toaster position="top-right" richColors />
      <OnboardingTour />
      <AIChatPanel />
    </>
  )
}