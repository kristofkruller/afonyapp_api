const jwtFromHeader = require('../middleware/jwtFromHeader');
const { login, register, verify, updateUser, updatePass } = require('../controllers/authController');
const express = require('express');
const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/verify', verify);
authRouter.put('/me', jwtFromHeader, updateUser);
authRouter.put('/pass', jwtFromHeader, updatePass);

module.exports = authRouter;