import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })
    const data = await db.photoDocumentation.findMany({
      where: { projectId },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch photo docs'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await db.photoDocumentation.create({
      data: {
        title: body.title,
        filename: body.filename ?? 'photo.png',
        url: body.url,
        category: body.category ?? 'PROGRESS',
        location: body.location ?? null,
        description: body.description ?? null,
        beforeUrl: body.beforeUrl ?? null,
        projectId: body.projectId,
        taskId: body.taskId ?? null,
        uploadedById: body.uploadedById,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create photo doc'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, ...updateData } = body
    const data = await db.photoDocumentation.update({
      where: { id },
      data: updateData,
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update photo doc'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.photoDocumentation.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete photo doc'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}