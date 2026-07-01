import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 })
    const documents = await db.document.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true, avatar: true } } },
    })
    return NextResponse.json({ success: true, data: documents })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.title || !body.filename || !body.fileType || !body.url || !body.category || !body.projectId || !body.uploadedById) {
      return NextResponse.json({ success: false, error: 'title, filename, fileType, url, category, projectId, and uploadedById are required' }, { status: 400 })
    }
    const document = await db.document.create({
      data: {
        title: body.title,
        filename: body.filename,
        fileType: body.fileType,
        fileSize: body.fileSize || 0,
        url: body.url,
        category: body.category,
        version: body.version || 1,
        description: body.description || null,
        projectId: body.projectId,
        uploadedById: body.uploadedById,
      },
      include: { uploadedBy: { select: { id: true, name: true, avatar: true } } },
    })
    return NextResponse.json({ success: true, data: document }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    const document = await db.document.update({
      where: { id },
      data,
      include: { uploadedBy: { select: { id: true, name: true, avatar: true } } },
    })
    return NextResponse.json({ success: true, data: document })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.document.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}