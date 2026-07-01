import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 })
    const logs = await db.dailyLog.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    })
    return NextResponse.json({ success: true, data: logs })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.date || !body.projectId || !body.createdById) {
      return NextResponse.json({ success: false, error: 'date, projectId, and createdById are required' }, { status: 400 })
    }
    const log = await db.dailyLog.create({
      data: {
        date: body.date,
        weather: body.weather || null,
        temperature: body.temperature || null,
        crewSize: body.crewSize || null,
        notes: body.notes || null,
        safetyNotes: body.safetyNotes || null,
        projectId: body.projectId,
        createdById: body.createdById,
      },
      include: { createdBy: { select: { id: true, name: true, avatar: true } } },
    })
    return NextResponse.json({ success: true, data: log }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    const log = await db.dailyLog.update({
      where: { id },
      data,
      include: { createdBy: { select: { id: true, name: true, avatar: true } } },
    })
    return NextResponse.json({ success: true, data: log })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    await db.dailyLog.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}