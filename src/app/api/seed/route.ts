import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Check if data already exists
    const existingUsers = await db.user.count()
    if (existingUsers > 0) {
      return NextResponse.json({ success: false, error: 'Database already has data. Clear it first.' }, { status: 400 })
    }

    // 1. Create Users
    const users = await db.$transaction(async (tx) => {
      const admin = await tx.user.create({
        data: {
          email: 'raj@cms.com',
          password: 'password',
          name: 'Raj Patel',
          role: 'ADMIN',
          phone: '+91 98765 43210',
          company: 'BuildTech Solutions',
          employeeId: 'EMP001',
          position: 'Project Director',
          department: 'Management',
          status: 'ACTIVE',
        },
      })

      const manager = await tx.user.create({
        data: {
          email: 'priya@cms.com',
          password: 'password',
          name: 'Priya Sharma',
          role: 'MANAGER',
          phone: '+91 98765 43211',
          company: 'BuildTech Solutions',
          employeeId: 'EMP002',
          position: 'Senior Project Manager',
          department: 'Project Management',
          status: 'ACTIVE',
        },
      })

      const member1 = await tx.user.create({
        data: {
          email: 'amit@cms.com',
          password: 'password',
          name: 'Amit Kumar',
          role: 'MEMBER',
          phone: '+91 98765 43212',
          company: 'BuildTech Solutions',
          employeeId: 'EMP003',
          position: 'Site Engineer',
          department: 'Engineering',
          status: 'ACTIVE',
        },
      })

      const member2 = await tx.user.create({
        data: {
          email: 'sneha@cms.com',
          password: 'password',
          name: 'Sneha Reddy',
          role: 'MEMBER',
          phone: '+91 98765 43213',
          company: 'BuildTech Solutions',
          employeeId: 'EMP004',
          position: 'Quantity Surveyor',
          department: 'Quantity Surveying',
          status: 'ACTIVE',
        },
      })

      const member3 = await tx.user.create({
        data: {
          email: 'vikram@cms.com',
          password: 'password',
          name: 'Vikram Singh',
          role: 'MEMBER',
          phone: '+91 98765 43214',
          company: 'BuildTech Solutions',
          employeeId: 'EMP005',
          position: 'Safety Officer',
          department: 'HSE',
          status: 'ACTIVE',
        },
      })

      const member4 = await tx.user.create({
        data: {
          email: 'anita@cms.com',
          password: 'password',
          name: 'Anita Desai',
          role: 'MEMBER',
          phone: '+91 98765 43215',
          company: 'BuildTech Solutions',
          employeeId: 'EMP006',
          position: 'Procurement Specialist',
          department: 'Procurement',
          status: 'ACTIVE',
        },
      })

      return { admin, manager, member1, member2, member3, member4 }
    })

    // 2. Create Projects
    const projects = await db.$transaction(async (tx) => {
      const p1 = await tx.project.create({
        data: {
          name: 'Mumbai Commercial Tower',
          code: 'MCT-001',
          description: '42-story commercial tower with 3 basement levels in BKC, Mumbai',
          status: 'ACTIVE',
          progress: 45,
          startDate: '2024-06-15',
          endDate: '2026-12-31',
          budget: 850000000,
          projectType: 'COMMERCIAL',
          contractType: 'LUMP_SUM',
          siteAddress: 'Plot 5, BKC, Mumbai 400051',
          siteContact: 'Site Office BKC',
          siteEmail: 'mct-site@buildtech.com',
          sitePhone: '+91 22 4567 8900',
          totalWorkforce: 120,
          dailyLaborCount: 85,
          createdById: users.admin.id,
          managerId: users.manager.id,
          engineerId: users.member1.id,
          safetyOfficerId: users.member3.id,
          boqStatus: 'APPROVED',
          boqVersion: 2,
        },
      })

      const p2 = await tx.project.create({
        data: {
          name: 'Pune Residential Complex',
          code: 'PRC-002',
          description: '200-unit residential complex with clubhouse and amenities in Hinjewadi, Pune',
          status: 'ACTIVE',
          progress: 30,
          startDate: '2024-09-01',
          endDate: '2026-06-30',
          budget: 420000000,
          projectType: 'RESIDENTIAL',
          contractType: 'LUMP_SUM',
          siteAddress: 'Sector 12, Hinjewadi Phase 2, Pune 411057',
          siteContact: 'Pune Site Office',
          siteEmail: 'prc-site@buildtech.com',
          sitePhone: '+91 20 4567 8900',
          totalWorkforce: 95,
          dailyLaborCount: 70,
          createdById: users.admin.id,
          managerId: users.manager.id,
          engineerId: users.member1.id,
          safetyOfficerId: users.member3.id,
          boqStatus: 'DRAFT',
          boqVersion: 1,
        },
      })

      const p3 = await tx.project.create({
        data: {
          name: 'Delhi Metro Station Extension',
          code: 'DMS-003',
          description: 'Elevated metro station and 2km viaduct extension for Line 7',
          status: 'ACTIVE',
          progress: 60,
          startDate: '2023-12-01',
          endDate: '2025-09-30',
          budget: 1250000000,
          projectType: 'INFRASTRUCTURE',
          contractType: 'UNIT_PRICE',
          siteAddress: 'Sector 62, Noida, UP 201301',
          siteContact: 'DMRC Site Camp',
          siteEmail: 'dms-site@buildtech.com',
          sitePhone: '+91 11 4567 8900',
          totalWorkforce: 200,
          dailyLaborCount: 160,
          createdById: users.admin.id,
          managerId: users.manager.id,
          engineerId: users.member1.id,
          safetyOfficerId: users.member3.id,
          boqStatus: 'APPROVED',
          boqVersion: 1,
        },
      })

      const p4 = await tx.project.create({
        data: {
          name: 'Bangalore IT Park Phase 2',
          code: 'BIT-004',
          description: '3-block IT park with common facilities in Whitefield, Bangalore',
          status: 'PLANNING',
          progress: 10,
          startDate: '2025-03-01',
          endDate: '2027-06-30',
          budget: 680000000,
          projectType: 'COMMERCIAL',
          contractType: 'DESIGN_BUILD',
          siteAddress: 'ITPL Road, Whitefield, Bangalore 560066',
          siteContact: 'Bangalore PMO',
          siteEmail: 'bit-site@buildtech.com',
          sitePhone: '+91 80 4567 8900',
          createdById: users.admin.id,
          managerId: users.manager.id,
          boqStatus: 'DRAFT',
          boqVersion: 1,
        },
      })

      const p5 = await tx.project.create({
        data: {
          name: 'Hyderabad Hospital Complex',
          code: 'HHC-005',
          description: '500-bed multi-specialty hospital in Financial District, Hyderabad',
          status: 'COMPLETED',
          progress: 100,
          startDate: '2022-04-01',
          endDate: '2024-11-30',
          budget: 320000000,
          projectType: 'HEALTHCARE',
          contractType: 'TURNKEY',
          siteAddress: 'Financial District, Gachibowli, Hyderabad 500032',
          siteContact: 'Completed',
          createdById: users.admin.id,
          managerId: users.manager.id,
          boqStatus: 'APPROVED',
          boqVersion: 3,
        },
      })

      return [p1, p2, p3, p4, p5]
    })

    // 3. Create Project Memberships
    await db.$transaction(async (tx) => {
      const memberships = [
        { userId: users.admin.id, projectId: projects[0].id, role: 'OWNER', position: 'Project Director' },
        { userId: users.manager.id, projectId: projects[0].id, role: 'MANAGER', position: 'Project Manager' },
        { userId: users.member1.id, projectId: projects[0].id, role: 'ENGINEER', position: 'Site Engineer' },
        { userId: users.member2.id, projectId: projects[0].id, role: 'QS', position: 'Quantity Surveyor' },
        { userId: users.member3.id, projectId: projects[0].id, role: 'SAFETY', position: 'Safety Officer' },
        { userId: users.member4.id, projectId: projects[0].id, role: 'PROCUREMENT', position: 'Procurement Specialist' },
        { userId: users.manager.id, projectId: projects[1].id, role: 'MANAGER', position: 'Project Manager' },
        { userId: users.member1.id, projectId: projects[1].id, role: 'ENGINEER', position: 'Site Engineer' },
        { userId: users.member3.id, projectId: projects[1].id, role: 'SAFETY', position: 'Safety Officer' },
        { userId: users.member2.id, projectId: projects[2].id, role: 'QS', position: 'Quantity Surveyor' },
        { userId: users.member1.id, projectId: projects[2].id, role: 'ENGINEER', position: 'Site Engineer' },
        { userId: users.manager.id, projectId: projects[3].id, role: 'MANAGER', position: 'Project Manager' },
        { userId: users.member4.id, projectId: projects[3].id, role: 'PROCUREMENT', position: 'Procurement Specialist' },
      ]
      for (const m of memberships) {
        await tx.projectMember.create({ data: m })
      }
    })

    // 4. Create Tasks (25+)
    await db.$transaction(async (tx) => {
      const taskData = [
        // Mumbai project tasks
        { title: 'Complete Piling Work - Zone A', projectId: projects[0].id, status: 'COMPLETED', priority: 'HIGH', progress: 100, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2024-08-15', estimatedHours: 160 },
        { title: 'Complete Piling Work - Zone B', projectId: projects[0].id, status: 'COMPLETED', priority: 'HIGH', progress: 100, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2024-09-30', estimatedHours: 200 },
        { title: 'Foundation Casting - All Zones', projectId: projects[0].id, status: 'COMPLETED', priority: 'HIGH', progress: 100, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2024-11-15', estimatedHours: 320 },
        { title: 'Basement Level 3 Construction', projectId: projects[0].id, status: 'COMPLETED', priority: 'HIGH', progress: 100, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2025-01-31', estimatedHours: 400 },
        { title: 'Basement Level 2 Construction', projectId: projects[0].id, status: 'IN_PROGRESS', priority: 'HIGH', progress: 70, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2025-04-15', estimatedHours: 400 },
        { title: 'MEP Rough-in - Basement', projectId: projects[0].id, status: 'IN_PROGRESS', priority: 'MEDIUM', progress: 30, createdById: users.manager.id, assigneeId: users.member2.id, dueDate: '2025-05-30', estimatedHours: 240 },
        { title: 'Basement Level 1 Construction', projectId: projects[0].id, status: 'PENDING', priority: 'HIGH', progress: 0, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2025-06-30', estimatedHours: 400 },
        { title: 'Ground Floor Slab Casting', projectId: projects[0].id, status: 'PENDING', priority: 'HIGH', progress: 0, createdById: users.member1.id, assigneeId: null, dueDate: '2025-08-15', estimatedHours: 200 },
        { title: 'Structural Steel Erection - Lower Floors', projectId: projects[0].id, status: 'PENDING', priority: 'MEDIUM', progress: 0, createdById: users.manager.id, assigneeId: null, dueDate: '2025-10-30', estimatedHours: 600 },
        { title: 'Façade Installation Planning', projectId: projects[0].id, status: 'PENDING', priority: 'LOW', progress: 0, createdById: users.manager.id, assigneeId: users.member4.id, dueDate: '2025-07-31', estimatedHours: 40 },
        // Pune project tasks
        { title: 'Earthwork & Site Preparation', projectId: projects[1].id, status: 'COMPLETED', priority: 'HIGH', progress: 100, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2024-10-15', estimatedHours: 120 },
        { title: 'Foundation Work - Block A', projectId: projects[1].id, status: 'COMPLETED', priority: 'HIGH', progress: 100, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2024-12-31', estimatedHours: 280 },
        { title: 'Foundation Work - Block B', projectId: projects[1].id, status: 'IN_PROGRESS', priority: 'HIGH', progress: 60, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2025-03-15', estimatedHours: 280 },
        { title: 'Ground Floor Construction - Block A', projectId: projects[1].id, status: 'IN_PROGRESS', priority: 'HIGH', progress: 20, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2025-05-30', estimatedHours: 350 },
        { title: 'Plumbing Rough-in - Block A', projectId: projects[1].id, status: 'PENDING', priority: 'MEDIUM', progress: 0, createdById: users.manager.id, assigneeId: null, dueDate: '2025-06-30', estimatedHours: 180 },
        // Delhi Metro tasks
        { title: 'Viaduct Pier Construction - P1 to P8', projectId: projects[2].id, status: 'COMPLETED', priority: 'HIGH', progress: 100, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2024-06-30', estimatedHours: 800 },
        { title: 'Viaduct Pier Construction - P9 to P16', projectId: projects[2].id, status: 'COMPLETED', priority: 'HIGH', progress: 100, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2024-10-31', estimatedHours: 800 },
        { title: 'Viaduct Span Erection - Phase 1', projectId: projects[2].id, status: 'COMPLETED', priority: 'HIGH', progress: 100, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2025-01-31', estimatedHours: 600 },
        { title: 'Viaduct Span Erection - Phase 2', projectId: projects[2].id, status: 'IN_PROGRESS', priority: 'HIGH', progress: 40, createdById: users.member1.id, assigneeId: users.member1.id, dueDate: '2025-05-31', estimatedHours: 600 },
        { title: 'Station Building Structure', projectId: projects[2].id, status: 'IN_PROGRESS', priority: 'HIGH', progress: 25, createdById: users.manager.id, assigneeId: users.member1.id, dueDate: '2025-07-31', estimatedHours: 500 },
        { title: 'Track Laying - Phase 1', projectId: projects[2].id, status: 'PENDING', priority: 'HIGH', progress: 0, createdById: users.manager.id, assigneeId: null, dueDate: '2025-08-31', estimatedHours: 400 },
        { title: 'Electrical & Signaling Works', projectId: projects[2].id, status: 'PENDING', priority: 'MEDIUM', progress: 0, createdById: users.manager.id, assigneeId: null, dueDate: '2025-09-30', estimatedHours: 350 },
        // Bangalore project tasks
        { title: 'Detailed Design Review', projectId: projects[3].id, status: 'IN_PROGRESS', priority: 'HIGH', progress: 40, createdById: users.manager.id, assigneeId: users.member1.id, dueDate: '2025-02-28', estimatedHours: 200 },
        { title: 'Environmental Clearance', projectId: projects[3].id, status: 'PENDING', priority: 'HIGH', progress: 0, createdById: users.manager.id, assigneeId: users.member4.id, dueDate: '2025-03-31', estimatedHours: 60 },
        { title: 'Vendor Pre-qualification', projectId: projects[3].id, status: 'PENDING', priority: 'MEDIUM', progress: 0, createdById: users.manager.id, assigneeId: users.member4.id, dueDate: '2025-04-30', estimatedHours: 80 },
        { title: 'Mobilization Planning', projectId: projects[3].id, status: 'PENDING', priority: 'MEDIUM', progress: 0, createdById: users.manager.id, assigneeId: null, dueDate: '2025-05-31', estimatedHours: 40 },
        // Completed project (Hyderabad)
        { title: 'Final Handover Documentation', projectId: projects[4].id, status: 'COMPLETED', priority: 'HIGH', progress: 100, createdById: users.manager.id, assigneeId: users.member2.id, dueDate: '2024-11-15', estimatedHours: 40 },
      ]

      for (const t of taskData) {
        const completed = t.status === 'COMPLETED'
        await tx.task.create({
          data: {
            ...t,
            completedAt: completed ? t.dueDate ?? new Date().toISOString() : null,
            billable: true,
            isMilestone: false,
          },
        })
      }
    })

    // 5. Create Budget Categories & Expenses
    await db.$transaction(async (tx) => {
      const categories = [
        { name: 'Structural Works', allocated: 350000000, projectId: projects[0].id },
        { name: 'MEP Services', allocated: 180000000, projectId: projects[0].id },
        { name: 'Finishing Works', allocated: 150000000, projectId: projects[0].id },
        { name: 'External Works', allocated: 80000000, projectId: projects[0].id },
        { name: 'Contingency', allocated: 90000000, projectId: projects[0].id },
        { name: 'Civil Works', allocated: 200000000, projectId: projects[1].id },
        { name: 'MEP Works', allocated: 120000000, projectId: projects[1].id },
        { name: 'Finishing', allocated: 80000000, projectId: projects[1].id },
        { name: 'Superstructure', allocated: 600000000, projectId: projects[2].id },
        { name: 'Systems & Finishing', allocated: 400000000, projectId: projects[2].id },
      ]

      for (const c of categories) {
        await tx.budgetCategory.create({ data: c })
      }

      // Some expenses
      const expenses = [
        { description: 'Concrete - M40 Grade - 500 cum', amount: 22500000, date: '2024-08-20', type: 'MATERIAL', projectId: projects[0].id, approvedById: users.manager.id, approvedAt: '2024-08-21' },
        { description: 'Steel Reinforcement - TMT Bars', amount: 35000000, date: '2024-09-15', type: 'MATERIAL', projectId: projects[0].id, approvedById: users.manager.id, approvedAt: '2024-09-16' },
        { description: 'Piling Contractor - Zone A', amount: 18000000, date: '2024-08-30', type: 'SUBCONTRACTOR', projectId: projects[0].id, approvedById: users.admin.id, approvedAt: '2024-09-01' },
        { description: 'Earthwork Excavation', amount: 4500000, date: '2024-10-10', type: 'LABOR', projectId: projects[1].id, approvedById: users.manager.id, approvedAt: '2024-10-11' },
        { description: 'Formwork Material', amount: 12000000, date: '2024-11-05', type: 'MATERIAL', projectId: projects[1].id, approvedById: users.manager.id, approvedAt: '2024-11-06' },
        { description: 'Viaduct Pier Concrete', amount: 42000000, date: '2024-09-30', type: 'MATERIAL', projectId: projects[2].id, approvedById: users.admin.id, approvedAt: '2024-10-01' },
        { description: 'Pre-stressed Girders', amount: 55000000, date: '2025-01-15', type: 'MATERIAL', projectId: projects[2].id, approvedById: users.admin.id, approvedAt: '2025-01-16' },
      ]

      for (const e of expenses) {
        await tx.expense.create({ data: e })
      }
    })

    // 6. Create Milestones
    await db.$transaction(async (tx) => {
      const milestones = [
        { title: 'Piling Completion', description: 'All piling works completed', date: '2024-10-01', status: 'COMPLETED', projectId: projects[0].id },
        { title: 'Basement Waterproofing', description: 'Complete basement waterproofing', date: '2025-02-28', status: 'IN_PROGRESS', projectId: projects[0].id },
        { title: 'Structure upto Podium', description: 'All floors up to podium level', date: '2025-09-30', status: 'UPCOMING', projectId: projects[0].id },
        { title: 'Topping Out Ceremony', description: 'Final slab casting', date: '2026-06-30', status: 'UPCOMING', projectId: projects[0].id },
        { title: 'Foundation Completion - All Blocks', description: 'All blocks foundation done', date: '2025-04-30', status: 'IN_PROGRESS', projectId: projects[1].id },
        { title: 'Viaduct Phase 1 Complete', description: 'First 1km of viaduct erected', date: '2025-02-28', status: 'COMPLETED', projectId: projects[2].id },
        { title: 'Station Structure Complete', description: 'Station building structural works', date: '2025-08-31', status: 'IN_PROGRESS', projectId: projects[2].id },
        { title: 'Project Handover', description: 'Final project handover to client', date: '2024-11-30', status: 'COMPLETED', projectId: projects[4].id },
      ]
      for (const m of milestones) {
        await tx.milestone.create({ data: m })
      }
    })

    // 7. Create Documents
    await db.$transaction(async (tx) => {
      const docs = [
        { title: 'Architectural Drawings - Rev 3', filename: 'arch-drawings-r3.pdf', fileType: 'application/pdf', fileSize: 15400000, url: '/docs/arch-r3.pdf', category: 'DRAWINGS', projectId: projects[0].id, uploadedById: users.member1.id },
        { title: 'Structural Calculations Report', filename: 'structural-calcs.pdf', fileType: 'application/pdf', fileSize: 8900000, url: '/docs/structural-calcs.pdf', category: 'REPORTS', projectId: projects[0].id, uploadedById: users.member1.id },
        { title: 'Site Safety Plan', filename: 'safety-plan.pdf', fileType: 'application/pdf', fileSize: 3200000, url: '/docs/safety-plan.pdf', category: 'SAFETY', projectId: projects[0].id, uploadedById: users.member3.id },
        { title: 'Project Schedule - Updated', filename: 'schedule-v5.mpp', fileType: 'application/msproject', fileSize: 5600000, url: '/docs/schedule-v5.mpp', category: 'SCHEDULES', projectId: projects[0].id, uploadedById: users.manager.id },
        { title: 'Quality Assurance Plan', filename: 'qa-plan.pdf', fileType: 'application/pdf', fileSize: 4500000, url: '/docs/qa-plan.pdf', category: 'QUALITY', projectId: projects[1].id, uploadedById: users.member1.id },
        { title: 'DMRC Specifications', filename: 'dmrc-specs.pdf', fileType: 'application/pdf', fileSize: 22000000, url: '/docs/dmrc-specs.pdf', category: 'SPECIFICATIONS', projectId: projects[2].id, uploadedById: users.member1.id },
      ]
      for (const d of docs) {
        await tx.document.create({ data: d })
      }
    })

    // 8. Create Materials
    await db.$transaction(async (tx) => {
      const materials = [
        { name: 'Concrete M40', quantity: 2500, unit: 'cum', unitCost: 5500, supplier: 'UltraTech ReadyMix', status: 'DELIVERED', projectId: projects[0].id, orderedDate: '2024-08-10', deliveredDate: '2024-09-15' },
        { name: 'TMT Steel Bars 16mm', quantity: 450, unit: 'MT', unitCost: 52000, supplier: 'Tata Steel', status: 'DELIVERED', projectId: projects[0].id, orderedDate: '2024-08-15', deliveredDate: '2024-09-20' },
        { name: 'TMT Steel Bars 25mm', quantity: 320, unit: 'MT', unitCost: 54000, supplier: 'Tata Steel', status: 'ORDERED', projectId: projects[0].id, orderedDate: '2025-01-10' },
        { name: 'Plywood Formwork 18mm', quantity: 5000, unit: 'sheets', unitCost: 1200, supplier: 'Kitply Industries', status: 'INSTALLED', projectId: projects[0].id, orderedDate: '2024-07-20', deliveredDate: '2024-08-05' },
        { name: 'Cement OPC 53 Grade', quantity: 800, unit: 'MT', unitCost: 380, supplier: 'ACC Cement', status: 'ORDERED', projectId: projects[1].id, orderedDate: '2025-01-05' },
        { name: 'Pre-stressed Girders', quantity: 48, unit: 'nos', unitCost: 850000, supplier: 'Precast India', status: 'DELIVERED', projectId: projects[2].id, orderedDate: '2024-10-01', deliveredDate: '2024-12-15' },
      ]
      for (const m of materials) {
        await tx.material.create({ data: m })
      }
    })

    // 9. Create Labels
    await db.$transaction(async (tx) => {
      const labels = [
        { name: 'Critical', color: '#ef4444', projectId: projects[0].id },
        { name: 'Structural', color: '#f97316', projectId: projects[0].id },
        { name: 'MEP', color: '#3b82f6', projectId: projects[0].id },
        { name: 'Safety', color: '#eab308', projectId: projects[0].id },
        { name: 'Quality', color: '#22c55e', projectId: projects[0].id },
        { name: 'Procurement', color: '#8b5cf6', projectId: projects[0].id },
      ]
      for (const l of labels) {
        await tx.label.create({ data: l })
      }
    })

    // 10. Create Subcontractors
    await db.$transaction(async (tx) => {
      const subs = [
        { name: 'Ramesh Gupta', company: 'Gupta Piling Works', email: 'ramesh@guptapiling.com', phone: '+91 98111 22334', contractorType: 'SPECIALIST', registrationNo: 'GPW-2018-4521', gst: '27AADCG1234F1Z5', pan: 'AADCG1234F', license: 'LIC-2019-PILING-456', licenseExpiry: '2026-03-31', insuranceExpiry: '2025-12-31', specialty: 'Piling & Foundation', rating: 4.5, preQualified: true, notes: 'Reliable piling contractor with 15+ years experience' },
        { name: 'Suresh Patel', company: 'Patel Steel Fabricators', email: 'suresh@patelsteel.com', phone: '+91 98222 33445', contractorType: 'FABRICATOR', registrationNo: 'PSF-2017-7890', gst: '24BBPCS5678G2Z3', pan: 'BBPCS5678G', license: 'LIC-2018-FAB-789', licenseExpiry: '2025-09-30', insuranceExpiry: '2025-06-30', specialty: 'Structural Steel', rating: 4.2, preQualified: true, notes: 'Good for structural steel fabrication and erection' },
        { name: 'Anand Mehta', company: 'Mehta Electricals', email: 'anand@mehtaelec.com', phone: '+91 98333 44556', contractorType: 'MEP', registrationNo: 'MEM-2019-1122', gst: '27CCMEM9012H3Z7', pan: 'CCMEM9012H', license: 'LIC-2020-ELEC-123', licenseExpiry: '2026-06-30', insuranceExpiry: '2026-01-31', specialty: 'Electrical Installation', rating: 3.8, preQualified: true },
        { name: 'Deepak Joshi', company: 'Joshi Plumbing Solutions', email: 'deepak@joshiplumb.com', phone: '+91 98444 55667', contractorType: 'MEP', registrationNo: 'JPS-2020-3344', specialty: 'Plumbing & Fire Fighting', rating: 4.0, preQualified: false },
        { name: 'Kavita Reddy', company: 'Reddy Interiors', email: 'kavita@reddyinteriors.com', phone: '+91 98555 66778', contractorType: 'FINISHING', specialty: 'Interior Finishing', rating: 4.7, preQualified: true },
      ]
      for (const s of subs) {
        await tx.subcontractor.create({ data: s })
      }
    })

    // 11. Create some RFIs and Submittals
    await db.$transaction(async (tx) => {
      const rfis = [
        { title: 'Clarification on Deep Foundation Design', description: 'Need clarification regarding the pile cap design at grid intersection B-3 to B-5. The structural drawings show two different reinforcement details.', status: 'IN_REVIEW', priority: 'HIGH', dueDate: '2025-02-15', projectId: projects[0].id, assignedToId: users.member1.id, createdById: users.member2.id },
        { title: 'MEP Coordination - Duct Routing', description: 'Conflict detected between HVAC duct routing and structural beam at Level 5. Need to confirm if beam penetration is acceptable.', status: 'OPEN', priority: 'MEDIUM', dueDate: '2025-02-20', projectId: projects[0].id, assignedToId: users.member1.id, createdById: users.manager.id },
        { title: 'Material Substitution Request - Cement Grade', description: 'Request to substitute OPC 53 grade with PPC for non-structural concrete works to reduce cost.', status: 'ANSWERED', priority: 'LOW', projectId: projects[2].id, response: 'Approved for non-structural works only. Maintain OPC 53 for all structural elements.', createdById: users.member2.id },
      ]
      for (const r of rfis) {
        await tx.rFI.create({ data: r })
      }

      const submittals = [
        { title: 'Mix Design - M40 Concrete', description: 'Concrete mix design for M40 grade as per IS 10262:2019', status: 'APPROVED', dueDate: '2024-07-15', projectId: projects[0].id, submittedById: users.member1.id, reviewedById: users.member1.id },
        { title: 'Steel Shop Drawings - Level 1 to 5', description: 'Structural steel shop drawings for floors 1 through 5', status: 'IN_REVIEW', dueDate: '2025-02-28', projectId: projects[0].id, submittedById: users.member1.id },
        { title: 'Fire Fighting System Layout', description: 'Complete fire fighting system layout including hydrant, sprinkler, and alarm systems', status: 'PENDING', dueDate: '2025-03-15', projectId: projects[0].id, submittedById: users.manager.id },
      ]
      for (const s of submittals) {
        await tx.submittal.create({ data: s })
      }
    })

    // 12. Create Activity Logs
    await db.$transaction(async (tx) => {
      const logs = [
        { action: 'TASK_COMPLETED', details: 'Completed: Complete Piling Work - Zone A', userId: users.member1.id, projectId: projects[0].id, relatedType: 'TASK' },
        { action: 'PROJECT_UPDATED', details: 'Progress updated to 45%', userId: users.manager.id, projectId: projects[0].id, relatedType: 'PROJECT' },
        { action: 'EXPENSE_CREATED', details: 'New expense: Concrete M40 - 500 cum', userId: users.member2.id, projectId: projects[0].id, relatedType: 'EXPENSE' },
        { action: 'RFI_CREATED', details: 'New RFI: Clarification on Deep Foundation Design', userId: users.member2.id, projectId: projects[0].id, relatedType: 'RFI' },
        { action: 'MILESTONE_COMPLETED', details: 'Milestone: Piling Completion', userId: users.manager.id, projectId: projects[0].id, relatedType: 'MILESTONE' },
        { action: 'TASK_CREATED', details: 'New task: Electrical & Signaling Works', userId: users.manager.id, projectId: projects[2].id, relatedType: 'TASK' },
      ]
      for (const l of logs) {
        await tx.activityLog.create({ data: l })
      }
    })

    // 13. Create Notifications
    await db.$transaction(async (tx) => {
      const notifs = [
        { type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: 'You have been assigned: Basement Level 2 Construction', userId: users.member1.id },
        { type: 'RFI_PENDING', title: 'RFI Needs Review', message: 'A new RFI requires your attention: Clarification on Deep Foundation Design', userId: users.member1.id },
        { type: 'DUE_SOON', title: 'Task Due Soon', message: 'MEP Rough-in - Basement is due in 5 days', userId: users.member2.id },
        { type: 'BUDGET_ALERT', title: 'Budget Alert', message: 'Structural Works category has consumed 75% of allocated budget', userId: users.manager.id },
      ]
      for (const n of notifs) {
        await tx.notification.create({ data: n })
      }
    })

    // 14. Create some chat messages
    await db.$transaction(async (tx) => {
      const messages = [
        { content: 'Team, the piling for Zone B is ahead of schedule. Great work everyone!', type: 'TEXT', channelId: projects[0].id, userId: users.member1.id },
        { content: 'Thanks Amit. Let\'s keep the momentum going for the foundation works.', type: 'TEXT', channelId: projects[0].id, userId: users.manager.id },
        { content: 'I\'ve uploaded the revised structural drawings. Please review.', type: 'TEXT', channelId: projects[0].id, userId: users.member1.id },
        { content: 'Safety inspection scheduled for tomorrow at 9 AM. All site personnel please be present.', type: 'TEXT', channelId: projects[0].id, userId: users.member3.id },
        { content: 'The steel delivery has been delayed by 2 days. I\'m following up with the supplier.', type: 'TEXT', channelId: projects[0].id, userId: users.member4.id },
      ]
      for (const m of messages) {
        await tx.chatMessage.create({ data: m })
      }
    })

    // 15. Create Punch Items
    await db.$transaction(async (tx) => {
      const punchItems = [
        { title: 'Repair honeycombing in Column C-12', description: 'Honeycombing observed at 3rd floor level in column C-12. Needs immediate repair.', status: 'OPEN', priority: 'HIGH', location: '3rd Floor - Grid C', projectId: projects[0].id, assignedToId: users.member1.id, createdById: users.member3.id },
        { title: 'Fix plumbing leak at Level B2', description: 'Water seepage observed near expansion joint at basement level 2.', status: 'IN_PROGRESS', priority: 'MEDIUM', location: 'Basement Level 2', projectId: projects[0].id, assignedToId: users.member1.id, createdById: users.member2.id },
        { title: 'Reinstall fire stop at penetration', description: 'Fire stop material missing at MEP penetration through fire wall.', status: 'OPEN', priority: 'HIGH', location: 'Basement Level 3', projectId: projects[0].id, assignedToId: null, createdById: users.member3.id },
      ]
      for (const p of punchItems) {
        await tx.punchItem.create({ data: p })
      }
    })

    // 16. Create Change Orders
    await db.$transaction(async (tx) => {
      const cos = [
        { title: 'Additional Piling - Unexpected Rock Strata', description: 'Encountered hard rock at 12m depth requiring additional piling. 8 extra piles of 18m length needed.', status: 'APPROVED', costImpact: 4500000, scheduleImpact: '3 weeks delay', reason: 'Geotechnical conditions differed from soil report', projectId: projects[0].id, requestedById: users.member1.id, approvedById: users.admin.id, approvedAt: '2024-09-10' },
        { title: 'Upgrade MEP to BMS Integration', description: 'Client requested upgrade of MEP systems to integrate with Building Management System.', status: 'PROPOSED', costImpact: 12000000, scheduleImpact: '4 weeks', reason: 'Client requirement change', projectId: projects[0].id, requestedById: users.manager.id },
      ]
      for (const c of cos) {
        await tx.changeOrder.create({ data: c })
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        users: 6,
        projects: 5,
        message: 'Demo data seeded successfully. Login with raj@cms.com / password',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to seed data'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}