const API_URL = '/api/auth';

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
    throw new Error(data.message || 'Authentication request failed.');
  }

  return data;
};

export const register = (userData) => (
  request('/register', 'POST', userData)
);

export const login = (credentials) => (
  request('/login', 'POST', credentials)
);

export const getCurrentUser = () => (
  request('/me')
);

export const logout = () => (
  request('/logout', 'POST')
);