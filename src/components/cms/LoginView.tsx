'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HardHat, Building2, Wrench, Hammer, Cone, Settings2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import type { User } from '@/types/cms'

const floatingIcons = [
  { Icon: HardHat, x: '10%', y: '15%', delay: 0, duration: 6 },
  { Icon: Building2, x: '80%', y: '20%', delay: 1, duration: 7 },
  { Icon: Wrench, x: '20%', y: '75%', delay: 2, duration: 8 },
  { Icon: Hammer, x: '75%', y: '70%', delay: 0.5, duration: 6.5 },
  { Icon: Cone, x: '50%', y: '10%', delay: 1.5, duration: 7.5 },
  { Icon: Settings2, x: '85%', y: '50%', delay: 2.5, duration: 8.5 },
  { Icon: HardHat, x: '30%', y: '40%', delay: 3, duration: 7 },
  { Icon: Building2, x: '60%', y: '85%', delay: 0.8, duration: 6.8 },
]

export function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const { theme, setTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await globalThis.fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return
      }
      login(data.user as User)
      setCurrentView('dashboard')
      toast.success(`Welcome back, ${data.user.name}!`)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail('raj@cms.com')
    setPassword('password')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-orange-700 dark:from-amber-700 dark:via-orange-800 dark:to-orange-950">
      {/* Floating Icons */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-white/10 dark:text-white/5 pointer-events-none"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -20, 0, 20, 0],
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 1, 0.95, 1],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <item.Icon className="w-12 h-12 sm:w-16 sm:h-16" />
        </motion.div>
      ))}

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 z-10"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
      </Button>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Card className="border-0 shadow-2xl shadow-black/20 dark:shadow-black/40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <CardContent className="p-8 sm:p-10">
            {/* Logo */}
            <motion.div
              className="flex flex-col items-center mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
                <HardHat className="h-9 w-9 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">CBOS</h1>
              <p className="text-sm text-muted-foreground mt-1">Construction Business Operating System</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-amber-500/30"
                  autoComplete="email"
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-amber-500/30"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium shadow-lg shadow-amber-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Demo Credentials */}
            <motion.div
              className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wider">Demo Credentials</p>
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-0.5">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-mono">raj@cms.com</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-mono">password</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  onClick={fillDemo}
                >
                  Fill
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}