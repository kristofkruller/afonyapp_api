const express = require('express');
const { orders, updateOrderStatus } = require('../controllers/ordersController');
const jwtFromHeader = require('../middleware/jwtFromHeader');

const ordersRouter = express.Router();

ordersRouter.post('/', jwtFromHeader, orders);
ordersRouter.put('/status', jwtFromHeader, updateOrderStatus);

module.exports = ordersRouter;