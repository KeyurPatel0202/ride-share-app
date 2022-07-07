const express = require('express');
const router = express.Router();
const AuthController = require('../controller/auth-controller');

router.post('/register', AuthController.register);
router.post('/login',AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/verification', AuthController.verification);

module.exports = router;