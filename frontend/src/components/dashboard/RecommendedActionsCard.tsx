'use client';

import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  Clock, 
  MessageSquare, 
  TrendingDown, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink
} from 'lucide-react';
import AutomationService, { Recommendation, RecommendationType } from '@/services/AutomationService';
import Link from 'next/link';

export function RecommendedActionsCard() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await AutomationService.getRecommendedActions();
        setRecommendations(data);
      } catch (error) {
        console.error('Erro ao buscar recomendações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleCopyMessage = (id: string, message: string) => {
    navigator.clipboard.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'LOW': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getIcon = (type: RecommendationType) => {
    switch (type) {
      case RecommendationType.HOT_LEAD_ACTIVITY: 
        return <Zap size={18} className="text-amber-400" />;
      case RecommendationType.LEAD_STALLED: 
        return <Clock size={18} className="text-rose-400" />;
      case RecommendationType.NEGOTIATION_STUCK: 
        return <MessageSquare size={18} className="text-amber-400" />;
      case RecommendationType.LOW_PERFORMANCE: 
        return <TrendingDown size={18} className="text-blue-400" />;
      default: 
        return <Sparkles size={18} className="text-[#00b8b2]" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0c1425]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 h-[400px] animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-full" />
          <div className="h-4 w-32 bg-white/5 rounded-lg" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#00b8b2]/10 p-2.5 rounded-2xl border border-[#00b8b2]/20">
            <Sparkles size={20} className="text-[#00b8b2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Ações Recomendadas</h2>
            <p className="text-xs text-gray-500 font-medium">Follow-up assistido pela inteligência HAYIA</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.slice(0, 4).map((rec) => (
          <div 
            key={rec.id}
            className="group bg-[#0c1425]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-5 hover:border-[#00b8b2]/30 transition-all duration-500 flex flex-col gap-4 relative overflow-hidden"
          >
            {/* Priority Badge */}
            <div className="flex justify-between items-start">
              <div className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getPriorityColor(rec.priority)}`}>
                {rec.priority === 'HIGH' ? 'Urgente' : rec.priority === 'MEDIUM' ? 'Ação sugerida' : 'Insight'}
              </div>
              <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                {getIcon(rec.type)}
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-bold text-white leading-tight">
                {rec.title}
              </h3>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                {rec.reason}
              </p>
            </div>

            {/* Suggested Message Bridge */}
            {rec.suggestedMessage && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 relative group/msg">
                <p className="text-[10px] text-gray-400 italic leading-relaxed pr-8">
                  "{rec.suggestedMessage}"
                </p>
                <button 
                  onClick={() => handleCopyMessage(rec.id, rec.suggestedMessage!)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-[#00b8b2] hover:bg-[#00b8b2]/10 transition-all"
                  title="Copiar mensagem sugerida"
                >
                  {copiedId === rec.id ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 mt-auto border-t border-white/5">
              <Link 
                href={rec.metadata.leadId ? `/dashboard/leads?id=${rec.metadata.leadId}` : `/dashboard/deals/${rec.metadata.listingId}`}
                className="flex-1 px-4 py-2.5 bg-white border border-white/10 text-[#0c1425] rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                {rec.type === RecommendationType.LEAD_STALLED || rec.type === RecommendationType.HOT_LEAD_ACTIVITY ? 'Responder agora' : 'Ver Detalhes'}
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
