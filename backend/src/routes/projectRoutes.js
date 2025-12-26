const express = require('express');
const router = express.Router();
const { listProjects, createProject } = require('../controllers/projectController');
const { authenticate } = require('../middleware/authMiddleware');

// Note: These paths are relative to '/api/projects' defined in app.js
router.get('/', authenticate, listProjects);
router.post('/', authenticate, createProject);

module.exports = router;