
function ProductCard({ product, onSelect }) {
  const price = (product.price_cents / 100).toFixed(2);
  const inStock = product.stock_quantity > 0;

  return (
    <button
      type="button"
      className="product-card"
      onClick={() => onSelect(product)}
    >
      <div className="product-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <span>No Image Available</span>
        )}
      </div>

      <div className="product-info">
        <span className="product-category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-bottom">
          <span className="product-price">
            ${price}
          </span>

          <span className={inStock ? 'in-stock' : 'out-of-stock'}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </button>
  );
}

export default ProductCard;

