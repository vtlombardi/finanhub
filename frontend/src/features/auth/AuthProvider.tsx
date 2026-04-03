'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from './auth.service';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null; // Substitua por ITenant do backend futuramente
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Checa sessão ao inicializar puxando info verdadeira do servidor
    const initializeAuth = async () => {
       const token = Cookies.get('finanhub.token');
       if (token) {
           try {
              const data = await AuthService.getProfile();
              setUser(data);
           } catch {
              Cookies.remove('finanhub.token');
              setUser(null);
           }
       }
       setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const data = await AuthService.login(email, pass);
      // Injeta cookie com duração segura (7 dias) que o Axios Interceptor usará dali em diante
      Cookies.set('finanhub.token', data.access_token, { expires: 7, secure: true });
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('finanhub.token');
    setUser(null);
    if (typeof window !== 'undefined') { window.location.href = '/login'; }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, loading }}>
        {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
