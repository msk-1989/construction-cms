import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })
    const data = await db.boqCategory.findMany({
      where: { projectId },
      include: { items: { orderBy: { itemNo: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch BOQ'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Clone version action
    if (body.action === 'cloneVersion') {
      if (!body.projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })
      const project = await db.project.findUnique({ where: { id: body.projectId } })
      const newVersion = (project?.boqVersion ?? 0) + 1
      // Clone all categories
      const existingCategories = await db.boqCategory.findMany({
        where: { projectId: body.projectId },
        include: { items: true },
        orderBy: { sortOrder: 'asc' },
      })
      const cloned = await db.$transaction(async (tx) => {
        const results = []
        for (const cat of existingCategories) {
          const newCat = await tx.boqCategory.create({
            data: {
              name: cat.name,
              description: cat.description,
              sortOrder: cat.sortOrder,
              version: newVersion,
              projectId: body.projectId,
              items: {
                create: cat.items.map((item) => ({
                  itemNo: item.itemNo,
                  description: item.description,
                  unit: item.unit,
                  quantity: item.quantity,
                  unitRate: item.unitRate,
                  amount: item.amount,
                  projectId: body.projectId,
                })),
              },
            },
            include: { items: true },
          })
          results.push(newCat)
        }
        await tx.project.update({
          where: { id: body.projectId },
          data: { boqVersion: newVersion, boqStatus: 'DRAFT' },
        })
        return results
      })
      return NextResponse.json({ success: true, data: cloned }, { status: 201 })
    }
    // Normal create
    const data = await db.boqCategory.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        projectId: body.projectId,
        sortOrder: body.sortOrder ?? 0,
      },
      include: { items: true },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create BOQ category'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    // Approve version action
    if (body.action === 'approveVersion') {
      if (!body.projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })
      const project = await db.project.update({
        where: { id: body.projectId },
        data: { boqStatus: 'APPROVED' },
      })
      return NextResponse.json({ success: true, data: project })
    }
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, ...updateData } = body
    const data = await db.boqCategory.update({ where: { id }, data: updateData, include: { items: true } })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update BOQ category'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.boqCategory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete BOQ category'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}