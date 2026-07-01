import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 })
    const expenses = await db.expense.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
      include: {
        budgetCategory: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true, avatar: true } },
      },
    })
    return NextResponse.json({ success: true, data: expenses })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.description || body.amount == null || !body.date || !body.type || !body.projectId) {
      return NextResponse.json({ success: false, error: 'description, amount, date, type, and projectId are required' }, { status: 400 })
    }
    const expense = await db.expense.create({
      data: {
        description: body.description,
        amount: body.amount,
        date: body.date,
        type: body.type,
        projectId: body.projectId,
        budgetCategoryId: body.budgetCategoryId || null,
        approvedById: body.approvedById || null,
        approvedAt: body.approvedAt || null,
      },
      include: {
        budgetCategory: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true, avatar: true } },
      },
    })
    return NextResponse.json({ success: true, data: expense }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    const expense = await db.expense.update({
      where: { id },
      data,
      include: {
        budgetCategory: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true, avatar: true } },
      },
    })
    return NextResponse.json({ success: true, data: expense })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.expense.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}