// src/features/events/types/ticket.types.ts

export interface Ticket {
  TicketID: string;
  Title: string;
  Detail: string;
  Price: string;
  Amount: number | null;
  Remaining: number | null;
  Status: 'publish' | 'unpublish';
}

export interface CreateTicketRequest {
  title: string;
  detail: string;
  price: number;
  amount: number | null;
}

export interface UpdateTicketRequest {
  ticket_id: string;
  title: string;
  detail: string;
  price: number;
  amount: number | null;
}

export interface UpdateTicketStatusRequest {
  status: 'publish' | 'unpublish';
}