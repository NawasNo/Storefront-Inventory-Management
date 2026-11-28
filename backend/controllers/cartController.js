const db = require('../config/database');

// Helper function to update the cart's last modified timestamp.
const updateCartTimestamp = (cartId) => {
  db.prepare(
    `
    UPDATE carts
    SET updated_at = CURRENT_TIMESTAMP
    WHERE cart_id = ?
  `,
  ).run(cartId);
};

// Retrieve the authenticated user's shopping cart.
const getCart = (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const cart = db
      .prepare(
        `
      SELECT cart_id
      FROM carts
      WHERE user_id = ?
    `,
      )
      .get(userId);

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found.',
      });
    }

    const items = db
      .prepare(
        `
      SELECT
        ci.cart_items_id,
        ci.product_id,
        p.name,
        p.image_url,
        p.price_cents,
        p.stock_quantity,
        p.is_active,
        ci.quantity,
        ci.quantity * p.price_cents AS subtotal_cents
      FROM cart_items AS ci
      JOIN products AS p
        ON ci.product_id = p.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.cart_items_id
    `,
      )
      .all(cart.cart_id);

    const totalCents = items.reduce((total, item) => total + item.subtotal_cents, 0);

    return res.status(200).json({
      cart_id: cart.cart_id,
      items,
      total_cents: totalCents,
    });
  } catch (error) {
    console.error('Error retrieving cart:', error);

    return res.status(500).json({
      message: 'Unable to retrieve cart.',
    });
  }
};

// Add a product to the cart or increase its existing quantity.
const addCartItem = (req, res) => {
  const { product_id: productId, quantity } = req.body || {};

  if (
    !Number.isSafeInteger(productId) ||
    productId <= 0 ||
    !Number.isSafeInteger(quantity) ||
    quantity <= 0
  ) {
    return res.status(400).json({
      message: 'Product ID and quantity must be positive integers.',
    });
  }

  try {
    const { user_id: userId } = req.user;

    const addItemTransaction = db.transaction(() => {
      const cart = db
        .prepare(
          `
        SELECT cart_id
        FROM carts
        WHERE user_id = ?
      `,
        )
        .get(userId);

      if (!cart) {
        return {
          status: 404,
          message: 'Cart not found.',
        };
      }

      const product = db
        .prepare(
          `
        SELECT product_id, stock_quantity, is_active
        FROM products
        WHERE product_id = ?
      `,
        )
        .get(productId);

      if (!product || product.is_active !== 1) {
        return {
          status: 404,
          message: 'Product not available.',
        };
      }

      const existingItem = db
        .prepare(
          `
        SELECT quantity
        FROM cart_items
        WHERE cart_id = ? AND product_id = ?
      `,
        )
        .get(cart.cart_id, productId);

      const newQuantity = (existingItem?.quantity || 0) + quantity;

      if (!Number.isSafeInteger(newQuantity)) {
        return {
          status: 400,
          message: 'Quantity is too large.',
        };
      }

      if (newQuantity > product.stock_quantity) {
        return {
          status: 409,
          message: 'Insufficient stock for the requested quantity.',
        };
      }

      db.prepare(
        `
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON CONFLICT(cart_id, product_id)
        DO UPDATE SET quantity = excluded.quantity
      `,
      ).run(cart.cart_id, productId, newQuantity);

      updateCartTimestamp(cart.cart_id);

      return {
        status: 201,
        message: 'Product added to cart successfully.',
        product_id: productId,
        quantity: newQuantity,
      };
    });

    const result = addItemTransaction.immediate();
    const { status, ...responseBody } = result;

    return res.status(status).json(responseBody);
  } catch (error) {
    console.error('Error adding cart item:', error);

    return res.status(500).json({
      message: 'Unable to add product to cart.',
    });
  }
};

// Update the quantity of an existing cart item.
const updateCartItem = (req, res) => {
  const cartItemId = Number(req.params.id);
  const { quantity } = req.body || {};

  if (!Number.isSafeInteger(cartItemId) || cartItemId <= 0) {
    return res.status(400).json({
      message: 'Invalid cart item ID.',
    });
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      message: 'Quantity must be a positive integer.',
    });
  }

  try {
    const { user_id: userId } = req.user;

    const updateItemTransaction = db.transaction(() => {
      const item = db
        .prepare(
          `
        SELECT
          ci.cart_items_id,
          ci.cart_id,
          p.stock_quantity,
          p.is_active
        FROM cart_items AS ci
        JOIN carts AS c
          ON ci.cart_id = c.cart_id
        JOIN products AS p
          ON ci.product_id = p.product_id
        WHERE ci.cart_items_id = ?
          AND c.user_id = ?
      `,
        )
        .get(cartItemId, userId);

      if (!item) {
        return {
          status: 404,
          message: 'Cart item not found.',
        };
      }

      if (item.is_active !== 1) {
        return {
          status: 409,
          message: 'Product is no longer available.',
        };
      }

      if (quantity > item.stock_quantity) {
        return {
          status: 409,
          message: 'Insufficient stock for the requested quantity.',
        };
      }

      db.prepare(
        `
        UPDATE cart_items
        SET quantity = ?
        WHERE cart_items_id = ?
      `,
      ).run(quantity, cartItemId);

      updateCartTimestamp(item.cart_id);

      return {
        status: 200,
        message: 'Cart item updated successfully.',
        cart_items_id: cartItemId,
        quantity,
      };
    });

    const result = updateItemTransaction.immediate();
    const { status, ...responseBody } = result;

    return res.status(status).json(responseBody);
  } catch (error) {
    console.error('Error updating cart item:', error);

    return res.status(500).json({
      message: 'Unable to update cart item.',
    });
  }
};

// Remove an individual item from the authenticated user's cart.
const removeCartItem = (req, res) => {
  const cartItemId = Number(req.params.id);

  if (!Number.isSafeInteger(cartItemId) || cartItemId <= 0) {
    return res.status(400).json({
      message: 'Invalid cart item ID.',
    });
  }

  try {
    const { user_id: userId } = req.user;

    const removeItemTransaction = db.transaction(() => {
      const item = db
        .prepare(
          `
        SELECT
          ci.cart_items_id,
          ci.cart_id
        FROM cart_items AS ci
        JOIN carts AS c
          ON ci.cart_id = c.cart_id
        WHERE ci.cart_items_id = ?
          AND c.user_id = ?
      `,
        )
        .get(cartItemId, userId);

      if (!item) {
        return {
          status: 404,
          message: 'Cart item not found.',
        };
      }

      db.prepare(
        `
        DELETE FROM cart_items
        WHERE cart_items_id = ?
      `,
      ).run(cartItemId);

      updateCartTimestamp(item.cart_id);

      return {
        status: 200,
        message: 'Cart item removed successfully.',
      };
    });

    const result = removeItemTransaction.immediate();
    const { status, ...responseBody } = result;

    return res.status(status).json(responseBody);
  } catch (error) {
    console.error('Error removing cart item:', error);

    return res.status(500).json({
      message: 'Unable to remove cart item.',
    });
  }
};

// Remove all items while preserving the user's cart record.
const clearCart = (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const clearCartTransaction = db.transaction(() => {
      const cart = db
        .prepare(
          `
        SELECT cart_id
        FROM carts
        WHERE user_id = ?
      `,
        )
        .get(userId);

      if (!cart) {
        return {
          status: 404,
          message: 'Cart not found.',
        };
      }

      db.prepare(
        `
        DELETE FROM cart_items
        WHERE cart_id = ?
      `,
      ).run(cart.cart_id);

      updateCartTimestamp(cart.cart_id);

      return {
        status: 200,
        message: 'Cart cleared successfully.',
      };
    });

    const result = clearCartTransaction.immediate();
    const { status, ...responseBody } = result;

    return res.status(status).json(responseBody);
  } catch (error) {
    console.error('Error clearing cart:', error);

    return res.status(500).json({
      message: 'Unable to clear cart.',
    });
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
