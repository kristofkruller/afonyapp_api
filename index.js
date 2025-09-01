const express = require('express');
const cors = require('cors');
const checkEnvVars = require('./assets/check_env');

const authRouter = require('./routes/auth');
const healthCheck = require('./routes/health');
const ordersRouter = require('./routes/orders');

try {
  require('dotenv').config();

  checkEnvVars(process.env.NODE_ENV === 'production');

  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json());

  app.use('/api/health', healthCheck);
  app.use('/api/auth', authRouter);
  app.use('/api/orders', ordersRouter);

  const PORT = Number(process.env.PORT) || 6000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API running on port ${PORT}`)
  });
} catch (error) {
  console.error('App startup failed:', error.message);
  process.exit(1);
}

