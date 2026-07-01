import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ success: false, error: 'Recurring task ID required' }, { status: 400 })

    const recurring = await db.recurringTask.findUnique({ where: { id } })
    if (!recurring) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    if (!recurring.enabled) return NextResponse.json({ success: false, error: 'Recurring task is disabled' }, { status: 400 })

    // Create a task from the recurring task
    const task = await db.task.create({
      data: {
        title: recurring.title,
        description: recurring.description ?? '',
        status: 'PENDING',
        priority: recurring.priority,
        progress: 0,
        dueDate: recurring.nextDueDate,
        estimatedHours: recurring.estimatedHours,
        billable: true,
        isMilestone: false,
        projectId: recurring.projectId,
        assigneeId: recurring.assigneeId ?? null,
        createdById: recurring.createdById,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    })

    // Calculate next due date based on recurrence rule
    const currentDate = new Date(recurring.nextDueDate)
    let nextDate = new Date(currentDate)
    const rule = recurring.recurrenceRule

    if (rule === 'DAILY') {
      nextDate.setDate(nextDate.getDate() + 1)
    } else if (rule === 'WEEKLY') {
      nextDate.setDate(nextDate.getDate() + 7)
    } else if (rule === 'BIWEEKLY') {
      nextDate.setDate(nextDate.getDate() + 14)
    } else if (rule === 'MONTHLY') {
      nextDate.setMonth(nextDate.getMonth() + 1)
    } else if (rule === 'QUARTERLY') {
      nextDate.setMonth(nextDate.getMonth() + 3)
    }

    // Update recurring task
    await db.recurringTask.update({
      where: { id },
      data: {
        nextDueDate: nextDate.toISOString().split('T')[0],
        lastGenerated: new Date().toISOString(),
      },
    })

    return NextResponse.json({ success: true, data: task }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate task'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}