const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const healthCheck = require('./routes/health');

require('dotenv').config();

const app = express();
app.use(cors);
app.use(express.json());

app.use('/api/health', healthCheck);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
