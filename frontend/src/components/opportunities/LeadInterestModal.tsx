'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  X, 
  Send, 
  CheckCircle, 
  ShieldCheck, 
  Loader2, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  MessageSquare,
  TrendingUp,
  Info
} from 'lucide-react';
import { LeadsService } from '@/services/leads.service';
import { Listing } from '@shared/contracts';

const leadSchema = z.object({
  userName: z.string().min(3, 'Nome muito curto'),
  userEmail: z.string().email('Email inválido'),
  userPhone: z.string().min(10, 'Telefone inválido'),
  userCompany: z.string().optional(),
  objective: z.string().min(1, 'Selecione um objetivo'),
  investmentRange: z.string().min(1, 'Selecione uma faixa'),
  message: z.string().min(10, 'Mensagem deve ser mais detalhada'),
  mediationAccepted: z.boolean().refine(val => val === true, 'Você deve aceitar a intermediação'),
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
  const [error, setError] = useState<string | null>(null);

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

  if (!isOpen) return null;

  const onSubmit = async (data: LeadFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await LeadsService.createLead({
        listingId: listing.id,
        ...data,
      });

      // Estabelecer thread de chat (Opcional - conforme regra de negócio)
      // Se o usuário está mandando um interesse real, abrimos o canal.
      try {
        const { ChatService } = await import('@/services/ChatService');
        await ChatService.createThread({
          listingId: listing.id,
          message: `Olá, manifestei interesse nesta oportunidade ("${listing.title}") via portal. Segue minha mensagem: ${data.message}`
        } as any);
      } catch (chatErr) {
        console.error('Falha silenciosa ao criar chat:', chatErr);
        // Não barramos o sucesso do Lead se o chat falhar (pode não estar logado ou erro na rede).
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha ao enviar interesse. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#020617] border border-white/10 rounded-[32px] p-12 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
            <CheckCircle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Interesse Registrado!</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sua solicitação para <span className="text-white font-semibold">"{listing.title}"</span> foi enviada com sucesso à central de intermediação Finanhub.
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-left border border-white/5">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Próximos Passos</p>
            <p className="text-xs text-gray-400 leading-normal">
              Um consultor Finanhub analisará seu perfil e entrará em contato em breve para validar o interesse e prosseguir com o NDA.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full bg-[#00b8b2] hover:bg-[#0e8a87] text-white py-4 rounded-xl font-bold transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#020617] border border-white/10 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-8">
        
        {/* Left Branding Panel */}
        <div className="hidden md:flex md:w-1/3 bg-gradient-to-br from-[#020617] to-gray-900 border-r border-white/5 p-8 flex-col justify-between">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-xl bg-[#00b8b2]/10 border border-[#00b8b2]/20 flex items-center justify-center text-[#00b8b2]">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight leading-tight">Intermediação Segura Finanhub</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Protegemos a identidade de ambas as partes até que haja uma qualificação real do interesse.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-12">
            {[
              { icon: CheckCircle, text: "NDA Estruturado" },
              { icon: CheckCircle, text: "Consultoria Especializada" },
              { icon: CheckCircle, text: "Due Diligence Assistida" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <item.icon size={12} className="text-[#00b8b2]" />
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8 md:p-10 space-y-6 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Manifestar Interesse</h2>
              <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">
                {listing.title}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    {...register('userName')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-[#00b8b2]/50 transition-all"
                    placeholder="Seu nome"
                  />
                </div>
                {errors.userName && <p className="text-[10px] text-red-500 ml-1">{errors.userName.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">E-mail Profissional</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    {...register('userEmail')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-[#00b8b2]/50 transition-all"
                    placeholder="seuemail@empresa.com"
                  />
                </div>
                {errors.userEmail && <p className="text-[10px] text-red-500 ml-1">{errors.userEmail.message}</p>}
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    {...register('userPhone')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-[#00b8b2]/50 transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                {errors.userPhone && <p className="text-[10px] text-red-500 ml-1">{errors.userPhone.message}</p>}
              </div>

              {/* Empresa */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Empresa / Grupo (Opcional)</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    {...register('userCompany')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-[#00b8b2]/50 transition-all"
                    placeholder="Nome da empresa"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Objetivo */}
               <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Objetivo do Contato</label>
                <select 
                  {...register('objective')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00b8b2]/50 transition-all appearance-none"
                >
                  <option value="" className="bg-gray-900">Selecione...</option>
                  <option value="Demonstração de Interesse" className="bg-gray-900">Demonstrar Interesse</option>
                  <option value="Solicitação de Análise" className="bg-gray-900">Solicitar Dados/Análise</option>
                  <option value="Parceria Estratégica" className="bg-gray-900">Parceria Estratégica</option>
                </select>
                {errors.objective && <p className="text-[10px] text-red-500 ml-1">{errors.objective.message}</p>}
              </div>

              {/* Faixa Investimento */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Faixa de Investimento</label>
                <select 
                  {...register('investmentRange')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00b8b2]/50 transition-all appearance-none"
                >
                  <option value="" className="bg-gray-900">Selecione...</option>
                  <option value="Ate 500k" className="bg-gray-900">Até R$ 500.000</option>
                  <option value="500k - 2M" className="bg-gray-900">R$ 500k — R$ 2.000.000</option>
                  <option value="2M - 10M" className="bg-gray-900">R$ 2.000.000 — R$ 10.000.000</option>
                  <option value="Acima 10M" className="bg-gray-900">Acima de R$ 10.000.000</option>
                </select>
                {errors.investmentRange && <p className="text-[10px] text-red-500 ml-1">{errors.investmentRange.message}</p>}
              </div>
            </div>

            {/* Mensagem */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Sua Mensagem</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-600" size={16} />
                <textarea 
                  {...register('message')}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-[#00b8b2]/50 transition-all resize-none"
                  placeholder="Explique brevemente seu interesse e tese de investimento..."
                />
              </div>
              {errors.message && <p className="text-[10px] text-red-500 ml-1">{errors.message.message}</p>}
            </div>

            {/* Consent */}
            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  {...register('mediationAccepted')}
                  className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[#00b8b2] focus:ring-[#00b8b2]/20"
                />
                <span className="text-[10px] text-gray-500 leading-normal group-hover:text-gray-400 transition-colors uppercase tracking-tight">
                  Compreendo que a <span className="text-white">Finanhub</span> atua como intermediadora estrutural. Aceito que meus dados sejam compartilhados com o anunciante apenas após a qualificação do interesse.
                </span>
              </label>
              {errors.mediationAccepted && <p className="text-[10px] text-red-500">{errors.mediationAccepted.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00b8b2] hover:bg-[#0e8a87] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-[#00b8b2]/10"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={16} className="group-hover:translate-x-1 transition-transform" />
              )}
              {isSubmitting ? 'Enviando Proposta...' : 'Manifestar Interesse Real'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
