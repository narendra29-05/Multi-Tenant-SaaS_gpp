# Product Requirements Document (PRD)

## User Personas
1. **Super Admin:** Manages the entire SaaS platform. Monitors all tenants and their subscription status.
2. **Tenant Admin:** The "owner" of an organization. Can add/remove members and manage all projects.
3. **End User:** Team members who create tasks and update project statuses.

## Functional Requirements (Minimum 15)
- **FR-001:** System shall allow users to register a new tenant with a unique subdomain.
- **FR-002:** System shall verify tenant status (Active/Suspended) during login.
- **FR-003:** System shall isolate data so Tenant A cannot see Tenant B's projects.
- **FR-004:** System shall enforce a 5-user limit on the "Free" plan.
- **FR-005:** System shall enforce a 3-project limit on the "Free" plan.
- **FR-006:** Tenant Admins shall be able to add new users via an email and password.
- **FR-007:** System shall support 3 roles: Super Admin, Tenant Admin, User.
- **FR-008:** Users shall be able to create projects.
- **FR-009:** Users shall be able to create tasks within a project.
- **FR-010:** Users shall be able to update task statuses (Todo, In Progress, Completed).
- **FR-011:** System shall generate a 24-hour JWT upon successful login.
- **FR-012:** System shall provide a Health Check API for monitoring.
- **FR-013:** System shall log all major actions in an audit_logs table.
- **FR-014:** Super Admin shall have access to list all tenants.
- **FR-015:** Dashboard shall display real-time statistics of projects and tasks.

## Non-Functional Requirements
- **NFR-001:** API response time must be under 200ms.
- **NFR-002:** System must be fully containerized using Docker.
- **NFR-003:** All passwords must be hashed using bcrypt.
- **NFR-004:** UI must be responsive for mobile and desktop views.
- **NFR-005:** Database migrations must run automatically on startup.