const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const healthCheck = require('./routes/health');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthCheck);
app.use('/api/auth', authRouter);

const PORT = Number(process.env.PORT) || 6000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}`)
});
