require('dotenv').config();

const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'store.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const users = [
  {
    name: 'Neha Marlady',
    email: 'nmarlady@pdx.edu',
    role: 'admin',
    password: process.env.ADMIN_PASSWORD,
  },
  {
    name: 'Nawas Noradeen',
    email: 'nawas@pdx.edu',
    role: 'admin',
    password: process.env.ADMIN_PASSWORD,
  },
  {
    name: 'Neha Marlady',
    email: 'nehamarlady@gmail.com',
    role: 'customer',
    password: process.env.CUSTOMER_PASSWORD,
  },
];

const products = [
  {
    sku: 'ELEC001',
    name: 'Laptop',
    description: 'Laptop for everyday use',
    price_cents: 89999,
    stock_quantity: 10,
    category: 'Electronics',
  },
  {
    sku: 'ELEC002',
    name: 'Wireless Mouse',
    description: 'Wireless optical mouse',
    price_cents: 2599,
    stock_quantity: 50,
    category: 'Accessories',
  },
  {
    sku: 'ELEC003',
    name: 'Keyboard',
    description: 'USB keyboard',
    price_cents: 4500,
    stock_quantity: 20,
    category: 'Accessories',
  },
  {
    sku: 'ELEC004',
    name: 'Monitor',
    description: '24-inch monitor',
    price_cents: 19999,
    stock_quantity: 15,
    category: 'Electronics',
  },
  {
    sku: 'ELEC005',
    name: 'Headphones',
    description: 'Wireless headphones',
    price_cents: 7999,
    stock_quantity: 25,
    category: 'Audio',
  },
];

const seedDatabase = db.transaction(() => {
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users
      (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `);

  users.forEach((user) => {
    const passwordHash = bcrypt.hashSync(user.password, 10);

    insertUser.run(user.name, user.email, passwordHash, user.role);
  });

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products
      (sku, name, description, price_cents, stock_quantity, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertInventory = db.prepare(`
    INSERT INTO inventory_transactions
      (product_id, quantity_changed, transaction_type, notes)
    VALUES (?, ?, 'addition', 'Initial stock')
  `);

  const getProduct = db.prepare(`
    SELECT product_id
    FROM products
    WHERE sku = ?
  `);

  products.forEach((product) => {
    const result = insertProduct.run(
      product.sku,
      product.name,
      product.description,
      product.price_cents,
      product.stock_quantity,
      product.category,
    );

    // Only record initial stock when the product was newly inserted.
    if (result.changes > 0) {
      const savedProduct = getProduct.get(product.sku);

      insertInventory.run(savedProduct.product_id, product.stock_quantity);
    }
  });

  const insertCart = db.prepare(`
    INSERT OR IGNORE INTO carts (user_id)
    VALUES (?)
  `);

  const getCustomers = db.prepare(`
    SELECT user_id
    FROM users
    WHERE role = 'customer'
  `);

  getCustomers.all().forEach((customer) => {
    insertCart.run(customer.user_id);
  });
});

try {
  if (!process.env.ADMIN_PASSWORD || !process.env.CUSTOMER_PASSWORD) {
    throw new Error('Set ADMIN_PASSWORD and CUSTOMER_PASSWORD in .env');
  }

  seedDatabase();
  console.log('Database seeded successfully!');
} catch (error) {
  console.error('Database seeding failed:', error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
