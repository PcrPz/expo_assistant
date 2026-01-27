// src/features/events/store/eventStore.ts
// ✅ ลบ Mock Data ออก - เริ่มต้นด้วย Array ว่าง

import { create } from 'zustand';
import type { Event } from '../types/event.types';

interface EventStore {
  // Events
  organizedEvents: Event[];
  participatedEvents: Event[];
  
  // Loading states
  isLoading: boolean;
  isLoadingOrganized: boolean;
  isLoadingParticipated: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  setOrganizedEvents: (events: Event[]) => void;
  setParticipatedEvents: (events: Event[]) => void;
  setEvents: (events: Event[]) => void;
  setIsLoading: (loading: boolean) => void;
  setLoading: (loading: boolean) => void;
  setIsLoadingOrganized: (loading: boolean) => void;
  setIsLoadingParticipated: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  // ✅ เริ่มต้นด้วย Array ว่าง (ไม่มี Mock)
  organizedEvents: [],
  participatedEvents: [],
  
  // Loading states
  isLoading: false,
  isLoadingOrganized: false,
  isLoadingParticipated: false,
  
  // Error state
  error: null,
  
  // Actions
  setOrganizedEvents: (events) => set({ organizedEvents: events }),
  setParticipatedEvents: (events) => set({ participatedEvents: events }),
  setEvents: (events) => set({ organizedEvents: events }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setLoading: (loading) => set({ isLoading: loading }),
  setIsLoadingOrganized: (loading) => set({ isLoadingOrganized: loading }),
  setIsLoadingParticipated: (loading) => set({ isLoadingParticipated: loading }),
  setError: (error) => set({ error }),
  clearEvents: () => set({ 
    organizedEvents: [], 
    participatedEvents: [],
    isLoading: false,
    isLoadingOrganized: false,
    isLoadingParticipated: false,
    error: null,
  }),
}));