const pool = require('./pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateEmail = require('../assets/verfifcation_email');
const { Resend } = require('resend');
const { isValidEmail, isStrongPassword } = require('../assets/validators');
const refreshToken = require('../middleware/refreshToken');

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email és jelszó kötelező' });
    }

    email = email.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Hibás email formátum' });
    }

    const uEmail = await pool.query('select * from afonyapp.users where email = $1', [email]);

    if (uEmail.rowCount < 1) return res.status(401).json({ message: 'Hibás email vagy jelszó' });

    const u = uEmail.rows[0];

    if (!u.validated) return res.status(403).json({ message: 'Kérlek aktiváld az email címedet' });

    const checkPass = await bcrypt.compare(password, u.password);
    if (!checkPass) return res.status(401).json({ message: 'Hibás email vagy jelszó' });

    const token = refreshToken(u);
    return res.json({ token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Szerverhiba (login)' })
  }
}

const register = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email és jelszó kötelező' });
    }

    email = email.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Hibás email formátum' });
    }

    if (!isStrongPassword(password)) {
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

    // email verification
    const activationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const activationUrl = `${process.env.BACKEND_URL}/api/auth/verify?token=${activationToken}`;
    const html = generateEmail(activationUrl);

    const resend = new Resend(process.env.RESEND_API_KEY);
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_DOMAIN) return res.status(500).json({ message: 'Szerverhiba, email kiküldés sikertelen' });

    const emailData = await resend.emails.send({
      from: process.env.RESEND_DOMAIN,
      to: email,
      subject: 'Áfonyapp regisztráció megerősítése',
      html: html,
    });
    if (!emailData || emailData.error) {
      return res.status(500).json({ message: 'Email küldése sikertelen' });
    }

    console.log('Email sent:', emailData);
    // store pass
    const salt = await bcrypt.genSalt(10);
    const safePassword = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO afonyapp.users (email, password) VALUES ($1, $2)',
      [email, safePassword]
    );
    return res.status(201).end(); // Sikeres regisztráció, ellenőrizd az emailed
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Szerverhiba (register)' });
  }
};

const verify = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof decoded !== 'object' || !decoded || !('email' in decoded)) {
      return res.status(400).json({ message: 'Érvénytelen token formátum' });
    }

    const email = decoded.email;
    if (!email) return res.status(400).json({ message: 'Hiányzó email a tokenben' });

    const result = await pool.query('UPDATE afonyapp.users SET validated = true WHERE email = $1', [email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    // redirect frontendre:
    return res.redirect(`${process.env.FRONTEND_URL}/activated`);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'A hitelesítő link lejárt' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Érvénytelen token' });
    }
    console.error('Activation err: ', error);
    return res.status(500).json({ message: 'Szerverhiba (verify)' })
  }
};

const updateUser = async (req, res) => {
  try {
    const nick = req.body.nick.trim();
    const nickRegex = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9]{3,24}$/;

    if ((typeof nick !== 'string') || !nick || !nickRegex.test(nick)) {
      return res.status(400).json({ message: 'A becenevet nem tudtuk megfelelően feldolgozni, kérlek próbálkozz ismét!' });
    }

    const decoded = req.user;

    const result = await pool.query('UPDATE afonyapp.users SET nick = $1 WHERE id = $2', [nick, decoded.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    const reToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        type: decoded.type,
        nick: nick,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );
    return res.json({ token: reToken });
  } catch (error) {
    console.error('updateUser err: ', error);
    return res.status(500).json({ message: 'Szerverhiba (updateUser)' })
  }
}

const updatePass = async (req, res) => {
  try {
    let { originalPassWord, newPassWord } = req.body;

    if (!originalPassWord || !newPassWord) {
      return res.status(400).json({ message: 'Jelszó kötelező' });
    }

    const { id } = req.user;
    const uPass = await pool.query(`SELECT password from afonyapp.users WHERE id = $1`, [id]);

    if (uPass.rowCount < 1) throw new Error("Jelszó kinyerése nem sikerült");

    const checkPass = await bcrypt.compare(originalPassWord, uPass.rows[0]['password']);

    if (!checkPass) return res.status(401).json({ message: 'Hibás jelszó' });

    // store pass
    const salt = await bcrypt.genSalt(10);
    const safePassword = await bcrypt.hash(newPassWord, salt);

    const result = await pool.query('UPDATE afonyapp.users SET password = $2 WHERE id = $1', [id, safePassword]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Jelszó frissítése nem sikerült' });
    }

    return res.sendStatus(200);

  } catch (error) {
    console.error('updatePass err: ', error);
    return res.status(500).json({ message: 'Szerverhiba (updateUser)' })
  }
}

module.exports = {
  login,
  register,
  verify,
  updateUser,
  updatePass,
};