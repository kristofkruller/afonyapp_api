const jwt = require('jsonwebtoken');

const jwtFromHeader = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Hiányzó Authorization header' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Hiányzó token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // itt elmentjük, hogy controllerben elérd

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'A token lejárt' });
    }
    return res.status(401).json({ message: 'Érvénytelen token' });
  }
};

module.exports = jwtFromHeader;