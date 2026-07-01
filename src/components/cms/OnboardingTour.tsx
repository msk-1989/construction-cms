'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HardHat, FolderKanban, ListTodo, MessageSquare, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TOUR_KEY = 'cbos-onboarding-completed'

const tips = [
  {
    icon: HardHat,
    title: 'Welcome to CBOS!',
    description: 'Your all-in-one Construction Business Operating System. Manage projects, tasks, teams, finances, and more.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: FolderKanban,
    title: 'Manage Projects',
    description: 'Create and track projects with progress, budgets, timelines, and team assignments.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: ListTodo,
    title: 'Track Tasks',
    description: 'Organize work with tasks, priorities, and deadlines. Use list or kanban views.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: MessageSquare,
    title: 'Collaborate',
    description: 'Chat with your team, share updates, and stay in sync across all projects.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    description: 'Use the AI chat panel in the bottom-right corner for quick help and insights.',
    color: 'from-sky-500 to-cyan-500',
  },
]

function checkTourFlag(): boolean {
  if (typeof window === 'undefined') return false
  return !localStorage.getItem(TOUR_KEY)
}

export function OnboardingTour() {
  const [show, setShow] = useState(false)
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    if (checkTourFlag()) {
      const id = requestAnimationFrame(() => setShow(true))
      return () => cancelAnimationFrame(id)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(TOUR_KEY, 'true')
    setShow(false)
  }

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1)
    } else {
      handleDismiss()
    }
  }

  const handlePrev = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1)
    }
  }

  if (!show) return null

  const tip = tips[currentTip]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-card border shadow-2xl rounded-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon Area */}
          <div className="relative h-32 flex items-center justify-center">
            <div className={`absolute inset-0 bg-gradient-to-br ${tip.color} opacity-10`} />
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tip.color} flex items-center justify-center shadow-xl`}>
              <tip.icon className="w-8 h-8 text-white" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 text-muted-foreground/70 hover:text-foreground hover:bg-white/10 h-8 w-8"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>

            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-5 mb-4">
              {tips.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTip(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentTip ? 'w-6 bg-amber-500' : 'w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {currentTip > 0 && (
                <Button variant="outline" className="flex-1" onClick={handlePrev}>
                  Back
                </Button>
              )}
              <Button
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={handleNext}
              >
                {currentTip === tips.length - 1 ? 'Got it!' : 'Next'}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              Skip tour
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}