import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateCode(name: string): string {
  const words = name.replace(/[^a-zA-Z]/g, ' ').split(/\s+/).filter(Boolean)
  if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase()
  if (words.length === 2) return (words[0][0] + words[1][0] + 'X').toUpperCase()
  if (words.length === 1 && words[0].length >= 3) return words[0].substring(0, 3).toUpperCase()
  return 'PRJ'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { code: { contains: search.toUpperCase() } },
            { siteAddress: { contains: search } },
          ],
        }
      : {}

    const projects = await db.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { members: true, tasks: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        manager: { select: { id: true, name: true, avatar: true } },
      },
    })

    const data = projects.map((p) => ({
      ...p,
      memberCount: p._count.members,
      taskCount: p._count.tasks,
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
    const { name, createdById } = body
    if (!name || !createdById) {
      return NextResponse.json({ success: false, error: 'Name and createdById are required' }, { status: 400 })
    }

    let code = generateCode(name)
    const existing = await db.project.findUnique({ where: { code } })
    if (existing) {
      const rand = Math.random().toString(36).substring(2, 5).toUpperCase()
      code = code.substring(0, 2) + rand
    }

    const project = await db.project.create({
      data: {
        ...body,
        code,
        status: body.status || 'PLANNING',
        progress: body.progress || 0,
        boqStatus: body.boqStatus || 'DRAFT',
        boqVersion: body.boqVersion || 1,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        manager: { select: { id: true, name: true, avatar: true } },
        engineer: { select: { id: true, name: true, avatar: true } },
        safetyOfficer: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}