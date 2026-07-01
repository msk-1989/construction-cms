import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true, position: true } } } },
        _count: { select: { tasks: true, members: true, comments: true, documents: true, changeOrders: true, punchItems: true, rfis: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        manager: { select: { id: true, name: true, avatar: true, email: true, phone: true } },
        engineer: { select: { id: true, name: true, avatar: true, email: true, phone: true } },
        safetyOfficer: { select: { id: true, name: true, avatar: true, email: true, phone: true } },
        budgetCategories: { include: { _count: { select: { expenses: true } }, _sum: { expenses: { select: { amount: true } } } } },
        milestones: { orderBy: { date: 'asc' } },
        labels: true,
      },
    })
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }
    const data = {
      ...project,
      memberCount: project._count.members,
      taskCount: project._count.tasks,
    }
    return NextResponse.json({ success: true, data })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const project = await db.project.update({
      where: { id },
      data: body,
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        manager: { select: { id: true, name: true, avatar: true } },
      },
    })
    return NextResponse.json({ success: true, data: project })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.project.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}