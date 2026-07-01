import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date().toISOString().split('T')[0]

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      cancelledProjects,
      planningProjects,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      onHoldTasks,
      totalMembers,
      totalExpenses,
      openRfis,
      openPunchItems,
      pendingChangeOrders,
      activeContracts,
    ] = await Promise.all([
      db.project.count(),
      db.project.count({ where: { status: 'ACTIVE' } }),
      db.project.count({ where: { status: 'COMPLETED' } }),
      db.project.count({ where: { status: 'ON_HOLD' } }),
      db.project.count({ where: { status: 'CANCELLED' } }),
      db.project.count({ where: { status: 'PLANNING' } }),
      db.task.count(),
      db.task.count({ where: { status: 'PENDING' } }),
      db.task.count({ where: { status: 'IN_PROGRESS' } }),
      db.task.count({ where: { status: 'COMPLETED' } }),
      db.task.count({ where: { status: 'ON_HOLD' } }),
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.expense.aggregate({ _sum: { amount: true } }),
      db.rFI.count({ where: { status: 'OPEN' } }),
      db.punchItem.count({ where: { status: 'OPEN' } }),
      db.changeOrder.count({ where: { status: 'PROPOSED' } }),
      db.contract.count({ where: { status: 'ACTIVE' } }),
    ])

    const budgetAgg = await db.project.aggregate({ _sum: { budget: true } })
    const totalBudget = budgetAgg._sum.budget || 0
    const totalSpent = totalExpenses._sum.amount || 0
    const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

    const overdueTasks = await db.task.count({
      where: { dueDate: { lt: now }, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
    })

    const recentProjects = await db.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { createdBy: { select: { id: true, name: true, avatar: true } } },
    })

    const upcomingTasks = await db.task.findMany({
      where: { dueDate: { gte: now }, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    })

    const recentActivity = await db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    })

    const data = {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      cancelledProjects,
      planningProjects,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      onHoldTasks,
      totalMembers,
      totalBudget,
      totalSpent,
      totalExpenses: totalSpent,
      totalSubcontractors: await db.subcontractor.count(),
      openRfis,
      openPunchItems,
      pendingChangeOrders,
      activeContracts,
      overdueTasks,
      recentProjects,
      upcomingTasks,
      recentActivity,
      budgetUtilization,
    }

    return NextResponse.json({ success: true, data })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}