
import { useState } from 'react';
import ProductCard from './components/ProductCard';
import ProductDetails from './pages/ProductDetails';
import AdminProducts from './pages/AdminProducts';
import initialProducts from './data/products';
import './App.css';

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [currentPage, setCurrentPage] = useState('storefront');

  const activeProducts = products.filter(
    (product) => product.is_active === 1,
  );

  const selectedProduct = products.find(
    (product) => product.product_id === selectedProductId,
  );

  function handleSelectProduct(product) {
    setSelectedProductId(product.product_id);
    setCurrentPage('details');
    window.scrollTo(0, 0);
  }

  function handleStorefront() {
    setSelectedProductId(null);
    setCurrentPage('storefront');
  }

  function handleAdmin() {
    setSelectedProductId(null);
    setCurrentPage('admin');
    window.scrollTo(0, 0);
  }

  function handleSaveProduct(productData, editingId) {
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
  }

  function handleDeleteProduct(productId) {
    setProducts((previous) => previous.filter(
      (product) => product.product_id !== productId,
    ));
  }

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
            onDelete={handleDeleteProduct}
            onBack={handleStorefront}
          />
        ) : currentPage === 'details' && selectedProduct ? (
          <ProductDetails
            product={selectedProduct}
            onBack={handleStorefront}
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
}

export default App;
