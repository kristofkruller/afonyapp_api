const express = require('express');
const { orders, updateOrderStatus, registerOrderOptions } = require('../controllers/ordersController');
const jwtFromHeader = require('../middleware/jwtFromHeader');

const ordersRouter = express.Router();

ordersRouter.post('/', jwtFromHeader, orders);
ordersRouter.put('/status', jwtFromHeader, updateOrderStatus);
ordersRouter.get('/registerOrderOptions', jwtFromHeader, registerOrderOptions);

module.exports = ordersRouter;