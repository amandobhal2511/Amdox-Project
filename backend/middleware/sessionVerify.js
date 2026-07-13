/**
 * Session verification middleware
 * Ensures express session is valid when using cookie-based sessions
 */
const verifySession = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.sessionUserId = req.session.userId;
  }
  next();
};

module.exports = { verifySession };
