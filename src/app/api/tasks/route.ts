import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const projectId = searchParams.get('projectId')
    const assigneeId = searchParams.get('assigneeId')

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (assigneeId) where.assigneeId = assigneeId

    const tasks = await db.task.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: tasks })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, status, priority, dueDate, projectId, assigneeId, createdById } = body

    if (!title || !projectId || !createdById) {
      return NextResponse.json(
        { success: false, error: 'Title, projectId, and createdById are required' },
        { status: 400 }
      )
    }

    const task = await db.task.create({
      data: {
        title,
        description: description || null,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        dueDate: dueDate || null,
        projectId,
        assigneeId: assigneeId || null,
        createdById,
      },
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

    return NextResponse.json({ success: true, data: task }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    )
  }
}