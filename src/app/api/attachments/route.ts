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

    const attachments = await db.attachment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true, avatar: true } } },
    })
    return NextResponse.json({ success: true, data: attachments })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.filename || !body.fileType || !body.url || !body.uploadedById) {
      return NextResponse.json({ success: false, error: 'filename, fileType, url, and uploadedById are required' }, { status: 400 })
    }
    const attachment = await db.attachment.create({
      data: {
        filename: body.filename,
        fileType: body.fileType,
        fileSize: body.fileSize || 0,
        url: body.url,
        taskId: body.taskId || null,
        projectId: body.projectId || null,
        uploadedById: body.uploadedById,
      },
      include: { uploadedBy: { select: { id: true, name: true, avatar: true } } },
    })
    return NextResponse.json({ success: true, data: attachment }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.attachment.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}