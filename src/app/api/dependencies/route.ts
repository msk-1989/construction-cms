import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    if (!taskId) return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 })
    const deps = await db.taskDependency.findMany({
      where: { taskId },
      include: {
        dependsOn: { select: { id: true, title: true, status: true, project: { select: { id: true, name: true, code: true } } } },
      },
    })
    return NextResponse.json({ success: true, data: deps })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, dependsOnId, type } = await request.json()
    if (!taskId || !dependsOnId || !type) {
      return NextResponse.json({ success: false, error: 'taskId, dependsOnId, and type are required' }, { status: 400 })
    }
    const dep = await db.taskDependency.create({
      data: { taskId, dependsOnId, type },
      include: {
        dependsOn: { select: { id: true, title: true, status: true } },
        task: { select: { id: true, title: true, status: true } },
      },
    })
    return NextResponse.json({ success: true, data: dep }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.taskDependency.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}