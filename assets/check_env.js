const msg = (key) => `❌ Missing required ENV variable: ${key}`;

class EnvVarMissingError extends Error {
  constructor(varName) {
    super(msg(varName));
    this.name = 'EnvVarMissingError';
  }
}

module.exports = function checkEnvVars(strict = false) {
  const required = [
    'PORT',
    'JWT_SECRET',
    'CONNSTRING',
    'RESEND_API_KEY',
    'RESEND_DOMAIN',
    'FRONTEND_URL',
    'BACKEND_URL'
  ];

  required.forEach((key) => {
    if (!process.env[key]) {
      if (strict) throw new EnvVarMissingError(key);
      else console.warn(msg(key));
    }
  });
}
