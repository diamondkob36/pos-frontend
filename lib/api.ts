// 🔒 API Configuration และ Helper Functions

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * ดึง Token จาก localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pos_token');
};

/**
 * สร้าง Headers พร้อม Authorization Token
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Fetch API พร้อม Error Handling
 */
export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized - Token หมดอายุหรือไม่ถูกต้อง
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
      window.location.href = '/login';
    }
    throw new Error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
  }

  // Handle 403 Forbidden - ไม่มีสิทธิ์เข้าถึง
  if (response.status === 403) {
    throw new Error('คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'เกิดข้อผิดพลาด');
  }

  return response.json();
};

/**
 * API Methods
 */
export const api = {
  // Products
  getProducts: () => fetchAPI('/products'),
  createProduct: (data: any) => fetchAPI('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => fetchAPI(`/products/${id}`, { method: 'DELETE' }),

  // Toppings
  getToppings: () => fetchAPI('/toppings'),
  createTopping: (data: any) => fetchAPI('/toppings', { method: 'POST', body: JSON.stringify(data) }),
  updateTopping: (id: number, data: any) => fetchAPI(`/toppings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTopping: (id: number) => fetchAPI(`/toppings/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => fetchAPI('/categories'),
  createCategory: (data: any) => fetchAPI('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: any) => fetchAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: number) => fetchAPI(`/categories/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (items: any[]) => fetchAPI('/orders', { method: 'POST', body: JSON.stringify({ items }) }),
  getOrders: () => fetchAPI('/orders'),

  // Users
  getUsers: () => fetchAPI('/users'),
  createUser: (data: any) => fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) => fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: number) => fetchAPI(`/users/${id}`, { method: 'DELETE' }),

  // Auth
  login: (username: string, password: string) => 
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),
};

export default api;
