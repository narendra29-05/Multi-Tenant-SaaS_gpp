# System Architecture & API Specification

## 1. System Overview
The application follows a standard **Three-Tier Architecture**:
- **Presentation Layer:** React.js (Frontend)
- **Application Layer:** Node.js with Express (Backend)
- **Data Layer:** PostgreSQL (Database)



## 2. Database Design (ERD)
The system uses a shared database with a `tenant_id` column for logical isolation.
- **tenants:** Stores organization metadata and subscription limits.
- **users:** Stores credentials and roles. Linked to `tenants` via `tenant_id`.
- **projects:** Stores project data. Linked to `tenants` via `tenant_id`.
- **tasks:** Stores task data. Linked to `projects` AND `tenants`.
- **audit_logs:** Stores immutable records of all system actions.

## 3. API Endpoint List (The 19 Required APIs)

### Authentication
1. `POST /api/auth/register-tenant` - Public - Register new Org + Admin
2. `POST /api/auth/login` - Public - Obtain JWT
3. `GET /api/auth/me` - Private - Get current user/tenant info
4. `POST /api/auth/logout` - Private - Clear session/log action

### Tenant Management
5. `GET /api/tenants/:tenantId` - Admin/Super - Get org details
6. `PUT /api/tenants/:tenantId` - Admin/Super - Update org name
7. `GET /api/tenants` - Super Admin Only - List all tenants in system

### User Management
8. `POST /api/tenants/:tenantId/users` - Admin - Add team member
9. `GET /api/tenants/:tenantId/users` - Private - List team members
10. `PUT /api/users/:userId` - Admin/Self - Update user profile
11. `DELETE /api/users/:userId` - Admin - Remove team member

### Project Management
12. `POST /api/projects` - Private - Create project (Checks limit)
13. `GET /api/projects` - Private - List tenant's projects
14. `PUT /api/projects/:projectId` - Admin/Creator - Update project
15. `DELETE /api/projects/:projectId` - Admin/Creator - Delete project

### Task Management
16. `POST /api/projects/:projectId/tasks` - Private - Add task
17. `GET /api/projects/:projectId/tasks` - Private - List tasks
18. `PATCH /api/tasks/:taskId/status` - Private - Update status (Todo/Done)
19. `PUT /api/tasks/:taskId` - Private - Edit task details