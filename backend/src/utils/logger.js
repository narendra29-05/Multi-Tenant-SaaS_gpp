const { pool } = require('../config/db');

const logAction = async (tenantId, userId, action, entityType, entityId, ip = null) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [tenantId, userId, action, entityType, entityId, ip]
    );
  } catch (error) {
    console.error("Audit Log Error:", error.message);
    // Don't throw error to avoid breaking the main request
  }
};

module.exports = { logAction };