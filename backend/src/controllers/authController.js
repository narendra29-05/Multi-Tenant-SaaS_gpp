const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

/**
 * API 1: Tenant Registration
 * POST /api/auth/register-tenant
 */
const registerTenant = async (req, res) => {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

    // 1. Basic check for missing fields
    if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 2. Check if subdomain exists
        const subCheck = await client.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain.toLowerCase()]);
        if (subCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'Subdomain already exists' });
        }

        // 3. Check if email exists (Global check for super admins or other tenant admins)
        const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
        if (emailCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        // 4. Create Tenant
        const tenantId = uuidv4();
        const tenantQuery = `
            INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING id
        `;
        await client.query(tenantQuery, [tenantId, tenantName, subdomain.toLowerCase(), 'active', 'free', 5, 3]);

        // 5. Hash Password & Create Admin User
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);
        const userId = uuidv4();

        const userQuery = `
            INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING id, email, full_name, role
        `;
        const newUser = await client.query(userQuery, [userId, tenantId, adminEmail, passwordHash, adminFullName, 'tenant_admin', true]);

        // 6. Audit Log (Requirement 4)
        const auditQuery = `
            INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `;
        await client.query(auditQuery, [uuidv4(), tenantId, userId, 'TENANT_REGISTRATION', 'tenant', tenantId]);

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Tenant registered successfully',
            data: {
                tenantId: tenantId,
                subdomain: subdomain.toLowerCase(),
                adminUser: {
                    id: newUser.rows[0].id,
                    email: newUser.rows[0].email,
                    fullName: newUser.rows[0].full_name,
                    role: newUser.rows[0].role
                }
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('REGISTRATION_ERROR_DETAIL:', error); // Check your terminal for this!
        return res.status(500).json({ 
            success: false, 
            message: 'Registration failed', 
            error: error.message // This tells you exactly what SQL failed
        });
    } finally {
        client.release();
    }
};

/**
 * API 2: User Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
    const { email, password, tenantSubdomain } = req.body;

    try {
        // 1. Find Tenant
        const tenantRes = await pool.query('SELECT * FROM tenants WHERE subdomain = $1', [tenantSubdomain]);
        if (tenantRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        const tenant = tenantRes.rows[0];

        // 2. Find User
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1 AND tenant_id = $2', [email, tenant.id]);
        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const user = userRes.rows[0];

        // 3. Verify Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 4. Generate JWT (userId, tenantId, role)
        const token = jwt.sign(
            { userId: user.id, tenantId: user.tenant_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            success: true,
            data: {
                user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role, tenantId: user.tenant_id },
                token,
                expiresIn: 86400
            }
        });

    } catch (error) {
        console.error('LOGIN_ERROR:', error);
        return res.status(500).json({ success: false, message: 'Login failed' });
    }
};

/**
 * API 3: Get Current User
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.email, u.full_name, u.role, u.is_active,
            t.id as tenant_id, t.name as tenant_name, t.subdomain, t.subscription_plan, t.max_users, t.max_projects
            FROM users u
            LEFT JOIN tenants t ON u.tenant_id = t.id
            WHERE u.id = $1
        `;
        const result = await pool.query(query, [req.user.userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const data = result.rows[0];
        return res.json({
            success: true,
            data: {
                id: data.id,
                email: data.email,
                fullName: data.full_name,
                role: data.role,
                isActive: data.is_active,
                tenant: data.tenant_id ? {
                    id: data.tenant_id,
                    name: data.tenant_name,
                    subdomain: data.subdomain,
                    subscriptionPlan: data.subscription_plan,
                    maxUsers: data.max_users,
                    maxProjects: data.max_projects
                } : null
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * API 4: Logout
 */
const logout = async (req, res) => {
    // In JWT stateless, client just deletes token. 
    // We simply return success as per requirements.
    res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { registerTenant, login, getCurrentUser, logout };