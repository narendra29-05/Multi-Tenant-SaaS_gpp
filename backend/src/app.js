const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const runMigrations = require('./config/migrate');
const { pool } = require('./config/db');

// Load environment variables from .env
dotenv.config();

const app = express();

// --- 1. MIDDLEWARE ---

// Standard JSON parsing middleware
app.use(express.json());

// Mandatory CORS Configuration (Requirement #7)
// In Docker, frontend URL is http://frontend:3000
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// --- 2. MANDATORY HEALTH CHECK (Requirement #7) ---
// This endpoint is used by the Docker healthcheck and the evaluation script.
app.get('/api/health', async (req, res) => {
  try {
    // Attempt to query the database to verify connectivity
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: "ok", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ 
      status: "error", 
      database: "disconnected",
      message: err.message 
    });
  }
});

// --- 3. API ROUTES (Placeholders for now) ---
// Example: app.use('/api/auth', require('./routes/authRoutes'));
// Example: app.use('/api/projects', require('./routes/projectRoutes'));

// Basic root route for verification
app.use('/api/tasks', require('./routes/taskRoutes'));
// Note: You can also mount tasks under /api/projects if you prefer
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.get('/', (req, res) => {
  res.status(200).json({ message: "Multi-Tenant SaaS API is running." });
});

// --- 4. ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// --- 5. SERVER STARTUP & AUTO-MIGRATIONS ---
const startServer = async () => {
  try {
    console.log("Starting server initialization...");

    // Mandatory: Run migrations and seed data automatically before server starts
    // This ensures the DB is ready for the evaluation script
    await runMigrations();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`
🚀 Server successfully started!
📡 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
🛠️ Health Check: http://localhost:${PORT}/api/health
      `);
    });
  } catch (error) {
    console.error("Critical failure during startup:", error);
    process.exit(1); // Exit if migrations or DB connection fails
  }
};

startServer();