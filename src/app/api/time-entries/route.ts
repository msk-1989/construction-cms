import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    if (!taskId) return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 })
    const entries = await db.timeEntry.findMany({
      where: { taskId },
      orderBy: { date: 'desc' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })
    const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0)
    return NextResponse.json({ success: true, data: { entries, totalDuration } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.taskId || !body.userId || !body.date || body.duration == null) {
      return NextResponse.json({ success: false, error: 'taskId, userId, date, and duration are required' }, { status: 400 })
    }
    const entry = await db.timeEntry.create({
      data: {
        description: body.description || null,
        duration: body.duration,
        date: body.date,
        taskId: body.taskId,
        userId: body.userId,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })
    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.timeEntry.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}