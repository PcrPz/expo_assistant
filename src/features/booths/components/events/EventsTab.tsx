// src/features/booths/components/events/EventsTab.tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { EventCard } from './EventCard';
import { CreateEventModal } from './CreateEventModal';
import { EventDetailModal } from './EventDetailModal';
import { EditEventModal } from './EditEventModal';
import { getBoothEvents, getBoothEventDetail } from '../../api/eventApi';
import type { BoothEvent, BoothEventDetail } from '../../types/event.types';

interface EventsTabProps {
  expoID: string;
  boothID: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function EventsTab({
  expoID,
  boothID,
  canCreate,
  canEdit,
  canDelete,
}: EventsTabProps) {
  const [events, setEvents] = useState<BoothEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // date filter: 'all' | 'upcoming' | 'ongoing' | 'past'
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BoothEventDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [expoID, boothID]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getBoothEvents(expoID, boothID);
      setEvents(data);
    } catch (error) {
      alert('ไม่สามารถโหลดกิจกรรมได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (eventID: string) => {
    try {
      const detail = await getBoothEventDetail(expoID, eventID);
      setSelectedEvent(detail);
      setIsDetailModalOpen(true);
    } catch (error) {
      alert('ไม่สามารถโหลดรายละเอียดกิจกรรมได้');
    }
  };

  const handleEdit = async (eventID: string) => {
    try {
      const detail = await getBoothEventDetail(expoID, eventID);
      setSelectedEvent(detail);
      setIsEditModalOpen(true);
    } catch (error) {
      alert('ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้');
    }
  };

  const handleEditFromDetail = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleRefreshFromDetail = async () => {
    await fetchEvents();
    if (selectedEvent) {
      try {
        const updated = await getBoothEventDetail(expoID, selectedEvent.EventID);
        setSelectedEvent(updated);
      } catch {
        setIsDetailModalOpen(false);
        setSelectedEvent(null);
      }
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.Title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (dateFilter !== 'all') {
      const now = new Date();
      const start = new Date(e.StartDate);
      const end = new Date(e.EndDate);
      if (dateFilter === 'upcoming' && !(start > now)) return false;
      if (dateFilter === 'ongoing' && !(start <= now && end >= now)) return false;
      if (dateFilter === 'past' && !(end < now)) return false;
    }

    return true;
  });

  // Sort: upcoming first → by StartDate asc
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime()
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">กิจกรรมของบูธ</h2>
          <p className="text-sm text-gray-400 mt-0.5">จัดการกิจกรรมและอีเวนต์ต่างๆ ของบูธ</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            สร้างกิจกรรม
          </button>
        )}
      </div>

      {/* Search + Date Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหากิจกรรม..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-white"
          />
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
          className="px-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] bg-white w-full sm:w-[180px]"
        >
          <option value="all">ทั้งหมด</option>
          <option value="upcoming">กำลังจะมาถึง</option>
          <option value="ongoing">กำลังดำเนินการ</option>
          <option value="past">ผ่านไปแล้ว</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F0]">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-500">
            {searchQuery || dateFilter !== 'all' ? 'ไม่พบกิจกรรมที่ค้นหา' : 'ยังไม่มีกิจกรรม'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery || dateFilter !== 'all'
              ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองของคุณ'
              : canCreate
              ? 'เริ่มต้นสร้างกิจกรรมแรกของบูธ'
              : 'ยังไม่มีกิจกรรมในบูธนี้'}
          </p>
          {canCreate && !searchQuery && dateFilter === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition"
            >
              <Plus className="w-4 h-4" />
              สร้างกิจกรรมแรก
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEvents.map((event) => (
            <EventCard
              key={event.EventID}
              event={event}
              canManage={canEdit && canDelete}
              expoID={expoID}
              boothID={boothID}
              onView={() => handleViewDetail(event.EventID)}
              onEdit={() => handleEdit(event.EventID)}
              onRefresh={fetchEvents}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateEventModal
        expoID={expoID}
        boothID={boothID}
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => { setIsCreateModalOpen(false); fetchEvents(); }}
      />

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          expoID={expoID}
          boothID={boothID}
          open={isDetailModalOpen}
          canManage={canEdit && canDelete}
          onClose={() => { setIsDetailModalOpen(false); setSelectedEvent(null); }}
          onEdit={handleEditFromDetail}
          onRefresh={handleRefreshFromDetail}
        />
      )}

      <EditEventModal
        expoID={expoID}
        boothID={boothID}
        event={selectedEvent}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          fetchEvents();
          if (isDetailModalOpen) handleRefreshFromDetail();
        }}
      />
    </div>
  );
}