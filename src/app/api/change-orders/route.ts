import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })
    const data = await db.changeOrder.findMany({
      where: { projectId },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch change orders'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await db.changeOrder.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status ?? 'PROPOSED',
        costImpact: body.costImpact ?? 0,
        scheduleImpact: body.scheduleImpact ?? null,
        reason: body.reason ?? null,
        projectId: body.projectId,
        requestedById: body.requestedById ?? null,
      },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create change order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, status, approvedById, ...updateData } = body
    if (status === 'APPROVED') {
      updateData.approvedById = approvedById ?? null
      updateData.approvedAt = new Date().toISOString()
    }
    if (status === 'IMPLEMENTED' && !updateData.approvedAt) {
      const existing = await db.changeOrder.findUnique({ where: { id } })
      if (existing?.status !== 'APPROVED') {
        return NextResponse.json({ success: false, error: 'Must be APPROVED before IMPLEMENTED' }, { status: 400 })
      }
    }
    if (status) updateData.status = status
    const data = await db.changeOrder.update({
      where: { id },
      data: updateData,
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update change order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.changeOrder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete change order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}