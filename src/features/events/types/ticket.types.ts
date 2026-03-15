// src/features/events/types/ticket.types.ts

export interface Ticket {
  TicketID: string;
  Title: string;
  Detail: string;
  Price: string;
}

export interface CreateTicketRequest {
  title: string;
  detail: string;
  price: number;
}

export interface UpdateTicketRequest {
  ticket_id: string;
  title: string;
  detail: string;
  price: number;
}