// src/features/events/components/create/SummaryPreview.tsx
'use client';

import { useState, useEffect } from 'react';
import { createEvent } from '../../api/eventApi';
import { createZonesBatch } from '@/src/features/zones/api/zoneApi';
import type { CreateEventRequest } from '../../types/event.types';
import type { ZoneWithFile } from '@/src/features/zones/api/zoneApi';

interface SummaryPreviewProps {
  formData: CreateEventRequest;
  zones: ZoneWithFile[];
  onNext?: () => void;  // ✅ Make optional (ไม่ใช้ใน 3-step version)
  onBack: () => void;
  onEventCreated: (expoId: string) => void;
}

export default function SummaryPreview({ 
  formData, 
  zones,
  onNext, 
  onBack, 
  onEventCreated 
}: SummaryPreviewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (formData.logoFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(formData.logoFile);
    }
    
    if (formData.bannerFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(formData.bannerFile);
    }
  }, [formData.logoFile, formData.bannerFile]);

  const handleCreateEvent = async () => {
    try {
      setIsCreating(true);
      setError(null);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 CREATE EVENT - Started');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 formData:', formData);
      console.log('🏷️ zones:', zones);
      console.log('📊 zones.length:', zones.length);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Step 1: สร้าง Event
      setProgress('กำลังสร้างงาน...');
      const response = await createEvent(formData);
      
      if (!response) {
        throw new Error('ไม่สามารถสร้างงานได้');
      }
      
      console.log('✅ Event created!');
      console.log('📦 Response:', response);
      console.log('🔑 expoID:', response.expoID);
      
      const expoID = response.expoID;
      
      // Step 2: สร้าง Zones
      if (zones && zones.length > 0) {
        setProgress(`กำลังสร้างโซน (${zones.length} โซน)...`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🏗️ Creating ${zones.length} zones...`);
        console.log('🔑 For expoID:', expoID);
        console.log('📦 Zones to create:', JSON.stringify(zones, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const zoneResult = await createZonesBatch(expoID, zones);
        
        console.log('✅ Zones result:', zoneResult);
        console.log('  - Success:', zoneResult.success);
        console.log('  - Failed:', zoneResult.failed);
        
        if (zoneResult.failed > 0) {
          console.error('❌ Zone errors:', zoneResult.errors);
        }
      } else {
        console.log('⚠️ No zones to create');
      }
      
      console.log('✅ All done!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      onEventCreated(expoID);
      
      // ✅ Call onNext only if provided (for 5-step version)
      // In 3-step version, we redirect directly via onEventCreated
      if (onNext) {
        onNext();
      }

    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">ตรวจสอบข้อมูล</h2>
        <p className="text-sm text-gray-500 text-center">ตรวจสอบความถูกต้องก่อนสร้างงาน</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-red-800 text-sm">เกิดข้อผิดพลาด</p>
              <p className="text-red-700 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {isCreating && progress && (
        <div className="bg-blue-50 border-l-4 border-[#3674B5] p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#3674B5] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            <p className="text-[#3674B5] font-medium text-sm">{progress}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {/* ข้อมูลหลัก */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#3674B5] text-white rounded-lg flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h3 className="text-lg font-bold text-gray-900">ข้อมูลงาน</h3>
          </div>

          <div className="space-y-5">
            {/* ชื่อและประเภท */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="ชื่องาน" value={formData.name} />
              <InfoItem label="ประเภท" value={formData.category} />
            </div>

            {/* วันที่และเวลา */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem 
                label="วันที่" 
                value={`${formatDate(formData.startDate)} - ${formatDate(formData.endDate)}`} 
              />
              {(formData.startTime || formData.endTime) && (
                <InfoItem 
                  label="เวลา" 
                  value={`${formData.startTime || '-'} - ${formData.endTime || '-'} น.`} 
                />
              )}
            </div>

            {/* สถานที่ */}
            <InfoItem label="สถานที่" value={formData.location} />

            {/* รายละเอียด */}
            {formData.description && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">รายละเอียด</p>
                <p className="text-sm text-gray-900 leading-relaxed">{formData.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ข้อมูลผู้จัด */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#3674B5] text-white rounded-lg flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h3 className="text-lg font-bold text-gray-900">ข้อมูลผู้จัด</h3>
          </div>

          <div className="space-y-4">
            <InfoItem label="ชื่อผู้จัดงาน" value={formData.organizer || '-'} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="อีเมล" value={formData.email || '-'} />
              <InfoItem label="เบอร์โทร" value={formData.tel || '-'} />
            </div>

            {(formData.website1 || formData.website2) && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-3">เว็บไซต์</p>
                <div className="space-y-2">
                  {formData.website1 && (
                    <a 
                      href={formData.website1} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#3674B5] hover:underline"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      <span className="truncate">{formData.website1}</span>
                    </a>
                  )}
                  {formData.website2 && (
                    <a 
                      href={formData.website2} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#3674B5] hover:underline"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      <span className="truncate">{formData.website2}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* รูปภาพ */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#3674B5] text-white rounded-lg flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h3 className="text-lg font-bold text-gray-900">รูปภาพ</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* รูปโปรโมท */}
            {logoPreview && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-3">รูปภาพโปรโมท</p>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={logoPreview} 
                    alt="Logo" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 truncate">{formData.logoFile?.name}</p>
              </div>
            )}
            
            {/* แผนผัง */}
            {bannerPreview && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-3">แผนผังงาน</p>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={bannerPreview} 
                    alt="Map" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 truncate">{formData.bannerFile?.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* โซน */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#3674B5] text-white rounded-lg flex items-center justify-center text-sm font-bold">
              4
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              โซนภายในงาน
              {zones && zones.length > 0 && (
                <span className="ml-2 text-[#3674B5] text-base font-normal">({zones.length} โซน)</span>
              )}
            </h3>
          </div>

          {zones && zones.length > 0 ? (
            <div className="space-y-3">
              {zones.map((zone, index) => (
                <ZoneCard key={index} zone={zone} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg 
                className="w-12 h-12 text-gray-400 mx-auto mb-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <p className="text-gray-500 text-sm">ไม่มีโซนในงาน</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-6 flex justify-between border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          disabled={isCreating}
          className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={handleCreateEvent}
          disabled={isCreating}
          className="px-8 py-2.5 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              กำลังสร้างงาน...
            </>
          ) : (
            <>
              <span>ดำเนินการต่อ</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="5 12 10 17 20 7"></polyline>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Helper Components
// ============================================

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

function ZoneCard({ zone, index }: { zone: ZoneWithFile; index: number }) {
  const [zonePreview, setZonePreview] = useState<string | null>(null);

  useEffect(() => {
    if (zone.mapFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setZonePreview(reader.result as string);
      };
      reader.readAsDataURL(zone.mapFile);
    }
  }, [zone.mapFile]);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-3">
        {/* Number */}
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#3674B5] to-[#498AC3] text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
          {index + 1}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-base mb-1">{zone.title}</h4>
          
          {zone.description && (
            <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
          )}
          
          {/* Zone Map */}
          {zonePreview ? (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">แผนที่โซน</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <img 
                  src={zonePreview} 
                  alt={zone.title} 
                  className="w-full h-32 object-cover"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 truncate">{zone.mapFile?.name}</p>
            </div>
          ) : zone.mapFile ? (
            <p className="text-xs text-gray-500 mt-2">
              📎 {zone.mapFile.name}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function formatDate(dateString: string): string {
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