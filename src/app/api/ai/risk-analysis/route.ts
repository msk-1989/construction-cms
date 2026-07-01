import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId } = body
    // Mock risk analysis data
    const risks = [
      {
        id: '1',
        category: 'SCHEDULE',
        title: 'Structural Work Delay',
        description: 'Current structural work is 2 weeks behind schedule due to material delivery delays. This may impact subsequent MEP installation.',
        probability: 'HIGH' as const,
        impact: 'HIGH' as const,
        mitigation: 'Expedite steel procurement, consider overtime for critical path activities.',
        owner: 'Project Manager',
        status: 'OPEN',
      },
      {
        id: '2',
        category: 'BUDGET',
        title: 'Material Cost Escalation',
        description: 'Steel and cement prices have increased 12% since project inception, potentially exceeding contingency budget.',
        probability: 'MEDIUM' as const,
        impact: 'HIGH' as const,
        mitigation: 'Lock in prices with suppliers, review value engineering opportunities.',
        owner: 'Procurement Manager',
        status: 'MONITORING',
      },
      {
        id: '3',
        category: 'SAFETY',
        title: 'Weather-related Hazards',
        description: 'Upcoming monsoon season may cause work stoppages and site safety concerns.',
        probability: 'HIGH' as const,
        impact: 'MEDIUM' as const,
        mitigation: 'Prepare drainage systems, schedule indoor work during rainy periods.',
        owner: 'Safety Officer',
        status: 'OPEN',
      },
      {
        id: '4',
        category: 'RESOURCE',
        title: 'Skilled Labor Shortage',
        description: 'Difficulty in retaining experienced electricians and plumbers in the current market.',
        probability: 'MEDIUM' as const,
        impact: 'MEDIUM' as const,
        mitigation: 'Partner with trade unions, offer competitive rates, cross-train existing workers.',
        owner: 'HR Manager',
        status: 'MONITORING',
      },
      {
        id: '5',
        category: 'QUALITY',
        title: 'Concrete Strength Variations',
        description: 'Recent test results show minor variations in concrete strength at certain pour locations.',
        probability: 'LOW' as const,
        impact: 'HIGH' as const,
        mitigation: 'Increase testing frequency, review mix design with supplier, document all test results.',
        owner: 'Quality Engineer',
        status: 'OPEN',
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        overallRiskLevel: 'MEDIUM',
        riskCount: { high: 2, medium: 2, low: 1 },
        risks,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to analyze risks' }, { status: 500 })
  }
}