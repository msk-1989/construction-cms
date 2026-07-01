import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let userId = searchParams.get('userId')
    if (!userId) {
      userId = request.cookies.get('userId')?.value || ''
    }
    if (!userId) return NextResponse.json({ success: true, data: { notifications: [], unreadCount: 0 } })

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    const unreadCount = notifications.filter((n) => !n.read).length
    return NextResponse.json({ success: true, data: { notifications, unreadCount } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    if (body.id && !body.markAll) {
      // Mark single notification as read
      const notification = await db.notification.update({
        where: { id: body.id },
        data: { read: true },
      })
      return NextResponse.json({ success: true, data: notification })
    }
    if (body.markAll && body.userId) {
      // Mark all notifications for a user as read
      const result = await db.notification.updateMany({
        where: { userId: body.userId, read: false },
        data: { read: true },
      })
      return NextResponse.json({ success: true, data: { updated: result.count } })
    }
    return NextResponse.json({ success: false, error: 'Provide id or markAll with userId' }, { status: 400 })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: m }, { status: 500 })
  }
}