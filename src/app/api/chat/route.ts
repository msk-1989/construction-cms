import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Virtual (system) channels that don't map to projects
const SYSTEM_CHANNELS = [
  { id: 'general', name: 'General', icon: 'hash', isSystem: true },
  { id: 'announcements', name: 'Announcements', icon: 'megaphone', isSystem: true },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get('channelId')
    const listChannels = searchParams.get('listChannels') === 'true'

    // Return channel list
    if (listChannels) {
      const projects = await db.project.findMany({
        where: { status: { in: ['PLANNING', 'ACTIVE', 'ON_HOLD'] } },
        select: { id: true, name: true, code: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      const projectChannels = projects.map((p) => ({
        id: p.id,
        name: p.name,
        icon: 'building',
        isSystem: false,
        code: p.code,
      }))

      // Get unread counts for each channel
      const allChannelIds = [
        ...SYSTEM_CHANNELS.map((c) => c.id),
        ...projectChannels.map((c) => c.id),
      ]

      const unreadCounts = await Promise.all(
        allChannelIds.map(async (chId) => {
          const count = await db.chatMessage.count({
            where: { channelId: chId },
          })
          return { channelId: chId, count }
        })
      )

      const countMap = Object.fromEntries(
        unreadCounts.map((u) => [u.channelId, u.count])
      )

      const channels = [
        ...SYSTEM_CHANNELS.map((c) => ({ ...c, messageCount: countMap[c.id] ?? 0 })),
        ...projectChannels.map((c) => ({ ...c, messageCount: countMap[c.id] ?? 0 })),
      ]

      return NextResponse.json({ success: true, data: channels })
    }

    // Return messages for a channel
    if (!channelId) {
      return NextResponse.json(
        { success: false, error: 'channelId or listChannels=true required' },
        { status: 400 }
      )
    }

    const data = await db.chatMessage.findMany({
      where: { channelId },
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch messages'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { content, type, channelId, userId } = body

    if (!content || !channelId || !userId) {
      return NextResponse.json(
        { success: false, error: 'content, channelId, and userId are required' },
        { status: 400 }
      )
    }

    const data = await db.chatMessage.create({
      data: {
        content,
        type: type ?? 'TEXT',
        channelId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
      },
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send message'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}