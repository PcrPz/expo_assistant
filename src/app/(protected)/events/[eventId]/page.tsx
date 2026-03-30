// src/app/(protected)/events/[eventId]/page.tsx
'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
import { TicketsTab } from '@/src/features/events/components/tickets/TicketsTab';
import { getTicketList } from '@/src/features/events/api/ticketApi';
import { getBoothsByExpoId } from '@/src/features/booths/api/boothApi';
import { PublishReadinessSection } from '@/src/features/events/components/PublishReadinessSection';
import { ExpoAnnouncementTab } from '@/src/features/events/components/announcements/ExpoAnnouncementTab';
import { CheckoutTab } from '@/src/features/events/components/checkout/CheckoutTab';
import { ExpoFormTab } from '@/src/features/events/components/forms/ExpoFormTab';

// ✅ Tab Type
type TabType = 'detail' | 'staff' | 'booth' | 'form' | 'dashboard' | 'applications' | 'tickets' | 'announcements' | 'checkout';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const searchParams = useSearchParams();
  const fromExplore = searchParams.get('from') === 'explore';
  const [hasBooths, setHasBooths] = useState(false);
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('detail');
  const [hasTickets, setHasTickets] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

const loadEvent = async () => {
    try {
      setIsLoading(true);
      // 1. ดึงข้อมูล Event หลัก (ต้องรออันนี้ก่อน)
      const foundEvent = await getEventWithRole(eventId);

      if (!foundEvent) {
        router.push('/home');
        return;
      }

      setEvent(foundEvent);

      // 2. จัดการเรื่อง Tab (ห้ามใส่ return; เด็ดขาด)
      const tabParam = searchParams.get('tab') as TabType | null;
      if (tabParam) {
        setActiveTab(tabParam);
      } else {
        // Default tab logic
        if (isEventOrganizer(foundEvent.role)) {
          setActiveTab('detail');
        } else if (isBoothStaff(foundEvent.role)) {
          setActiveTab('detail');
        } else if (isBoothStaffVisitor(foundEvent.role)) {
          setActiveTab('detail');
        }
      }

      // 3. เช็คความพร้อม (รันแบบ Background ไม่ต้องรอให้หน้าเว็บหมุนค้าง)
      if (isEventOrganizer(foundEvent.role)) {
        // เช็คตั๋ว
        getTicketList(foundEvent.expoID)
          .then((tickets) => setHasTickets(tickets.length > 0))
          .catch(() => setHasTickets(false));

        // เช็คบูธ
        getBoothsByExpoId(foundEvent.expoID)
          .then((booths) => setHasBooths(booths.length > 0))
          .catch(() => setHasBooths(false));
      }

    } catch (error) {
      console.error('Failed to load event:', error);
      // router.push('/home'); // เปิดไว้ถ้าอยากให้เด้งกลับหน้าโฮมเวลาพัง
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Refresh event after payment or ticket change
  const handlePaymentSuccess = () => {
    console.log('💰 Payment successful, refreshing event...');
    loadEvent();
  };

  // ✅ Refresh hasTickets แบบ realtime เมื่อสร้าง/ลบตั๋ว
  const refreshTickets = async () => {
    if (!event) return;
    try {
      const tickets = await getTicketList(event.expoID);
      setHasTickets(tickets.length > 0);
    } catch {
      setHasTickets(false);
    }
  };

  const refreshBooths = async () => {
    if (!event) return;
    try {
      const booths = await getBoothsByExpoId(event.expoID);
      setHasBooths(booths.length > 0);
    } catch {
      setHasBooths(false);
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

  const availableTabs = getAvailableTabs(event.role, event.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <EventDetailHeader
        event={event}
        role={event.role}
        activeTab={activeTab}
        availableTabs={availableTabs}
        onTabChange={(tab) => {
          setActiveTab(tab);
          router.replace(`/events/${eventId}?tab=${tab}`, { scroll: false });
        }}
        backUrl={fromExplore ? '/booths/explore-events' : undefined}
      />

      <div className="max-w-screen-xl mx-auto px-8 py-6 space-y-6">
        {/* ✅ Payment Deposit Section - แสดงเฉพาะ Owner + Pending */}
        {isEventOrganizer(event.role) && event.status === 'pending' && (
          <PaymentDepositSection 
            eventId={event.expoID}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* ✅ Publish Event Section - แสดงเฉพาะ Owner/Admin + Unpublish */}
        {(event.role === 'owner' || event.role === 'admin') && event.status === 'unpublish' && (
        (hasTickets && hasBooths) ? (
          <PublishEventSection
            eventId={event.expoID}
            onPublishSuccess={loadEvent}
          />
        ) : (
          <PublishReadinessSection
            hasTickets={hasTickets}
            hasBooths={hasBooths}
            onGoToTickets={() => setActiveTab('tickets')}
            onGoToBooth={() => setActiveTab('booth')}
          />
        )
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
              expoMap={event.map}
              onBoothChange={refreshBooths}
            />
          )}
          
          {activeTab === 'form' && (
            <ExpoFormTab
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

          {/* ✅ TAB ใหม่: ตั๋ว */}
          {activeTab === 'tickets' && isEventOrganizer(event.role) && (
            <TicketsTab
              expoID={event.expoID}
              canManage={event.role === 'owner' || event.role === 'admin'}
              onTicketsChange={refreshTickets}
            />
          )}

          {/* ✅ TAB ใหม่: ประกาศจากงาน */}
          {activeTab === 'announcements' && (
            <ExpoAnnouncementTab expoID={event.expoID} role={event.role} />
          )}

          {/* ✅ TAB ใหม่: สรุปและจัดการการเงิน */}
          {activeTab === 'checkout' && (
            <CheckoutTab expoID={event.expoID} role={event.role} onComplete={loadEvent} />
          )}
        </div>
      </div>
    </div>
  );
}