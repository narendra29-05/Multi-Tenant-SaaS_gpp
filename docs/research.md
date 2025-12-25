# Multi-Tenancy Research Analysis

## 1. Multi-Tenancy Approaches
In SaaS architecture, there are three primary patterns for managing data isolation:

### Approach A: Shared Database + Shared Schema (The Column-Based Isolation)
This is the approach implemented in this project. All tenants share the same database and the same tables. Every row in the database is tagged with a `tenant_id`.
- **Pros:** Extremely easy to scale and maintain. Migrations only need to run once. Most cost-effective.
- **Cons:** High risk of "Data Leakage" if the developer forgets to add `WHERE tenant_id = ?` in a query.

### Approach B: Shared Database + Separate Schema (The Schema Isolation)
Each tenant gets their own "Schema" (namespace) within the same database.
- **Pros:** Better security than Approach A. Users can have custom fields more easily.
- **Cons:** Migrations are difficult. If you have 100 tenants, you must run your migration 100 times.

### Approach C: Separate Database (The Database Isolation)
Each tenant gets a physically separate database instance.
- **Pros:** Maximum security and performance isolation. No "noisy neighbor" effect.
- **Cons:** Extremely expensive and complex to manage.

## 2. Technology Stack Justification
- **Node.js & Express:** Chosen for its asynchronous nature, which is perfect for I/O heavy SaaS applications.
- **PostgreSQL:** Chosen over NoSQL because multi-tenant systems require strict relational constraints and ACID compliance to ensure data integrity.
- **JWT (JSON Web Tokens):** Used for stateless authentication. This allows our backend to be scalable (it doesn't need to remember sessions) while securely carrying the `tenant_id` in the payload.
- **React:** Chosen for its component-based architecture, making the complex state management of projects and tasks easier to build and maintain.

## 3. Security Measures
1. **Data Isolation:** Enforced via a global `tenant_id` check at the database layer.
2. **RBAC:** Role-Based Access Control ensures that regular users cannot perform admin actions (like adding users).
3. **Password Security:** Using `bcrypt` with 10 salt rounds to ensure that even if the database is leaked, user passwords remain secure.
4. **JWT Expiry:** Tokens expire in 24 hours to limit the window of opportunity for hijacked tokens.