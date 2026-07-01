import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })
    const data = await db.contract.findMany({
      where: { projectId },
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        paymentVouchers: { select: { id: true, voucherNo: true, amount: true, status: true } },
        retainageWaivers: { select: { id: true, title: true, amount: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch contracts'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ctCount = await db.contract.count()
    const contractNo = `CT-${String(ctCount + 1).padStart(5, '0')}`
    const data = await db.contract.create({
      data: {
        contractNo,
        title: body.title,
        contractType: body.contractType,
        status: 'DRAFT',
        value: body.value,
        retainagePercent: body.retainagePercent ?? 10,
        startDate: body.startDate ?? null,
        endDate: body.endDate ?? null,
        description: body.description ?? null,
        terms: body.terms ?? null,
        projectId: body.projectId,
        vendorId: body.vendorId ?? null,
        createdById: body.createdById,
      },
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        paymentVouchers: { select: { id: true, voucherNo: true, amount: true, status: true } },
      },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create contract'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['COMPLETED'],
  COMPLETED: ['CLOSED'],
  CLOSED: [],
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, status, approvedById, ...updateData } = body
    if (status) {
      const existing = await db.contract.findUnique({ where: { id } })
      if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
      const allowed = VALID_TRANSITIONS[existing.status] ?? []
      if (!allowed.includes(status)) {
        return NextResponse.json({ success: false, error: `Cannot transition from ${existing.status} to ${status}` }, { status: 400 })
      }
      const updatePayload: Record<string, unknown> = { ...updateData, status }
      if (status === 'ACTIVE') {
        updatePayload.approvedById = approvedById ?? null
        updatePayload.approvedAt = new Date().toISOString()
      }
      if (status === 'CLOSED') {
        updatePayload.closedAt = new Date().toISOString()
      }
      const data = await db.contract.update({
        where: { id },
        data: updatePayload,
        include: {
          vendor: true,
          createdBy: { select: { id: true, name: true, email: true } },
          paymentVouchers: { select: { id: true, voucherNo: true, amount: true, status: true } },
        },
      })
      return NextResponse.json({ success: true, data })
    }
    const data = await db.contract.update({
      where: { id },
      data: updateData,
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        paymentVouchers: { select: { id: true, voucherNo: true, amount: true, status: true } },
      },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update contract'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.contract.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete contract'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}