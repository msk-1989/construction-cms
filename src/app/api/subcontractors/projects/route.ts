import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    const where = projectId ? { projectId } : {}
    const data = await db.subcontractorProject.findMany({
      where,
      include: { subcontractor: true, project: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch assignments'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await db.subcontractorProject.create({
      data: {
        subcontractorId: body.subcontractorId,
        projectId: body.projectId,
        contractAmount: body.contractAmount ?? null,
        startDate: body.startDate ?? null,
        endDate: body.endDate ?? null,
        status: body.status ?? 'ACTIVE',
      },
      include: { subcontractor: true, project: true },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to assign subcontractor'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, ...updateData } = body
    const data = await db.subcontractorProject.update({
      where: { id },
      data: updateData,
      include: { subcontractor: true, project: true },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update assignment'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.subcontractorProject.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove assignment'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}