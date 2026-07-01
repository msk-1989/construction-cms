# Task R2 - Core API Routes

## Status: COMPLETED

## Summary
Created/rewrote all 24 core API routes for the Construction Management CMS.

## Routes Created

### Auth (3 routes)
- `src/app/api/auth/login/route.ts` - POST: login with plain text password match, sets cookie
- `src/app/api/auth/me/route.ts` - GET: returns null (client-side only via Zustand)
- `src/app/api/auth/register/route.ts` - POST: create user with email uniqueness check

### Dashboard (1 route)
- `src/app/api/dashboard/route.ts` - POST: comprehensive stats (18+ metrics) with recent projects, upcoming tasks, recent activity

### Projects (2 routes)
- `src/app/api/projects/route.ts` - GET (list with search, member/task counts), POST (create with auto-generated 3-letter code)
- `src/app/api/projects/[id]/route.ts` - GET (full detail with members, budget categories, milestones), PUT, DELETE

### Tasks (3 routes)
- `src/app/api/tasks/route.ts` - GET (filter by projectId, assigneeId, status), POST
- `src/app/api/tasks/[id]/route.ts` - GET (full detail with subtasks, comments, dependencies, time entries), PUT, DELETE
- `src/app/api/tasks/bulk/route.ts` - PUT (bulk update status/priority/assignee), DELETE (bulk delete)

### Team (1 route)
- `src/app/api/team/route.ts` - GET: list all users with project/task counts

### New API Routes (14 routes)
- `src/app/api/comments/route.ts` - GET (?projectId, ?taskId), POST, PUT, DELETE (with replies)
- `src/app/api/subtasks/route.ts` - GET (?taskId), POST, PUT, DELETE
- `src/app/api/labels/route.ts` - GET (?projectId), POST, DELETE
- `src/app/api/task-labels/route.ts` - POST (link task to label), DELETE (unlink)
- `src/app/api/dependencies/route.ts` - GET (?taskId), POST, DELETE
- `src/app/api/time-entries/route.ts` - GET (?taskId with totalDuration), POST, DELETE
- `src/app/api/attachments/route.ts` - GET (?projectId, ?taskId), POST, DELETE
- `src/app/api/activity/route.ts` - GET (?projectId, ?limit), POST
- `src/app/api/notifications/route.ts` - GET (?userId with unreadCount), PUT (mark single/all read)
- `src/app/api/milestones/route.ts` - GET (?projectId), POST, PUT, DELETE
- `src/app/api/documents/route.ts` - GET (?projectId), POST, PUT, DELETE
- `src/app/api/budget-categories/route.ts` - GET (?projectId with spent totals), POST, PUT, DELETE
- `src/app/api/expenses/route.ts` - GET (?projectId), POST, PUT, DELETE
- `src/app/api/materials/route.ts` - GET (?projectId), POST, PUT, DELETE
- `src/app/api/daily-logs/route.ts` - GET (?projectId), POST, PUT, DELETE

## Pattern Used
All routes follow the standard pattern:
- `{ success: true, data: ... }` for success
- `{ success: false, error: '...' }` for errors
- `try/catch` with `e instanceof Error ? e.message : 'Failed'`
- Related data included in GET responses
- Empty results handled gracefully