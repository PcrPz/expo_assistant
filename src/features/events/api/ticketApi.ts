// src/features/events/api/ticketApi.ts

import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  UpdateTicketStatusRequest,
} from '../types/ticket.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function getTicketList(expoID: string): Promise<Ticket[]> {
  const res = await fetchWithAuth(`${API_URL}/ticket/${expoID}/get-tickets`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  const data = await res.json();
  return data ?? [];
}

export async function getTicketDetail(expoID: string, ticketID: string): Promise<Ticket> {
  const res = await fetchWithAuth(`${API_URL}/ticket/${expoID}/get/${ticketID}`);
  if (!res.ok) throw new Error('Failed to fetch ticket detail');
  return res.json();
}

export async function createTicket(expoID: string, body: CreateTicketRequest): Promise<{ ticketID: string }> {
  const res = await fetchWithAuth(`${API_URL}/ticket/${expoID}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
}

export async function updateTicket(expoID: string, body: UpdateTicketRequest): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/ticket/${expoID}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update ticket');
}

export async function updateTicketStatus(
  expoID: string,
  ticketID: string,
  body: UpdateTicketStatusRequest
): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/ticket/${expoID}/status/${ticketID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update ticket status');
}

export async function deleteTicket(expoID: string, ticketID: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/ticket/${expoID}/delete/${ticketID}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete ticket');
}