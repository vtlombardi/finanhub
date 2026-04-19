import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface MatchResult {
  score: number;
  classification: string;
  justification: string;
  factors?: {
    financial: number;
    sector: number;
    behavioral: number;
    ai: number;
  };
}

export const MatchingService = {
  getHeaders() {
    const token = Cookies.get('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },

  async getRecommended(limit = 10) {
    const response = await axios.get(`${API_URL}/matching/recommended`, {
      params: { limit },
      headers: this.getHeaders(),
    });
    return response.data;
  },

  async getListingMatches(listingId: string, limit = 5) {
    const response = await axios.get(`${API_URL}/matching/listing/${listingId}/matches`, {
      params: { limit },
      headers: this.getHeaders(),
    });
    return response.data;
  },

  async getMatchScore(listingId: string) {
    const response = await axios.get(`${API_URL}/matching/listing/${listingId}/score`, {
      headers: this.getHeaders(),
    });
    return response.data;
  },
};
