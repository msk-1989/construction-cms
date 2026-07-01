import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    if (!taskId) return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 })
    const subtasks = await db.subtask.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ success: true, data: subtasks })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.title || !body.taskId) {
      return NextResponse.json({ success: false, error: 'Title and taskId are required' }, { status: 400 })
    }
    const subtask = await db.subtask.create({
      data: { title: body.title, completed: body.completed ?? false, taskId: body.taskId },
    })
    return NextResponse.json({ success: true, data: subtask }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    const subtask = await db.subtask.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: subtask })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.subtask.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}