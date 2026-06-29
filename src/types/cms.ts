export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string | null
  createdAt: string
}

export interface Project {
  id: string
  name: string
  code: string
  description?: string | null
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
  progress: number
  startDate?: string | null
  endDate?: string | null
  budget?: number | null
  createdAt: string
  updatedAt: string
  createdById: string
  createdBy?: User
  members?: ProjectMember[]
  tasks?: Task[]
  _count?: { tasks: number }
  memberCount?: number
}

export interface ProjectMember {
  id: string
  userId: string
  projectId: string
  joinedAt: string
  user?: User
}

export interface Task {
  id: string
  title: string
  description?: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  progress: number
  dueDate?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
  projectId: string
  project?: Project
  assigneeId?: string | null
  assignee?: User | null
  createdById: string
  createdBy?: User
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  totalMembers: number
  recentProjects: Project[]
  upcomingTasks: Task[]
}

export type ViewType = 'dashboard' | 'projects' | 'tasks' | 'team' | 'reports' | 'project-detail'
