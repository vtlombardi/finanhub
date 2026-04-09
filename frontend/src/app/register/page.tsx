'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { AuthService } from '@/services/AuthService';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

type RegisterStep = 'FORM' | 'VERIFY' | 'SUCCESS';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>('FORM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registration State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  // Verification State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // O backend agora cria o tenant automaticamente baseado no nome
      await AuthService.register(formData);
      setStep('VERIFY');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao iniciar registro.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;
    
    setLoading(true);
    setError('');

    try {
      const data = await AuthService.verifyEmail({ email: formData.email, code });
      // Store the JWT returned by verify-email so the user lands authenticated
      if (data?.access_token) {
        Cookies.set('finanhub.token', data.access_token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
        });
      }
      setStep('SUCCESS');
      setTimeout(() => router.push('/dashboard'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await AuthService.resendVerification(formData.email);
      setResendTimer(60);
      setError('');
    } catch (err: any) {
      setError('Erro ao reenviar código.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
           <Link href="/" className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/20 mb-6 group transition-all hover:scale-105">
             <ShieldCheck className="text-white w-8 h-8 group-hover:rotate-12 transition-transform" />
           </Link>
           <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
             {step === 'FORM' && 'Comece sua Operação'}
             {step === 'VERIFY' && 'Verifique seu Acesso'}
             {step === 'SUCCESS' && 'Acesso Confirmado'}
           </h1>
           <p className="text-slate-400 text-sm">
             {step === 'FORM' && 'Estruture sua jornada no ecossistema M&A'}
             {step === 'VERIFY' && `Enviamos um código de segurança para ${formData.email}`}
             {step === 'SUCCESS' && 'Tudo pronto! Preparando seu dashboard...'}
           </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
           {error && (
             <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-in fade-in slide-in-from-top-2">
               {error}
             </div>
           )}

           {step === 'FORM' && (
             <form onSubmit={handleRegister} className="space-y-5">
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Nome Completo</label>
                 <div className="relative">
                   <input 
                     type="text" 
                     value={formData.fullName}
                     onChange={e => setFormData({...formData, fullName: e.target.value})}
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                     placeholder="Ex: Dr. Roberto Silva"
                     required
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">E-mail Corporativo</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                      placeholder="roberto@empresa.com.br"
                      required
                    />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Senha de Acesso</label>
                 <input 
                   type="password" 
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                   placeholder="••••••••"
                   required
                 />
               </div>

               <button 
                 type="submit" 
                 disabled={loading} 
                 className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group"
               >
                 {loading ? 'Processando...' : (
                   <>
                     Criar Conta <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
               </button>
             </form>
           )}

           {step === 'VERIFY' && (
             <div className="space-y-8">
               <div className="flex justify-between gap-2">
                 {otp.map((digit, idx) => (
                   <input
                     key={idx}
                     id={`otp-${idx}`}
                     type="text"
                     maxLength={1}
                     value={digit}
                     onChange={e => handleOtpChange(idx, e.target.value)}
                     onKeyDown={e => handleOtpKeyDown(idx, e)}
                     className="w-12 h-14 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-bold text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                   />
                 ))}
               </div>

               <div className="space-y-4">
                 <button 
                   onClick={() => handleVerify()}
                   disabled={loading || otp.join('').length < 6}
                   className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                 >
                   {loading ? 'Validando...' : 'Confirmar Acesso'}
                 </button>

                 <div className="text-center">
                    <button 
                      onClick={handleResend}
                      disabled={resendTimer > 0 || loading}
                      className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-2 disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : 'Não recebi o e-mail'}
                    </button>
                 </div>
               </div>
             </div>
           )}

           {step === 'SUCCESS' && (
             <div className="text-center py-10">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
                  <CheckCircle2 className="w-20 h-20 text-emerald-500 relative z-10 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Identidade Confirmada!</h3>
                <p className="text-slate-400 text-sm">
                  Bem-vindo à rede oficial M&A Finanhub.
                </p>
             </div>
           )}
        </div>
        
        {step === 'FORM' && (
          <p className="text-center mt-8 text-sm text-slate-500">
            Já possui uma chave? <Link href="/login" className="text-blue-400 font-semibold hover:underline">Acessar Backoffice</Link>
          </p>
        )}
      </div>
    </main>
  );
}
