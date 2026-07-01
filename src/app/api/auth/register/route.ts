import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'Email, password, and name are required' }, { status: 400 })
    }
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }
    const user = await db.user.create({
      data: { email, password, name, role: role || 'MEMBER' },
    })
    const { password: _, ...safeUser } = user
    return NextResponse.json({ success: true, data: safeUser }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}