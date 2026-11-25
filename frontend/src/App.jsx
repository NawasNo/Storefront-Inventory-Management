
import { useEffect, useState } from 'react';
import ProductCard from './components/ProductCard';
import ProductDetails from './pages/ProductDetails';
import AdminProducts from './pages/AdminProducts';
import ShoppingCart from './pages/ShoppingCart';
import Login from './pages/Login';
import Register from './pages/Register';
import {
  login, register, getCurrentUser, logout,
} from './services/auth';
import {
  getProducts,
  getAdminProducts,
  createProduct,
  updateProduct,
} from './services/products';
import './App.css';

const App = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await getCurrentUser();

        setUser(data.user);
        setCurrentPage('storefront');
      } catch {
        setUser(null);
        setCurrentPage('login');
      } finally {
        setSessionLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let cancelled = false;

    const loadProducts = async () => {
      try {
        const data = user.role === 'admin'
          ? await getAdminProducts()
          : await getProducts();

        if (!cancelled) {
          setProducts(data.products);
          setProductsError('');
        }
      } catch (error) {
        if (!cancelled) {
          setProductsError(error.message);
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [user]);

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
    if (!user || product.is_active !== 1) {
      return;
    }

    setSelectedProductId(product.product_id);
    setCurrentPage('details');
    window.scrollTo(0, 0);
  };

  const handleStorefront = () => {
    if (!user) {
      return;
    }

    setSelectedProductId(null);
    setCurrentPage('storefront');
    window.scrollTo(0, 0);
  };

  const handleAdmin = () => {
    if (!user || user.role !== 'admin') {
      return;
    }

    setSelectedProductId(null);
    setCurrentPage('admin');
    window.scrollTo(0, 0);
  };

  const handleCart = () => {
    if (!user) {
      return;
    }

    setSelectedProductId(null);
    setCurrentPage('cart');
    window.scrollTo(0, 0);
  };

  const handleLoginPage = () => {
    setAuthError('');
    setSelectedProductId(null);
    setCurrentPage('login');
    window.scrollTo(0, 0);
  };

  const handleRegisterPage = () => {
    setAuthError('');
    setSelectedProductId(null);
    setCurrentPage('register');
    window.scrollTo(0, 0);
  };

  const handleLogin = async (credentials) => {
    setAuthError('');
    setAuthLoading(true);

    try {
      const data = await login(credentials);

      setProducts([]);
      setProductsLoading(true);
      setProductsError('');
      setUser(data.user);
      setSelectedProductId(null);
      setCurrentPage('storefront');
      window.scrollTo(0, 0);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setAuthError('');
    setAuthLoading(true);

    try {
      await register(userData);
      handleLoginPage();
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthError('');

    try {
      await logout();

      setUser(null);
      setProducts([]);
      setProductsLoading(true);
      setProductsError('');
      setCart([]);
      handleLoginPage();
    } catch (error) {
      setAuthError(error.message);
    }
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
      || product.stock_quantity < 1) {
      return;
    }

    const updatedQuantity = Math.min(quantity, product.stock_quantity);

    setCart((previous) => previous.map((item) => (
      item.product_id === productId
        ? { ...item, quantity: updatedQuantity }
        : item
    )));
  };

  const handleRemoveFromCart = (productId) => {
    setCart((previous) => previous.filter(
      (item) => item.product_id !== productId,
    ));
  };

  const handleSaveProduct = async (productData, editingId) => {
    if (editingId !== null && editingId !== undefined) {
      const data = await updateProduct(editingId, productData);

      setProducts((previousProducts) => (
        previousProducts.map((product) => (
          product.product_id === editingId
            ? data.product
            : product
        ))
      ));
    } else {
      const data = await createProduct(productData);

      setProducts((previousProducts) => [
        ...previousProducts,
        data.product,
      ]);
    }
  };

  const handleDeactivateProduct = async (productId) => {
    await handleSaveProduct({ is_active: 0 }, productId);
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

          <nav className="store-nav">
            {!sessionLoading && (
              user ? (
                <>
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

                  {user.role === 'admin' && (
                    <button
                      type="button"
                      className="admin-nav-button"
                      onClick={handleAdmin}
                    >
                      Admin
                    </button>
                  )}

                  <button
                    type="button"
                    className="admin-nav-button"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="admin-nav-button"
                    onClick={handleLoginPage}
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    className="admin-nav-button"
                    onClick={handleRegisterPage}
                  >
                    Register
                  </button>
                </>
              )
            )}
          </nav>
        </div>
      </header>
      <main>
        {user && authError && (
          <p className="auth-error" role="alert">
            {authError}
          </p>
        )}

        {sessionLoading ? (
          <section className="auth-page">
            <p>Loading...</p>
          </section>
        ) : !user ? (
          currentPage === 'register' ? (
            <Register
              onRegister={handleRegister}
              onLogin={handleLoginPage}
              error={authError}
              loading={authLoading}
            />
          ) : (
            <Login
              onLogin={handleLogin}
              onRegister={handleRegisterPage}
              error={authError}
              loading={authLoading}
            />
          )
        ) : productsLoading ? (
          <p>Loading products...</p>
        ) : productsError ? (
          <p role="alert">{productsError}</p>
        ) : currentPage === 'admin' && user.role === 'admin' ? (
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
