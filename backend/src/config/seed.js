const bcrypt = require('bcrypt');
const { pool } = require('./db');

const seedData = async () => {
  const client = await pool.connect();
  try {
    console.log("Checking if seed data exists...");
    
    // Check if Super Admin already exists to prevent duplicate seeding
    const check = await client.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['super_admin']);
    if (check.rows.length > 0) {
      console.log("Seed data already present. Skipping...");
      return;
    }

    await client.query('BEGIN');
    const salt = await bcrypt.genSalt(10);

    // 1. Create Super Admin (tenant_id is NULL)
    const superAdminPass = await bcrypt.hash('Admin@123', salt);
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, tenant_id) 
       VALUES ('superadmin@system.com', $1, 'System Admin', 'super_admin', NULL)`,
      [superAdminPass]
    );

    // 2. Create Demo Tenant
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects) 
       VALUES ('Demo Company', 'demo', 'active', 'pro', 25, 15) RETURNING id`
    );
    const demoTenantId = tenantResult.rows[0].id;

    // 3. Create Tenant Admin for Demo
    const tenantAdminPass = await bcrypt.hash('Demo@123', salt);
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, tenant_id) 
       VALUES ('admin@demo.com', $1, 'Demo Admin', 'tenant_admin', $2)`,
      [tenantAdminPass, demoTenantId]
    );

    // 4. Create Regular User
    const userPass = await bcrypt.hash('User@123', salt);
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, tenant_id) 
       VALUES ('user1@demo.com', $1, 'Demo User', 'user', $2)`,
      [userPass, demoTenantId]
    );

    await client.query('COMMIT');
    console.log("✅ Seed data successfully loaded.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Seeding failed:", err);
  } finally {
    client.release();
  }
};

module.exports = seedData;