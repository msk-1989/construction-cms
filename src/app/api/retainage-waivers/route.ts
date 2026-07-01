import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })
    const data = await db.retainageWaiver.findMany({
      where: { projectId },
      include: {
        approvedBy: { select: { id: true, name: true, email: true } },
        contract: { select: { id: true, contractNo: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch retainage waivers'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await db.retainageWaiver.create({
      data: {
        title: body.title,
        vendorName: body.vendorName,
        waiverType: body.waiverType,
        amount: body.amount,
        retainagePercent: body.retainagePercent,
        status: body.status ?? 'PENDING',
        projectId: body.projectId,
        contractId: body.contractId ?? null,
        approvedById: body.approvedById ?? null,
        notes: body.notes ?? null,
      },
      include: {
        approvedBy: { select: { id: true, name: true, email: true } },
        contract: { select: { id: true, contractNo: true, title: true } },
      },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create retainage waiver'
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
    if (status === 'RELEASED') {
      updateData.approvedAt = new Date().toISOString()
    }
    if (status) updateData.status = status
    const data = await db.retainageWaiver.update({
      where: { id },
      data: updateData,
      include: {
        approvedBy: { select: { id: true, name: true, email: true } },
        contract: { select: { id: true, contractNo: true, title: true } },
      },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update retainage waiver'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.retainageWaiver.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete retainage waiver'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}