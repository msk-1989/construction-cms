import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })

    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

    const tasks = await db.task.findMany({
      where: { projectId },
      select: { id: true, title: true, status: true, progress: true, createdAt: true, completedAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
    const remainingTasks = totalTasks - completedTasks

    // Generate burndown data points (weekly)
    const startDate = new Date(project.createdAt)
    const now = new Date()
    const weeks: { week: string; ideal: number; actual: number }[] = []
    const dayMs = 7 * 24 * 60 * 60 * 1000

    let weekIndex = 0
    let cursor = new Date(startDate)
    while (cursor <= now || weekIndex < 4) {
      const weekEnd = new Date(cursor.getTime() + dayMs)
      const tasksCompletedByWeek = tasks.filter(t => {
        if (!t.completedAt) return false
        return new Date(t.completedAt) <= weekEnd
      }).length
      const idealRemaining = Math.max(0, totalTasks - (weekIndex + 1) * (totalTasks / 4))
      const actualRemaining = totalTasks - tasksCompletedByWeek

      weeks.push({
        week: `Week ${weekIndex + 1}`,
        ideal: Math.round(idealRemaining * 10) / 10,
        actual: actualRemaining,
      })

      cursor = weekEnd
      weekIndex++
      if (weekIndex >= 12) break
    }

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        projectName: project.name,
        totalTasks,
        completedTasks,
        remainingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        weeks,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate burndown'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}