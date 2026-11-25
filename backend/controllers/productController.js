const db = require('../config/database');

const validateProduct = (product) => {
  const {
    sku,
    name,
    description,
    price_cents: priceCents,
    stock_quantity: stockQuantity,
    category,
    image_url: imageUrl,
    is_active: isActive,
  } = product;

  if (
    typeof sku !== 'string'
    || !sku.trim()
    || typeof name !== 'string'
    || !name.trim()
    || typeof category !== 'string'
    || !category.trim()
  ) {
    return 'SKU, product name, and category are required.';
  }

  if (!Number.isSafeInteger(priceCents) || priceCents <= 0) {
    return 'Price must be a positive integer in cents.';
  }

  if (!Number.isSafeInteger(stockQuantity) || stockQuantity < 0) {
    return 'Stock quantity must be a nonnegative integer.';
  }

  if (isActive !== 0 && isActive !== 1) {
    return 'Product status must be 0 or 1.';
  }

  if (
    typeof description !== 'string'
    || typeof imageUrl !== 'string'
  ) {
    return 'Description and image URL must be strings.';
  }

  return null;
};

const normalizeProduct = (product) => ({
  sku: product.sku.trim(),
  name: product.name.trim(),
  description: product.description.trim(),
  price_cents: product.price_cents,
  stock_quantity: product.stock_quantity,
  category: product.category.trim(),
  image_url: product.image_url.trim(),
  is_active: product.is_active,
});

const findDuplicateSku = (sku, productId = 0) => (
  db.prepare(`
    SELECT product_id
    FROM products
    WHERE LOWER(sku) = LOWER(?)
      AND product_id != ?
  `).get(sku, productId)
);

const findProduct = (productId) => (
  db.prepare(`
    SELECT *
    FROM products
    WHERE product_id = ?
  `).get(productId)
);

const recordInventoryTransaction = (
  productId,
  quantityChanged,
  transactionType,
  notes,
) => {
  if (quantityChanged === 0) {
    return;
  }

  db.prepare(`
    INSERT INTO inventory_transactions (
      product_id,
      quantity_changed,
      transaction_type,
      notes
    )
    VALUES (?, ?, ?, ?)
  `).run(
    productId,
    quantityChanged,
    transactionType,
    notes,
  );
};

const getProducts = (req, res) => {
  try {
    const products = db.prepare(`
      SELECT *
      FROM products
      WHERE is_active = 1
      ORDER BY product_id
    `).all();

    return res.status(200).json({ products });
  } catch (error) {
    console.error('Get products error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve products.',
    });
  }
};

const getAdminProducts = (req, res) => {
  try {
    const products = db.prepare(`
      SELECT *
      FROM products
      ORDER BY product_id
    `).all();

    return res.status(200).json({ products });
  } catch (error) {
    console.error('Get admin products error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve products.',
    });
  }
};

const getProductById = (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: 'Invalid product ID.',
    });
  }

  try {
    const product = findProduct(productId);

    if (
      !product
      || (product.is_active !== 1 && req.user.role !== 'admin')
    ) {
      return res.status(404).json({
        message: 'Product not found.',
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('Get product error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve product.',
    });
  }
};

const createProduct = (req, res) => {
  const productData = {
    description: '',
    stock_quantity: 0,
    image_url: '',
    is_active: 1,
    ...req.body,
  };

  const validationError = validateProduct(productData);

  if (validationError) {
    return res.status(400).json({
      message: validationError,
    });
  }

  const product = normalizeProduct(productData);

  try {
    const create = db.transaction(() => {
      if (findDuplicateSku(product.sku)) {
        return null;
      }

      const result = db.prepare(`
        INSERT INTO products (
          sku,
          name,
          description,
          price_cents,
          stock_quantity,
          category,
          image_url,
          is_active
        )
        VALUES (
          @sku,
          @name,
          @description,
          @price_cents,
          @stock_quantity,
          @category,
          @image_url,
          @is_active
        )
      `).run(product);

      const productId = Number(result.lastInsertRowid);

      recordInventoryTransaction(
        productId,
        product.stock_quantity,
        'addition',
        'Initial product inventory.',
      );

      return findProduct(productId);
    });

    const createdProduct = create.immediate();

    if (!createdProduct) {
      return res.status(409).json({
        message: 'A product with this SKU already exists.',
      });
    }

    return res.status(201).json({
      message: 'Product created successfully.',
      product: createdProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);

    return res.status(500).json({
      message: 'Unable to create product.',
    });
  }
};

const updateProduct = (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: 'Invalid product ID.',
    });
  }

  try {
    const update = db.transaction(() => {
      const existingProduct = findProduct(productId);

      if (!existingProduct) {
        return {
          status: 404,
          message: 'Product not found.',
        };
      }

      const productData = {
        ...existingProduct,
        description: existingProduct.description || '',
        image_url: existingProduct.image_url || '',
        ...req.body,
      };

      const validationError = validateProduct(productData);

      if (validationError) {
        return {
          status: 400,
          message: validationError,
        };
      }

      const product = normalizeProduct(productData);

      if (findDuplicateSku(product.sku, productId)) {
        return {
          status: 409,
          message: 'A product with this SKU already exists.',
        };
      }

      db.prepare(`
        UPDATE products
        SET
          sku = @sku,
          name = @name,
          description = @description,
          price_cents = @price_cents,
          stock_quantity = @stock_quantity,
          category = @category,
          image_url = @image_url,
          is_active = @is_active,
          updated_at = CURRENT_TIMESTAMP
        WHERE product_id = @product_id
      `).run({
        ...product,
        product_id: productId,
      });

      const quantityChanged = (
        product.stock_quantity - existingProduct.stock_quantity
      );

      recordInventoryTransaction(
        productId,
        quantityChanged,
        'adjustment',
        'Inventory updated by administrator.',
      );

      return {
        status: 200,
        message: 'Product updated successfully.',
        product: findProduct(productId),
      };
    });

    const { status, ...data } = update.immediate();

    return res.status(status).json(data);
  } catch (error) {
    console.error('Update product error:', error);

    return res.status(500).json({
      message: 'Unable to update product.',
    });
  }
};

module.exports = {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
};