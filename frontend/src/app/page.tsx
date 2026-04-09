'use client';
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { Hero } from '@/components/sections/Hero';
import { SearchBar } from '@/components/sections/SearchBar';
import { StatsBanner } from '@/components/sections/StatsBanner';
import { CategoryGrid } from '@/components/sections/CategoryGrid';
import { FeaturedListings } from '@/components/sections/FeaturedListings';
import { LeaderboardBanner } from '@/components/sections/LeaderboardBanner';
import { PhotoGallery } from '@/components/sections/PhotoGallery';
import { LargeMobileBanners } from '@/components/sections/LargeMobileBanners';
import { Metrics } from '@/components/sections/Metrics';
import { VideoGallery } from '@/components/sections/VideoGallery';

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Header onOpenAuth={() => setAuthOpen(true)} />
      <main>
        <Hero />
        <SearchBar />
        <StatsBanner />
        <CategoryGrid />
        <FeaturedListings />
        <LeaderboardBanner />
        <PhotoGallery />
        <LargeMobileBanners />
        <Metrics />
        <VideoGallery />
      </main>
      <Footer />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
