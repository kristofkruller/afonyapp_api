// const { login, register, verify } = require('../controllers/authController');
const express = require('express');
const healthCheck = express.Router();

const isUp = async (_, res) => {
  return res.json({health: 'Up'});
}

healthCheck.get('/', isUp);

module.exports = healthCheck;