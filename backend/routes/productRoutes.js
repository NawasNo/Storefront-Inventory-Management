const express = require('express');

const {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
} = require('../controllers/productController');

const {
  requireAuth,
  requireAdmin,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, getProducts);

router.get('/admin', requireAuth, requireAdmin, getAdminProducts);

router.get('/:id', requireAuth, getProductById);

router.post('/', requireAuth, requireAdmin, createProduct);

router.put('/:id', requireAuth, requireAdmin, updateProduct);

module.exports = router;