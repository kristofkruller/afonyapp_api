const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const uEmail = await pool.query('select * from afonyapp.users where email = $1', [email]);

    if (uEmail.rowCount < 1) return res.status(401).json({ message: 'Invalid email or password' });

    const u = uEmail.rows[0];

    const checkPass = await bcrypt.compare(password, u.password);
    if (!checkPass) return res.status(401).json({ message: 'Invalid email or password' });

    const payload = {
      id: u.id,
      email: u.email,
      type: u.type,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' })
  }
}

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    let qry = await pool.query('select * from afonyapp.users where email = $1', [email]);

    if (qry.rowCount > 0) return res.status(401).json({ message: 'Invalid registration, email already exists' });

    const salt = await bcrypt.genSalt(10);
    const safePassword = await bcrypt.hash(password, salt);

    qry = await pool.query('insert into afonyapp.users (email, password) values ($1,$2)', [email, safePassword]);

    return res.status(201).json({ status: 'Registration successful!' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  login, register
};