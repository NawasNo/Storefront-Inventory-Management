
# Frontend Setup and Testing

## 1. Overview

This document describes the frontend setup, development, and testing completed for the **Storefront & Inventory Management System**.

The frontend is implemented using **React**, **JavaScript**, **JSX**, and **CSS**, with **Vite** for development and build tooling.

The application currently includes a customer-facing product catalog, product details page, administrative product management interface, shopping cart, and checkout review interface.

Product and cart data are currently managed through React state. Backend RESTful API integration and database persistence are planned for a later development phase.

### Technologies Used

- **React** – Component-based user interface
- **JavaScript** – Frontend application logic
- **JSX** – React component structure
- **CSS** – Styling and responsive layouts
- **Vite** – Development server and build tool
- **ESLint** – JavaScript linting and code quality

---

## 2. Frontend Structure

The frontend is organized into reusable components, pages, and data files.

```text
frontend/
├── public/
│   └── images/
│       ├── laptop.jpg
│       ├── mouse.jpg
│       ├── keyboard.jpg
│       ├── monitor.jpg
│       └── headphones.jpg
├── src/
│   ├── components/
│   │   └── ProductCard.jsx
│   ├── data/
│   │   └── products.js
│   ├── pages/
│   │   ├── AdminProducts.jsx
│   │   ├── ProductDetails.jsx
│   │   └── ShoppingCart.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

### File Descriptions

| File | Description |
|------|-------------|
| `App.jsx` | Main application, navigation, product state, and shopping cart state management |
| `App.css` | Application layout, styling, and shopping cart interface |
| `index.css` | Global CSS styles |
| `ProductCard.jsx` | Reusable product display component |
| `ProductDetails.jsx` | Individual product details page with Add to Cart functionality |
| `AdminProducts.jsx` | Administrative product management |
| `ShoppingCart.jsx` | Shopping cart display, quantity management, order totals, and checkout review |
| `products.js` | Temporary sample product data |
| `main.jsx` | React application entry point |

---

## 3. Frontend Setup

### Install Dependencies

From the `frontend/` directory:

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Vite starts the development server, allowing the application to be viewed and tested locally.

### Run ESLint

```bash
npm run lint
```

ESLint checks the frontend JavaScript and JSX files for configured code quality and formatting rules.

### Build the Application

```bash
npm run build
```

The production build is generated in the `dist/` directory.

---

## 4. Product Catalog

The storefront displays available products in a responsive grid layout.

Each product includes:

- Product image
- Product name
- Category
- Description
- Price
- Available stock quantity

The `ProductCard.jsx` component is used to display product information consistently across the storefront.

### Product Details

Users can select individual products to view additional information.

The product details page displays:

- Product image
- Product name
- Category
- Description
- Price
- SKU
- Available stock quantity
- Stock availability status
- Add to Cart button

Users can return to the storefront using the Back to Products button.

Only products with `is_active = 1` are displayed.

Inactive products are excluded from both the storefront and product details view.

### Sample Products

| Product | Price | Initial Stock |
|---------|-------|---------------|
| Laptop | $899.99 | 10 |
| Wireless Mouse | $25.99 | 50 |
| Keyboard | $45.00 | 20 |
| Monitor | $199.99 | 15 |
| Headphones | $79.99 | 25 |

---

## 5. Administrative Product Management

The Admin Product Management interface provides functionality for managing products.

### Add Products

Administrators can create new products using a form containing:

- Product name
- SKU
- Description
- Category
- Price
- Stock quantity
- Image URL
- Active/Inactive status

### Edit Products

Existing products can be edited through the administrative interface.

Changes are immediately reflected in React state and the storefront.

### Form Validation

The administrative form includes validation for:

- Required product information
- Valid product prices
- Nonnegative stock quantities
- Duplicate product SKUs

Invalid information is rejected before updating the product list.

### Product Activation and Deactivation

Products are deactivated rather than permanently deleted.

Deactivation updates the product's `is_active` value to `0`.

Reactivation changes `is_active` back to `1`.

The administrative table includes:

- Product information
- Stock quantity
- Product status
- Edit button
- Activate or Deactivate button

Inactive products remain visible in the Admin interface but are hidden from the storefront.

This approach aligns with the SQLite database design and helps preserve product records for historical orders.

---

## 6. Product Data Management

The frontend currently uses temporary product data defined in:

`frontend/src/data/products.js`

React state is used to manage products during development.

### Product Data Structure

| Field | Description |
|-------|-------------|
| `product_id` | Unique product identifier |
| `sku` | Product SKU |
| `name` | Product name |
| `description` | Product description |
| `price_cents` | Product price in integer cents |
| `stock_quantity` | Available inventory quantity |
| `category` | Product category |
| `image_url` | Product image location |
| `is_active` | Product activation status |

Product prices are stored as integer cents to remain consistent with the SQLite database schema.

### Current Limitations

The frontend is not yet connected to the backend RESTful API.

Product additions, edits, and status changes are currently managed through React state.

Refreshing the application resets the product data to its initial values.

Database persistence will be implemented during frontend and backend integration.

---

## 7. Shopping Cart and Checkout Review

The shopping cart allows customers to select products, manage quantities, and review their orders before checkout.

### Add to Cart

Customers can add products to their shopping cart from the product details page.

The Add to Cart functionality includes:

- Adding available products to the cart
- Increasing quantities when products are added multiple times
- Preventing inactive products from being added
- Preventing out-of-stock products from being added
- Limiting quantities to available inventory
- Displaying the total cart quantity in the navigation bar

The Add to Cart button is disabled when a product is out of stock.

### Shopping Cart Management

The `ShoppingCart.jsx` component displays the products currently selected by the customer.

Each cart item includes:

- Product image and name
- Individual product price
- Selected quantity
- Quantity increase and decrease controls
- Remove button
- Calculated item subtotal

Customers can update quantities or remove products from their shopping cart.

Decreasing a product quantity to zero removes the product from the cart.

The application automatically recalculates the total whenever the cart changes.

An empty shopping cart displays an appropriate message.

The quantity increase and decrease buttons include descriptive accessibility labels that identify the product being updated.

Products with missing or invalid image URLs display a "No Image Available" placeholder consistent with the storefront styling.

### Cart State Management

Shopping cart data is managed in `App.jsx` using React's `useState` hook.

Each cart item contains:

| Field | Description |
|-------|-------------|
| `product_id` | Identifier of the selected product |
| `quantity` | Number of units selected |

Product information is retrieved from the current product list using the product identifier.

The cart counter is calculated by summing the quantities of all cart items.

### Inventory Validation

The shopping cart validates product availability before allowing checkout.

Checkout is disabled when:

- The cart is empty
- A product is unavailable or inactive
- A product quantity exceeds available stock
- A cart item has an invalid quantity

Quantity increases are prevented when the selected quantity reaches available stock.

If available inventory decreases below the selected cart quantity, customers can use the decrease button to adjust the quantity directly to the available stock.

The shopping cart also displays warnings when a product becomes unavailable or its selected quantity exceeds current stock.

Product quantities are validated against the current product data stored in React state.

### Order Summary

The shopping cart displays an order summary containing the total price of all selected products.

Individual item subtotals are calculated using the product price and selected quantity.

The total order price is calculated by summing all item subtotals.

Prices are calculated using integer cents and formatted as dollars for display.

This maintains consistency with the SQLite database schema.

### Checkout Review

Customers can select **Proceed to Checkout** to display an order review.

The checkout review includes:

- Current shopping cart items
- Current order total
- Order review instructions
- Back to Cart button

The Back to Cart button returns the customer to the standard shopping cart summary.

The checkout interface currently supports order review only.

Actual order submission, database persistence, inventory deduction, and order confirmation will be implemented after the backend RESTful API becomes available.

### Current Limitations

Shopping cart information is temporarily stored in React state.

Refreshing the application resets the shopping cart.

The frontend does not currently submit orders to the SQLite database or process payments.

Inventory quantities are not deducted when products are added to the cart.

Inventory deduction will occur during successful order processing after backend integration.

---

## 8. Frontend Testing

### Test 1: Product Catalog

**Objective:** Verify that products display correctly in the storefront.

**Results:**

- Product images display correctly.
- Product names, descriptions, categories, and prices are displayed.
- Stock quantities are visible.
- Products appear in a responsive grid.

**Status: Passed**

### Test 2: Product Details

**Objective:** Verify that users can view individual product information.

**Results:**

- Selecting a product opens its details page.
- Product information matches the selected product.
- Navigation back to the storefront works.

**Status: Passed**

### Test 3: Add and Edit Products

**Objective:** Verify that administrators can create and modify products.

**Results:**

- New products can be added.
- Existing products can be edited.
- Product changes are reflected in the storefront.

**Status: Passed**

### Test 4: Product Validation

**Objective:** Verify that invalid product information is rejected.

**Results:**

- Invalid prices are rejected.
- Negative stock quantities are rejected.
- Duplicate SKUs are prevented.
- Required fields are validated.

**Status: Passed**

### Test 5: Product Activation and Deactivation

**Objective:** Verify that administrators can control product availability.

**Results:**

- Active products can be deactivated.
- Deactivated products disappear from the storefront.
- Inactive products remain visible in the Admin table.
- Inactive products can be reactivated.
- Reactivated products reappear in the storefront.

**Status: Passed**

### Test 6: Inactive Product Filtering

**Objective:** Verify that inactive products cannot be displayed through the product details view.

**Results:**

- The storefront displays only active products.
- Product details are retrieved from the active product list.
- Inactive products are excluded from product details.

**Status: Passed**

### Test 7: Add to Cart

**Objective:** Verify that customers can add available products to the shopping cart.

**Results:**

- Available products can be added to the cart.
- Adding the same product increases its quantity.
- The cart counter updates correctly.
- Out-of-stock and inactive products are prevented from being added.
- Product quantities cannot exceed available stock.

**Status: Passed**

### Test 8: Shopping Cart Management

**Objective:** Verify that customers can manage selected products.

**Results:**

- Cart items display product information and prices.
- Quantities can be increased and decreased.
- Products can be removed from the cart.
- Item subtotals and order totals update correctly.
- An empty cart displays an appropriate message.

**Status: Passed**

### Test 9: Checkout Review

**Objective:** Verify that customers can review their shopping cart before order submission.

**Results:**

- Proceed to Checkout displays the order review interface.
- The current order total remains visible.
- Back to Cart navigation is implemented.
- Checkout validation prevents invalid cart contents from proceeding.

**Status: Partially Tested — Checkout review display verified; remaining interaction tests and backend order submission pending**

### Test 10: ESLint and Production Build

**Objective:** Verify frontend code quality and production build compatibility.

**Results:**

- `npm run lint` completed without errors.
- `npm run build` completed successfully.
- Vite successfully transformed 22 modules.
- The production build was generated in `frontend/dist/`.

**Status: Passed**

### Test 11: Shopping Cart Peer Review Improvements

**Objective:** Verify the improvements implemented in response to peer review feedback.

**Results:**

- Checkout validation prevents invalid cart contents from proceeding.
- Cart quantities can be adjusted directly to available stock when inventory decreases.
- Quantity controls include descriptive accessibility labels.
- Missing or invalid product images display an appropriate fallback.
- Product images and placeholders maintain consistent dimensions.
- Shopping cart layout and existing functionality remain intact.

**Status: Passed — Manual testing completed. Accessibility labels verified in source code.**

---

## 9. Current Progress

The following frontend tasks have been completed:

- [x] Initialized React application with Vite
- [x] Configured ESLint
- [x] Organized frontend directories
- [x] Created reusable product components
- [x] Developed responsive product catalog
- [x] Implemented product details page
- [x] Developed Admin Product Management interface
- [x] Implemented add and edit product functionality
- [x] Added product form validation
- [x] Implemented product activation and deactivation
- [x] Added Active/Inactive status display
- [x] Filtered inactive products from the storefront
- [x] Tested product management functionality
- [x] Implemented Add to Cart functionality
- [x] Implemented shopping cart quantity management
- [x] Implemented product removal from cart
- [x] Added inventory and stock quantity validation
- [x] Implemented shopping cart totals
- [x] Implemented checkout review interface
- [x] Verified ESLint and production build

### Next Development Phase: User Authentication

- [ ] Implement frontend user registration interface
- [ ] Connect registration form to POST /api/auth/register
- [ ] Implement frontend login interface
- [ ] Integrate login with backend authentication API
- [ ] Implement authenticated-user state management
- [ ] Require authentication to access the storefront
- [ ] Restrict Admin Product Management to administrator accounts
- [ ] Implement frontend logout functionality
- [ ] Test customer and administrator access permissions

### Remaining Frontend Development Tasks

- [ ] Integrate product catalog with backend RESTful API
- [ ] Connect Admin Product Management to backend product API
- [ ] Replace temporary product data with products retrieved from the backend API
- [ ] Integrate shopping cart with backend cart API
- [ ] Display persistent shopping cart information
- [ ] Connect checkout interface to backend order API
- [ ] Display order confirmation after successful submission
- [ ] Handle API errors and loading states
- [ ] Complete frontend and backend integration testing

---

## 10. Conclusion

The React frontend has been developed and manually tested for product browsing, administrative product management, shopping cart functionality, and checkout review.

Customers can browse available products, view product details, add items to their shopping cart, adjust quantities, remove products, and review their order totals.

The administrative interface supports adding, editing, activating, and deactivating products using React state.

The frontend uses reusable React components, consistent JavaScript conventions, and product fields compatible with the SQLite database schema.

ESLint and production build checks have completed successfully.

### Next Development Phase

The next phase of frontend development will focus on implementing user authentication interfaces and integrating them with the backend authentication API.

Planned frontend development includes:

- Creating customer registration and login interfaces
- Connecting registration and login forms to backend endpoints
- Managing authenticated-user state
- Requiring authentication before accessing the storefront
- Restricting administrative functionality to authorized users
- Implementing logout functionality
- Testing authentication and role-based navigation

Following authentication integration, frontend development will continue with connecting the product catalog, administrative product management, shopping cart, and checkout review interfaces to the backend RESTful API.

These integrations will replace temporary React state data with persistent database-backed information and support complete order processing.

The final development phase will focus on integrated application testing, validating user interactions, and ensuring consistent frontend behavior.
