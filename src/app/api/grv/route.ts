import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    const data = await db.grvVoucher.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        po: { include: { vendor: true } },
        verifiedBy: { select: { id: true, name: true, email: true } },
        qualityCheckedBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch GRV vouchers'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items = body.items ?? []
    const grvCount = await db.grvVoucher.count()
    const grvNumber = `GRV-${String(grvCount + 1).padStart(5, '0')}`
    const data = await db.$transaction(async (tx) => {
      const grv = await tx.grvVoucher.create({
        data: {
          grvNumber,
          poId: body.poId ?? null,
          title: body.title,
          status: 'DRAFT',
          projectId: body.projectId,
          totalItems: items.length,
          notes: body.notes ?? null,
          items: {
            create: items.map((i: { poItemId?: string; description: string; unit: string; orderedQty: number; receivedQty: number; rejectedQty: number; unitRate: number; qualityStatus?: string }) => ({
              poItemId: i.poItemId ?? null,
              description: i.description,
              unit: i.unit,
              orderedQty: i.orderedQty,
              receivedQty: i.receivedQty,
              rejectedQty: i.rejectedQty ?? 0,
              unitRate: i.unitRate,
              amount: i.receivedQty * i.unitRate,
              qualityStatus: i.qualityStatus ?? 'ACCEPTED',
            })),
          },
        },
        include: { items: true, po: { include: { vendor: true } } },
      })
      // Update PO item receivedQty
      for (const item of items) {
        if (item.poItemId) {
          await tx.purchaseOrderItem.update({
            where: { id: item.poItemId },
            data: { receivedQty: { increment: item.receivedQty } },
          })
        }
      }
      return grv
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create GRV'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['QUALITY_CHECKED', 'REJECTED'],
  QUALITY_CHECKED: ['VERIFIED', 'REJECTED'],
  VERIFIED: [],
  REJECTED: [],
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, status, qualityCheckedById, verifiedById, ...updateData } = body
    if (status) {
      const existing = await db.grvVoucher.findUnique({ where: { id } })
      if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
      const allowed = VALID_TRANSITIONS[existing.status] ?? []
      if (!allowed.includes(status)) {
        return NextResponse.json({ success: false, error: `Cannot transition from ${existing.status} to ${status}` }, { status: 400 })
      }
      const updatePayload: Record<string, unknown> = { ...updateData, status }
      if (status === 'QUALITY_CHECKED') {
        updatePayload.qualityCheckedById = qualityCheckedById ?? null
        updatePayload.qualityCheckedAt = new Date().toISOString()
      }
      if (status === 'VERIFIED') {
        updatePayload.verifiedById = verifiedById ?? null
        updatePayload.verifiedAt = new Date().toISOString()
      }
      const data = await db.grvVoucher.update({
        where: { id },
        data: updatePayload,
        include: { po: true, items: true, verifiedBy: true, qualityCheckedBy: true },
      })
      return NextResponse.json({ success: true, data })
    }
    const data = await db.grvVoucher.update({
      where: { id },
      data: updateData,
      include: { po: true, items: true },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update GRV'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.grvVoucher.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete GRV'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}