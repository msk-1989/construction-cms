import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    const totalProjects = await db.project.count()
    const activeProjects = await db.project.count({ where: { status: 'ACTIVE' } })
    const completedProjects = await db.project.count({ where: { status: 'COMPLETED' } })
    const onHoldProjects = await db.project.count({ where: { status: 'ON_HOLD' } })

    const totalTasks = await db.task.count()
    const pendingTasks = await db.task.count({ where: { status: 'PENDING' } })
    const inProgressTasks = await db.task.count({ where: { status: 'IN_PROGRESS' } })
    const completedTasks = await db.task.count({ where: { status: 'COMPLETED' } })

    const totalMembers = await db.user.count()

    const recentProjects = await db.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tasks: true, members: true } },
        createdBy: {
          select: { id: true, email: true, name: true, role: true, avatar: true },
        },
      },
    })

    const upcomingTasks = await db.task.findMany({
      where: {
        status: { not: 'COMPLETED' },
        dueDate: { not: null },
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        totalMembers,
        recentProjects,
        upcomingTasks,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}