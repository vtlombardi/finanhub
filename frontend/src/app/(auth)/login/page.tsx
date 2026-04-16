'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import Link from 'next/link';
import styles from './LoginPage.module.css';

// Componente Interno que usa SearchParams (Exige Suspense Boundary no Next.js App Router)
function LoginLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const resetSuccess = searchParams.get('reset') === 'success';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      router.push(callbackUrl);
    } catch (err: any) {
      // Captura mensagens específicas do backend (ex: e-mail não verificado)
      const message = err.response?.data?.message || 'Credenciais inválidas. Verifique seus dados.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="fhLoginForm">
      {resetSuccess && (
        <div className={styles.successBox}>
          Senha redefinida com sucesso. Faça login agora.
        </div>
      )}
      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}
      
      <div className={styles.field}>
        <label htmlFor="email">E-mail Corporativo</label>
        <div className={styles.inputWrap}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <input 
            id="email" 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="exemplo@empresa.com" 
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Senha de Acesso</label>
        <div className={styles.inputWrap}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input 
            id="password" 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" 
            required
            autoComplete="current-password"
          />
        </div>
      </div>

      <div className={styles.row}>
        <label className={styles.remember}>
          <input type="checkbox" />
          <span>Lembrar acesso</span>
        </label>
        <Link href="/forgot-password" className={styles.link}>Esqueceu a senha?</Link>
      </div>

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? (
          <div className={styles.spinner} />
        ) : (
          'Entrar na Plataforma'
        )}
      </button>

      <div className={styles.divider}>ou</div>

      <Link href="/register" className={styles.ghostButton}>
        Solicitar Acesso à Finanhub
      </Link>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className={styles.fhLoginPage}>
      <div className={styles.fhLoginShell}>
        
        {/* --- LADO ESQUERDO: BRANDING --- */}
        <aside className={styles.fhLoginBrandPanel}>
          <div className={styles.brandTop}>
            <div className={styles.brandLogo}>
              {/* Logo Vetorial Finanhub */}
              <svg viewBox="0 0 340 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="FINANHUB">
                <defs>
                  <linearGradient id="fh-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00d8d0"/>
                    <stop offset="100%" stopColor="#00b8b2"/>
                  </linearGradient>
                </defs>
                <g transform="translate(0 3)">
                  <path d="M20 8 L42 28 L20 48 L7 48 L29 28 L7 8 Z" fill="url(#fh-g)"/>
                  <path d="M45 8 L58 8 L37 28 L58 48 L45 48 L24 28 Z" fill="rgba(255,255,255,.16)"/>
                </g>
                <g fill="#F4FBFF" fontFamily="Poppins, Arial, sans-serif" fontWeight="800">
                  <text x="80" y="30" fontSize="26" letterSpacing="4">FINANHUB</text>
                  <text x="82" y="49" fontSize="8.5" letterSpacing="2.2" fill="rgba(231,245,255,.6)">CONECTANDO INVESTIDORES E OPORTUNIDADES</text>
                </g>
              </svg>
            </div>
            <div className={styles.brandBadge}>Portal Profissional</div>
          </div>

          <div className={styles.brandContent}>
            <div>
              <div className={styles.signal}>Acesso de Alta Performance</div>
              <h1>Entre no ambiente premium da <span className={styles.h1Accent}>Finanhub</span>.</h1>
              <p className={styles.lead}>
                Uma experiência sólida, limpa e dedicada para conectar profissionais a operações estratégicas de M&A, investimentos e parcerias corporativas.
              </p>

              <div className={styles.signalRow}>
                <div className={styles.signal}>Segurança Bancária</div>
                <div className={styles.signal}>Dados em Tempo Real</div>
              </div>
            </div>

            <div className={styles.bottomCards}>
              <div className={styles.miniCard}>
                <strong>+9</strong>
                <span>Categorias Estratégicas</span>
              </div>
              <div className={styles.miniCard}>
                <strong>24/7</strong>
                <span>Monitoramento Ativo</span>
              </div>
              <div className={styles.miniCard}>
                <strong>Elite</strong>
                <span>Rede Gerenciada</span>
              </div>
            </div>
          </div>
        </aside>

        {/* --- LADO DIREITO: FORMULÁRIO --- */}
        <section className={styles.fhLoginFormPanel}>
          <div className={styles.formWrap}>
            <div className={styles.topChip}>Autenticação Finanhub</div>
            <h2>Bem-vindo de volta</h2>
            <p className={styles.subtext}>
              Identifique-se para acessar seu dashboard, gerenciar ativos e acompanhar suas interações com o ecossistema.
            </p>

            <Suspense fallback={
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <div className={styles.spinner} style={{ borderTopColor: '#00b8b2', margin: '0 auto' }} />
              </div>
            }>
              <LoginLogic />
            </Suspense>

            <div className={styles.foot}>
              Ao acessar a plataforma, você confirma estar de acordo com os <Link href="/terms">Termos de Uso</Link> e a <Link href="/privacy">Política de Privacidade</Link>.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


