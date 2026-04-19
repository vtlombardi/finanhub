'use client';

import React, { useEffect, useState } from 'react';
import { MatchingService, MatchResult } from '@/services/MatchingService';
import { 
  Users, 
  ChevronRight, 
  TrendingUp, 
  Zap, 
  Target,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface TopMatchesCardProps {
  listingId: string;
}

export function TopMatchesCard({ listingId }: TopMatchesCardProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await MatchingService.getListingMatches(listingId);
        setMatches(data);
      } catch (error) {
        console.error('Erro ao buscar matches:', error);
      } finally {
        setLoading(false);
      }
    };

    if (listingId) fetchMatches();
  }, [listingId]);

  if (loading) {
    return (
      <div className="bg-[#020617] border border-white/5 rounded-[32px] p-8 animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded-lg mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 w-full bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="bg-[#020617] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#00b8b2]/10 border border-[#00b8b2]/20 rounded-xl text-[#00b8b2]">
            <Target size={20} />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight uppercase">Investidores Aderentes</h3>
        </div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Matching inteligente HAYIA Engine</p>
      </div>

      <div className="divide-y divide-white/[0.03]">
        {matches.map((investor) => (
          <div key={investor.id} className="p-6 hover:bg-white/[0.02] transition-all group relative">
            <div className="flex items-center gap-4">
              {/* Score Circle */}
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="transparent"
                    stroke={investor.match.score >= 80 ? '#00b8b2' : investor.match.score >= 60 ? '#3b82f6' : '#f59e0b'}
                    strokeWidth="4"
                    strokeDasharray={150.8}
                    strokeDashoffset={150.8 - (150.8 * investor.match.score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-white">{investor.match.score}%</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-bold text-white truncate">{investor.fullName}</h4>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    investor.match.classification === 'Muito Alto' ? 'bg-[#00b8b2]/20 text-[#00b8b2]' :
                    investor.match.classification === 'Alto' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {investor.match.classification}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">
                  "{investor.match.justification}"
                </p>
              </div>

              {/* Action */}
              <Link 
                href={`/dashboard/leads?id=${investor.id}`}
                className="p-3 bg-white/5 hover:bg-[#00b8b2] text-gray-400 hover:text-white rounded-xl transition-all shadow-lg group-hover:scale-110"
              >
                <MessageSquare size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white/[0.02] border-t border-white/5">
        <Link 
          href="/dashboard/leads"
          className="w-full h-12 flex items-center justify-center gap-2 text-[10px] font-black text-[#00b8b2] hover:text-white uppercase tracking-[3px] transition-all border border-[#00b8b2]/30 hover:bg-[#00b8b2] rounded-2xl"
        >
          Ver todos os leads <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
