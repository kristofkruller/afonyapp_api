const { login, register, verify } = require('../controllers/authController');
const express = require('express');
const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/verify', verify);

module.exports = authRouter;