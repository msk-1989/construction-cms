import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, role: true, avatar: true } },
            createdBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { ...project, memberCount: project.members.length } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch project'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()

    const project = await db.project.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.status && { status: data.status }),
        ...(data.startDate !== undefined && { startDate: data.startDate || null }),
        ...(data.endDate !== undefined && { endDate: data.endDate || null }),
        ...(data.budget !== undefined && { budget: data.budget ? parseFloat(data.budget) : null }),
        ...(data.progress !== undefined && { progress: parseFloat(data.progress) }),
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
        _count: { select: { tasks: true } },
      },
    })

    return NextResponse.json({ success: true, data: { ...project, memberCount: project.members.length } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update project'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.projectMember.deleteMany({ where: { projectId: id } })
    await db.task.deleteMany({ where: { projectId: id } })
    await db.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete project'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}