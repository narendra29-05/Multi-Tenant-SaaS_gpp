const { pool } = require('../config/db');
const { logAction } = require('../utils/logger');

const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority, dueDate } = req.body;
  const { tenantId, userId } = req.user;

  try {
    // 1. Verify project exists AND belongs to the user's tenant (Data Isolation)
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized: Project not found in your organization" });
    }

    // 2. If assignedTo is provided, verify that user belongs to the same tenant
    if (assignedTo) {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, tenantId]
      );
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ success: false, message: "Assigned user must belong to your organization" });
      }
    }

    // 3. Create Task
    const result = await pool.query(
      `INSERT INTO tasks (project_id, tenant_id, title, description, assigned_to, priority, due_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'todo') RETURNING *`,
      [projectId, tenantId, title, description, assignedTo, priority, dueDate]
    );

    await logAction(tenantId, userId, 'CREATE_TASK', 'task', result.rows[0].id);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body; // 'todo', 'in_progress', 'completed'
  const { tenantId, userId } = req.user;

  try {
    const result = await pool.query(
      `UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND tenant_id = $3 RETURNING *`,
      [status, taskId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createTask, updateTaskStatus };