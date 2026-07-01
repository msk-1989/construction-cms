import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId

    const logs = await db.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    })
    return NextResponse.json({ success: true, data: logs })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.action || !body.userId) {
      return NextResponse.json({ success: false, error: 'action and userId are required' }, { status: 400 })
    }
    const log = await db.activityLog.create({
      data: {
        action: body.action,
        details: body.details || null,
        userId: body.userId,
        projectId: body.projectId || null,
        relatedId: body.relatedId || null,
        relatedType: body.relatedType || null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    })
    return NextResponse.json({ success: true, data: log }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}