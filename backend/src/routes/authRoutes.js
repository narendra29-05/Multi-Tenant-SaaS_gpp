const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Using the controller object directly to avoid destructuring errors
router.post('/register-tenant', authController.registerTenant);
router.post('/login', authController.login);

module.exports = router;