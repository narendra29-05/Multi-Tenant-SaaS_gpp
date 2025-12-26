const express = require('express');
const router = express.Router();
const { inviteUser, listTeam } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Only Admins should be able to invite new users
router.post('/invite', authenticate, authorize('admin'), inviteUser);
router.get('/team', authenticate, listTeam);

module.exports = router;