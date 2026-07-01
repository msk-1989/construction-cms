import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const assigneeId = searchParams.get('assigneeId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (assigneeId) where.assigneeId = assigneeId
    if (status) where.status = status

    const tasks = await db.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
        _count: { select: { subtasks: true, comments: true, attachments: true } },
        labels: { include: { label: true } },
      },
    })

    return NextResponse.json({ success: true, data: tasks })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.title || !body.projectId || !body.createdById) {
      return NextResponse.json({ success: false, error: 'Title, projectId, and createdById are required' }, { status: 400 })
    }
    const task = await db.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status || 'PENDING',
        priority: body.priority || 'MEDIUM',
        progress: body.progress || 0,
        dueDate: body.dueDate || null,
        estimatedHours: body.estimatedHours || null,
        billable: body.billable ?? true,
        isMilestone: body.isMilestone ?? false,
        projectId: body.projectId,
        assigneeId: body.assigneeId || null,
        createdById: body.createdById,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
        _count: { select: { subtasks: true, comments: true, attachments: true } },
        labels: { include: { label: true } },
      },
    })
    return NextResponse.json({ success: true, data: task }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}