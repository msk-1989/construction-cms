import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const categoryId = req.nextUrl.searchParams.get('categoryId')
    if (!categoryId) return NextResponse.json({ success: false, error: 'categoryId required' }, { status: 400 })
    const data = await db.boqItem.findMany({
      where: { categoryId },
      orderBy: { itemNo: 'asc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch BOQ items'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const amount = (body.quantity ?? 0) * (body.unitRate ?? 0)
    const data = await db.boqItem.create({
      data: {
        itemNo: body.itemNo,
        description: body.description,
        unit: body.unit,
        quantity: body.quantity,
        unitRate: body.unitRate,
        amount,
        categoryId: body.categoryId,
        projectId: body.projectId,
      },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create BOQ item'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, ...updateData } = body
    // Auto-calculate actualAmount if actualQty and actualRate are provided
    if (updateData.actualQty !== undefined && updateData.actualRate !== undefined) {
      updateData.actualAmount = updateData.actualQty * updateData.actualRate
    }
    const data = await db.boqItem.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update BOQ item'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.boqItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete BOQ item'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}