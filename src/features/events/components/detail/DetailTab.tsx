// src/features/events/components/detail/DetailTab.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Event, EventRole, Zone } from '../../types/event.types';
import { canEditEvent } from '../../types/event.types';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import { getCategoryLabel } from '../../constants/categories';

interface DetailTabProps {
  event: Event;
  role?: EventRole;
}

function formatThaiDate(dateString: string): string {
  if (!dateString) return '-';
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const date = new Date(dateString);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

export function DetailTab({ event, role }: DetailTabProps) {
  const router = useRouter();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isZoneDetailModalOpen, setIsZoneDetailModalOpen] = useState(false);

  const mapUrl = getMinioFileUrl(event.map);
  const defaultMap = 'https://via.placeholder.com/800x600/5B9BD5/FFFFFF?text=No+Map';
  const showEditButton = canEditEvent(role);

  const dateRange = `${formatThaiDate(event.startDate)} — ${formatThaiDate(event.endDate)}`;
  const timeRange = event.startTime && event.endTime
    ? `${event.startTime} — ${event.endTime} น.`
    : '-';

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
    setIsZoneDetailModalOpen(true);
  };

  const hasContact = event.email || event.tel || event.website1 || event.website2;

  return (
    <>
      <div className="space-y-4">

        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{event.name}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{getCategoryLabel(event.category)}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {(role === 'system_admin' || role === 'owner' || role === 'admin') && (
              <button
                onClick={() => router.push(`/events/${event.expoID}/explore-booths`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-[#3674B5] text-[#3674B5] bg-white hover:bg-[#EEF4FB] transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                ค้นหาบูธ
              </button>
            )}
            {showEditButton && (
              <button
                onClick={() => router.push(`/events/${event.expoID}/edit`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#3674B5] text-white hover:bg-[#2d6aa8] transition shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                แก้ไข
              </button>
            )}
          </div>
        </div>

        {/* ── Info Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoCard
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
            label="วันที่จัดงาน"
            value={dateRange}
          />
          {timeRange !== '-' && (
            <InfoCard
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
              label="เวลา"
              value={timeRange}
            />
          )}
          <InfoCard
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
            label="สถานที่"
            value={event.location}
          />
          {event.organizer && (
            <InfoCard
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>}
              label="ผู้จัดงาน"
              value={event.organizer}
            />
          )}
        </div>

        {/* ── Description ─────────────────────────────────────── */}
        {event.description && (
          <SectionCard
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
            title="รายละเอียดงาน"
          >
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </SectionCard>
        )}

        {/* ── Contact ─────────────────────────────────────────── */}
        {hasContact && (
          <SectionCard
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>}
            title="ช่องทางการติดต่อ"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {event.email && (
                <ContactItem
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                  label="อีเมล"
                  value={event.email}
                />
              )}
              {event.tel && (
                <ContactItem
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>}
                  label="เบอร์โทร"
                  value={event.tel}
                />
              )}
              {event.website1 && (
                <LinkItem
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
                  label="เว็บไซต์หลัก"
                  href={event.website1}
                />
              )}
              {event.website2 && (
                <LinkItem
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>}
                  label="ลิงก์เพิ่มเติม"
                  href={event.website2}
                />
              )}
            </div>
          </SectionCard>
        )}

        {/* ── Map ─────────────────────────────────────────────── */}
        {event.map && (
          <SectionCard
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
            title="แผนผังงาน"
          >
            <div
              className="relative bg-gray-50 rounded-xl border border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-[#3674B5] transition-all group"
              onClick={() => setIsMapModalOpen(true)}
            >
              <img
                src={mapUrl || defaultMap}
                alt="Event Map"
                className="w-full h-auto max-h-80 object-contain mx-auto group-hover:scale-[1.02] transition-transform duration-300"
                onError={(e) => { e.currentTarget.src = defaultMap; }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-all">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-lg shadow text-sm font-medium text-gray-800">
                  คลิกเพื่อดูขนาดเต็ม
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Zones ───────────────────────────────────────────── */}
        {event.zones && event.zones.length > 0 && (
          <SectionCard
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
            title="โซนภายในงาน"
            count={event.zones.length}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {event.zones.map((zone, index) => (
                <ZoneCard
                  key={zone.zone_id || `zone-${index}`}
                  zone={zone}
                  index={index}
                  onClick={() => handleZoneClick(zone)}
                />
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {isMapModalOpen && (
        <MapModal
          title={`แผนผังงาน — ${event.name}`}
          imageUrl={mapUrl || defaultMap}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}
      {isZoneDetailModalOpen && selectedZone && (
        <ZoneDetailModal
          zone={selectedZone}
          zoneNumber={(event.zones?.findIndex(z => z.zone_id === selectedZone.zone_id) ?? -1) + 1}
          onClose={() => { setIsZoneDetailModalOpen(false); setSelectedZone(null); }}
        />
      )}
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function InfoCard({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 bg-[#EEF4FB] rounded-lg flex items-center justify-center flex-shrink-0 text-[#3674B5]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, count, children }: {
  icon: React.ReactElement;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
        {icon}
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {count !== undefined && (
          <span className="text-xs text-gray-400 font-medium">{count} รายการ</span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function ContactItem({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="w-8 h-8 bg-[#EEF4FB] rounded-lg flex items-center justify-center flex-shrink-0 text-[#3674B5]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function LinkItem({ icon, label, href }: { icon: React.ReactElement; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-[#3674B5] hover:bg-[#EEF4FB] transition group"
    >
      <div className="w-8 h-8 bg-[#EEF4FB] rounded-lg flex items-center justify-center flex-shrink-0 text-[#3674B5]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-[#3674B5] truncate">{href}</p>
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
        <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
      </svg>
    </a>
  );
}

function ZoneCard({ zone, index, onClick }: { zone: Zone; index: number; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-[#3674B5] hover:shadow-md transition-all group bg-white"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#3674B5] to-[#498AC3] text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
          {index + 1}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#3674B5] transition truncate">
            {zone.title}
          </h4>
          {zone.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
              {zone.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {zone.map ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3674B5] bg-[#EEF4FB] px-2.5 py-1 rounded-md">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            มีแผนที่
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
            ไม่มีแผนที่
          </span>
        )}
        <span className="text-xs font-semibold text-[#3674B5] opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
          ดูเพิ่มเติม
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
        </span>
      </div>
    </div>
  );
}

// ── Modals (logic unchanged) ──────────────────────────────────────

function MapModal({ title, imageUrl, onClose }: { title: string; imageUrl: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-9 h-9 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center justify-center transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Image — fills viewport */}
      <div
        className="relative w-full h-full flex items-center justify-center p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title}
          className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg"
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/800x600/5B9BD5/FFFFFF?text=Image+Not+Found'; }}
        />
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 py-4 pointer-events-none">
        <p className="text-sm font-medium text-white text-center">{title}</p>
      </div>
    </div>
  );
}

function ZoneDetailModal({ zone, zoneNumber, onClose }: { zone: Zone; zoneNumber: number; onClose: () => void }) {
  const zoneMapUrl = zone.map ? getMinioFileUrl(zone.map) : null;
  const defaultMap = 'https://via.placeholder.com/800x600/E5E7EB/6B7280?text=No+Zone+Map';

  console.log('🗺️ Zone Detail Modal:');
  console.log('  zone:', zone);
  console.log('  zone.map:', zone.map);
  console.log('  zoneMapUrl:', zoneMapUrl);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#3674B5] to-[#498AC3] text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
              {zoneNumber}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{zone.title}</h2>
              <p className="text-xs text-gray-400">รายละเอียดโซน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition text-gray-500"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {zone.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">คำอธิบาย</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-200">
                {zone.description}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">แผนที่โซน</p>
            {zoneMapUrl ? (
              <div
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden cursor-zoom-in"
                onClick={() => window.open(zoneMapUrl, '_blank')}
              >
                <img
                  src={zoneMapUrl}
                  alt={`${zone.title} Map`}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    console.error('❌ Zone map failed to load:', zoneMapUrl);
                    e.currentTarget.src = defaultMap;
                  }}
                />
                <div className="px-4 py-2.5 border-t border-gray-200 flex items-center justify-end gap-1.5 bg-white">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  <span className="text-xs font-semibold text-[#3674B5]">เปิดในแท็บใหม่</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 py-10 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">ไม่มีแผนที่สำหรับโซนนี้</p>
                <p className="text-xs text-gray-400 mt-1">สามารถเพิ่มแผนที่ได้ในหน้าแก้ไขงาน</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}