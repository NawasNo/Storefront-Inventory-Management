# Database Setup and Testing

## 1. Overview

This document describes the database setup and testing completed for the **Store Management and Inventory System**.

The database is implemented using **SQLite**, with **better-sqlite3** for integration with the Node.js and Express backend.

### Technologies Used

- **SQLite** – Relational database
- **Node.js** – Backend runtime
- **better-sqlite3** – SQLite database connection
- **bcryptjs** – Password hashing
- **dotenv** – Environment variable management
- **dbdiagram.io** – Database ER diagram design

---

## 2. Database Design

The database schema was designed using [dbdiagram.io](https://dbdiagram.io/) and implemented in `backend/database/schema.sql`.

The database consists of seven tables:

| Table | Description |
|-------|-------------|
| `users` | Stores customer and admin account information |
| `products` | Stores product details, pricing, and stock quantities |
| `carts` | Maintains one shopping cart per user |
| `cart_items` | Stores products and quantities added to carts |
| `orders` | Stores customer orders and their statuses |
| `order_items` | Stores individual products purchased in each order |
| `inventory_transactions` | Records stock additions, sales, adjustments, and returns |

### Database Relationships

- One user can have one shopping cart.
- One user can place multiple orders.
- One cart can contain multiple cart items.
- One product can appear in multiple cart items.
- One order can contain multiple order items.
- One product can appear in multiple order items.
- One product can have multiple inventory transactions.
- An inventory transaction can optionally reference an order.

### Constraints and Data Integrity

The schema includes:

- Primary keys and foreign keys
- `UNIQUE` constraints for user emails and product SKUs
- Role validation (`customer` or `admin`)
- Positive product prices and cart quantities
- Nonnegative stock quantities
- Unique product entries within each cart
- Foreign-key delete rules (`CASCADE`, `RESTRICT`, and `SET NULL`)
- Indexes to improve product, order, cart, and inventory queries

Product prices are stored in **integer cents** to avoid floating-point precision issues.

The schema also includes `created_at` and `updated_at` columns where applicable.

- `created_at` values are automatically generated using SQLite's `CURRENT_TIMESTAMP`.
- Updating `updated_at` requires application logic or database triggers.

---

## 3. Database Creation

The schema was saved in:

`backend/database/schema.sql`

From the `backend/` directory, the following command was used to create the database:

```bash
sqlite3 database/store.db < database/schema.sql
```

The database was opened using:

```bash
sqlite3 database/store.db
```

### Database Verification

The following SQLite commands were executed:

```sql
.tables
.indexes

PRAGMA foreign_key_list(cart_items);
PRAGMA foreign_key_list(order_items);
PRAGMA foreign_key_list(inventory_transactions);

PRAGMA foreign_key_check;
```

### Results

- All seven tables were successfully created.
- Expected indexes were created.
- Foreign-key relationships were correctly configured.
- `PRAGMA foreign_key_check` returned no violations.

**Status: Passed**

---

## 4. Sample Data Insertion

A `database/seed.js` script was created to populate the database with sample users, products, carts, and initial inventory transactions.

### Sample Users

| Name | Email | Role |
|------|-------|------|
| Neha Marlady | nmarlady@pdx.edu | Admin |
| Nawas Noradeen | nawas@pdx.edu | Admin |
| Neha Marlady | nehamarlady@gmail.com | Customer |

Passwords were hashed using `bcryptjs` before being stored in the database.

Development passwords were provided through environment variables rather than hardcoded in the seed script.

### Sample Products

| SKU | Product | Price | Initial Stock | Image URL |
|-----|---------|-------|---------------|-----------|
| ELEC001 | Laptop | $899.99 | 10 | /images/laptop.jpg |
| ELEC002 | Wireless Mouse | $25.99 | 50 | /images/mouse.jpg |
| ELEC003 | Keyboard | $45.00 | 20 | /images/keyboard.jpg |
| ELEC004 | Monitor | $199.99 | 15 | /images/monitor.jpg |
| ELEC005 | Headphones | $79.99 | 25 | /images/headphones.jpg |

Product image URLs are stored in the database and reference image files located in `frontend/public/images/`.

### Seed Script Execution

From the `backend/` directory:

```bash
node database/seed.js
```

The following records were successfully created:

| Table | Records |
|-------|---------|
| `users` | 3 |
| `products` | 5 |
| `carts` | 1 |
| `inventory_transactions` | 5 |

A cart was created for the customer account.

The inventory transactions recorded the initial stock quantities for all five products.

Existing product records are not overwritten when the seed script is executed again.

During Product API integration, the existing sample products were updated with their corresponding image URLs without resetting the database or modifying inventory quantities.

---

## 5. Database Testing

### Test 1: User and Cart Relationship

**Objective:** Verify that the customer account is associated with a shopping cart.

```sql
SELECT
    users.user_id,
    users.name,
    users.email,
    carts.cart_id
FROM users
JOIN carts
    ON users.user_id = carts.user_id;
```

**Result:**

Customer `user_id = 3` is associated with `cart_id = 1`.

**Status: Passed**

### Test 2: Add Products to Cart

**Objective:** Verify that products can be inserted into and retrieved from a customer's cart.

Inserted one laptop and two wireless mice into the customer's cart.

```sql
INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES
    (1, 1, 1),
    (1, 2, 2);
```

Retrieved the cart contents using:

```sql
SELECT
    cart_items.cart_items_id,
    products.name,
    cart_items.quantity,
    products.price_cents,
    cart_items.quantity * products.price_cents AS subtotal_cents
FROM cart_items
JOIN products
    ON cart_items.product_id = products.product_id
WHERE cart_items.cart_id = 1;
```

**Results:**

| Product | Quantity | Subtotal |
|---------|----------|----------|
| Laptop | 1 | $899.99 |
| Wireless Mouse | 2 | $51.98 |
| **Total** | **3** | **$951.97** |

**Status: Passed**

### Test 3: Inventory Verification

**Objective:** Verify that initial inventory transactions match the stock quantities stored in the products table.

```sql
SELECT
    products.name,
    products.stock_quantity,
    inventory_transactions.quantity_changed,
    inventory_transactions.transaction_type
FROM inventory_transactions
JOIN products
    ON inventory_transactions.product_id = products.product_id;
```

**Results:**

- All five products had matching initial stock records.
- Adding items to the cart did not decrease inventory quantities.

**Status: Passed**

### Test 4: Foreign-Key Constraint

**Objective:** Verify that foreign-key constraints prevent references to nonexistent records.

Enabled and verified foreign-key enforcement:

```sql
PRAGMA foreign_keys = ON;
PRAGMA foreign_keys;
```

The result was `1`, confirming that foreign-key enforcement was enabled for the SQLite connection.

Attempted to insert a cart item referencing a nonexistent product:

```sql
INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES (1, 9999, 1);
```

**Expected and Observed Result:**

```text
FOREIGN KEY constraint failed (19)
```

**Status: Passed**

### Test 5: Unique Constraint

**Objective:** Verify that the same product cannot be inserted multiple times as separate entries in the same cart.

Attempted to insert a duplicate product:

```sql
INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES (1, 1, 1);
```

**Expected and Observed Result:**

```text
UNIQUE constraint failed: cart_items.cart_id, cart_items.product_id (19)
```

This confirmed that duplicate product entries in the same cart are prevented.

**Status: Passed**

### Test 6: Product Creation and Updates

**Objective:** Verify that product changes made through the Product API are saved in SQLite.

- Created a new product through the API.
- Updated product pricing and stock quantities.
- Created and edited products through the Admin Product Management page.
- Refreshed the frontend to verify database persistence.

**Status: Passed**

### Test 7: Inventory Transaction Recording

**Objective:** Verify that product creation and stock adjustments generate inventory transactions.

The following inventory changes were tested:

| Operation | Quantity Changed | Transaction Type |
|-----------|------------------|------------------|
| Initial stock | +5 | addition |
| Stock increase | +3 | adjustment |
| Stock decrease | -6 | adjustment |

Inventory records were verified using SQLite.

**Status: Passed**

### Test 8: Product Activation and Deactivation

**Objective:** Verify that products can be deactivated without permanently deleting database records.

- Deactivated an existing product.
- Verified that the product was excluded from the storefront.
- Verified that the product remained available in the administrator product listing.
- Reactivated the product and verified that it returned to the storefront.

**Status: Passed**

### Test 9: Product Image Storage

**Objective:** Verify that product image URLs are stored and retrieved correctly.

```sql
SELECT sku, name, image_url
FROM products;
```

All five original products were verified to have the correct image URLs and displayed their corresponding images in the frontend.

**Status: Passed**
---

## 6. Inventory Management Rules

The following business rules will be implemented in the backend:

1. Adding products to the cart will not reduce available inventory.
2. Stock availability will be validated during checkout.
3. Product prices and order totals will be calculated using database values.
4. Stock quantities will be reduced only when checkout succeeds.
5. Every inventory change will be recorded in `inventory_transactions`.
6. Order creation, stock deduction, inventory transaction insertion, and cart clearing will occur within a single database transaction.
7. Products will be deactivated using `is_active` rather than permanently deleted when historical records must be preserved.

---

## 7. Security Considerations

- Passwords are stored as bcrypt hashes.
- Admin and customer roles are distinguished using the `role` column.
- Admin users can also be permitted to use customer functionality through backend authorization rules.
- Public registration will not allow users to assign themselves the admin role.
- Database files, environment variables, and dependencies should not be committed to Git.

### Recommended `.gitignore` Entries

```gitignore
node_modules/
.env
database/*.db
database/*.db-wal
database/*.db-shm
```

---

## 8. Current Progress

The following tasks have been completed:

- [x] Designed the database ER diagram
- [x] Created the SQL schema
- [x] Defined table relationships and constraints
- [x] Created indexes
- [x] Created the SQLite database
- [x] Created the sample data seed script
- [x] Inserted admin and customer accounts
- [x] Inserted sample products
- [x] Created a customer shopping cart
- [x] Recorded initial inventory transactions
- [x] Tested user-to-cart relationships
- [x] Tested cart-item insertion and retrieval
- [x] Verified inventory records
- [x] Tested foreign-key enforcement
- [x] Tested duplicate prevention

---

## 9. Conclusion

The SQLite database has been created, populated with sample data, and successfully tested for the selected relationships and constraints.

The database is ready for backend integration.

Authentication, checkout transactions, and API-level business rules will be implemented and tested during the next development phase.
