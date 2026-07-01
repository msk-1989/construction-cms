import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List grant templates
export async function GET() {
  try {
    const templates = await db.grantTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: templates })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a grant template
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, permissions, duration, createdBy } = body

    if (!name || !permissions?.length || !createdBy) {
      return NextResponse.json({ error: 'name, permissions, and createdBy are required' }, { status: 400 })
    }

    const template = await db.grantTemplate.create({
      data: { name, description, permissions, duration, createdBy },
    })

    return NextResponse.json({ success: true, data: template })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}