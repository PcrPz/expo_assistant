// src/app/(protected)/events/[eventId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEventWithRole } from '@/src/features/events/api/eventApi';
import type { Event } from '@/src/features/events/types/event.types';
import { 
  isEventOrganizer, 
  isBoothStaff,
  getAvailableTabs 
} from '@/src/features/events/types/event.types';
import { EventDetailHeader } from '@/src/features/events/components/detail/EventDetailHeader';
import { StaffTab } from '@/src/features/staff/components/StaffTab';
import { DashboardTab } from '@/src/features/booths/components/DashboardTab';
import { BoothTab } from '@/src/features/booths/components/BoothTab';
import { DetailTab } from '@/src/features/events/components/detail/DetailTab';

type TabType = 'detail' | 'staff' | 'booth' | 'dashboard';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('detail');

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      
      const foundEvent = await getEventWithRole(eventId);
      
      if (!foundEvent) {
        console.error('❌ Event not found');
        router.push('/home');
        return;
      }
      
      console.log('✅ Event loaded with role:', foundEvent.role);
      setEvent(foundEvent);
      
      // Set default tab based on role
      if (isEventOrganizer(foundEvent.role)) {
        setActiveTab('detail');
      } else if (isBoothStaff(foundEvent.role)) {
        setActiveTab('dashboard');
      }
      
    } catch (error) {
      console.error('Failed to load event:', error);
      router.push('/home');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4A8BC2] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">ไม่พบงานนี้</p>
          <button
            onClick={() => router.push('/home')}
            className="mt-4 px-6 py-2 bg-[#4A8BC2] text-white rounded-lg hover:bg-[#3A7AB2]"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  const availableTabs = getAvailableTabs(event.role);

  return (
    <div className="min-h-screen bg-gray-50">
      <EventDetailHeader
        event={event}
        role={event.role}
        activeTab={activeTab}
        availableTabs={availableTabs}
        onTabChange={setActiveTab}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'detail' && (
            <DetailTab event={event} role={event.role} />
          )}
          
          {activeTab === 'staff' && isEventOrganizer(event.role) && (
            <StaffTab 
              expoId={event.id}
              userRole={event.role}
            />
          )}
          
          {/* ✅ แก้ตรงนี้ - ใช้ expoId แทน eventId */}
          {activeTab === 'booth' && (
            <BoothTab 
              expoId={event.id}
              role={event.role}
            />
          )}
          
          {/* ✅ แก้ตรงนี้ - ใช้ expoId แทน eventId */}
          {activeTab === 'dashboard' && (
            <DashboardTab 
              expoId={event.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}