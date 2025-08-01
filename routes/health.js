// const { login, register, verify } = require('../controllers/authController');
const express = require('express');
const healthCheck = express.Router();

const isUp = async (_, res) => {
  return res.status(200).json({health: 'Up'});
}

healthCheck.get('/', isUp);

module.exports = healthCheck;