// src/app/events/[eventId]/booths/[boothId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { BoothDetailClient } from "@/src/features/booths/components/BoothDetailClient";
import { useEffect, useState } from 'react';
import { getEventWithRole } from '@/src/features/events/api/eventApi';
import type { Event } from '@/src/features/events/types/event.types';

/**
 * ✅ Client Component - ดึง role จาก event ฝั่ง client
 */
export default function BoothDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const boothId = params.boothId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        const foundEvent = await getEventWithRole(eventId);
        setEvent(foundEvent);
      } catch (error) {
        console.error('Failed to load event:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadEvent();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3674B5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบงาน</h2>
          <p className="text-gray-600">ไม่สามารถโหลดข้อมูลงานได้</p>
        </div>
      </div>
    );
  }

  return (
    <BoothDetailClient 
      eventId={eventId} 
      boothId={boothId}
      userRole={event.role}
    />
  );
}