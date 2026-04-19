'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  X, 
  Send, 
  CheckCircle, 
  Loader2, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  MessageSquare,
  TrendingUp,
  ChevronDown,
  Lock,
  ArrowRight
} from 'lucide-react';
import { LeadsService } from '@/services/leads.service';
import { Listing } from '@shared/contracts';

const leadSchema = z.object({
  userName: z.string().min(3, 'Insira seu nome completo'),
  userEmail: z.string().email('E-mail institucional inválido'),
  userPhone: z.string().min(10, 'Telefone inválido'),
  userCompany: z.string().optional(),
  objective: z.string().min(1, 'Selecione o objetivo do interesse'),
  investmentRange: z.string().min(1, 'Selecione sua faixa de investimento'),
  message: z.string().min(10, 'Por favor, detalhe sua tese ou interesse'),
  mediationAccepted: z.boolean().refine(val => val === true, 'O aceite do NDA é obrigatório'),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

export function LeadInterestModal({ isOpen, onClose, listing }: LeadInterestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Handle animation entrance
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsMounted(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      mediationAccepted: false,
    }
  });

  if (!isOpen && !isMounted) return null;

  const onSubmit = async (data: LeadFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      
      await LeadsService.createLead({
        listingId: listing.id,
        ...data,
      });

      // Optional Chat integration
      try {
        const { ChatService } = await import('@/services/ChatService');
        await ChatService.createThread({
          listingId: listing.id,
          message: `Olá, manifestei interesse nesta oportunidade ("${listing.title}") via portal. Segue minha mensagem: ${data.message}`
        } as any);
      } catch (chatErr) {
        console.error('Chat thread bypass:', chatErr);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Falha ao processar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (hasError: any) => `
    w-full bg-white/[0.03] border ${hasError ? 'border-red-500/50' : 'border-white/10'} 
    rounded-2xl h-[52px] px-5 text-sm text-white placeholder-gray-600 outline-none 
    focus:border-[#00b8b2] focus:ring-4 focus:ring-[#00b8b2]/10 transition-all duration-300
  `;

  const labelClasses = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1";

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/80" onClick={onClose} />
        <div className="relative bg-[#020617] border border-white/10 rounded-[32px] p-12 max-w-lg w-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] text-center space-y-8 animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
            <CheckCircle size={48} strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">Análise Iniciada</h2>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm mx-auto">
              Sua demonstração de interesse para <span className="text-white font-semibold">"{listing.title}"</span> foi enviada com sucesso.
            </p>
          </div>
          <div className="bg-white/[0.03] rounded-3xl p-6 text-left border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00b8b2]/10 flex items-center justify-center text-[#00b8b2]">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Próxima Etapa</p>
                <p className="text-xs text-gray-200 mt-0.5">Qualificação do perfil pelo time de M&A</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed pl-11">
              Um consultor entrará em contato em até 24h para validar sua tese e liberar o acesso controlado ao Data Room via NDA estruturado.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full h-14 bg-gradient-to-r from-[#00b8b2] to-[#0e8a87] hover:shadow-lg hover:shadow-[#00b8b2]/20 text-white rounded-2xl font-bold transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
          >
            Continuar Explorando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto backdrop-blur-sm transition-all duration-300 ${isOpen ? 'bg-black/80 opacity-100' : 'bg-black/0 opacity-0'}`}>
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className={`
        relative bg-[#020617] border border-white/10 rounded-[32px] w-full max-w-[720px] 
        shadow-[0_48px_160px_-24px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col my-auto
        transition-all duration-500 transform
        ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}
      `}>
        
        {/* Header Section */}
        <div className="p-8 md:p-10 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-white tracking-tight">Manifestar Interesse</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00b8b2] animate-pulse" />
                <p className="text-sm text-gray-500 font-medium">
                  {listing.title}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all border border-white/5"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-5 rounded-2xl mb-8 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0">!</div>
              {serverError}
            </div>
          )}

          <form id="lead-interest-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* BLOCK 1: IDENTIFICATION */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-1 h-4 bg-[#00b8b2] rounded-full" />
                <h3 className="text-xs font-bold text-white uppercase tracking-[2px]">Identificação Pessoal</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Nome Completo</label>
                  <input {...register('userName')} className={inputClasses(errors.userName)} placeholder="Ex: João Silva" />
                  {errors.userName && <p className="text-[10px] text-red-500 mt-2 ml-1">{errors.userName.message}</p>}
                </div>
                <div>
                  <label className={labelClasses}>E-mail Institucional</label>
                  <input {...register('userEmail')} className={inputClasses(errors.userEmail)} placeholder="joao.silva@empresa.com" />
                  {errors.userEmail && <p className="text-[10px] text-red-500 mt-2 ml-1">{errors.userEmail.message}</p>}
                </div>
              </div>
            </div>

            {/* BLOCK 2: CONTACT */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-1 h-4 bg-[#00b8b2] rounded-full" />
                <h3 className="text-xs font-bold text-white uppercase tracking-[2px]">Canais de Contato</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Telefone / WhatsApp</label>
                  <input {...register('userPhone')} className={inputClasses(errors.userPhone)} placeholder="(00) 0 0000-0000" />
                  {errors.userPhone && <p className="text-[10px] text-red-500 mt-2 ml-1">{errors.userPhone.message}</p>}
                </div>
              </div>
            </div>

            {/* BLOCK 3: PROFILE */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-1 h-4 bg-[#00b8b2] rounded-full" />
                <h3 className="text-xs font-bold text-white uppercase tracking-[2px]">Perfil do Investidor</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Empresa ou Grupo (Opcional)</label>
                  <input {...register('userCompany')} className={inputClasses(false)} placeholder="Nome da empresa" />
                </div>
                <div>
                  <label className={labelClasses}>Faixa de Investimento</label>
                  <div className="relative">
                    <select {...register('investmentRange')} className={`${inputClasses(errors.investmentRange)} appearance-none cursor-pointer pr-12`}>
                      <option value="" className="bg-gray-950">Selecione uma faixa...</option>
                      <option value="Ate 500k" className="bg-gray-950">Até R$ 500.000</option>
                      <option value="500k - 2M" className="bg-gray-950">R$ 500k — R$ 2M</option>
                      <option value="2M - 10M" className="bg-gray-950">R$ 2M — R$ 10M</option>
                      <option value="Acima 10M" className="bg-gray-950">Acima de R$ 10.000.000</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.investmentRange && <p className="text-[10px] text-red-500 mt-2 ml-1">{errors.investmentRange.message}</p>}
                </div>
              </div>
            </div>

            {/* BLOCK 4: INTENTION */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-1 h-4 bg-[#00b8b2] rounded-full" />
                <h3 className="text-xs font-bold text-white uppercase tracking-[2px]">Tese e Intencionalidade</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className={labelClasses}>Objetivo Estratégico</label>
                  <div className="relative">
                    <select {...register('objective')} className={`${inputClasses(errors.objective)} appearance-none cursor-pointer pr-12`}>
                      <option value="" className="bg-gray-950">O que você busca?</option>
                      <option value="Demonstração de Interesse" className="bg-gray-950">Adquirir controle total (M&A)</option>
                      <option value="Solicitação de Análise" className="bg-gray-950">Investimento minoritário / Aporte</option>
                      <option value="Parceria Estratégica" className="bg-gray-950">Parceria Estratégica / Fusão</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.objective && <p className="text-[10px] text-red-500 mt-2 ml-1">{errors.objective.message}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Tese de Investimento e Comentários</label>
                  <textarea 
                    {...register('message')} 
                    rows={4}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#00b8b2] focus:ring-4 focus:ring-[#00b8b2]/10 transition-all duration-300 resize-none min-h-[140px]"
                    placeholder="Descreva brevemente sua motivação, sinergias esperadas ou dúvidas iniciais sobre a operação..."
                  />
                  {errors.message && <p className="text-[10px] text-red-500 mt-2 ml-1">{errors.message.message}</p>}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Area */}
        <div className="p-8 md:p-10 border-t border-white/5 bg-white/[0.01] space-y-6">
          <label className="flex items-start gap-4 cursor-pointer group px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
            <div className="relative flex items-center mt-0.5">
              <input 
                type="checkbox"
                {...register('mediationAccepted')}
                className="w-5 h-5 rounded-lg border-white/10 bg-black text-[#00b8b2] focus:ring-[#00b8b2]/20 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-gray-300 font-bold uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} className="text-[#00b8b2]" />
                Termo de Confidencialidade (NDA)
              </span>
              <p className="text-[10px] text-gray-500 leading-normal uppercase">
                Aceito que meus dados profissionais sejam compartilhados com o anunciante apenas após a qualificação do interesse pelo time <span className="text-[#00b8b2]">Finanhub M&A</span>.
              </p>
            </div>
          </label>
          {errors.mediationAccepted && <p className="text-[10px] text-red-500 text-center">{errors.mediationAccepted.message}</p>}

          <button 
            type="submit"
            form="lead-interest-form"
            disabled={isSubmitting}
            className="w-full h-16 bg-gradient-to-r from-[#00b8b2] to-[#0e8a87] hover:to-[#00b8b2] text-white rounded-2xl font-black text-xs uppercase tracking-[3px] transition-all duration-500 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_12px_48px_-8px_rgba(0,184,178,0.4)] hover:shadow-[0_12px_64px_-8px_rgba(0,184,178,0.6)] transform hover:-translate-y-1 active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Iniciar Análise da Oportunidade</span>
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
