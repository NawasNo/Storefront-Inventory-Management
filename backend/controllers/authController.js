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

module.exports = { register };
