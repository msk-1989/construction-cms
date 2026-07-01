'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellOff, Check, CheckCheck, Loader2, Filter,
  MessageSquare, AlertTriangle, Info, FileText, DollarSign,
  Users, Shield, Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/store/useAuthStore'
import type { Notification } from '@/types/cms'

const REFRESH_INTERVAL = 10_000

function getNotificationIcon(type: string) {
  const t = type.toLowerCase()
  if (t.includes('task')) return FileText
  if (t.includes('project')) return AlertTriangle
  if (t.includes('budget') || t.includes('expense') || t.includes('payment') || t.includes('financial')) return DollarSign
  if (t.includes('team') || t.includes('member') || t.includes('user')) return Users
  if (t.includes('admin') || t.includes('system') || t.includes('role')) return Shield
  if (t.includes('chat') || t.includes('message')) return MessageSquare
  if (t.includes('alert') || t.includes('warning') || t.includes('safety')) return AlertTriangle
  if (t.includes('rfi') || t.includes('submittal') || t.includes('document')) return FileText
  return Bell
}

function getNotificationColor(type: string) {
  const t = type.toLowerCase()
  if (t.includes('task')) return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
  if (t.includes('project')) return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  if (t.includes('budget') || t.includes('expense') || t.includes('payment')) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (t.includes('alert') || t.includes('warning') || t.includes('safety')) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  if (t.includes('system') || t.includes('admin')) return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  if (t.includes('chat') || t.includes('message')) return 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function NotificationsView() {
  const user = useAuthStore((state) => state.user)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [markingId, setMarkingId] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await globalThis.fetch(`/api/notifications?userId=${user.id}`)
      const json = await res.json()
      if (json.success) {
        setNotifications(json.data.notifications)
        setUnreadCount(json.data.unreadCount)
      }
    } catch {
      // Silent fail for background refreshes
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchNotifications()
    intervalRef.current = setInterval(fetchNotifications, REFRESH_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchNotifications])

  const handleMarkRead = async (id: string) => {
    setMarkingId(id)
    try {
      const res = await globalThis.fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.success) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch {
      toast.error('Failed to mark notification as read')
    } finally {
      setMarkingId(null)
    }
  }

  const handleMarkAllRead = async () => {
    if (!user?.id) return
    setMarkingAll(true)
    try {
      const res = await globalThis.fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userId: user.id }),
      })
      const json = await res.json()
      if (json.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
        toast.success(`${json.data.updated} notifications marked as read`)
      }
    } catch {
      toast.error('Failed to mark all as read')
    } finally {
      setMarkingAll(false)
    }
  }

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read)
    return notifications
  }, [notifications, filter])

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Stay updated with the latest activity</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="gap-2"
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark All Read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all" className="gap-2">
            <Bell className="h-4 w-4" /> All
            <span className="text-xs text-muted-foreground">({notifications.length})</span>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            <Filter className="h-4 w-4" /> Unread
            <span className="text-xs text-muted-foreground">({unreadCount})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-16" /></div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className={cn(
              'p-4 rounded-full mb-4',
              filter === 'unread' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-900/30'
            )}>
              {filter === 'unread' ? (
                <BellOff className="h-8 w-8 text-amber-500 dark:text-amber-400" />
              ) : (
                <Bell className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <p className="font-medium text-foreground">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'unread'
                ? 'You have no unread notifications'
                : 'Notifications about project activity will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-300px)]">
          <div className="space-y-2 pr-4">
            <AnimatePresence initial={false}>
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                const iconColor = getNotificationColor(notification.type)
                const isMarking = markingId === notification.id

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={cn(
                        'border-0 shadow-sm cursor-pointer transition-all hover:shadow-md',
                        !notification.read && 'ring-1 ring-amber-200 dark:ring-amber-800 bg-amber-50/50 dark:bg-amber-950/10'
                      )}
                      onClick={() => !notification.read && handleMarkRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={cn('p-2.5 rounded-lg shrink-0', iconColor)}>
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className={cn(
                                  'text-sm font-medium leading-tight',
                                  notification.read ? 'text-muted-foreground' : 'text-foreground'
                                )}>
                                  {notification.title}
                                </p>
                                <p className={cn(
                                  'text-xs mt-1 line-clamp-2',
                                  notification.read ? 'text-muted-foreground/60' : 'text-muted-foreground'
                                )}>
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {!notification.read && (
                                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                                )}
                                <span className="text-[11px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Type badge and mark read button */}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px]">
                                {notification.type || 'Notification'}
                              </Badge>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                  onClick={(e) => { e.stopPropagation(); handleMarkRead(notification.id) }}
                                  disabled={isMarking}
                                >
                                  {isMarking ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3 mr-1" />
                                  )}
                                  Mark read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}