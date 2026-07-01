import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ success: false, error: 'projectId required' }, { status: 400 })

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { expenses: true, tasks: true },
    })
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

    const budget = project.budget ?? 0
    const totalSpent = project.expenses.reduce((sum, e) => sum + e.amount, 0)
    const tasks = project.tasks
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length

    // EVM Calculations
    const plannedValue = budget * (totalTasks > 0 ? Math.min(1, completedTasks / totalTasks) : 0) // simplified PV
    const earnedValue = budget * (totalTasks > 0 ? completedTasks / totalTasks : 0) // EV = % complete * BAC
    const actualCost = totalSpent // AC

    const costVariance = earnedValue - actualCost
    const scheduleVariance = earnedValue - plannedValue
    const costPerformanceIndex = actualCost > 0 ? earnedValue / actualCost : 1
    const schedulePerformanceIndex = plannedValue > 0 ? earnedValue / plannedValue : 1

    // Estimate at Completion & Estimate to Complete
    const estimateAtCompletion = costPerformanceIndex > 0 ? budget / costPerformanceIndex : budget
    const estimateToComplete = estimateAtCompletion - actualCost
    const varianceAtCompletion = budget - estimateAtCompletion
    const toCompletePerformanceIndex = (budget - earnedValue) > 0 ? (budget - earnedValue) / Math.max(0.01, estimateToComplete) : 1

    // Forecast
    const budgetAtCompletion = budget
    const budgetConsumedPercent = budget > 0 ? (actualCost / budget) * 100 : 0
    const workCompletePercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        projectName: project.name,
        // Core EVM metrics
        bac: budget,
        pv: plannedValue,
        ev: earnedValue,
        ac: actualCost,
        // Variances
        cv: costVariance,
        sv: scheduleVariance,
        cvPercent: earnedValue > 0 ? (costVariance / earnedValue) * 100 : 0,
        svPercent: plannedValue > 0 ? (scheduleVariance / plannedValue) * 100 : 0,
        // Performance Indices
        cpi: Math.round(costPerformanceIndex * 1000) / 1000,
        spi: Math.round(schedulePerformanceIndex * 1000) / 1000,
        tcpi: Math.round(toCompletePerformanceIndex * 1000) / 1000,
        // Forecasts
        eac: Math.round(estimateAtCompletion),
        etc: Math.round(estimateToComplete),
        vac: Math.round(varianceAtCompletion),
        // Summary
        budgetConsumedPercent: Math.round(budgetConsumedPercent * 10) / 10,
        workCompletePercent: Math.round(workCompletePercent * 10) / 10,
        healthStatus: costPerformanceIndex >= 0.9 && schedulePerformanceIndex >= 0.9 ? 'HEALTHY'
          : costPerformanceIndex >= 0.7 && schedulePerformanceIndex >= 0.7 ? 'AT_RISK'
          : 'CRITICAL',
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
          pending: tasks.filter(t => t.status === 'PENDING').length,
        },
        expenseStats: {
          totalExpenses: project.expenses.length,
          totalSpent: Math.round(totalSpent),
          remainingBudget: Math.round(budget - totalSpent),
        },
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate EVM report'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}