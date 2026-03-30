// src/features/events/hooks/useLoadEvents.ts

import { useEffect } from 'react';
import { useEventStore } from '../store/eventStore';
import { getAllMyEvents } from '../api/eventApi';

/**
 * Hook สำหรับโหลด Events ทั้งหมด
 * ใช้ใน HomePage, DashboardSidebar
 *
 * เรียก API ครั้งเดียว (/expo/get-my-expo-list) แล้ว
 * แยก organized / participated ด้วย role filter ในฝั่ง client
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

      // เรียก API เดียว แล้ว split ผลลัพธ์ตาม role
      const { organized, participated } = await getAllMyEvents();

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