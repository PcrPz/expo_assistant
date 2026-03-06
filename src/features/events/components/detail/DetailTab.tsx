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
        {/* Header with Buttons */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{getCategoryLabel(event.category)}</span>
            </div>
          </div>
          
          {/* ✅ Action Buttons */}
          <div className="flex gap-3 flex-shrink-0">
            {/* ✅ ปุ่มค้นหาบูธ (เฉพาะ Organizer) */}
            {(role === 'system_admin' || role === 'owner' || role === 'admin') && (
              <button
                onClick={() => router.push(`/events/${event.expoID}/explore-booths`)}
                className="px-4 py-2.5 bg-white border-2 border-[#3674B5] text-[#3674B5] rounded-lg font-medium hover:bg-[#3674B5] hover:text-white transition flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <span>ค้นหาบูธ</span>
              </button>
            )}
            
            {/* ปุ่มแก้ไขเดิม */}
            {showEditButton && (
              <button
                onClick={() => router.push(`/events/${event.expoID}/edit`)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>แก้ไข</span>
              </button>
            )}
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* วันที่ */}
          <InfoCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            }
            label="วันที่จัดงาน"
            value={dateRange}
            color="blue"
          />

          {/* เวลา */}
          {timeRange !== '-' && (
            <InfoCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              }
              label="เวลา"
              value={timeRange}
              color="purple"
            />
          )}

          {/* สถานที่ */}
          <InfoCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            }
            label="สถานที่"
            value={event.location}
            color="green"
          />

          {/* ผู้จัด */}
          {event.organizer && (
            <InfoCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
              }
              label="ผู้จัดงาน"
              value={event.organizer}
              color="orange"
            />
          )}
        </div>

        {/* รายละเอียด */}
        {event.description && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span className="text-[#3674B5]">รายละเอียดงาน</span>
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        )}

        {/* ช่องทางติดต่อ */}
        {(event.email || event.tel || event.website1 || event.website2) && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              ช่องทางการติดต่อ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.email && (
                <ContactItem
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  }
                  label="อีเมล"
                  value={event.email}
                />
              )}
              {event.tel && (
                <ContactItem
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  }
                  label="เบอร์โทร"
                  value={event.tel}
                />
              )}
              {event.website1 && (
                <a
                  href={event.website1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition border border-gray-200 hover:border-[#3674B5] group"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#3674B5]/10 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">เว็บไซต์หลัก</p>
                    <p className="text-sm font-medium text-[#3674B5] truncate">
                      {event.website1}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" className="flex-shrink-0">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              )}
              {event.website2 && (
                <a
                  href={event.website2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition border border-gray-200 hover:border-[#3674B5] group"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#3674B5]/10 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">ลิงก์เพิ่มเติม</p>
                    <p className="text-sm font-medium text-[#3674B5] truncate">
                      {event.website2}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" className="flex-shrink-0">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* แผนผังงาน */}
        {event.map && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              แผนผังงาน
            </h3>
            <div 
              className="relative bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-4 cursor-pointer hover:border-[#3674B5] hover:bg-gray-100 transition-all group overflow-hidden"
              onClick={() => setIsMapModalOpen(true)}
            >
              <img
                src={mapUrl || defaultMap}
                alt="Event Map"
                className="w-full h-auto max-h-96 object-contain mx-auto group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = defaultMap;
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                  <p className="text-sm font-medium text-gray-900">คลิกเพื่อดูขนาดเต็ม</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Zones */}
        {event.zones && event.zones.length > 0 && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-lg flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <span>โซนภายในงาน ({event.zones.length})</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.zones.map((zone, index) => {
                const hasMap = !!zone.map;
                
                return (
                  <div
                    key={zone.zone_id || `zone-${index}`}
                    onClick={() => handleZoneClick(zone)}
                    className="bg-white rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all group border-2 border-gray-200 hover:border-[#3674B5]"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#3674B5] to-[#498AC3] text-white rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#3674B5] transition-colors truncate">
                          {zone.title}
                        </h4>
                        {zone.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {zone.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      {hasMap ? (
                        <div className="flex items-center gap-2 text-[#3674B5] bg-[#3674B5]/10 px-3 py-1 rounded-full">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span className="text-xs font-semibold">มีแผนที่</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          <span className="text-xs font-semibold">ไม่มีแผนที่</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-[#3674B5] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold">ดูเพิ่มเติม</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
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

      {/* Modals */}
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

// =============== COMPONENTS ===============

interface InfoCardProps {
  icon: React.ReactElement;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function InfoCard({ icon, label, value, color }: InfoCardProps) {
  const colors = {
    blue: 'bg-white border-[#3674B5]/20',
    green: 'bg-white border-[#498AC3]/20',
    purple: 'bg-white border-[#749BC2]/20',
    orange: 'bg-white border-[#91C8E4]/20',
  };

  const iconBgColors = {
    blue: 'bg-[#3674B5]/10',
    green: 'bg-[#498AC3]/10',
    purple: 'bg-[#749BC2]/10',
    orange: 'bg-[#91C8E4]/10',
  };

  const iconColors = {
    blue: '#3674B5',
    green: '#498AC3',
    purple: '#749BC2',
    orange: '#91C8E4',
  };

  return (
    <div className={`${colors[color]} rounded-xl p-4 border-2 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${iconBgColors[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <div style={{ color: iconColors[color] }}>
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface ContactItemProps {
  icon: React.ReactElement;
  label: string;
  value: string;
}

function ContactItem({ icon, label, value }: ContactItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
        <div style={{ color: '#3674B5' }}>
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

// Map Modal (ใช้เดิม)
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

// Zone Detail Modal (ใช้เดิมแต่ปรับสีธีม)
interface ZoneDetailModalProps {
  zone: Zone;
  zoneNumber: number;
  onClose: () => void;
}

function ZoneDetailModal({ zone, zoneNumber, onClose }: ZoneDetailModalProps) {
  const zoneMapUrl = zone.map ? getMinioFileUrl(zone.map) : null;
  const defaultMap = 'https://via.placeholder.com/800x600/E5E7EB/6B7280?text=No+Zone+Map';

  console.log('🗺️ Zone Detail Modal:');
  console.log('  zone:', zone);
  console.log('  zone.map:', zone.map);
  console.log('  zoneMapUrl:', zoneMapUrl);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - เปลี่ยนเป็นสีธีม */}
        <div className="bg-gradient-to-r from-[#3674B5] to-[#498AC3] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-[#3674B5] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
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
                    console.error('❌ Zone map failed to load:', zoneMapUrl);
                    e.currentTarget.src = defaultMap;
                  }}
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 font-semibold">ไม่มีแผนที่สำหรับโซนนี้</p>
                <p className="text-sm text-gray-400 mt-1">สามารถเพิ่มแผนที่ได้ในหน้าแก้ไขงาน</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white rounded-lg hover:shadow-lg font-medium transition flex items-center gap-2"
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