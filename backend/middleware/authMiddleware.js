const db = require('../config/database');

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  try {
    const user = db
      .prepare(
        `
      SELECT user_id, name, email, role
      FROM users
      WHERE user_id = ?
    `,
      )
      .get(req.session.userId);

    if (!user) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    console.error('Authentication middleware error:', error);

    return res.status(500).json({
      message: 'Unable to authenticate user.',
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required.',
    });
  }

  return next();
};

module.exports = {
  requireAuth,
  requireAdmin,
};
