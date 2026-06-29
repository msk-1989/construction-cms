import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const task = await db.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, code: true, status: true },
        },
        assignee: {
          select: { id: true, email: true, name: true, role: true, avatar: true },
        },
        createdBy: {
          select: { id: true, email: true, name: true, role: true, avatar: true },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) updateData.status = body.status
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate
    if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId || null
    if (body.progress !== undefined) updateData.progress = body.progress

    if (body.status === 'COMPLETED') {
      updateData.completedAt = new Date().toISOString()
      updateData.progress = 100
    } else if (body.status !== undefined) {
      updateData.completedAt = null
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: { id: true, name: true, code: true, status: true },
        },
        assignee: {
          select: { id: true, email: true, name: true, role: true, avatar: true },
        },
        createdBy: {
          select: { id: true, email: true, name: true, role: true, avatar: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.task.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}