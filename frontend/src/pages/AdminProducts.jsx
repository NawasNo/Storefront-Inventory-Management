
import { useState } from 'react';

const emptyForm = {
  sku: '',
  name: '',
  description: '',
  price: '',
  stock_quantity: '',
  category: '',
  image_url: '',
  is_active: 1,
};

const AdminProducts = ({
  products,
  onSave,
  onDeactivate,
  onBack,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError('');
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingId(product.product_id);

    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      price: (product.price_cents / 100).toFixed(2),
      stock_quantity: String(product.stock_quantity),
      category: product.category || '',
      image_url: product.image_url || '',
      is_active: product.is_active,
    });

    setError('');
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === 'is_active' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const price = Number(form.price);
    const quantity = Number(form.stock_quantity);

    if (
      !form.sku.trim()
      || !form.name.trim()
      || !form.category.trim()
      || !Number.isFinite(price)
      || price <= 0
      || !/^\d+(\.\d{1,2})?$/.test(form.price)
      || !Number.isInteger(quantity)
      || quantity < 0
      || form.stock_quantity.trim() === ''
    ) {
      setError('Please enter valid product information.');
      return;
    }

    const duplicateSku = products.some(
      (product) => (
        product.sku.toLowerCase() === form.sku.trim().toLowerCase()
        && product.product_id !== editingId
      ),
    );

    if (duplicateSku) {
      setError('A product with this SKU already exists.');
      return;
    }

    const productData = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      price_cents: Math.round(price * 100),
      stock_quantity: quantity,
      category: form.category.trim(),
      image_url: form.image_url.trim(),
      is_active: form.is_active,
    };

    setSaving(true);

    try {
      await onSave(productData, editingId);

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };


  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError('');
  };

  const handleDeactivate = async (productId) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onDeactivate(productId);

      if (editingId === productId) {
        handleCancel();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (productId) => {
    setSaving(true);
    setError('');

    try {
      await onSave({ is_active: 1 }, productId);

      if (editingId === productId) {
        handleCancel();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-products">
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        Back to Storefront
      </button>

      <div className="admin-heading">
        <div>
          <h1>Product Management</h1>
          <p>Manage your store&apos;s products and inventory.</p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={handleAdd}
          disabled={saving}
        >
          Add Product
        </button>
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>
            {editingId === null ? 'Add Product' : 'Edit Product'}
          </h2>

          <div className="admin-form-grid">
            <label>
              Product Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              SKU
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Category
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Price ($)
              <input
                type="number"
                name="price"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Stock Quantity
              <input
                type="number"
                name="stock_quantity"
                min="0"
                step="1"
                value={form.stock_quantity}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Image URL
              <input
                type="text"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="/images/product.jpg"
              />
            </label>

            <label>
              Status
              <select
                name="is_active"
                value={form.is_active}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  font: 'inherit',
                }}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </label>

            <label className="admin-full-width">
              Description
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-primary-button"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.product_id}>
                <td>
                  <strong>{product.name}</strong>
                  <span className="admin-category">
                    {product.category}
                  </span>
                </td>

                <td>{product.sku}</td>

                <td>
                  ${(product.price_cents / 100).toFixed(2)}
                </td>

                <td>{product.stock_quantity}</td>

                <td>
                  <span
                    className={
                      product.is_active === 1
                        ? 'admin-active'
                        : 'admin-inactive'
                    }
                  >
                    {product.is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td>
                  <div className="admin-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      disabled={saving}
                    >
                      Edit
                    </button>

                    {product.is_active === 1 ? (
                      <button
                        type="button"
                        className="admin-delete-button"
                        onClick={() => handleDeactivate(product.product_id)}
                        disabled={saving}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivate(product.product_id)}
                        disabled={saving}
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminProducts;
