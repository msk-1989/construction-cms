import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    const labels = await db.label.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tasks: true } } },
    })
    return NextResponse.json({ success: true, data: labels })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name || !body.color) {
      return NextResponse.json({ success: false, error: 'Name and color are required' }, { status: 400 })
    }
    const label = await db.label.create({
      data: { name: body.name, color: body.color, projectId: body.projectId || null },
    })
    return NextResponse.json({ success: true, data: label }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.label.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}