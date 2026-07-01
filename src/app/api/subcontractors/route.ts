import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    const where = projectId
      ? { projectLinks: { some: { projectId } } }
      : {}
    const data = await db.subcontractor.findMany({
      where,
      include: { projectLinks: { include: { project: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subcontractors'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await db.subcontractor.create({
      data: {
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone ?? null,
        contractorType: body.contractorType ?? null,
        registrationNo: body.registrationNo ?? null,
        gst: body.gst ?? null,
        pan: body.pan ?? null,
        license: body.license ?? null,
        licenseExpiry: body.licenseExpiry ?? null,
        insuranceExpiry: body.insuranceExpiry ?? null,
        specialty: body.specialty ?? null,
        rating: body.rating ?? 0,
        preQualified: body.preQualified ?? false,
        notes: body.notes ?? null,
      },
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create subcontractor'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { id, ...updateData } = body
    const data = await db.subcontractor.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update subcontractor'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    await db.subcontractor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete subcontractor'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}