const { login, register, verify } = require('../controllers/authController');
const express = require('express');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/verify', verify);

module.exports = router;