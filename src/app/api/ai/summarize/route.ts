import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { content, type } = body
    // Mock summary generation
    const summary = type === 'project'
      ? `Project Summary: The project is currently progressing with key activities on track. Budget utilization stands at approximately 68% with 3 active change orders pending review. Critical path items include structural work completion and MEP installation. The team recommends focusing on procurement lead times to avoid schedule delays.`
      : `Summary: Based on the provided content, the key discussion points have been captured. There are 3 action items identified, 2 pending decisions, and 1 critical issue that requires immediate attention from the project manager.`

    return NextResponse.json({
      success: true,
      data: {
        summary,
        keyPoints: [
          'Budget tracking within acceptable limits',
          'Schedule adherence needs monitoring',
          'Procurement pipeline requires attention',
          'Quality inspections on track',
          'Safety compliance maintained',
        ],
        actionItems: [
          'Review outstanding change orders',
          'Update material delivery schedule',
          'Confirm subcontractor availability',
        ],
        timestamp: new Date().toISOString(),
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to generate summary' }, { status: 500 })
  }
}