'use client';

import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Briefcase, 
  MapPin, 
  Layers, 
  MessageCircle, 
  Heart, 
  Share2,
  ShieldCheck,
  Target,
  FileText,
  Lock,
  History
} from 'lucide-react';
import styles from '@/styles/fh-ad-detail.module.css';

interface InvestmentSummarySidebarProps {
  listing: {
    id: string;
    price: string | number;
    investmentValue?: string | number;
    category?: { name: string };
    city: string;
    state: string;
    operationStructure?: string;
    attrValues?: any[];
    company?: {
        name: string;
        isVerified: boolean;
        createdAt?: string;
    };
  };
  onInterest: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
}

export const InvestmentSummarySidebar: React.FC<InvestmentSummarySidebarProps> = ({ 
  listing, 
  onInterest, 
  onFavorite,
  isFavorited 
}) => {
  // Helper para buscar atributos dinâmicos
  const getAttr = (name: string) => {
    const attr = listing.attrValues?.find(av => 
      av.attribute?.name?.toLowerCase() === name.toLowerCase() || 
      av.attribute?.label?.toLowerCase() === name.toLowerCase()
    );
    return attr?.valueStr || attr?.valueNum || 'Sob consulta';
  };

  const investmentValue = listing.investmentValue || listing.price;
  const priceValue = typeof investmentValue === 'string' ? parseFloat(investmentValue) : investmentValue;
  const formattedPrice = !isNaN(priceValue as any) && priceValue !== null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(priceValue))
    : 'Sob consulta';

  // Configuração dos itens da Investment Sidebar conforme pedido do usuário
  const summaryItems = [
    { label: 'Tipo de investimento', value: getAttr('tipoDeInvestimento'), iconColor: 'from-[#00b8b2] to-[#1f6fff]' },
    { label: 'Ticket mínimo', value: getAttr('ticketMinimo') ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(getAttr('ticketMinimo'))) : formattedPrice, iconColor: 'from-[#00b8b2] to-[#1f6fff]' },
    { label: 'Finalidade do capital', value: getAttr('finalidadeCapital'), iconColor: 'from-[#00b8b2] to-[#1f6fff]' },
    { label: 'Projeção de retorno', value: getAttr('projecaoRetorno'), iconColor: 'from-[#00b8b2] to-[#1f6fff]' },
    { label: 'Prazo estimado', value: getAttr('prazoRetorno'), iconColor: 'from-[#00b8b2] to-[#1f6fff]' },
    { label: 'Setor', value: getAttr('setor'), iconColor: 'from-[#00b8b2] to-[#1f6fff]' },
    { label: 'Modelo de monetização', value: getAttr('modeloMonetizacao'), iconColor: 'from-[#00b8b2] to-[#1f6fff]' },
    { label: 'Histórico', value: getAttr('historicoProjeto'), iconColor: 'from-[#00b8b2] to-[#1f6fff]' },
    { label: 'Garantias', value: getAttr('garantias'), iconColor: 'from-[#00b8b2] to-[#1f6fff]' },
    { label: 'Estrutura jurídica', value: getAttr('estruturaJuridica'), iconColor: 'from-[#00b8b2] to-[#1f6fff]' },
  ];

  return (
    <aside className={styles.summaryCard}>
      {/* Eyebrow / Label */}
      <div className="mb-6">
        <span className="text-[10px] uppercase text-[#98a2b3] tracking-[0.2em] font-black">
          Resumo do Investimento
        </span>
      </div>

      {/* Ticket Principal */}
      <div className={styles.summaryPrice}>
        <p className="text-[#cfd8e6] text-sm mb-1 font-medium">Aporte Mínimo</p>
        <p className={styles.amount}>{formattedPrice}</p>
        <p className="text-[#98a2b3] text-[11px] mt-1 italic">Oportunidade de Co-Investimento</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Lista de Dados Financeiros */}
      <div className="space-y-4 mb-8">
        {summaryItems.map((item, idx) => (
          <div key={idx} className="grid grid-cols-[16px_1fr] gap-3 items-start">
            <div className={`w-4 h-4 rounded-[5px] bg-gradient-to-br ${item.iconColor} mt-1`} />
            <div>
              <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">{item.label}</span>
              <span className="text-sm text-[#dce5f0] font-semibold">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ações CTAs adaptadas conforme pedido */}
      <div className="space-y-3">
        <button 
          onClick={onInterest}
          className={`${styles.ctaButton} ${styles.primaryCta}`}
        >
          <Target size={18} />
          Solicitar Análise
        </button>
        
        <button 
          onClick={onInterest} // Ambos abrem o modal de lead
          className={`${styles.ctaButton} ${styles.secondaryCta}`}
        >
          <MessageCircle size={18} />
          Iniciar Conversa
        </button>

        <button 
          onClick={onFavorite}
          className={`${styles.ctaButton} ${styles.secondaryCta}`}
        >
          <Heart size={18} className={isFavorited ? "fill-[#00b8b2] text-[#00b8b2]" : ""} />
          {isFavorited ? 'Salvo no Monitoramento' : 'Monitorar Ativo'}
        </button>
      </div>

      {/* Advertence / Confidentiality */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/10">
        <strong className="block text-xs text-white mb-2">Private Investment Memo</strong>
        <p className="text-[11px] text-[#dde9f6] leading-relaxed">
          O acesso ao deck completo e projeções detalhadas requer a qualificação do perfil do investidor e assinatura de NDA.
        </p>
      </div>

      {/* Footer Segurança */}
      <div className="mt-6 flex items-start gap-3 opacity-60">
        <ShieldCheck size={16} className="text-[#00b8b2] mt-0.5 shrink-0" />
        <p className="text-[9px] text-[#98a2b3] leading-relaxed uppercase font-black tracking-widest">
          Oportunidade originada sob curadoria Finanhub Private. Risco avaliado.
        </p>
      </div>
    </aside>
  );
};
