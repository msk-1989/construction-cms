import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    const data = await db.quotation.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch quotations'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items = body.items ?? []
    const subtotal = items.reduce((sum: number, i: { quantity: number; unitRate: number }) => sum + (i.quantity ?? 0) * (i.unitRate ?? 0), 0)
    const taxPercent = body.taxPercent ?? 18
    const tax = subtotal * (taxPercent / 100)
    const total = subtotal + tax
    const data = await db.quotation.create({
      data: {
        referenceNo: body.referenceNo,
        vendorId: body.vendorId ?? null,
        title: body.title,
        description: body.description ?? null,
        status: body.status ?? 'DRAFT',
        subtotal,
        tax,
        total,
        validUntil: body.validUntil ?? null,
        terms: body.terms ?? null,
        projectId: body.projectId,
        createdById: body.createdById,
        items: {
          create: items.map((i: { description: string; unit: string; quantity: number; unitRate: number }) => ({
            description: i.description,
            unit: i.unit,
            quantity: i.quantity,
            unitRate: i.unitRate,
            amount: i.quantity * i.unitRate,
          })),
        },
      },
      include: {
        vendor: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create quotation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: ['DRAFT'],
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, status, approvedById, ...updateData } = body
    if (status) {
      const existing = await db.quotation.findUnique({ where: { id } })
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
      const data = await db.quotation.update({ where: { id }, data: updatePayload, include: { vendor: true, items: true } })
      return NextResponse.json({ success: true, data })
    }
    // If items are provided, recalculate totals
    if (updateData.items) {
      const items = updateData.items
      const subtotal = items.reduce((sum: number, i: { quantity: number; unitRate: number }) => sum + (i.quantity ?? 0) * (i.unitRate ?? 0), 0)
      const taxPercent = updateData.taxPercent ?? 18
      updateData.subtotal = subtotal
      updateData.tax = subtotal * (taxPercent / 100)
      updateData.total = subtotal + updateData.tax
      delete updateData.items
      delete updateData.taxPercent
      // Delete existing items and recreate
      await db.quotationItem.deleteMany({ where: { quotationId: id } })
      await db.quotationItem.createMany({
        data: items.map((i: { description: string; unit: string; quantity: number; unitRate: number }) => ({
          description: i.description,
          unit: i.unit,
          quantity: i.quantity,
          unitRate: i.unitRate,
          amount: i.quantity * i.unitRate,
          quotationId: id,
        })),
      })
    }
    const data = await db.quotation.update({ where: { id }, data: updateData, include: { vendor: true, items: true } })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update quotation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.quotation.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete quotation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}