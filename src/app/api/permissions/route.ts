import { NextResponse } from 'next/server'

// Permission overrides for different roles
const PERMISSIONS = [
  { role: 'ADMIN', module: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage_members'] },
  { role: 'ADMIN', module: 'tasks', actions: ['create', 'read', 'update', 'delete', 'assign'] },
  { role: 'ADMIN', module: 'budget', actions: ['create', 'read', 'update', 'delete', 'approve'] },
  { role: 'ADMIN', module: 'procurement', actions: ['create', 'read', 'update', 'delete', 'approve'] },
  { role: 'ADMIN', module: 'contracts', actions: ['create', 'read', 'update', 'delete', 'approve'] },
  { role: 'ADMIN', module: 'reports', actions: ['read', 'export'] },
  { role: 'ADMIN', module: 'settings', actions: ['read', 'update'] },
  { role: 'ADMIN', module: 'users', actions: ['create', 'read', 'update', 'delete'] },
  { role: 'MANAGER', module: 'projects', actions: ['create', 'read', 'update', 'manage_members'] },
  { role: 'MANAGER', module: 'tasks', actions: ['create', 'read', 'update', 'assign'] },
  { role: 'MANAGER', module: 'budget', actions: ['create', 'read', 'update', 'approve'] },
  { role: 'MANAGER', module: 'procurement', actions: ['create', 'read', 'update', 'approve'] },
  { role: 'MANAGER', module: 'contracts', actions: ['create', 'read', 'update', 'approve'] },
  { role: 'MANAGER', module: 'reports', actions: ['read', 'export'] },
  { role: 'MEMBER', module: 'projects', actions: ['read'] },
  { role: 'MEMBER', module: 'tasks', actions: ['create', 'read', 'update'] },
  { role: 'MEMBER', module: 'budget', actions: ['read'] },
  { role: 'MEMBER', module: 'procurement', actions: ['read'] },
  { role: 'MEMBER', module: 'contracts', actions: ['read'] },
  { role: 'MEMBER', module: 'reports', actions: ['read'] },
]

export async function GET() {
  return NextResponse.json({ success: true, data: PERMISSIONS })
}