import { useState } from 'react';

const ShoppingCart = ({
  cart,
  products,
  onUpdateQuantity,
  onRemove,
  onBack,
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  const cartItems = cart.map((item) => ({
    ...item,
    product: products.find(
      (product) => product.product_id === item.product_id,
    ),
  }));

  const canCheckout = cartItems.length > 0 && cartItems.every(
    (item) => item.product
      && item.product.is_active === 1
      && item.quantity > 0
      && item.quantity <= item.product.stock_quantity,
  );

  const totalCents = cartItems.reduce(
    (total, item) => (
      total + (item.product
        ? item.product.price_cents * item.quantity
        : 0)
    ),
    0,
  );

  const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

  return (
    <section className="shopping-cart-page">
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        ← Continue Shopping
      </button>

      <h1>Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your shopping cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => {
              const { product } = item;

              if (!product) {
                return (
                  <div key={item.product_id} className="cart-item">
                    <p>Product unavailable</p>
                    <button
                      type="button"
                      onClick={() => onRemove(item.product_id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              }

              return (
                <div className="cart-item" key={item.product_id}>
                  {product.image_url && !failedImages[product.product_id] ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="cart-item-image"
                      onError={() => setFailedImages((previous) => ({
                        ...previous,
                        [product.product_id]: true,
                      }))}
                    />
                  ) : (
                    <div className="cart-item-image cart-image-fallback">
                      <span>No Image Available</span>
                    </div>
                  )}

                  <div className="cart-item-info">
                    <h2>{product.name}</h2>
                    <p>{formatPrice(product.price_cents)} each</p>

                    <div className="cart-quantity-controls">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product.name}`}
                        onClick={() => onUpdateQuantity(
                          product.product_id,
                          item.quantity - 1,
                        )}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase quantity of ${product.name}`}
                        disabled={
                          product.is_active !== 1
                          || item.quantity >= product.stock_quantity
                        }
                        onClick={() => onUpdateQuantity(
                          product.product_id,
                          item.quantity + 1,
                        )}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => onRemove(product.product_id)}
                    >
                      Remove
                    </button>

                    {product.is_active !== 1 && (
                      <p>This product is no longer available.</p>
                    )}

                    {item.quantity > product.stock_quantity && (
                      <p>
                        Only {product.stock_quantity} available.
                      </p>
                    )}
                  </div>

                  <strong>
                    {formatPrice(product.price_cents * item.quantity)}
                  </strong>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <p>
              Total: <strong>{formatPrice(totalCents)}</strong>
            </p>
            {showCheckout && canCheckout ? (
              <>
                <h3>Review Your Order</h3>
                <p>
                  Please review your items and total before placing your order.
                </p>
                <p>
                  Order submission will be available after backend API integration.
                </p>

                <button
                  type="button"
                  className="cart-secondary-button"
                  onClick={() => setShowCheckout(false)}
                >
                  Back to Cart
                </button>
              </>
            ) : (
              <button
                type="button"
                className="cart-primary-button"
                disabled={!canCheckout}
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default ShoppingCart;