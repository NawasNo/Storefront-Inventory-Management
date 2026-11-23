
const ProductDetails = ({ product, onBack, onAddToCart }) => {
  const price = (product.price_cents / 100).toFixed(2);
  const inStock = product.stock_quantity > 0;

  return (
    <section className="product-details">
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        ← Back to Products
      </button>

      <div className="details-layout">
        <div className="details-image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <span>No Image Available</span>
          )}
        </div>

        <div className="details-info">
          <span className="product-category">
            {product.category}
          </span>

          <h1>{product.name}</h1>

          <p className="details-price">
            ${price}
          </p>

          <span className={inStock ? 'in-stock' : 'out-of-stock'}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>

          <h2>Description</h2>

          <p className="details-description">
            {product.description}
          </p>

          <div className="details-meta">
            <p>
              <strong>SKU: </strong>
              {product.sku}
            </p>

            <p>
              <strong>Available Quantity: </strong>
              {product.stock_quantity}
            </p>
          </div>

          <button
            type="button"
            className="cart-primary-button"
            disabled={!inStock}
            onClick={() => onAddToCart(product.product_id)}
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;