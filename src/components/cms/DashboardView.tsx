'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FolderKanban, ListTodo, Users, TrendingUp, ArrowRight, Plus, Clock, CheckCircle2,
  AlertTriangle, Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { DashboardStats, Project, Task, ActivityLog } from '@/types/cms'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  PLANNING: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  ON_HOLD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  COMPLETED: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
}

const priorityColor: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  LOW: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const taskStatusColor: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ON_HOLD: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setSelectedProjectId = useAppStore((s) => s.setSelectedProjectId)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const res = await globalThis.fetch('/api/dashboard')
      if (res.ok) {
        const data = await res.json()
        setStats(data.data || data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const openProject = (id: string) => {
    setSelectedProjectId(id)
    setCurrentView('project-detail')
  }

  const statCards = stats
    ? [
        {
          label: 'Active Projects',
          value: stats.activeProjects,
          icon: FolderKanban,
          color: 'from-amber-500 to-orange-500',
          bgLight: 'bg-amber-50 dark:bg-amber-900/20',
          textColor: 'text-amber-600 dark:text-amber-400',
        },
        {
          label: 'Total Tasks',
          value: stats.totalTasks,
          icon: ListTodo,
          color: 'from-emerald-500 to-teal-500',
          bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
          textColor: 'text-emerald-600 dark:text-emerald-400',
        },
        {
          label: 'Team Members',
          value: stats.totalMembers,
          icon: Users,
          color: 'from-violet-500 to-purple-500',
          bgLight: 'bg-violet-50 dark:bg-violet-900/20',
          textColor: 'text-violet-600 dark:text-violet-400',
        },
        {
          label: 'Completion Rate',
          value: stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0,
          icon: TrendingUp,
          color: 'from-rose-500 to-pink-500',
          bgLight: 'bg-rose-50 dark:bg-rose-900/20',
          textColor: 'text-rose-600 dark:text-rose-400',
          suffix: '%',
        },
      ]
    : []

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening across your projects.</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" variants={container} initial="hidden" animate="show">
          {statCards.map((s) => (
            <motion.div key={s.label} variants={item}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                      <p className="text-3xl font-bold mt-1 tracking-tight">
                        {s.value}{s.suffix || ''}
                      </p>
                    </div>
                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg', s.color)}>
                      <s.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className={cn('mt-3 h-1.5 rounded-full overflow-hidden', s.bgLight)}>
                    <div className={cn('h-full rounded-full bg-gradient-to-r', s.color)} style={{ width: `${Math.min(s.value * (s.suffix ? 1 : 5), 100)}%` }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm" onClick={() => setCurrentView('projects')}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setCurrentView('tasks')}>
            <Plus className="h-4 w-4" /> New Task
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setCurrentView('team')}>
            <Users className="h-4 w-4" /> Manage Team
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setCurrentView('reports')}>
            <TrendingUp className="h-4 w-4" /> View Reports
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.35 }}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FolderKanban className="h-4.5 w-4.5 text-amber-500" />
                  Recent Projects
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" onClick={() => setCurrentView('projects')}>
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2.5">
                  {(stats?.recentProjects || []).slice(0, 5).map((project) => (
                    <button
                      key={project.id}
                      onClick={() => openProject(project.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0">
                        <FolderKanban className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{project.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{project.code}</span>
                          <Progress value={project.progress} className="h-1.5 w-16" />
                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px] shrink-0', statusColor[project.status] || '')}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </button>
                  ))}
                  {(!stats?.recentProjects || stats.recentProjects.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">No projects yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-emerald-500" />
                  Upcoming Tasks
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" onClick={() => setCurrentView('tasks')}>
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2.5">
                  {(stats?.upcomingTasks || []).slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        task.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                      )}>
                        {task.status === 'COMPLETED'
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          : task.priority === 'HIGH'
                            ? <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            : <ListTodo className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.project?.name || 'Unassigned'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="outline" className={cn('text-[10px]', priorityColor[task.priority] || '')}>
                          {task.priority}
                        </Badge>
                        {task.dueDate && <span className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</span>}
                      </div>
                    </div>
                  ))}
                  {(!stats?.upcomingTasks || stats.upcomingTasks.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">No upcoming tasks</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Activity Feed */}
      {loading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.45 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-orange-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-96">
                <div className="space-y-3">
                  {(stats?.recentActivity || []).slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 py-2">
                      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold">
                          {log.user?.name ? log.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{log.user?.name || 'Unknown'}</span>
                          <span className="text-muted-foreground"> {log.details || log.action}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}