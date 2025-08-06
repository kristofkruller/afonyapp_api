const { login, register, verify, updateUser } = require('../controllers/authController');
const express = require('express');
const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/verify', verify);
authRouter.put('/me', updateUser);

module.exports = authRouter;