import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List permission overrides
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    const where: any = {}
    if (userId) where.userId = userId

    const overrides = await db.permissionOverride.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: overrides })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a permission override
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, resource, action, isAllowed, reason, createdBy, expiresAt } = body

    if (!userId || !resource || !action || createdBy === undefined) {
      return NextResponse.json({ error: 'userId, resource, action, and createdBy are required' }, { status: 400 })
    }

    const override = await db.permissionOverride.create({
      data: {
        userId,
        resource,
        action,
        isAllowed: isAllowed ?? true,
        reason,
        createdBy,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'PERMISSION_OVERRIDE',
        details: `${isAllowed ? 'Granted' : 'Denied'} ${action} on ${resource} for user ${userId}`,
        userId: createdBy,
        relatedId: userId,
        relatedType: 'USER',
      },
    })

    return NextResponse.json({ success: true, data: override })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Deactivate a permission override
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const override = await db.permissionOverride.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, data: override })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}