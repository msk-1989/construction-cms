// @ts-expect-error React Compiler optimization skipped
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import type { Task, TaskStatus } from '@/types/cms'
import { format, addDays, differenceInDays, startOfDay, parseISO, isAfter, isBefore, isWithinInterval } from 'date-fns'

interface GanttChartProps {
  tasks: Task[]
}

type GroupBy = 'status' | 'assignee' | 'none'

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-emerald-500',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-400',
  IN_PROGRESS: 'bg-amber-500',
  COMPLETED: 'bg-emerald-500',
  ON_HOLD: 'bg-orange-400',
  CANCELLED: 'bg-gray-300',
}

export function GanttChart({ tasks }: GanttChartProps) {
  const [viewDays, setViewDays] = useState(60)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [groupBy, setGroupBy] = useState<GroupBy>('status')

  const tasksWithDates = useMemo(() => {
    return tasks
      .filter(t => t.dueDate || t.createdAt)
      .map(t => {
        const start = parseISO(t.createdAt)
        const end = t.dueDate ? parseISO(t.dueDate) : addDays(start, 7)
        return { ...t, _start: start, _end: end }
      })
      .sort((a, b) => a._start.getTime() - b._start.getTime())
  }, [tasks])

  const dateRange = useMemo(() => {
    if (tasksWithDates.length === 0) {
      const now = new Date()
      return { start: startOfDay(now), end: addDays(now, 60) }
    }
    const starts = tasksWithDates.map(t => t._start)
    const ends = tasksWithDates.map(t => t._end)
    const earliest = new Date(Math.min(...starts.map(d => d.getTime())))
    const latest = new Date(Math.max(...ends.map(d => d.getTime())))
    return { start: addDays(earliest, -3), end: addDays(latest, 7) }
  }, [tasksWithDates])

  const totalDays = differenceInDays(dateRange.end, dateRange.start)
  const dayWidth = Math.max(20, 800 / viewDays)

  const visibleStart = addDays(dateRange.start, scrollOffset)
  const visibleEnd = addDays(visibleStart, viewDays)

  const visibleStartMs = visibleStart.getTime()
  const days = useMemo(() => {
    const result: Date[] = []
    const vs = visibleStart
    for (let i = 0; i < viewDays; i++) {
      result.push(addDays(vs, i))
    }
    return result
  }, [visibleStartMs, viewDays])

  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') return { 'All Tasks': tasksWithDates }
    if (groupBy === 'status') {
      const groups: Record<string, typeof tasksWithDates> = {}
      for (const task of tasksWithDates) {
        const key = STATUS_LABELS[task.status] || task.status
        if (!groups[key]) groups[key] = []
        groups[key].push(task)
      }
      return groups
    }
    if (groupBy === 'assignee') {
      const groups: Record<string, typeof tasksWithDates> = {}
      for (const task of tasksWithDates) {
        const key = task.assignee?.name || 'Unassigned'
        if (!groups[key]) groups[key] = []
        groups[key].push(task)
      }
      return groups
    }
    return { 'All Tasks': tasksWithDates }
  }, [tasksWithDates, groupBy])

  const getBarLeft = (task: (typeof tasksWithDates)[0]) => {
    const diff = differenceInDays(task._start, visibleStart)
    return diff * dayWidth
  }

  const getBarWidth = (task: (typeof tasksWithDates)[0]) => {
    const diff = differenceInDays(task._end, task._start)
    return Math.max(diff * dayWidth, dayWidth)
  }

  const canScrollLeft = scrollOffset > 0
  const canScrollRight = scrollOffset + viewDays < totalDays

  if (tasks.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm text-muted-foreground">No tasks with dates to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base font-semibold">Gantt Chart</CardTitle>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['none', 'status', 'assignee'] as GroupBy[]).map(g => (
              <Button
                key={g}
                variant={groupBy === g ? 'default' : 'outline'}
                size="sm"
                className={cn('text-xs h-7', groupBy === g && 'bg-amber-600 hover:bg-amber-700')}
                onClick={() => setGroupBy(g)}
              >
                {g === 'none' ? 'All' : g === 'status' ? 'By Status' : 'By Assignee'}
              </Button>
            ))}
            <div className="h-4 w-px bg-border mx-1" />
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewDays(d => Math.max(14, d - 7))} disabled={viewDays <= 14}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground w-8 text-center">{viewDays}d</span>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewDays(d => Math.min(180, d + 7))} disabled={viewDays >= 180}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Timeline header */}
        <div className="overflow-x-auto">
          <div className="min-w-fit">
            {/* Date headers */}
            <div className="flex border-b">
              <div className="w-48 shrink-0 p-2 text-xs font-medium text-muted-foreground border-r">
                Task
              </div>
              <div className="flex relative" style={{ width: dayWidth * viewDays }}>
                {days.map((day, i) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  return (
                    <div
                      key={i}
                      className={cn(
                        'text-center border-r text-[10px] py-1 shrink-0',
                        isWeekend && 'bg-muted/30',
                        isToday && 'bg-amber-50 dark:bg-amber-900/20'
                      )}
                      style={{ width: dayWidth }}
                    >
                      {i % Math.ceil(viewDays / 15) === 0 && (
                        <span className={cn(isToday && 'text-amber-600 font-semibold')}>
                          {format(day, 'MMM d')}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="flex border-b">
              <div className="w-48 shrink-0 border-r flex items-center justify-between px-2">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setScrollOffset(s => Math.max(0, s - 7))} disabled={!canScrollLeft}>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-[10px] text-muted-foreground">
                  {format(visibleStart, 'MMM d')} – {format(visibleEnd, 'MMM d, yyyy')}
                </span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setScrollOffset(s => s + 7)} disabled={!canScrollRight}>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <div style={{ width: dayWidth * viewDays }} className="relative">
                {/* Today line will be positioned here */}
                {(() => {
                  const today = new Date()
                  if (isAfter(today, visibleEnd) || isBefore(today, visibleStart)) return null
                  const offset = differenceInDays(today, visibleStart)
                  return (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: offset * dayWidth + dayWidth / 2 }}
                    />
                  )
                })()}
              </div>
            </div>

            {/* Task rows grouped */}
            <TooltipProvider delayDuration={200}>
              {Object.entries(groupedTasks).map(([group, groupTasks]) => (
                <div key={group}>
                  {/* Group header */}
                  {groupBy !== 'none' && (
                    <div className="flex bg-muted/40 border-b">
                      <div className="w-48 shrink-0 px-2 py-1.5 border-r">
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{group}</span>
                        <Badge variant="secondary" className="ml-2 text-[10px] h-4">{groupTasks.length}</Badge>
                      </div>
                      <div style={{ width: dayWidth * viewDays }} />
                    </div>
                  )}
                  {groupTasks.map(task => {
                    const barLeft = getBarLeft(task)
                    const barWidth = getBarWidth(task)
                    const isVisible = barLeft + barWidth > 0 && barLeft < dayWidth * viewDays
                    const clampedLeft = Math.max(0, barLeft)
                    const clampedWidth = Math.min(barLeft + barWidth, dayWidth * viewDays) - clampedLeft

                    return (
                      <div key={task.id} className="flex border-b hover:bg-muted/20 transition-colors">
                        <div className="w-48 shrink-0 px-2 py-2 border-r flex items-center gap-1.5 min-w-0">
                          <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', PRIORITY_COLORS[task.priority] || 'bg-gray-400')} />
                          <span className="text-xs truncate">{task.title}</span>
                        </div>
                        <div className="relative" style={{ width: dayWidth * viewDays, height: 36 }}>
                          {isVisible && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    'absolute top-2 h-5 rounded-sm cursor-pointer transition-all hover:opacity-90 flex items-center px-1.5',
                                    task.status === 'COMPLETED' ? 'opacity-70' : 'opacity-100',
                                    STATUS_COLORS[task.status] || 'bg-gray-400'
                                  )}
                                  style={{
                                    left: clampedLeft,
                                    width: Math.max(clampedWidth, 4),
                                  }}
                                >
                                  {clampedWidth > 40 && (
                                    <span className="text-[10px] text-white font-medium truncate">
                                      {task.title}
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs max-w-xs">
                                <div className="font-semibold">{task.title}</div>
                                <div className="text-muted-foreground">
                                  {format(task._start, 'MMM d')} → {format(task._end, 'MMM d, yyyy')}
                                </div>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="secondary" className="text-[10px] h-4">{task.status}</Badge>
                                  <Badge variant="outline" className="text-[10px] h-4">{task.priority}</Badge>
                                  {task.progress > 0 && <span>{task.progress}%</span>}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}