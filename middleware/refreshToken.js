const jwt = require('jsonwebtoken');

module.exports = function refreshToken(user) {
  if (!user.id || !user.email || !user.type || !user.nick) throw new Error("Token sign failed due to lack of user data!");

  const payload = {
    id: user.id,
    email: user.email,
    type: user.type,
    nick: user.nick,
  }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
  // console.log(jwt.verify(token, process.env.JWT_SECRET));
  if (token) return token;
}