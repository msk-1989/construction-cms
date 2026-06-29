import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 })
    }

    const userCount = await db.user.count()
    const role = userCount === 0 ? 'ADMIN' : 'MEMBER'

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: { email, password: hashedPassword, name, role },
    })

    const { password: _, ...safeUser } = user
    return NextResponse.json({ success: true, data: safeUser })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}