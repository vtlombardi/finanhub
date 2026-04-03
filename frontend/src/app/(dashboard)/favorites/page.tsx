'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2, ExternalLink } from 'lucide-react';
import { ListingsService } from '@/features/listings/listings.service';
import Link from 'next/link';

export default function FavoritesDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const data = await ListingsService.getMyFavorites();
      setFavorites(data);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (listingId: string) => {
    try {
      await ListingsService.toggleFavorite(listingId);
      setFavorites(favorites.filter((f) => f.listing?.id !== listingId && f.listingId !== listingId));
    } catch {
      alert('Erro ao remover favorito.');
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 animate-pulse">Carregando favoritos...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          <Heart size={24} className="text-rose-400" /> Meus Favoritos
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Deals que você marcou para acompanhar. {favorites.length} salvo{favorites.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <Heart size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Nenhum favorito ainda</h3>
          <p className="text-slate-500 text-sm mt-2 mb-6">Explore a vitrine e favorite os deals que te interessam.</p>
          <Link href="/deals" className="btn-primary inline-flex items-center gap-2">
            Explorar Deals
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => {
            const listing = fav.listing;
            if (!listing) return null;

            return (
              <div key={fav.id} className="glass-panel rounded-xl overflow-hidden group hover:border-rose-500/30 transition-all">
                <div className="h-1.5 bg-gradient-to-r from-rose-500 to-pink-600"></div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700">
                      {listing.category?.name || 'M&A'}
                    </span>
                    <button
                      onClick={() => handleRemove(listing.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Remover dos favoritos"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h3 className="font-semibold text-slate-200 mb-2 line-clamp-2 group-hover:text-rose-400 transition-colors">
                    {listing.title}
                  </h3>

                  <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500">Valuation</p>
                      <p className="font-mono text-sm font-semibold text-slate-300">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(listing.price || 0))}
                      </p>
                    </div>
                    <Link
                      href={`/deals/${listing.slug || listing.id}`}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                    >
                      Ver Deal <ExternalLink size={12} />
                    </Link>
                  </div>

                  <p className="text-xs text-slate-600 mt-2">
                    {listing.tenant?.name || 'Seller'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
