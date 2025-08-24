const express = require('express');
const { orders, updateOrderStatus } = require('../controllers/ordersController');
const jwtFromHeader = require('../middleware/jwtFromHeader');

const ordersRouter = express.Router();

ordersRouter.post('/orders', jwtFromHeader, orders);
ordersRouter.put('/orders/status', jwtFromHeader, updateOrderStatus);

module.exports = ordersRouter;