import { api } from './api.client';

export type AdPosition = 'LEADERBOARD' | 'MOBILE_BANNER' | 'SIDEBAR';

export interface Ad {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl: string;
  position: AdPosition;
}

export async function fetchActiveAds(position: AdPosition): Promise<Ad[]> {
  const { data } = await api.get<Ad[]>('/ads/active', { params: { position } });
  return data;
}
