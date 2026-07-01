'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────
interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// ── Typing indicator component ─────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-2">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-amber-500 text-white text-xs">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <motion.span
            className="w-2 h-2 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.15,
            }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.3,
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Panel animation variants ───────────────────────────────
const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 28, stiffness: 300 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

const fabVariants = {
  idle: { scale: 1 },
  pulse: { scale: [1, 1.08, 1], transition: { duration: 2, repeat: Infinity } },
  hover: { scale: 1.1 },
  tap: { scale: 0.95 },
}

// ── Backdrop ───────────────────────────────────────────────
function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
      onClick={onClick}
      aria-hidden="true"
    />
  )
}

// ── Main Component ─────────────────────────────────────────
export function AIChatPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // ── Scroll to bottom ────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isThinking])

  // ── Focus input on open ─────────────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 350)
    }
  }, [open])

  // ── Close on Escape ─────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  // ── Close when clicking outside panel ───────────────────
  const handleBackdropClick = useCallback(() => {
    setOpen(false)
  }, [])

  // ── Send message ────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || sending) return

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setSending(true)
    setIsThinking(true)

    // Simulate "thinking" delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    try {
      const res = await globalThis.fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      const json = await res.json()

      if (json.success) {
        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: json.data.reply,
          timestamp: json.data.timestamp ?? new Date().toISOString(),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        toast.error(json.error || 'AI assistant failed to respond')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setIsThinking(false)
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        variants={fabVariants}
        initial="idle"
        animate={open ? 'idle' : 'pulse'}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg',
          'flex items-center justify-center',
          'bg-gradient-to-br from-amber-400 to-orange-500',
          'text-white hover:from-amber-500 hover:to-orange-600',
          'transition-shadow hover:shadow-xl hover:shadow-amber-500/25',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2'
        )}
        aria-label={open ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="sparkles"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <Backdrop onClick={handleBackdropClick} />
            <motion.div
              ref={panelRef}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 z-50 h-[70vh] w-96 max-w-[calc(100vw-2rem)] mt-16 mr-4 rounded-xl border border-border bg-background shadow-2xl shadow-black/10 flex flex-col overflow-hidden"
            >
              {/* ─── Panel Header ─────────────────────────── */}
              <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      AI Assistant
                    </h3>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Construction management helper
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* ─── Messages ──────────────────────────────── */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {messages.length === 0 && !isThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center py-10 text-center"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 mb-3">
                        <Sparkles className="h-6 w-6 text-amber-500" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Ask me anything
                      </p>
                      <p className="text-xs text-muted-foreground max-w-[220px]">
                        I can help with project analysis, reports, scheduling,
                        and construction management insights.
                      </p>
                    </motion.div>
                  )}

                  {messages.map((msg) => {
                    const isUser = msg.role === 'user'

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          'flex gap-2.5',
                          isUser ? 'flex-row-reverse' : 'flex-row'
                        )}
                      >
                        {/* Avatar */}
                        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                          <AvatarFallback
                            className={cn(
                              'text-xs',
                              isUser
                                ? 'bg-muted-foreground/20 text-muted-foreground'
                                : 'bg-amber-500 text-white'
                            )}
                          >
                            {isUser ? (
                              <User className="h-3.5 w-3.5" />
                            ) : (
                              <Bot className="h-3.5 w-3.5" />
                            )}
                          </AvatarFallback>
                        </Avatar>

                        {/* Bubble */}
                        <div
                          className={cn(
                            'flex flex-col max-w-[80%] min-w-0',
                            isUser ? 'items-end' : 'items-start'
                          )}
                        >
                          <div
                            className={cn(
                              'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
                              isUser
                                ? 'bg-amber-500 text-white rounded-br-md'
                                : 'bg-muted text-foreground rounded-bl-md'
                            )}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-muted-foreground/60 mt-0.5 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}

                  {/* Typing indicator */}
                  {isThinking && <TypingIndicator />}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* ─── Input Area ────────────────────────────── */}
              <div className="p-3 border-t border-border shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the AI assistant..."
                    disabled={sending}
                    className="flex-1 bg-muted/50 border-border text-sm focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || sending}
                    size="icon"
                    className="shrink-0 h-9 w-9 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}