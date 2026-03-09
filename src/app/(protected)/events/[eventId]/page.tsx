// src/app/(protected)/events/[eventId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEventWithRole } from '@/src/features/events/api/eventApi';
import type { Event } from '@/src/features/events/types/event.types';
import { 
  isEventOrganizer, 
  isBoothStaff,
  isBoothStaffVisitor,
  getAvailableTabs 
} from '@/src/features/events/types/event.types';
import { EventDetailHeader } from '@/src/features/events/components/detail/EventDetailHeader';
import { StaffTab } from '@/src/features/staff/components/StaffTab';

import { BoothTab } from '@/src/features/booths/components/BoothTab';
import { DetailTab } from '@/src/features/events/components/detail/DetailTab';

// ✅ เพิ่ม Components ใหม่
import { PaymentDepositSection } from '@/src/features/events/components/PaymentDepositSection';
import { PublishEventSection } from '@/src/features/events/components/PublishEventSection';
import { BoothApplicationsTab } from '@/src/features/events/components/BoothApplicationsTab';
import { DashboardTab } from '@/src/features/events/components/detail/DashboardTab';

// ✅ Tab Type - ลบ invitations
type TabType = 'detail' | 'staff' | 'booth' | 'dashboard' | 'applications';

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
        setActiveTab('detail');
      } else if (isBoothStaffVisitor(foundEvent.role)) {
        setActiveTab('detail'); // ดูได้แค่ detail
      }
      
    } catch (error) {
      console.error('Failed to load event:', error);
      router.push('/home');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Refresh event after payment
  const handlePaymentSuccess = () => {
    console.log('💰 Payment successful, refreshing event...');
    loadEvent();
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

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ✅ Payment Deposit Section - แสดงเฉพาะ Owner + Pending */}
        {isEventOrganizer(event.role) && event.status === 'pending' && (
          <PaymentDepositSection 
            eventId={event.expoID}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* ✅ Publish Event Section - แสดงเฉพาะ Owner/Admin + Unpublish */}
        {(event.role === 'owner' || event.role === 'admin') && event.status === 'unpublish' && (
          <PublishEventSection 
            eventId={event.expoID}
            onPublishSuccess={handlePaymentSuccess}
          />
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'detail' && (
            <DetailTab event={event} role={event.role} />
          )}
          
          {activeTab === 'staff' && isEventOrganizer(event.role) && (
            <StaffTab 
              expoId={event.expoID}
              userRole={event.role}
            />
          )}
          
          {activeTab === 'booth' && (
            <BoothTab 
              expoId={event.expoID}
              role={event.role}
            />
          )}
          
          {activeTab === 'dashboard' && (
            <DashboardTab 
              eventId={event.expoID}
              role={event.role}
            />
          )}

          {/* ✅ TAB ใหม่: คำขอเข้าบูธ */}
          {activeTab === 'applications' && isEventOrganizer(event.role) && (
            <BoothApplicationsTab eventId={event.expoID} />
          )}
        </div>
      </div>
    </div>
  );
}