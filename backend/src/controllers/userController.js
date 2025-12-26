const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

exports.inviteUser = async (req, res) => {
  const { full_name, email, password, role } = req.body;
  const tenant_id = req.user.tenantId; // Isolation: Get tenant from the admin's token

  try {
    // 1. Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already registered" });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert user linked to the tenant
    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, password, role, tenant_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role`,
      [full_name, email, hashedPassword, role || 'member', tenant_id]
    );

    res.status(201).json({ success: true, data: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listTeam = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, created_at FROM users WHERE tenant_id = $1',
      [req.user.tenantId]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};