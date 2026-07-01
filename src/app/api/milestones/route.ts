import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 })
    const milestones = await db.milestone.findMany({
      where: { projectId },
      orderBy: { date: 'asc' },
    })
    return NextResponse.json({ success: true, data: milestones })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.title || !body.projectId) {
      return NextResponse.json({ success: false, error: 'Title and projectId are required' }, { status: 400 })
    }
    const milestone = await db.milestone.create({
      data: {
        title: body.title,
        description: body.description || null,
        date: body.date || null,
        status: body.status || 'PENDING',
        projectId: body.projectId,
      },
    })
    return NextResponse.json({ success: true, data: milestone }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    const milestone = await db.milestone.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: milestone })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.milestone.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}