import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }
    if (user.password !== password) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }
    const { password: _, ...safeUser } = user
    const response = NextResponse.json({ success: true, data: safeUser })
    response.cookies.set('userId', user.id, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}