const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/Unauthorized');

module.exports = (req, res, next) => {
  try {
    const payload = jwt.verify(
      Object.fromEntries(req.headers.cookie.split('; ')
        .map((x) => x.split(/=(.*)$/, 2).map(decodeURIComponent)))._id,
      '12345',
    );
    req.user = payload;
  } catch {
    throw new UnauthorizedError('Необходима авторизация');
  }

  next();
};
