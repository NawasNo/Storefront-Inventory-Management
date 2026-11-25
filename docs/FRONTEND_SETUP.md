# Frontend Setup and Testing

## 1. Overview

This document explains how to set up, run, and test the frontend for our Storefront & Inventory Management System.

The frontend uses React, JavaScript, JSX, CSS, and Vite.

## 2. Frontend Structure

```
frontend/
├── public/
│   ├── images/
│   │   ├── laptop.jpg
│   │   ├── mouse.jpg
│   │   ├── keyboard.jpg
│   │   ├── monitor.jpg
│   │   └── headphones.jpg
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── ProductCard.jsx
│   ├── pages/
│   │   ├── AdminProducts.jsx
│   │   ├── Login.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Register.jsx
│   │   └── ShoppingCart.jsx
│   ├── services/
│   │   ├── auth.js
│   │   └── products.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
```
---

## 3. Frontend Setup

### Requirements

- Node.js
- npm
- Configured backend
- Initialized SQLite database

### Install Dependencies

From the root directory of the project, run:

```
cd frontend
npm ci
```

### Start the Backend

The backend needs to be running for authentication, product retrieval, and product management to work.

Follow the instructions in `docs/DATABASE_SETUP.md` to set up the database and environment variables.

From the `backend/` directory, run:

```
npm ci
npm run dev
```

The backend runs at:

`http://localhost:5001`

### Start the Frontend

Open a separate terminal and run the following from the `frontend/` directory:

```
npm run dev
```

The frontend runs at:

`http://localhost:5173`

If using GitHub Codespaces, open the forwarded port for 5173.

Both the frontend and backend should be running when testing the application.

### API Proxy

The Vite configuration forwards requests starting with `/api` to the backend at `http://localhost:5001`.

This allows the frontend to communicate with the backend using relative API URLs.

The proxy is configured in `frontend/vite.config.js` and is used during development.

---

## 4. Frontend Testing

The following tests can be performed manually through the frontend.

### Test 1: Product Catalog

- Sign into an account.
- Verify that active products are retrieved from the database.
- Verify that product images, names, descriptions, prices, and stock quantities are displayed correctly.
- Verify that products without images display a placeholder.
- Refresh the browser and verify that products remain available.

**Status: Passed**

### Test 2: Product Details

- Select a product from the storefront.
- Verify that the correct product information is displayed.
- Select Back to Products.
- Verify that the storefront is displayed again.

**Status: Passed**

### Test 3: Add and Edit Products

- Sign into an admin account.
- Open the Admin Product Management page.
- Add a new product.
- Edit an existing product.
- Verify that the changes are reflected in the storefront.
- Refresh the browser and verify that product changes are saved in the database.
- Verify that inventory transactions are recorded when stock quantities change.

**Status: Passed**

### Test 4: Product Validation

Try adding or editing a product using:

- Missing required fields
- Invalid prices
- Negative stock quantities
- Duplicate SKUs

Verify that invalid product information cannot be saved.

**Status: Passed**

### Test 5: Product Activation and Deactivation

- Sign into an admin account.
- Deactivate an active product.
- Verify that the product is removed from the storefront.
- Verify that the product remains visible in the admin table.
- Activate the product again.
- Verify that the product appears in the storefront.

**Status: Passed**

### Test 6: Inactive Product Filtering

- Deactivate a product.
- Return to the storefront.
- Verify that the inactive product is not displayed.
- Verify that inactive products cannot be opened through the Product Details page.

**Status: Passed**

### Test 7: Add to Cart

- Select an available product.
- Add the product to the shopping cart.
- Add the same product again.
- Verify that the quantity and cart counter increase.
- Attempt to add more products than the available stock.
- Verify that inactive and out-of-stock products cannot be added.

**Status: Passed**

### Test 8: Shopping Cart Management

- Add multiple products to the shopping cart.
- Increase and decrease product quantities.
- Verify that item subtotals and order totals update correctly.
- Remove a product from the cart.
- Remove all remaining products.
- Verify that the empty cart message is displayed.

**Status: Passed**

### Test 9: Checkout Review

- Add an available product to the shopping cart.
- Select Proceed to Checkout.
- Verify that the order review and total are displayed.
- Select Back to Cart.
- Verify that invalid cart items prevent checkout.

**Status: Passed**

The checkout review display has been verified. Remaining interaction testing and backend order submission are pending.

### Test 10: Shopping Cart Validation and Image Handling

- Add a product to the shopping cart.
- Reduce its available stock through the Admin page.
- Verify that the cart displays a warning when the selected quantity exceeds available stock.
- Verify that the quantity can be adjusted to the available stock.
- Verify that invalid cart items prevent checkout.
- Test a product with a missing or invalid image URL.
- Verify that the image placeholder is displayed.
- Verify that the quantity buttons include descriptive accessibility labels.

**Status: Passed**

### Test 11: User Registration

- Open the Registration page.
- Enter a valid name, email address, and password.
- Confirm the password.
- Submit the registration form.
- Verify that the Login page is displayed.
- Sign in using the newly created account.

Also test registration using:

- An existing email address
- A password shorter than eight characters
- Passwords that do not match
- Missing required fields

Verify that invalid registration information is rejected.

**Status: Passed**

### Test 12: User Login

- Sign in using a valid admin account.
- Verify that the storefront is displayed.
- Verify that the Admin button is available.
- Sign out and sign in using a customer account.
- Verify that the Admin button is not displayed.
- Attempt to sign in using incorrect credentials.
- Verify that an error message is displayed.

**Status: Passed**

### Test 13: Session Management

- Sign into an account.
- Refresh the browser.
- Verify that the user remains signed in.
- Select Sign Out.
- Verify that the Login page is displayed.
- Refresh the browser again.
- Verify that the user remains signed out.

**Status: Passed**

### Test 14: Access Permissions

Verify that each user has the correct access permissions.

| Page or Feature | Not Signed In | Customer | Admin |
|-----------------|---------------|----------|-------|
| Login | Yes | No | No |
| Registration | Yes | No | No |
| Product Catalog | No | Yes | Yes |
| Product Details | No | Yes | Yes |
| Shopping Cart | No | Yes | Yes |
| Admin Product Management | No | No | Yes |
| Sign Out | No | Yes | Yes |

**Status: Passed**

### Test 15: Product API Integration

- Verify that authenticated users can retrieve active products.
- Verify that administrators can retrieve all products, including inactive products.
- Verify that administrators can create, edit, activate, and deactivate products.
- Verify that unauthenticated product requests return HTTP 401.
- Verify that customer requests to the administrator product listing return HTTP 403.
- Verify that product and inventory changes persist in SQLite.

**Status: Passed**

Direct customer requests to product creation and update endpoints require additional testing.


## 5. Testing Notes and Current Limitations

### Backend Integration Testing

During authentication and product management testing, the backend referenced a shopping cart route that was still being developed.

The cart route import and registration in `backend/app.js` were temporarily disabled for local testing.

The shopping cart route must be available before the backend can start with its original configuration.

### Current Limitations

- Shopping cart information is managed through React state and is not persistent across user sessions.
- The shopping cart is not yet connected to the backend Cart API.
- The checkout interface currently supports order review only.
- Order submission and automatic inventory deduction during checkout require backend integration.
- The Vite API proxy is configured for development only.

### Additional Testing

Shopping cart persistence, checkout, order submission, and inventory deduction will need to be tested once their corresponding backend APIs are integrated.

Product API input validation and customer write restrictions require additional backend testing.

Local database files, environment credentials, and temporary backend changes should not be committed to GitHub.