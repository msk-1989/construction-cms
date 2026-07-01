import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const taskId = searchParams.get('taskId')

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (taskId) where.taskId = taskId

    const comments = await db.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    return NextResponse.json({ success: true, data: comments })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.content || !body.userId) {
      return NextResponse.json({ success: false, error: 'Content and userId are required' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { id: body.userId }, select: { name: true } })
    const comment = await db.comment.create({
      data: {
        content: body.content,
        mentions: body.mentions || null,
        parentId: body.parentId || null,
        taskId: body.taskId || null,
        projectId: body.projectId || null,
        userId: body.userId,
        userName: user?.name || 'Unknown',
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    })
    return NextResponse.json({ success: true, data: comment }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    const comment = await db.comment.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    })
    return NextResponse.json({ success: true, data: comment })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.comment.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}