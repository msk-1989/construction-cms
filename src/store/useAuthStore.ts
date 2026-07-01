import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/cms'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    { name: 'cbos-auth' }
  )
)
