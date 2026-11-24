require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const sessionMiddleware = require('./config/session');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(sessionMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);

app.get('/api/health', (req, res) => {
  const result = db.prepare('SELECT COUNT(*) AS count FROM products').get();

  res.status(200).json({
    message: 'Server and database connected successfully',
    productCount: result.count,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
