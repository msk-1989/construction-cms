import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const poId = req.nextUrl.searchParams.get('poId')
    if (!poId) return NextResponse.json({ success: false, error: 'poId required' }, { status: 400 })
    const data = await db.purchaseOrderItem.findMany({
      where: { poId },
      include: { grvItems: true },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch PO items'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}