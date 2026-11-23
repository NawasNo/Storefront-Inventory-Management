
import { useState } from 'react';
import ProductCard from './components/ProductCard';
import ProductDetails from './pages/ProductDetails';
import AdminProducts from './pages/AdminProducts';
import ShoppingCart from './pages/ShoppingCart';
import initialProducts from './data/products';
import './App.css';

const App = () => {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [currentPage, setCurrentPage] = useState('storefront');
  const [cart, setCart] = useState([]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const activeProducts = products.filter(
    (product) => product.is_active === 1,
  );

  const selectedProduct = activeProducts.find(
    (product) => product.product_id === selectedProductId,
  );

  const handleSelectProduct = (product) => {
    if (product.is_active !== 1) {
      return;
    }

    setSelectedProductId(product.product_id);
    setCurrentPage('details');
    window.scrollTo(0, 0);
  };

  const handleStorefront = () => {
    setSelectedProductId(null);
    setCurrentPage('storefront');
  };

  const handleAdmin = () => {
    setSelectedProductId(null);
    setCurrentPage('admin');
    window.scrollTo(0, 0);
  };

  const handleCart = () => {
    setSelectedProductId(null);
    setCurrentPage('cart');
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (productId) => {
    const product = products.find(
      (item) => item.product_id === productId,
    );

    if (!product || product.is_active !== 1
      || product.stock_quantity < 1) {
      return;
    }

    setCart((previous) => {
      const existingItem = previous.find(
        (item) => item.product_id === productId,
      );

      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          return previous;
        }

        return previous.map((item) => (
          item.product_id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }

      return [
        ...previous,
        {
          product_id: productId,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (productId, quantity) => {
    const product = products.find(
      (item) => item.product_id === productId,
    );

    if (!Number.isInteger(quantity)) {
      return;
    }

    if (quantity <= 0) {
      setCart((previous) => previous.filter(
        (item) => item.product_id !== productId,
      ));
      return;
    }

    if (!product || product.is_active !== 1
      || quantity > product.stock_quantity) {
      return;
    }

    setCart((previous) => previous.map((item) => (
      item.product_id === productId
        ? { ...item, quantity }
        : item
    )));
  };

  const handleRemoveFromCart = (productId) => {
    setCart((previous) => previous.filter(
      (item) => item.product_id !== productId,
    ));
  };

  const handleSaveProduct = (productData, editingId) => {
    if (editingId !== null) {
      setProducts((previous) => previous.map(
        (product) => (
          product.product_id === editingId
            ? { ...product, ...productData }
            : product
        ),
      ));
    } else {
      setProducts((previous) => {
        const nextId = previous.reduce(
          (highest, product) => Math.max(highest, product.product_id),
          0,
        ) + 1;

        return [
          ...previous,
          {
            product_id: nextId,
            ...productData,
          },
        ];
      });
    }
  };

  const handleDeactivateProduct = (productId) => {
    setProducts((previous) => previous.map(
      (product) => (
        product.product_id === productId
          ? { ...product, is_active: 0 }
          : product
      ),
    ));
  };

  return (
    <>
      <header className="site-header">
        <div className="header-content">
          <a
            className="store-logo"
            href="#home"
            onClick={handleStorefront}
          >
            TechStore
          </a>

          <nav aria-label="Main navigation">
            <a href="#products" onClick={handleStorefront}>
              Products
            </a>

            <button
              type="button"
              className="admin-nav-button"
              onClick={handleCart}
            >
              Cart ({cartCount})
            </button>

            <button
              type="button"
              className="admin-nav-button"
              onClick={handleAdmin}
            >
              Admin
            </button>
          </nav>
        </div>
      </header>

      <main>
        {currentPage === 'admin' ? (
          <AdminProducts
            products={products}
            onSave={handleSaveProduct}
            onDeactivate={handleDeactivateProduct}
            onBack={handleStorefront}
          />
        ) : currentPage === 'cart' ? (
          <ShoppingCart
            cart={cart}
            products={products}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemove={handleRemoveFromCart}
            onBack={handleStorefront}
          />
        ) : currentPage === 'details' && selectedProduct ? (
          <ProductDetails
            product={selectedProduct}
            onBack={handleStorefront}
            onAddToCart={handleAddToCart}
          />
        ) : (
          <>
            <section className="welcome-section" id="home">
              <p className="eyebrow">ELECTRONICS & ACCESSORIES</p>
              <h1>Welcome to TechStore</h1>
              <p>
                Explore our collection of electronics and accessories
                for your everyday needs.
              </p>
              <a className="shop-button" href="#products">
                Shop Products
              </a>
            </section>

            <section className="products-section" id="products">
              <div className="section-heading">
                <h2>Our Products</h2>
                <p>Browse our available electronics and accessories.</p>
              </div>

              <div className="product-grid">
                {activeProducts.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onSelect={handleSelectProduct}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="site-footer">
        <p>TechStore — Storefront & Inventory Management</p>
      </footer>
    </>
  );
};

export default App;
