'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { ROLE_PERMISSIONS, type Permission } from '@/lib/permissions'

export function usePermissions() {
  const user = useAuthStore((state) => state.user)

  const role = user?.role || 'MEMBER'

  const permissions = useMemo(() => {
    return new Set<Permission>(ROLE_PERMISSIONS[role] || [])
  }, [role])

  const can = (permission: Permission): boolean => {
    return permissions.has(permission)
  }

  const canAny = (...perms: Permission[]): boolean => {
    return perms.some((p) => permissions.has(p))
  }

  const canAll = (...perms: Permission[]): boolean => {
    return perms.every((p) => permissions.has(p))
  }

  return {
    can,
    canAny,
    canAll,
    isAdmin: role === 'ADMIN',
    isManager: role === 'MANAGER',
    isMember: role === 'MEMBER',
    role,
    permissions,
  }
}