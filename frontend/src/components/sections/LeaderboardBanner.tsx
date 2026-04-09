'use client';
import React, { useEffect, useState } from 'react';
import { fetchActiveAds, Ad } from '@/services/ads.service';

const FallbackBanner: React.FC = () => (
  <a href="https://finanhub.com.br/anuncie" className="ad-link">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="auto" viewBox="0 0 1140 120" preserveAspectRatio="xMidYMid slice">
      <rect width="1140" height="120" fill="#12b3af"></rect>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" fontFamily="Poppins, sans-serif">
        ANUNCIE SUA EMPRESA OU OPORTUNIDADE AQUI
      </text>
    </svg>
  </a>
);

export const LeaderboardBanner: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetchActiveAds('LEADERBOARD')
      .then(setAds)
      .catch(() => setAds([]));
  }, []);

  return (
    <section className="custom-content">
      <div className="ads-leaderboard" data-bg="brand" has-gap="">
        <div className="container">
          <div className="wrapper">
            {ads.length === 0 ? (
              <FallbackBanner />
            ) : (
              ads.map((ad) => (
                <a key={ad.id} href={ad.linkUrl} className="ad-link" target="_blank" rel="noopener noreferrer">
                  {ad.imageUrl ? (
                    <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="auto" viewBox="0 0 1140 120" preserveAspectRatio="xMidYMid slice">
                      <rect width="1140" height="120" fill="#12b3af"></rect>
                      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" fontFamily="Poppins, sans-serif">
                        {ad.title}
                      </text>
                    </svg>
                  )}
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
