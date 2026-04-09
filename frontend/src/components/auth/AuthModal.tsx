'use client';
import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (activeTab === 'sign-in') {
        await login(email, password);
        onClose();
        window.location.href = '/dashboard';
      } else {
        // Implementar registro futuramente
        setError('O registro ainda não está disponível. Por favor, entre em contato.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-default modal-sign open" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-nav">
          <button 
            className={`heading modal-nav-link ${activeTab === 'sign-in' ? 'active' : ''}`}
            onClick={() => setActiveTab('sign-in')}
            style={{ background: 'none', border: 'none' }}
          >
            Entrar
          </button>
          <button 
            className={`heading modal-nav-link ${activeTab === 'sign-up' ? 'active' : ''}`}
            onClick={() => setActiveTab('sign-up')}
            style={{ background: 'none', border: 'none' }}
          >
            Cadastrar
          </button>
          <button className="modal-close-button" onClick={onClose}>
            <i className="fa fa-close"></i>
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>
              {error}
            </div>
          )}
          
          {activeTab === 'sign-in' ? (
            <div className="content-tab active">
              <div className="modal-social">
                <div className="modal-social-wrapper">
                  <button className="social-modal-button google-button">
                    <img src="https://finanhub.com.br/assets/images/google-icon.svg" alt="Google" />
                    Entrar com Google
                  </button>
                </div>
              </div>
              <span className="heading or-label">ou</span>
              <form className="modal-form" onSubmit={handleSubmit}>
                <input 
                  type="email" 
                  name="email" 
                  className="input" 
                  placeholder="Email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="input-password-control">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    className="input" 
                    placeholder="Senha" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <div className="form-actions">
                  <label className="form-remember">
                    <input type="checkbox" name="remember" /> Entrar automaticamente
                  </label>
                  <div className="form-lost-password"><a href="#" className="link">Esqueceu a sua senha?</a></div>
                </div>
                <div className="form-button">
                  <button type="submit" className="button button-bg is-primary" disabled={isLoading}>
                    {isLoading ? 'Carregando...' : 'Entrar'}
                  </button>
                </div>
              </form>
              <small className="privacy-policy">
                Ao se inscrever, você concorda com nossos <a href="/termos-de-uso" className="link">Termos de Serviço</a> e <a href="/politica-de-privacidade" className="link">Política de Privacidade</a>.
              </small>
            </div>
          ) : (
            <div className="content-tab active">
              <div className="modal-social">
                <div className="modal-social-wrapper">
                  <button className="social-modal-button google-button">
                    <img src="https://finanhub.com.br/assets/images/google-icon.svg" alt="Google" />
                    Registrar com Google
                  </button>
                </div>
              </div>
              <span className="heading or-label">ou</span>
              <form className="modal-form" onSubmit={handleSubmit}>
                <input type="text" name="first_name" className="input" placeholder="Nome" required />
                <input type="text" name="last_name" className="input" placeholder="Sobrenome" required />
                <input type="email" name="username" className="input" placeholder="Email" required />
                <div className="input-password-control">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    className="input" 
                    placeholder="Senha" 
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <div className="form-button">
                  <button type="submit" className="button button-bg is-primary" disabled={isLoading}>
                    {isLoading ? 'Carregando...' : 'Cadastre-se'}
                  </button>
                </div>
              </form>
            <small className="privacy-policy">
                Ao se inscrever, você concorda com nossos <a href="/termos-de-uso" className="link">Termos de Serviço</a> e <a href="/politica-de-privacidade" className="link">Política de Privacidade</a>.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
