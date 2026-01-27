// src/features/events/hooks/useLoadEvents.ts

import { useEffect } from 'react';
import { useEventStore } from '../store/eventStore';
import { getOrganizedEvents, getParticipatedEvents } from '../api/eventApi';

/**
 * Hook สำหรับโหลด Events ทั้งหมด
 * ใช้ใน HomePage, DashboardSidebar
 */
export function useLoadEvents() {
  const {
    organizedEvents,
    participatedEvents,
    isLoading,
    error,
    setOrganizedEvents,
    setParticipatedEvents,
    setLoading,
    setError,
  } = useEventStore();

  useEffect(() => {
    loadAllEvents();
  }, []);

  const loadAllEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // โหลดทั้ง 2 แบบพร้อมกัน
      const [organized, participated] = await Promise.all([
        getOrganizedEvents(),
        getParticipatedEvents(),
      ]);

      setOrganizedEvents(organized);
      setParticipatedEvents(participated);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  return {
    organizedEvents,
    participatedEvents,
    isLoading,
    error,
    reload: loadAllEvents,
  };
}