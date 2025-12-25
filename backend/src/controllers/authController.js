const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/jwt');

const registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start Transaction (Requirement #15)

    // 1. Create Tenant
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain, subscription_plan, max_users, max_projects) 
       VALUES ($1, $2, 'free', 5, 3) RETURNING id`,
      [tenantName, subdomain.toLowerCase()]
    );
    const tenantId = tenantResult.rows[0].id;

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // 3. Create Admin User
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4, 'tenant_admin') RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, passwordHash, adminFullName]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId,
        subdomain,
        adminUser: userResult.rows[0]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: "Subdomain or Email already exists" });
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};
const login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  try {
    // 1. Join user with tenant to verify subdomain (unless it's a super_admin)
    // Super Admins don't belong to a tenant, so we use a LEFT JOIN
    const userResult = await pool.query(
      `SELECT u.*, t.subdomain, t.status as tenant_status 
       FROM users u 
       LEFT JOIN tenants t ON u.tenant_id = t.id 
       WHERE u.email = $1`,
      [email]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 2. If not a super_admin, verify the tenant subdomain and status
    if (user.role !== 'super_admin') {
      if (user.subdomain !== tenantSubdomain) {
        return res.status(404).json({ success: false, message: "Tenant not found for this user" });
      }
      if (user.tenant_status !== 'active') {
        return res.status(403).json({ success: false, message: "Account suspended or inactive" });
      }
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 4. Generate JWT (using the utility we created earlier)
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id
        },
        token,
        expiresIn: 86400 // 24 hours
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerTenant, login };