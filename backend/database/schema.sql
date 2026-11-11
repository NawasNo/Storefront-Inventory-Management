
-- STORE MANAGEMENT DATABASE

PRAGMA foreign_keys = ON;

-- 1. USERS

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'admin')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

-- 2. PRODUCTS

CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL
        CHECK (price_cents >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (stock_quantity >= 0),
    category TEXT,
    image_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1
        CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

-- 3. CARTS

CREATE TABLE IF NOT EXISTS carts (
    cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- 4. CART ITEMS

CREATE TABLE IF NOT EXISTS cart_items (
    cart_items_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1
        CHECK (quantity > 0),

    FOREIGN KEY (cart_id)
        REFERENCES carts(cart_id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    UNIQUE (cart_id, product_id)
);

-- 5. ORDERS

CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount_cents INTEGER NOT NULL
        CHECK (total_amount_cents >= 0),
    status TEXT NOT NULL DEFAULT 'confirmed'
        CHECK (
            status IN (
                'confirmed',
                'processing',
                'completed',
                'cancelled'
            )
        ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT
);

-- 6. ORDER ITEMS

CREATE TABLE IF NOT EXISTS order_items (
    order_items_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL
        CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL
        CHECK (unit_price_cents >= 0),

    FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT
);

-- 7. INVENTORY TRANSACTIONS

CREATE TABLE IF NOT EXISTS inventory_transactions (
    inventory_transactions_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity_changed INTEGER NOT NULL
        CHECK (quantity_changed != 0),
    transaction_type TEXT NOT NULL
        CHECK (
            transaction_type IN (
                'addition',
                'sale',
                'adjustment',
                'return'
            )
        ),
    reference_order_id INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    FOREIGN KEY (reference_order_id)
        REFERENCES orders(order_id)
        ON DELETE SET NULL
);

-- INDEXES

CREATE INDEX IF NOT EXISTS idx_products_name
ON products(name);

CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category);

CREATE INDEX IF NOT EXISTS idx_orders_user_id
ON orders(user_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id
ON inventory_transactions(product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_created_at
ON inventory_transactions(created_at);
