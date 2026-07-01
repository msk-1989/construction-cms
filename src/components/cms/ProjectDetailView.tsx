'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, MapPin, Users, User, HardHat, Shield,
  CalendarDays, DollarSign, Clock, FileText, CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'
import type { Project } from '@/types/cms'
import { ProjectManagementTabs } from './ProjectManagementTabs'
import { format } from 'date-fns'

const STATUS_STYLES: Record<string, string> = {
  PLANNING: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
  ON_HOLD: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
  COMPLETED: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
}

const PROGRESS_COLORS: Record<string, string> = {
  PLANNING: 'bg-sky-500',
  ACTIVE: 'bg-emerald-500',
  ON_HOLD: 'bg-orange-500',
  COMPLETED: 'bg-teal-500',
  CANCELLED: 'bg-red-500',
}

export function ProjectDetailView() {
  const { selectedProjectId, setCurrentView } = useAppStore()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = useCallback(async () => {
    if (!selectedProjectId) return
    setLoading(true)
    try {
      const res = await globalThis.fetch(`/api/projects/${selectedProjectId}`)
      if (!res.ok) throw new Error('Failed to fetch project')
      const data = await res.json()
      setProject(data)
    } catch {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [selectedProjectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">Project not found</p>
        <Button variant="outline" onClick={() => setCurrentView('projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentView('projects')}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Projects
      </Button>

      {/* Hero Banner */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className={cn(
          'relative bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 p-6 md:p-8',
          'dark:from-amber-900 dark:via-amber-800 dark:to-orange-900'
        )}>
          <div className="absolute inset-0 bg-[url(\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==\')] opacity-50" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{project.name}</h1>
                  <Badge className={cn('border bg-white/20 text-white backdrop-blur-sm', STATUS_STYLES[project.status]?.replace(/bg-\S+/g, '').replace(/text-\S+/g, '').replace(/border-\S+/g, ''))} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-amber-100 text-sm flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {project.code}
                  {project.projectType && (
                    <>
                      <span className="mx-1">•</span>
                      {project.projectType}
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-6 text-white min-w-0">
                <div className="text-center">
                  <div className="text-3xl font-bold">{project.progress}%</div>
                  <div className="text-xs text-amber-100">Progress</div>
                </div>
                {project.budget && (
                  <div className="text-center hidden sm:block">
                    <div className="text-lg font-semibold">₹{(project.budget / 100000).toFixed(1)}L</div>
                    <div className="text-xs text-amber-100">Budget</div>
                  </div>
                )}
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', PROGRESS_COLORS[project.status] || 'bg-amber-500')}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Info Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Project Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type badges */}
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" /> Types
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.projectType && (
                  <Badge variant="outline" className="text-xs">{project.projectType}</Badge>
                )}
                {project.contractType && (
                  <Badge variant="outline" className="text-xs">{project.contractType.replace(/_/g, ' ')}</Badge>
                )}
              </div>
            </div>

            {/* Site Address */}
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Site Address
              </div>
              <p className="text-sm">{project.siteAddress || 'Not specified'}</p>
            </div>

            {/* Workforce */}
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3 w-3" /> Workforce
              </div>
              <p className="text-sm">
                {project.totalWorkforce || 0} total
                {project.dailyLaborCount && <span className="text-muted-foreground"> · {project.dailyLaborCount} daily</span>}
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" /> Timeline
              </div>
              <p className="text-sm">
                {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'TBD'}
                {project.endDate && (
                  <span className="text-muted-foreground"> → {format(new Date(project.endDate), 'MMM d, yyyy')}</span>
                )}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Key Personnel */}
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Personnel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <User className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Project Manager</div>
                <div className="text-sm font-medium truncate">{project.manager?.name || 'Not assigned'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <HardHat className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Engineer</div>
                <div className="text-sm font-medium truncate">{project.engineer?.name || 'Not assigned'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Shield className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Safety Officer</div>
                <div className="text-sm font-medium truncate">{project.safetyOfficer?.name || 'Not assigned'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <ProjectManagementTabs project={project} projectId={selectedProjectId!} />
    </motion.div>
  )
}