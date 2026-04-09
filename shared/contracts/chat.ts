/**
 * Contratos e tipos para o módulo de Mensageria/Chat.
 */

export interface ChatParticipant {
  userId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
  };
}

export interface ChatThread {
  id: string;
  tenantId: string;
  listingId?: string | null;
  updatedAt: string;
  createdAt: string;
  participants: ChatParticipant[];
  messages?: ChatMessage[]; // Geralmente contém apenas a última mensagem na listagem
  listing?: {
    id: string;
    title: string;
  } | null;
}

export interface CreateThreadDto {
  targetAdminId?: string;
  listingId?: string;
}

export interface SendMessageDto {
  body: string;
}
