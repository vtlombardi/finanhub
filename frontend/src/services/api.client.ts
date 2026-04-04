import axios from 'axios';
import Cookies from 'js-cookie';

/** Instância Base do Axios injetando a URL do Backend NestJS globalmente */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Requisição:
 * insere JWT caso o usuário esteja logado nos cookies
 */
api.interceptors.request.use((config) => {
  const token = Cookies.get('finanhub.token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Interceptor de Resposta:
 * força logout se o backend retornar 401
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Sessão expirada ou token inválido detectado. Redirecionando...');
      Cookies.remove('finanhub.token');

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
