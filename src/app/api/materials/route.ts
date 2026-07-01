import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const materials = await db.material.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: materials })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name || body.quantity == null || !body.unit || body.unitCost == null || !body.projectId) {
      return NextResponse.json({ success: false, error: 'name, quantity, unit, unitCost, and projectId are required' }, { status: 400 })
    }
    const material = await db.material.create({
      data: {
        name: body.name,
        quantity: body.quantity,
        unit: body.unit,
        unitCost: body.unitCost,
        supplier: body.supplier || null,
        status: body.status || 'PLANNED',
        orderedDate: body.orderedDate || null,
        deliveredDate: body.deliveredDate || null,
        notes: body.notes || null,
        projectId: body.projectId,
      },
    })
    return NextResponse.json({ success: true, data: material }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    const material = await db.material.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: material })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.material.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}