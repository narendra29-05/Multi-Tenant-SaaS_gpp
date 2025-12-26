const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  // Include userId, tenantId, and role in payload (Requirement #7 - FAQ Q7)
  return jwt.sign(
    { 
      userId: user.id, 
      tenantId: user.tenant_id, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = { generateToken };