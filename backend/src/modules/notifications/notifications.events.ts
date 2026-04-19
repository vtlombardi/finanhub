/**
 * Tipos de eventos que acionam notificações no Finanhub/HAYIA.
 */
export const NotificationEvents = {
  // OPERACIONAIS
  LEAD_CREATED: 'lead.created',
  LEAD_STATUS_CHANGED: 'lead.status.changed',
  PROPOSAL_RECEIVED: 'proposal.received',
  CHAT_MESSAGE_RECEIVED: 'chat.message.received',

  // ESTRATÉGICOS (HAYIA)
  LEAD_SCORE_HIGH: 'lead.score.high', // Score > 80
  LEAD_STALLED: 'lead.stalled',       // Sem resposta > 48h
  LISTING_PERFORMANCE_LOW: 'listing.performance.low',
  ACTION_RECOMMENDED: 'hayia.action.recommended',

  // DATA ROOM
  DATAROOM_REQUESTED: 'dataroom.requested',
  DATAROOM_APPROVED: 'dataroom.approved',
  DATAROOM_VIEWED: 'dataroom.viewed',
  DATAROOM_DOC_ADDED: 'dataroom.doc.added',

  // PERFORMANCE
  PERFORMANCE_PEAK: 'performance.peak',
  CONVERSION_CHANGE: 'performance.conversion.change',
};

/**
 * Mapeamento de categorias de notificação para a UI.
 */
export enum NotificationCategory {
  OPERATIONAL = 'OPERATIONAL',
  STRATEGIC = 'STRATEGIC',
  DATAROOM = 'DATAROOM',
  PERFORMANCE = 'PERFORMANCE',
}
