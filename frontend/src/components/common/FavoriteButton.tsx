'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/features/auth/AuthProvider';

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited?: boolean;
  className?: string;
}

export function FavoriteButton({ listingId, initialFavorited = false, className = '' }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toggleFavorite, favorites } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  // Sincroniza com a lista global de favoritos se disponível
  useEffect(() => {
    if (favorites.length > 0) {
      const found = favorites.some(f => f.id === listingId);
      setIsFavorited(found);
    }
  }, [favorites, listingId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redireciona para login ou mostra modal se não autenticado
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setLoading(true);
    try {
      const result = await toggleFavorite(listingId);
      if (result !== null) {
        setIsFavorited(result);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
        isFavorited 
          ? 'bg-[#00b8b2]/10 text-[#00b8b2]' 
          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
      } ${className}`}
      title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart 
        size={20} 
        fill={isFavorited ? 'currentColor' : 'none'} 
        style={{ transition: 'transform 0.2s', transform: loading ? 'scale(0.8)' : 'scale(1)' }}
      />
      {loading && (
        <div className="absolute inset-0 border-2 border-[#00b8b2] border-t-transparent rounded-full animate-spin" style={{ margin: '4px' }} />
      )}
    </button>
  );
}
