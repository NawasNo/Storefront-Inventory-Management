const bcrypt = require('bcryptjs');
const db = require('../config/database');

const register = async (req, res) => {
  const { name, email, password } = req.body || {};

  // Validate required fields and their types
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      message: 'Name, email, and password are required.',
    });
  }

  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedName || !normalizedEmail || !password) {
    return res.status(400).json({
      message: 'Name, email, and password are required.',
    });
  }

  if (
    trimmedName.length > 100 ||
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return res.status(400).json({
      message: 'Please provide a valid name and email address.',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: 'Password must contain at least 8 characters.',
    });
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({
      message: 'Password is too long. Please choose a shorter password.',
    });
  }

  try {
    // Check whether the email is already registered
    const existingUser = db
      .prepare('SELECT user_id FROM users WHERE email = ?')
      .get(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    // Hash password before storing it
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and cart as one atomic operation
    const createAccount = db.transaction(() => {
      const result = db
        .prepare(
          `
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, 'customer')
      `,
        )
        .run(trimmedName, normalizedEmail, passwordHash);

      const userId = Number(result.lastInsertRowid);

      db.prepare(
        `
        INSERT INTO carts (user_id)
        VALUES (?)
      `,
      ).run(userId);

      return userId;
    });

    const userId = createAccount();

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        user_id: userId,
        name: trimmedName,
        email: normalizedEmail,
        role: 'customer',
      },
    });
  } catch (error) {
    // Handle duplicate emails, including concurrent registration attempts
    if (
      error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY'
    ) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    console.error('Registration error:', error);

    return res.status(500).json({
      message: 'Unable to register user. Please try again later.',
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({
      message: 'Email and password are required.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = db
      .prepare(
        `
      SELECT user_id, name, email, password_hash, role
      FROM users
      WHERE email = ?
    `,
      )
      .get(normalizedEmail);

    const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    req.session.regenerate((error) => {
      if (error) {
        console.error('Session regeneration error:', error);
        return res.status(500).json({
          message: 'Unable to log in. Please try again later.',
        });
      }

      req.session.userId = user.user_id;

      return req.session.save((saveError) => {
        if (saveError) {
          console.error('Session save error:', saveError);
          return res.status(500).json({
            message: 'Unable to log in. Please try again later.',
          });
        }

        return res.status(200).json({
          message: 'Login successful.',
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      });
    });

    return undefined;
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Unable to log in. Please try again later.',
    });
  }
};

const getCurrentUser = (req, res) =>
  res.status(200).json({
    user: req.user,
  });

const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Logout error:', error);

      return res.status(500).json({
        message: 'Unable to log out. Please try again later.',
      });
    }

    res.clearCookie('store.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      message: 'Logout successful.',
    });
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};
