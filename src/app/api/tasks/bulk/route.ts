import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { ids, action, value } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !action || !value) {
      return NextResponse.json({ success: false, error: 'ids, action, and value are required' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (action === 'status') data.status = value
    else if (action === 'priority') data.priority = value
    else if (action === 'assignee') data.assigneeId = value
    else return NextResponse.json({ success: false, error: 'Invalid action. Use status, priority, or assignee' }, { status: 400 })

    if (action === 'status' && value === 'COMPLETED') {
      data.completedAt = new Date().toISOString()
      data.progress = 100
    } else if (action === 'status' && value !== 'COMPLETED') {
      data.completedAt = null
    }

    const result = await db.task.updateMany({ where: { id: { in: ids } }, data })

    return NextResponse.json({ success: true, data: { updated: result.count } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids array is required' }, { status: 400 })
    }
    const result = await db.task.deleteMany({ where: { id: { in: ids } } })
    return NextResponse.json({ success: true, data: { deleted: result.count } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}