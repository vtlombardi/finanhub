import { api } from './api.client';

export interface DataRoomDocument {
  id: string;
  name: string;
  url: string;
  category: string;
  mediaType: string;
  createdAt: string;
}

export interface DataRoomRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string | null;
  acceptedNdaAt: string | null;
  createdAt: string;
  investor: { id: string; fullName: string; email: string };
  listing: { id: string; title: string; slug: string };
}

export interface DataRoomViewLog {
  id: string;
  viewedAt: string;
  investor: { fullName: string; email: string };
  document: { name: string; category: string };
}

export const DataRoomService = {
  // Investor side
  requestAccess: (listingId: string, message?: string) => 
    api.post<DataRoomRequest>('/dataroom/request', { listingId, message }),

  getMyRequest: (listingId: string) => 
    api.get<DataRoomRequest | null>('/dataroom/request', { params: { listingId } }),

  getDocumentsForInvestor: (listingId: string) => 
    api.get<DataRoomDocument[]>(`/dataroom/${listingId}/documents`),

  acceptNda: (listingId: string) => 
    api.post(`/dataroom/accept-nda`, { listingId }),

  logView: (documentId: string) => 
    api.post(`/dataroom/${documentId}/view`),

  // Seller side
  getRequests: () => 
    api.get<DataRoomRequest[]>('/dataroom/requests'),

  updateStatus: (requestId: string, status: 'APPROVED' | 'REJECTED') => 
    api.patch(`/dataroom/requests/${requestId}`, { status }),

  grantAccess: (listingId: string, investorId: string) => 
    api.post('/dataroom/seller/grant-access', { listingId, investorId }),

  getSellerDocuments: (listingId: string) => 
    api.get<DataRoomDocument[]>(`/dataroom/seller/${listingId}/documents`),

  addDocument: (listingId: string, data: { name: string; url: string; category: string; mediaType?: string }) => 
    api.post<DataRoomDocument>(`/dataroom/seller/${listingId}/documents`, data),

  removeDocument: (documentId: string) => 
    api.delete(`/dataroom/documents/${documentId}`),

  getTrackingLogs: (listingId: string) => 
    api.get<DataRoomViewLog[]>(`/dataroom/seller/${listingId}/tracking`),
};
