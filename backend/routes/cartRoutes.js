const express = require('express');
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', getCart);
router.post('/items', addCartItem);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
