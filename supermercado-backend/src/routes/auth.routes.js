const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Registro de usuario
router.post('/register', authController.register);

// Login de usuario
router.post('/login', authController.login);

module.exports = router;
