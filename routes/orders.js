const express = require('express');
const { orders, updateOrderStatus, getOrderOptions, registerNewOrder } = require('../controllers/ordersController');
const jwtFromHeader = require('../middleware/jwtFromHeader');

const ordersRouter = express.Router();

ordersRouter.post('/', jwtFromHeader, orders);
ordersRouter.put('/status', jwtFromHeader, updateOrderStatus);
ordersRouter.get('/getOrderOptions', jwtFromHeader, getOrderOptions);
ordersRouter.post('/registerNewOrder', jwtFromHeader, registerNewOrder);

module.exports = ordersRouter;