import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const task = await db.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, avatar: true, email: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
        subtasks: { orderBy: { createdAt: 'asc' } },
        comments: { include: { user: { select: { id: true, name: true, avatar: true } }, replies: { include: { user: { select: { id: true, name: true, avatar: true } } } } }, orderBy: { createdAt: 'desc' } },
        labels: { include: { label: true } },
        timeEntries: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { date: 'desc' } },
        attachments: { include: { uploadedBy: { select: { id: true, name: true, avatar: true } } } },
        dependencies: { include: { dependsOn: { select: { id: true, title: true, status: true } } } },
        dependedOnBy: { include: { task: { select: { id: true, title: true, status: true } } } },
        _count: { select: { subtasks: true, comments: true, attachments: true } },
      },
    })
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: task })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const task = await db.task.update({
      where: { id },
      data: body,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
        _count: { select: { subtasks: true, comments: true, attachments: true } },
        labels: { include: { label: true } },
      },
    })
    return NextResponse.json({ success: true, data: task })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.task.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}