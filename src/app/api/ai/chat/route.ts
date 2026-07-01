import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = body
    // Simple mock/echo response for AI chat
    const responses = [
      `I understand you're asking about: "${message}". Here's what I can help with — I can analyze project data, generate reports, and provide construction management insights.`,
      `Thanks for your question! Based on the project context, I'd recommend reviewing the current project timeline and budget allocation for any potential issues.`,
      `Great question! Let me help you with that. In construction management, it's important to track all change orders and their impact on both budget and schedule.`,
    ]
    const reply = responses[Math.floor(Math.random() * responses.length)]
    return NextResponse.json({
      success: true,
      data: {
        reply,
        timestamp: new Date().toISOString(),
        model: 'mock-ai-v1',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to process AI chat' }, { status: 500 })
  }
}