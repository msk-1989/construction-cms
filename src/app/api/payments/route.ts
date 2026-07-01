import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })
    const data = await db.paymentVoucher.findMany({
      where: { projectId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        contract: { select: { id: true, contractNo: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch payments'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const pvCount = await db.paymentVoucher.count()
    const voucherNo = `PV-${String(pvCount + 1).padStart(5, '0')}`
    const certCount = await db.paymentVoucher.count({ where: { projectId: body.projectId } })
    const certificateNo = `CERT-${String(certCount + 1).padStart(4, '0')}`
    const data = await db.paymentVoucher.create({
      data: {
        voucherNo,
        title: body.title,
        paymentType: body.paymentType,
        status: 'DRAFT',
        amount: body.amount,
        payeeName: body.payeeName,
        paymentMode: body.paymentMode,
        bankReference: body.bankReference ?? null,
        projectId: body.projectId,
        poId: body.poId ?? null,
        contractId: body.contractId ?? null,
        description: body.description ?? null,
        certificateNo,
        createdById: body.createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        contract: { select: { id: true, contractNo: true, title: true } },
      },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create payment'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['APPROVED'],
  APPROVED: ['PAID'],
  PAID: [],
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, status, approvedById, ...updateData } = body
    if (status) {
      const existing = await db.paymentVoucher.findUnique({ where: { id } })
      if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
      const allowed = VALID_TRANSITIONS[existing.status] ?? []
      if (!allowed.includes(status)) {
        return NextResponse.json({ success: false, error: `Cannot transition from ${existing.status} to ${status}` }, { status: 400 })
      }
      const updatePayload: Record<string, unknown> = { ...updateData, status }
      if (status === 'APPROVED') {
        updatePayload.approvedById = approvedById ?? null
        updatePayload.approvedAt = new Date().toISOString()
      }
      if (status === 'PAID') {
        updatePayload.paidAt = new Date().toISOString()
      }
      const data = await db.paymentVoucher.update({
        where: { id },
        data: updatePayload,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          approvedBy: { select: { id: true, name: true, email: true } },
          contract: true,
        },
      })
      return NextResponse.json({ success: true, data })
    }
    const data = await db.paymentVoucher.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        contract: true,
      },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update payment'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.paymentVoucher.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete payment'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}