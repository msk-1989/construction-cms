'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash,
  Megaphone,
  Building2,
  Send,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { ChatMessage, Project } from '@/types/cms'

// ── Channel types ──────────────────────────────────────────
interface ChannelInfo {
  id: string
  name: string
  icon: string
  isSystem: boolean
  code?: string
  messageCount: number
}

// ── Helpers ────────────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()

  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getChannelIcon(iconName: string, className?: string) {
  const cls = className ?? 'h-4 w-4'
  switch (iconName) {
    case 'megaphone':
      return <Megaphone className={cls} />
    case 'building':
      return <Building2 className={cls} />
    default:
      return <Hash className={cls} />
  }
}

// ── Component ──────────────────────────────────────────────
export function ChatView() {
  const { user } = useAuthStore()
  const userId = user?.id ?? ''

  const [channels, setChannels] = useState<ChannelInfo[]>([])
  const [activeChannel, setActiveChannel] = useState<string>('general')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState('')
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeChannelInfo = channels.find((c) => c.id === activeChannel)

  // ── Fetch channels ─────────────────────────────────────
  const fetchChannels = useCallback(async () => {
    try {
      const res = await globalThis.fetch('/api/chat?listChannels=true')
      const json = await res.json()
      if (json.success) {
        setChannels(json.data as ChannelInfo[])
      }
    } catch {
      toast.error('Failed to load channels')
    } finally {
      setLoadingChannels(false)
    }
  }, [])

  // ── Fetch messages ─────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!activeChannel) return
    setLoadingMessages(true)
    try {
      const res = await globalThis.fetch(
        `/api/chat?channelId=${encodeURIComponent(activeChannel)}`
      )
      const json = await res.json()
      if (json.success) {
        setMessages(json.data as ChatMessage[])
      }
    } catch {
      // silent fail on polling
    } finally {
      setLoadingMessages(false)
    }
  }, [activeChannel])

  // ── Load channels on mount ─────────────────────────────
  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  // ── Poll messages every 3 seconds ──────────────────────
  useEffect(() => {
    if (!activeChannel) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [activeChannel, fetchMessages])

  // ── Scroll to bottom on new messages ───────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // ── Send message ───────────────────────────────────────
  const handleSend = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || !userId || !activeChannel) return

    const tempId = `temp-${Date.now()}`
    setSending(tempId)

    // Optimistic insert
    const optimistic: ChatMessage = {
      id: tempId,
      content: trimmed,
      type: 'TEXT',
      channelId: activeChannel,
      userId,
      createdAt: new Date().toISOString(),
      user: user
        ? { ...user, password: undefined, _count: undefined }
        : undefined,
    }
    setMessages((prev) => [...prev, optimistic])
    setInputValue('')

    try {
      const res = await globalThis.fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          channelId: activeChannel,
          userId,
          type: 'TEXT',
        }),
      })
      const json = await res.json()
      if (json.success) {
        // Replace optimistic with real message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? json.data : m))
        )
      } else {
        toast.error(json.error || 'Failed to send message')
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
      }
    } catch {
      toast.error('Network error')
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setSending('')
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="flex h-full border border-border rounded-lg overflow-hidden bg-background">
      {/* ─── Left Sidebar ──────────────────────────────── */}
      <aside className="w-64 border-r border-border bg-muted/30 flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            Channels
          </h2>
        </div>

        <ScrollArea className="flex-1">
          {loadingChannels ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <nav className="p-2 space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left group',
                    activeChannel === channel.id
                      ? 'bg-amber-500/10 text-amber-600 font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0',
                      activeChannel === channel.id
                        ? 'text-amber-500'
                        : 'text-muted-foreground/60 group-hover:text-muted-foreground'
                    )}
                  >
                    {getChannelIcon(channel.icon)}
                  </span>
                  <span className="truncate flex-1">{channel.name}</span>
                  {channel.messageCount > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'h-5 min-w-5 text-[10px] px-1.5',
                        activeChannel === channel.id
                          ? 'bg-amber-500/20 text-amber-600'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {channel.messageCount}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          )}
        </ScrollArea>
      </aside>

      {/* ─── Main Chat Area ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel Header */}
        <div className="h-14 border-b border-border flex items-center gap-3 px-4 shrink-0">
          <span className="text-amber-500">
            {activeChannelInfo
              ? getChannelIcon(activeChannelInfo.icon, 'h-5 w-5')
              : <Hash className="h-5 w-5" />}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {activeChannelInfo?.name ?? 'Select a channel'}
            </h3>
            {activeChannelInfo?.code && (
              <p className="text-xs text-muted-foreground">
                {activeChannelInfo.code}
              </p>
            )}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          <div className="p-4 space-y-1">
            <AnimatePresence initial={false}>
              {messages.length === 0 && !loadingMessages && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Start the conversation!
                  </p>
                </motion.div>
              )}

              {loadingMessages && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-16"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </motion.div>
              )}

              {messages.map((msg, idx) => {
                const isMe = msg.userId === userId
                const isSystem = msg.type === 'SYSTEM'
                const senderName = msg.user?.name ?? 'Unknown User'
                const senderInitials = getInitials(senderName)
                const showAvatar =
                  idx === 0 ||
                  messages[idx - 1].userId !== msg.userId ||
                  isSystem

                if (isSystem) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="flex justify-center py-2"
                    >
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {msg.content}
                      </span>
                    </motion.div>
                  )
                }

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'flex gap-2.5 py-1 px-2 rounded-lg group',
                      isMe ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    {showAvatar && (
                      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                        {msg.user?.avatar && (
                          <AvatarImage
                            src={msg.user.avatar}
                            alt={senderName}
                          />
                        )}
                        <AvatarFallback
                          className={cn(
                            'text-[11px] font-medium',
                            isMe
                              ? 'bg-amber-500 text-white'
                              : 'bg-muted-foreground/20 text-muted-foreground'
                          )}
                        >
                          {senderInitials}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {!showAvatar && <div className="w-8 shrink-0" />}

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        'flex flex-col max-w-[70%] min-w-0',
                        isMe ? 'items-end' : 'items-start'
                      )}
                    >
                      {showAvatar && (
                        <div
                          className={cn(
                            'flex items-center gap-2 mb-0.5',
                            isMe ? 'flex-row-reverse' : 'flex-row'
                          )}
                        >
                          <span className="text-xs font-medium text-foreground">
                            {senderName}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      )}

                      <div
                        className={cn(
                          'px-3 py-2 rounded-2xl text-sm leading-relaxed break-words',
                          isMe
                            ? 'bg-amber-500 text-white rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <Separator />
        <div className="p-4 shrink-0">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeChannelInfo
                  ? `Message #${activeChannelInfo.name.toLowerCase()}...`
                  : 'Select a channel to start chatting...'
              }
              disabled={!activeChannel || !userId}
              className="flex-1 bg-muted/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || !userId || !!sending}
              size="icon"
              className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}