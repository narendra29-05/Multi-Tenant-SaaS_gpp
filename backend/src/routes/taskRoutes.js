const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { createTask, updateTaskStatus } = require('../controllers/taskController');

router.use(authenticate);

// API 16: Create Task
router.post('/projects/:projectId/tasks', createTask);

// API 18: Update Status
router.patch('/:taskId/status', updateTaskStatus);

module.exports = router;