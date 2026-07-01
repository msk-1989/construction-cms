# Task R3: Core UI Components

## Status: COMPLETED

## Components Created

### 1. LoginView.tsx (`/src/components/cms/LoginView.tsx`)
- Full-screen login with amber/orange gradient background
- 8 animated floating construction icons (HardHat, Building2, Wrench, Hammer, Crane, Settings2) using framer-motion
- CMS logo/title with "Construction Management System" subtitle
- Email + Password form with show/hide toggle
- Login POST to `/api/auth/login` with proper error handling
- Demo credentials card (raj@cms.com / password) with "Fill" button
- Dark mode toggle via next-themes
- Loading state with spinner

### 2. Sidebar.tsx (`/src/components/cms/Sidebar.tsx`)
- Collapsible sidebar (w-256 / w-68) with smooth framer-motion width animation
- Logo area with Building2 icon in amber gradient
- 7 main menu items + 2 admin items, all filtered by `usePermissions().can()`
- Badge counts fetched from `/api/dashboard` (tasks, projects)
- Active state with amber gradient
- Desktop: collapsible sidebar with tooltips when collapsed
- Mobile: Sheet/drawer via shadcn Sheet component
- User info at bottom with avatar, name, role
- Sign out button
- Admin section with separator

### 3. Header.tsx (`/src/components/cms/Header.tsx`)
- Mobile menu button (hamburger) for sidebar toggle
- Breadcrumb showing current view name
- Search input (desktop only)
- Notification dropdown with badge, mark all read, skeleton loading
- Dark mode toggle (Sun/Moon icons)
- User menu dropdown (profile, settings, sign out)
- Sticky top with backdrop blur
- Notification polling every 30s

### 4. DashboardView.tsx (`/src/components/cms/DashboardView.tsx`)
- 4 stat cards: Active Projects, Total Tasks, Team Members, Completion Rate
- Each with gradient icon, animated progress bar, staggered entrance animation
- Recent Projects list (last 5) with progress, status badges
- Upcoming Tasks list (next 5) with priority badges, due dates
- Activity feed (last 10) with user avatars
- Quick action buttons (New Project, New Task, Manage Team, View Reports)
- Responsive grid layout
- Skeleton loading states

### 5. ProjectsView.tsx (`/src/components/cms/ProjectsView.tsx`)
- Grid/List toggle view with smooth transitions
- Search bar with real-time filtering
- Status filter tabs: All, Active, On Hold, Completed
- Project cards: name, code, status badge, progress bar, budget, member count, due date
- Create project dialog: name, description, status, dates, budget, project type, contract type, site info (address, contact, email, phone), workforce
- Edit/Delete per project via dropdown menu
- Click project → navigates to project-detail view
- Permission-based Create/Edit/Delete buttons
- Staggered animation on grid items

### 6. TasksView.tsx (`/src/components/cms/TasksView.tsx`)
- Tab filter: All Tasks, My Tasks, By Status
- List/Kanban toggle (Kanban uses simple columns, no dnd-kit)
- Search + priority filter dropdown
- Task cards/rows: title, status badge, priority badge, assignee, due date, progress, milestone indicator
- Create task dialog: title, description, project, assignee, status, priority, due date, estimated hours
- Edit/Delete per task
- Bulk selection: checkboxes with "Select All" header
- Floating bulk action bar (appears when items selected): Change Status, Change Priority, Assign, Delete
- Permission-based Create/Edit/Delete
- Kanban columns: Pending, In Progress, Completed, On Hold, Cancelled

### 7. OnboardingTour.tsx (`/src/components/cms/OnboardingTour.tsx`)
- 5-step tour with navigation dots
- Each tip has unique icon and gradient color
- "Got it!" dismiss button on last step
- "Skip tour" button available on all steps
- Back/Next navigation
- localStorage flag (`cms-onboarding-completed`) to show only once
- Modal overlay with backdrop blur
- Framer motion entrance/exit animations

## Stub Components Created
For views not yet built (imported by existing page.tsx):
- ProjectDetailView.tsx
- TeamView.tsx
- ReportsView.tsx
- SettingsView.tsx
- NotificationsView.tsx
- AdminDashboardView.tsx
- ChatView.tsx
- AIChatPanel.tsx (returns null)

## Lint Status
- All new components pass ESLint cleanly
- Only pre-existing error in GanttChart.tsx (not touched)

## Architecture Notes
- All components use `'use client'` directive
- All use named exports: `export function ComponentName()`
- All API calls use `globalThis.fetch` with relative paths
- All notifications use `toast` from `sonner`
- All class merging uses `cn()` from `@/lib/utils`
- All animations use `framer-motion`
- Amber/orange theme throughout, NO blue/indigo
- Cards use `border-0 shadow-sm`
- Mobile responsive with sm/md/lg breakpoints
- Loading states with Skeleton components
- Error states handled gracefully with toast notifications