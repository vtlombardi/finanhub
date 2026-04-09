'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/AuthService';
import { User, LoginRequest, RegisterRequest } from '@shared/contracts';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('finanhub.token');

      if (token) {
        try {
          const userData = await AuthService.getProfile();
          // Normaliza: /auth/me retorna { userId } mas contratos usam { id }
          setUser({ ...userData, id: userData.id || (userData as any).userId });

          // Redireciona para o dashboard apenas se estiver em página pública (login/register)
          if (typeof window !== 'undefined') {
            const publicPaths = ['/login', '/register', '/'];
            if (publicPaths.includes(window.location.pathname)) {
              window.location.href = '/dashboard';
            }
          }

        } catch {
          Cookies.remove('finanhub.token');
          setUser(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (request: LoginRequest) => {
    setLoading(true);
    try {
      const data = await AuthService.login(request);
      // Injeta cookie com duração segura (7 dias) que o Axios Interceptor usará dali em diante
      Cookies.set('finanhub.token', data.access_token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (request: RegisterRequest) => {
    return AuthService.register(request);
  };

  const logout = () => {
    Cookies.remove('finanhub.token');
    setUser(null);
    if (typeof window !== 'undefined') { 
      window.location.href = '/login'; 
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user, 
      user, 
      setUser,
      login, 
      register,
      logout, 
      loading 
    }}>
        {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
