import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    const data = await db.purchaseOrder.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        items: true,
        _count: { select: { grvVouchers: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch purchase orders'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items = body.items ?? []
    const subtotal = items.reduce((sum: number, i: { orderedQty: number; unitRate: number }) => sum + (i.orderedQty ?? 0) * (i.unitRate ?? 0), 0)
    const taxPercent = body.taxPercent ?? 18
    const tax = subtotal * (taxPercent / 100)
    const total = subtotal + tax
    // Auto-generate PO number
    const count = await db.purchaseOrder.count()
    const poNumber = `PO-${String(count + 1).padStart(5, '0')}`
    const data = await db.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: body.vendorId ?? null,
        title: body.title,
        description: body.description ?? null,
        status: 'DRAFT',
        projectId: body.projectId,
        quotationId: body.quotationId ?? null,
        subtotal,
        tax,
        total,
        deliveryDate: body.deliveryDate ?? null,
        terms: body.terms ?? null,
        createdById: body.createdById,
        items: {
          create: items.map((i: { description: string; unit: string; orderedQty: number; unitRate: number }) => ({
            description: i.description,
            unit: i.unit,
            orderedQty: i.orderedQty,
            unitRate: i.unitRate,
            amount: i.orderedQty * i.unitRate,
          })),
        },
      },
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
        _count: { select: { grvVouchers: true } },
      },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create purchase order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: ['ISSUED'],
  ISSUED: ['CLOSED'],
  CLOSED: [],
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, status, approvedById, ...updateData } = body
    if (status) {
      const existing = await db.purchaseOrder.findUnique({ where: { id } })
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
      if (status === 'ISSUED') {
        updatePayload.issuedAt = new Date().toISOString()
      }
      if (status === 'CLOSED') {
        updatePayload.closedAt = new Date().toISOString()
      }
      const data = await db.purchaseOrder.update({
        where: { id },
        data: updatePayload,
        include: { vendor: true, items: true, _count: { select: { grvVouchers: true } } },
      })
      return NextResponse.json({ success: true, data })
    }
    const data = await db.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: { vendor: true, items: true, _count: { select: { grvVouchers: true } } },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update purchase order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.purchaseOrder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete purchase order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}