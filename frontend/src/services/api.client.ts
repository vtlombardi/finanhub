import axios from 'axios';
import Cookies from 'js-cookie';
import { useNotificationStore } from '../store/useNotificationStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('finanhub.token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401: Unauthorized / Session Expired
    if (error.response?.status === 401) {
      Cookies.remove('finanhub.token');
      
      const isDashboard = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard');
      
      if (isDashboard) {
        useNotificationStore.getState().show('Sua sessão expirou. Por favor, faça login novamente.', 'warning');
        const currentUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?redirect=${currentUrl}`;
      }
    } 
    // Outros Erros de API
    else if (error.response?.data?.message) {
      // Evita mostrar erro genérico se for algo já tratado pelo componente
      // mas garante que erro 500 ou validação bruta apareça
      const msg = Array.isArray(error.response.data.message) 
        ? error.response.data.message[0] 
        : error.response.data.message;
      
      useNotificationStore.getState().show(msg, 'error');
    }
    // Erros de Rede / Timeout
    else if (!error.response) {
      useNotificationStore.getState().show('Falha na conexão com o servidor. Verifique sua internet.', 'error');
    }

    return Promise.reject(error);
  }
);
