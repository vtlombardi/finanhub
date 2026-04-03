import axios from 'axios';
import Cookies from 'js-cookie';

/** Instância Base do Axios injetando a URL do Backend NestJS Globalmente */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
});

/** 
 * Interceptor de Requisicão: 
 * Insere JWT secretamente caso o Tenant/Usuário esteja logado nos cookies
 */
api.interceptors.request.use((config) => {
  const token = Cookies.get('finanhub.token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** 
 * Interceptor de Respostas:
 * Força logout brutal nativo se o backend rejeitar chaves vencidas/revogadas.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Sessão expirada ou Token Inválido detectado. Redirecionando...');
      Cookies.remove('finanhub.token');
      // Redireciona a UI sem quebrar a tela de render
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
