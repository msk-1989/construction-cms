'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { ROLE_PERMISSIONS, type Permission } from '@/lib/permissions'
import type { ExceptionalGrant } from '@/types/cms'

export function usePermissions() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role || 'MEMBER'

  const permissions = useMemo(() => {
    return new Set<Permission>(ROLE_PERMISSIONS[role] || [])
  }, [role])

  const can = (permission: Permission): boolean => permissions.has(permission)

  const canAny = (...perms: Permission[]): boolean => perms.some((p) => permissions.has(p))

  const canAll = (...perms: Permission[]): boolean => perms.every((p) => permissions.has(p))

  const hasGrant = (permission: string, grants?: ExceptionalGrant[]): boolean => {
    if (!grants?.length) return false
    const now = new Date()
    return grants.some(g => g.permission === permission && g.status === 'ACTIVE' && (!g.endDate || new Date(g.endDate) > now))
  }

  return {
    can, canAny, canAll, hasGrant,
    isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
    isSuperAdmin: role === 'SUPER_ADMIN',
    isManager: role === 'MANAGER',
    isMember: role === 'MEMBER',
    role, permissions,
  }
}