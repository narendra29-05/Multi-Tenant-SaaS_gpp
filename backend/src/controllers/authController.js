const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/jwt');

console.log("Auth Controller Loading..."); // This will show in docker logs

const registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain, subscription_plan, max_users, max_projects) 
       VALUES ($1, $2, 'free', 5, 3) RETURNING id`,
      [tenantName, subdomain.toLowerCase()]
    );
    const tenantId = tenantResult.rows[0].id;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4, 'tenant_admin') RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, passwordHash, adminFullName]
    );
    await client.query('COMMIT');
    res.status(201).json({ success: true, message: "Registered", data: { tenantId, adminUser: userResult.rows[0] } });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;
  try {
    const userResult = await pool.query(
      `SELECT u.*, t.subdomain, t.status as tenant_status FROM users u 
       LEFT JOIN tenants t ON u.tenant_id = t.id WHERE u.email = $1`, [email]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user);
    res.status(200).json({ success: true, data: { user: { id: user.id, fullName: user.full_name, role: user.role }, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DOUBLE CHECK THIS LINE
module.exports = { registerTenant, login };