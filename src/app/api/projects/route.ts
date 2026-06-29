import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const projectsWithCounts = projects.map((p) => ({
      ...p,
      memberCount: p.members.length,
    }))

    return NextResponse.json({ success: true, data: projectsWithCounts })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, code, description, status, startDate, endDate, budget, createdById } = data

    if (!name || !code || !createdById) {
      return NextResponse.json({ success: false, error: 'Name, code, and creator are required' }, { status: 400 })
    }

    const existingCode = await db.project.findUnique({ where: { code } })
    if (existingCode) {
      return NextResponse.json({ success: false, error: 'Project code already exists' }, { status: 400 })
    }

    const project = await db.project.create({
      data: {
        name,
        code,
        description: description || null,
        status: status || 'PLANNING',
        startDate: startDate || null,
        endDate: endDate || null,
        budget: budget ? parseFloat(budget) : null,
        createdById,
        members: { create: { userId: createdById } },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
        _count: { select: { tasks: true } },
      },
    })

    return NextResponse.json({ success: true, data: { ...project, memberCount: project.members.length } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create project'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}