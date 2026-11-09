
# Storefront & Inventory Management

A full-stack e-commerce application designed to provide a seamless shopping experience while offering administrators the tools needed to manage products, inventory, and customer orders.

Developed for **CS465P at Portland State University**, this project uses React for the frontend, Node.js and Express for the backend, and SQLite for database management.

## Overview

The Storefront & Inventory Management application combines customer-facing shopping functionality with administrative inventory management.

Customers will be able to browse products, manage shopping carts, and complete simulated purchases. Administrators will be able to manage the product catalog, track inventory levels, and review customer orders.

The application follows a modular architecture that separates the frontend, backend, and database operations.

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, JavaScript, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | SQLite |
| API | RESTful API |
| Version Control | Git, GitHub |
| Development | GitHub Codespaces, VS Code |

## Planned Features

### Customer Storefront

- **Product Catalog:** Browse available products with descriptions, prices, and images.
- **Product Details:** View detailed product information.
- **Shopping Cart:** Add products, update quantities, and remove items.
- **Checkout:** Complete a simulated checkout process.
- **Order Confirmation:** Display confirmation after placing an order.

### Administrative Dashboard

- **Product Management:** Create, view, update, and delete products.
- **Inventory Tracking:** Monitor available stock quantities.
- **Inventory Adjustments:** Record additions, sales, and stock adjustments.
- **Order Management:** View customer orders and their statuses.

## Application Architecture

The application uses a three-layer architecture.

### Frontend — React

Provides the user interface for product browsing, shopping carts, checkout, and administrative functionality.

### Backend — Node.js / Express

Processes HTTP requests, handles application logic, and exposes RESTful API endpoints.

### Database — SQLite

Stores application data, including products, shopping carts, orders, and inventory transactions.

### Data Flow

React Frontend → Express REST API → SQLite Database

## Project Structure

    Storefront-Inventory-Management/
    ├── frontend/
    │   ├── public/
    │   ├── src/
    │   │   ├── assets/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   ├── package.json
    │   └── vite.config.js
    │
    ├── backend/
    │   ├── db/
    │   ├── routes/
    │   ├── controllers/
    │   └── package.json
    │
    ├── docs/
    ├── .env.example
    ├── .gitignore
    └── README.md

### Directory Responsibilities

- `frontend/` — React frontend application.
- `frontend/src/components/` — Reusable UI components.
- `frontend/src/pages/` — Application pages and views.
- `frontend/src/services/` — Backend API communication.
- `backend/` — Express backend application.
- `backend/db/` — Database schema, connection, and seed data.
- `backend/routes/` — REST API routes.
- `backend/controllers/` — Request handling and application logic.
- `docs/` — Documentation and database diagrams.

## Getting Started

### Prerequisites

Ensure the following are installed:

- Node.js
- npm
- Git

### 1. Clone the Repository

    git clone https://github.com/NawasNo/Storefront-Inventory-Management.git
    cd Storefront-Inventory-Management

### 2. Frontend Setup

Navigate to the frontend directory:

    cd frontend

Install dependencies:

    npm install

Start the development server:

    npm run dev

Vite will display the development URL, typically:

    http://localhost:5173

### 3. Backend Setup

From the repository root:

    cd backend

Install dependencies:

    npm install

The backend server and database integration are currently under development. Additional setup instructions will be provided as development progresses.

## Database Design

The application is planned to use a relational SQLite database.

| Table | Description |
|-------|-------------|
| `users` | Customer and administrator account information |
| `products` | Product details, prices, and stock quantities |
| `carts` | Shopping carts associated with users |
| `cart_items` | Products and quantities in shopping carts |
| `orders` | Customer purchase records |
| `order_items` | Individual products included in orders |
| `inventory_transactions` | Records of inventory changes |

The database schema and entity-relationship diagram will be included in the project documentation.

User authentication and account-related functionality are subject to final implementation decisions.

## Development Status

**Current Status: Initial Development**

The repository currently includes:

- React frontend initialized with Vite
- Backend Node.js project initialized
- Express, SQLite3, CORS, and dotenv dependencies
- Organized frontend and backend directories
- Initial project documentation

### Upcoming Development

- [ ] Implement database schema and seed data
- [ ] Develop RESTful API endpoints
- [ ] Build product catalog and product details
- [ ] Implement shopping cart functionality
- [ ] Develop simulated checkout and order processing
- [ ] Build administrative product management
- [ ] Implement inventory tracking
- [ ] Integrate frontend and backend
- [ ] Test application functionality
- [ ] Finalize project documentation
