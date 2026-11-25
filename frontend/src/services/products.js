const API_URL = '/api/products';

const request = async (endpoint, method = 'GET', body) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Product request failed.');
  }

  return data;
};

export const getProducts = () => (
  request('')
);

export const getAdminProducts = () => (
  request('/admin')
);

export const getProductById = (productId) => (
  request(`/${productId}`)
);

export const createProduct = (productData) => (
  request('', 'POST', productData)
);

export const updateProduct = (productId, productData) => (
  request(`/${productId}`, 'PUT', productData)
);