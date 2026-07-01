import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all grants
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (userId) where.userId = userId

    const grants = await db.exceptionalGrant.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        grantedByUser: { select: { id: true, name: true, email: true } },
        revokedByUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get stats
    const [activeCount, expiredCount, total, usersAffected] = await Promise.all([
      db.exceptionalGrant.count({ where: { status: 'ACTIVE' } }),
      db.exceptionalGrant.count({ where: { status: 'EXPIRED' } }),
      db.exceptionalGrant.count(),
      // count unique users
      (async () => {
        const result = await db.exceptionalGrant.groupBy({
          by: ['userId'],
          where: { status: 'ACTIVE' },
        })
        return result.length
      })(),
    ])

    return NextResponse.json({
      success: true,
      data: grants,
      stats: {
        active: activeCount,
        expiringSoon: 0, // computed client-side
        expired: expiredCount,
        total,
        usersAffected,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new grant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, permissions, grantType, duration, scope, reason, grantedBy } = body

    if (!userId || !permissions?.length || !reason || !grantedBy) {
      return NextResponse.json({ error: 'userId, permissions, reason, and grantedBy are required' }, { status: 400 })
    }

    // Create a grant for each permission
    const grants = await db.exceptionalGrant.createMany({
      data: permissions.map((perm: string) => ({
        userId,
        grantedBy,
        permission: perm,
        scopeType: scope?.type || 'GLOBAL',
        scopeId: scope?.id || null,
        reason,
        grantType: grantType || 'TEMPORARY',
        endDate: grantType === 'TEMPORARY' && duration
          ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
          : null,
        status: 'ACTIVE',
      })),
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'GRANT_CREATED',
        details: `Created ${permissions.length} exceptional grant(s) for user ${userId}: ${permissions.join(', ')}`,
        userId: grantedBy,
        relatedId: userId,
        relatedType: 'USER',
      },
    })

    return NextResponse.json({ success: true, data: grants })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Revoke a grant
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const grantId = searchParams.get('id')
    const revokedBy = searchParams.get('revokedBy')
    const reason = searchParams.get('reason')

    if (!grantId || !revokedBy) {
      return NextResponse.json({ error: 'id and revokedBy are required' }, { status: 400 })
    }

    const grant = await db.exceptionalGrant.update({
      where: { id: grantId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedBy,
        revocationReason: reason || null,
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'GRANT_REVOKED',
        details: `Revoked grant ${grant.permission} from user ${grant.userId}. Reason: ${reason || 'Not specified'}`,
        userId: revokedBy,
        relatedId: grant.userId,
        relatedType: 'USER',
      },
    })

    return NextResponse.json({ success: true, data: grant })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}