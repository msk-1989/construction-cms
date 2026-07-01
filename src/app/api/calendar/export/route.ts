import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })

    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

    const tasks = await db.task.findMany({
      where: { projectId, dueDate: { not: null } },
      select: { title: true, dueDate: true, status: true, priority: true },
    })

    const milestones = await db.milestone.findMany({
      where: { projectId, date: { not: null } },
      select: { title: true, date: true, status: true },
    })

    // Build ICS content
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Construction CMS//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${project.name}`,
      `X-WR-CALDESC:${project.description ?? project.name} Project Calendar`,
    ]

    for (const task of tasks) {
      if (!task.dueDate) continue
      const d = task.dueDate.replace(/-/g, '')
      lines.push(
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${d}`,
        `DTEND;VALUE=DATE:${d}`,
        `SUMMARY:${task.title}`,
        `DESCRIPTION:Status: ${task.status} | Priority: ${task.priority}`,
        `UID:task-${task.dueDate}@cms`,
        'END:VEVENT',
      )
    }

    for (const ms of milestones) {
      if (!ms.date) continue
      const d = ms.date.replace(/-/g, '')
      lines.push(
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${d}`,
        `DTEND;VALUE=DATE:${d}`,
        `SUMMARY:🏁 ${ms.title}`,
        `DESCRIPTION:Milestone - ${ms.status}`,
        `UID:ms-${ms.date}@cms`,
        'END:VEVENT',
      )
    }

    lines.push('END:VCALENDAR')

    const ics = lines.join('\r\n')
    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${project.code}-calendar.ics"`,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to export calendar'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}