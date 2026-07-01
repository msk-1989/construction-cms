import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { taskId, labelId } = await request.json()
    if (!taskId || !labelId) {
      return NextResponse.json({ success: false, error: 'taskId and labelId are required' }, { status: 400 })
    }
    const existing = await db.taskLabel.findUnique({ where: { taskId_labelId: { taskId, labelId } } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Label already linked to task' }, { status: 409 })
    }
    const taskLabel = await db.taskLabel.create({
      data: { taskId, labelId },
      include: { label: true },
    })
    return NextResponse.json({ success: true, data: taskLabel }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { taskId, labelId } = await request.json()
    if (!taskId || !labelId) {
      return NextResponse.json({ success: false, error: 'taskId and labelId are required' }, { status: 400 })
    }
    await db.taskLabel.delete({ where: { taskId_labelId: { taskId, labelId } } })
    return NextResponse.json({ success: true, data: { taskId, labelId } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}