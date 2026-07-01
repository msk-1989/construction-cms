import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 })
    const categories = await db.budgetCategory.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { expenses: true } },
        _sum: { expenses: { select: { amount: true } } },
      },
    })
    const data = categories.map((c) => ({
      ...c,
      spent: c._sum.expenses?.amount || 0,
      expenseCount: c._count.expenses,
    }))
    return NextResponse.json({ success: true, data })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name || body.allocated == null || !body.projectId) {
      return NextResponse.json({ success: false, error: 'name, allocated, and projectId are required' }, { status: 400 })
    }
    const category = await db.budgetCategory.create({
      data: { name: body.name, allocated: body.allocated, projectId: body.projectId },
    })
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    const category = await db.budgetCategory.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: category })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.budgetCategory.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}