import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })
    const data = await db.receiptVoucher.findMany({
      where: { projectId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch receipts'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rvCount = await db.receiptVoucher.count()
    const voucherNo = `RV-${String(rvCount + 1).padStart(5, '0')}`
    const data = await db.receiptVoucher.create({
      data: {
        voucherNo,
        title: body.title,
        amount: body.amount,
        receivedFrom: body.receivedFrom,
        paymentMode: body.paymentMode,
        bankReference: body.bankReference ?? null,
        projectId: body.projectId,
        description: body.description ?? null,
        receivedAt: body.receivedAt ?? new Date().toISOString(),
        createdById: body.createdById,
      },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create receipt'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, ...updateData } = body
    const data = await db.receiptVoucher.update({
      where: { id },
      data: updateData,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update receipt'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.receiptVoucher.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete receipt'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}