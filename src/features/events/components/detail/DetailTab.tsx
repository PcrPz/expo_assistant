// src/features/events/components/detail/DetailTab.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Event, EventRole, Zone } from '../../types/event.types';
import { canEditEvent } from '../../types/event.types';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';

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
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear() + 543;
  
  return `${day} ${month} ${year}`;
}

export function DetailTab({ event, role }: DetailTabProps) {
  const router = useRouter();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isZoneDetailModalOpen, setIsZoneDetailModalOpen] = useState(false);
  
  const mapUrl = getMinioFileUrl(event.map);
  const defaultMap = 'https://via.placeholder.com/800x600/5B9BD5/FFFFFF?text=No+Map';
  
  const showEditButton = canEditEvent(role);

  const dateRange = `${formatThaiDate(event.startDate)} - ${formatThaiDate(event.endDate)}`;
  const timeRange = event.startTime && event.endTime 
    ? `${event.startTime} - ${event.endTime} น.`
    : '-';

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
    setIsZoneDetailModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
          </div>
          
          {showEditButton && (
            <button
              onClick={() => router.push(`/events/${event.expoID}/edit`)}
              className="px-6 py-2.5 bg-[#5B9BD5] text-white rounded-lg font-medium hover:bg-[#4A8BC2] transition flex items-center gap-2 flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>แก้ไข</span>
            </button>
          )}
        </div>

        {/* รายละเอียด */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <DetailRow label="ประเภท" value={event.category} isFirst />
          <DetailRow label="วันที่" value={dateRange} />
          
          {timeRange !== '-' && (
            <DetailRow label="เวลา" value={timeRange} />
          )}
          
          <DetailRow label="สถานที่" value={event.location} />
          
          {event.description && (
            <DetailRow
              label="รายละเอียด"
              value={<p className="whitespace-pre-line leading-relaxed text-gray-700">{event.description}</p>}
            />
          )}
          
          {event.organizer && (
            <DetailRow label="ผู้จัด" value={event.organizer} />
          )}
          
          {(event.email || event.tel) && (
            <DetailRow
              label="ช่องทางการติดต่อ"
              value={
                <div className="space-y-1.5">
                  {event.email && (
                    <p className="text-gray-700">
                      <span className="text-gray-500 text-sm">อีเมล:</span> {event.email}
                    </p>
                  )}
                  {event.tel && (
                    <p className="text-gray-700">
                      <span className="text-gray-500 text-sm">เบอร์โทร:</span> {event.tel}
                    </p>
                  )}
                </div>
              }
            />
          )}

          {(event.website1 || event.website2) && (
            <DetailRow
              label="เว็บไซต์"
              value={
                <div className="flex flex-wrap gap-3">
                  {event.website1 && (
                    <a
                      href={event.website1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#5B9BD5] hover:text-[#4A8BC2] hover:underline font-medium"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      เว็บไซต์หลัก
                    </a>
                  )}

                  {event.website2 && (
                    <a
                      href={event.website2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#5B9BD5] hover:text-[#4A8BC2] hover:underline font-medium"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      ลิงก์เพิ่มเติม
                    </a>
                  )}
                </div>
              }
            />
          )}

          {event.map && (
            <DetailRow
              label="แผนผังงาน"
              value={
                <div className="space-y-2">
                  <div 
                    className="bg-white rounded-lg border-2 border-gray-300 p-4 cursor-pointer hover:border-[#5B9BD5] transition-all"
                    onClick={() => setIsMapModalOpen(true)}
                  >
                    <img
                      src={mapUrl || defaultMap}
                      alt="Event Map"
                      className="w-full h-auto max-h-80 object-contain mx-auto hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = defaultMap;
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    คลิกที่รูปเพื่อดูขนาดเต็ม
                  </p>
                </div>
              }
            />
          )}
        </div>

        {/* ✅ Zones Section */}
        {event.zones && event.zones.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              โซนภายในงาน ({event.zones.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.zones.map((zone, index) => {
                // 🔍 Debug: ดูข้อมูลแต่ละ zone
                console.log(`=== ZONE ${index + 1} ===`);
                console.log('Raw zone data:', zone);
                console.log('zone_id:', zone.zone_id, '(type:', typeof zone.zone_id, ')');
                console.log('title:', zone.title);
                console.log('description:', zone.description);
                console.log('map:', zone.map);
                console.log('Has zone_id?', !!zone.zone_id);
                console.log('==================');
                
                const hasMap = !!zone.map;
                
                return (
                  <div
                    key={zone.zone_id || `zone-${index}`}
                    onClick={() => handleZoneClick(zone)}
                    className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#5B9BD5] hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#5B9BD5] text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-[#5B9BD5] transition-colors">
                          {zone.title}
                        </h4>
                        {zone.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {zone.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      {hasMap ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="text-xs font-medium">มีแผนที่</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          <span className="text-xs font-medium">ไม่มีแผนที่</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-[#5B9BD5] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>ดูรายละเอียด</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isMapModalOpen && (
        <MapModal
          title={`แผนผังงาน - ${event.name}`}
          imageUrl={mapUrl || defaultMap}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}

      {isZoneDetailModalOpen && selectedZone && (
        <ZoneDetailModal
          zone={selectedZone}
          zoneNumber={(event.zones?.findIndex(
            z => z.zone_id === selectedZone.zone_id
          ) ?? -1) + 1}
          onClose={() => {
            setIsZoneDetailModalOpen(false);
            setSelectedZone(null);
          }}
        />
      )}
    </>
  );
}

// Components
interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}

function DetailRow({ label, value, isFirst, isLast }: DetailRowProps) {
  return (
    <div className={`flex flex-col md:flex-row ${isLast ? '' : 'border-b border-gray-100'}`}>
      <div className="md:w-1/4 px-6 py-4 bg-gray-50">
        <p className="font-medium text-gray-600 text-sm">{label}:</p>
      </div>
      <div className="md:w-3/4 px-6 py-4 bg-white">
        <div className="text-gray-900">{value}</div>
      </div>
    </div>
  );
}

interface MapModalProps {
  title: string;
  imageUrl: string;
  onClose: () => void;
}

function MapModal({ title, imageUrl, onClose }: MapModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-black/70 via-black/80 to-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div className="relative max-w-7xl w-full h-full flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition shadow-lg"
          aria-label="ปิด"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex-1 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-full object-contain drop-shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/800x600/5B9BD5/FFFFFF?text=Image+Not+Found';
            }}
          />
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-t-xl p-4 text-center shadow-lg">
          <p className="text-gray-700 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );
}

interface ZoneDetailModalProps {
  zone: Zone;
  zoneNumber: number;
  onClose: () => void;
}

function ZoneDetailModal({ zone, zoneNumber, onClose }: ZoneDetailModalProps) {
  const zoneMapUrl = zone.map ? getMinioFileUrl(zone.map) : null;
  const defaultMap = 'https://via.placeholder.com/800x600/E5E7EB/6B7280?text=No+Zone+Map';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#5B9BD5] to-[#4A8BC2] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-[#5B9BD5] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
              {zoneNumber}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{zone.title}</h2>
              <p className="text-blue-100 text-sm">รายละเอียดโซน</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition backdrop-blur-sm"
            aria-label="ปิด"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {zone.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                คำอธิบาย
              </h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-200">
                {zone.description}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              แผนที่โซน
            </h3>
            
            {zoneMapUrl ? (
              <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
                <img
                  src={zoneMapUrl}
                  alt={`${zone.title} Map`}
                  className="w-full h-auto max-h-96 object-contain mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = defaultMap;
                  }}
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 font-medium">ไม่มีแผนที่สำหรับโซนนี้</p>
                <p className="text-sm text-gray-400 mt-1">สามารถเพิ่มแผนที่ได้ในหน้าแก้ไขงาน</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#5B9BD5] text-white rounded-lg hover:bg-[#4A8BC2] font-medium transition flex items-center gap-2"
          >
            <span>ปิด</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}