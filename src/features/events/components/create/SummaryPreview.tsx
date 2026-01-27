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
  onNext: () => void;
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
  
  // ✅ State สำหรับ Preview รูป
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // ✅ Load Preview รูปจาก File
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
    onNext();

  } catch (err: any) {
    console.error('❌ Error:', err);
    setError(err.message);
  } finally {
    setIsCreating(false);
  }
};

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">ตรวจสอบข้อมูลก่อนสร้างงาน</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-red-800">เกิดข้อผิดพลาด</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {isCreating && progress && (
        <div className="mb-6 bg-blue-50 border-l-4 border-[#5B9BD5] p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-[#5B9BD5] border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-[#5B9BD5] font-medium">{progress}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* ✅ Card 1: รูปภาพ (Preview) */}
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">รูปภาพและไฟล์</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* รูปโปรโมท */}
            {logoPreview && (
              <div>
                <p className="text-sm text-gray-600 mb-3 font-medium">รูปภาพโปรโมท</p>
                <div className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="w-full h-48 object-contain rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    📎 {formData.logoFile?.name}
                  </p>
                </div>
              </div>
            )}
            
            {/* แผนผังงาน */}
            {bannerPreview && (
              <div>
                <p className="text-sm text-gray-600 mb-3 font-medium">แผนผังงาน</p>
                <div className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
                  <img 
                    src={bannerPreview} 
                    alt="Banner Preview" 
                    className="w-full h-48 object-contain rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    📎 {formData.bannerFile?.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Card 2: ข้อมูลพื้นฐาน */}
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">ข้อมูลรายละเอียดพื้นฐาน</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <InfoRow label="ชื่องาน:" value={formData.name} />
              <InfoRow label="ประเภท:" value={formData.category} />
              <InfoRow 
                label="วันที่:" 
                value={`${formData.startDate} – ${formData.endDate}`} 
              />
              {(formData.startTime || formData.endTime) && (
                <InfoRow 
                  label="เวลา:" 
                  value={`${formData.startTime || '-'} – ${formData.endTime || '-'}`} 
                />
              )}
              <InfoRow label="สถานที่:" value={formData.location} />
            </div>
            
            {/* Column 2 */}
            <div className="space-y-4">
              <InfoRow label="ผู้จัดงาน:" value={formData.organizer || '-'} />
              <InfoRow label="อีเมล:" value={formData.email || '-'} />
              <InfoRow label="เบอร์โทร:" value={formData.tel || '-'} />
              {formData.website1 && (
                <InfoRow label="Website 1:" value={formData.website1} />
              )}
              {formData.website2 && (
                <InfoRow label="Website 2:" value={formData.website2} />
              )}
            </div>
          </div>
          
          {/* รายละเอียด */}
          {formData.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2 font-medium">รายละเอียดงาน:</p>
              <p className="text-gray-900 leading-relaxed">{formData.description}</p>
            </div>
          )}
        </div>

        {/* ✅ Card 3: โซน */}
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            ข้อมูลโซนภายในงาน 
            {zones && zones.length > 0 && (
              <span className="ml-2 text-[#5B9BD5]">({zones.length} โซน)</span>
            )}
          </h3>
          
          {zones && zones.length > 0 ? (
            <div className="space-y-4">
              {zones.map((zone, index) => (
                <ZoneCard 
                  key={index} 
                  zone={zone} 
                  index={index} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg 
                className="w-12 h-12 text-gray-400 mx-auto mb-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                />
              </svg>
              <p className="text-gray-500">ไม่มีโซนในงาน</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isCreating}
          className="px-12 py-4 border-2 border-[#5B9BD5] text-[#5B9BD5] text-lg font-semibold rounded-xl hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={handleCreateEvent}
          disabled={isCreating}
          className="px-12 py-4 bg-[#5B9BD5] text-white text-lg font-semibold rounded-xl hover:bg-[#4A8BC2] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          {isCreating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              กำลังสร้างงาน...
            </>
          ) : (
            'ดำเนินการต่อ'
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Helper Components
// ============================================

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

// ✅ Zone Card Component
function ZoneCard({ zone, index }: { zone: ZoneWithFile; index: number }) {
  const [zonePreview, setZonePreview] = useState<string | null>(null);

  // Load zone image preview
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
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
      <div className="flex items-start gap-4">
        {/* Number Badge */}
        <div className="flex-shrink-0 w-10 h-10 bg-[#5B9BD5] text-white rounded-full flex items-center justify-center font-bold">
          {index + 1}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-lg mb-2">{zone.title}</h4>
          
          {zone.description && (
            <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
          )}
          
          {/* Zone Image Preview */}
          {zonePreview && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">แผนที่โซน:</p>
              <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                <img 
                  src={zonePreview} 
                  alt={`${zone.title} Map`} 
                  className="w-full h-32 object-contain rounded"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  📎 {zone.mapFile?.name}
                </p>
              </div>
            </div>
          )}
          
          {/* ถ้าไม่มีรูป แต่มีไฟล์ */}
          {!zonePreview && zone.mapFile && (
            <p className="text-xs text-gray-500 mt-2">
              📎 ไฟล์แผนที่: {zone.mapFile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}