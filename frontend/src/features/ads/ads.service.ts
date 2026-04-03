import { api } from '../../services/api.client';

export class AdsService {
  static async getOpportunities() {
    return api.get('/api/v1/ads');
  }

  static async createOpportunity(data: any) {
    return api.post('/api/v1/ads', data);
  }
}

