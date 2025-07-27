const pool = require('./pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email és jelszó kötelező' });
    }

    email = email.trim().toLowerCase();

    const emailRegex = /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Hibás email formátum' });
    }
  
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
    res.status(500).json({ message: 'Szerverhiba' })
  }
}

const register = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email és jelszó kötelező' });
    }

    email = email.trim().toLowerCase();

    const emailRegex = /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Hibás email formátum' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'A jelszónak tartalmaznia kell kisbetűt, nagybetűt, számot és speciális karaktert (minimum 8 karakter)',
      });
    }

    if (email === password) {
      return res.status(400).json({ message: 'A jelszó nem egyezhet meg az email címmel' });
    }

    const userExists = await pool.query('SELECT 1 FROM afonyapp.users WHERE email = $1', [email]);
    if (userExists.rowCount > 0) {
      return res.status(409).json({ message: 'Ez az email már regisztrálva van' });
    }

    const salt = await bcrypt.genSalt(10);
    const safePassword = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO afonyapp.users (email, password) VALUES ($1, $2)',
      [email, safePassword]
    );

    return res.status(201).json({ status: 'Sikeres regisztráció' });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Szerverhiba' });
  }
};

module.exports = {
  login, register
};