import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            projectMemberships: true,
            assignedTasks: true,
            createdProjects: true,
          },
        },
      },
    })
    return NextResponse.json({ success: true, data: users })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}