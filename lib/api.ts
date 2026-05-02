import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const mapFallbackUrl = (url?: string) => {
  if (!url) return undefined;
  const cleanUrl = url.split('?')[0];

  if (cleanUrl.startsWith('/compras')) {
    return url.replace('/compras', '/compras');
  }
  if (cleanUrl.startsWith('/ventas')) {
    return url.replace('/ventas', '/trabajos');
  }

  return undefined;
};

// Interceptor para manejar errores de autenticación y rutas antiguas desplegadas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response?.status === 404 && config && !config._retry) {
      const fallbackUrl = mapFallbackUrl(config.url);
      if (fallbackUrl) {
        config._retry = true;
        config.url = fallbackUrl;
        return api(config);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
