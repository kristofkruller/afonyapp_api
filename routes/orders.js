const express = require('express');
const orders = require('../controllers/ordersController');
const jwtFromHeader = require('../middleware/jwtFromHeader');

const ordersRouter = express.Router();

ordersRouter.post('/orders', jwtFromHeader, orders);

module.exports = ordersRouter;