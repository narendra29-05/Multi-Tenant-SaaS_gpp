const { pool } = require('../config/db');
const { logAction } = require('../utils/logger');

const listProjects = async (req, res) => {
  try {
    // LEFT JOIN ensures projects show even if creator user is missing
    const result = await pool.query(
      `SELECT p.*, u.full_name as creator_name 
       FROM projects p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.tenant_id = $1
       ORDER BY p.created_at DESC`, 
      [req.user.tenantId]
    );

    res.status(200).json({
      success: true,
      data: { projects: result.rows }
    });
  } catch (error) {
    console.error("List Projects Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProject = async (req, res) => {
  const { name, description } = req.body;
  const tenant_id = req.user.tenantId; 
  const created_by = req.user.userId;

  try {
    // 1. Check Subscription Limits
    const tenantData = await pool.query('SELECT max_projects FROM tenants WHERE id = $1', [tenant_id]);
    const currentCount = await pool.query('SELECT COUNT(*) FROM projects WHERE tenant_id = $1', [tenant_id]);

    const max = tenantData.rows[0]?.max_projects || 0;
    const current = parseInt(currentCount.rows[0].count);

    if (current >= max) {
      return res.status(403).json({ success: false, message: "Project limit reached for your plan" });
    }

    // 2. Insert Project
    const result = await pool.query(
      `INSERT INTO projects (name, description, tenant_id, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, tenant_id, created_by]
    );

    // 3. Log Action
    await logAction(tenant_id, created_by, 'CREATE_PROJECT', 'project', result.rows[0].id);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Create Project Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { listProjects, createProject };