// src/features/events/components/create/ZoneDetailsForm.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState, useMemo, useEffect } from 'react';
import type { Zone } from '../../types/event.types';
import type { ZoneWithFile } from '@/src/features/zones/api/zoneApi';

// ✅ Separate component for image preview (follows Rules of Hooks)
function ZoneImagePreview({ file, alt }: { file: File; alt: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Cleanup blob URL when component unmounts
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!previewUrl) {
    return (
      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
      <img
        src={previewUrl}
        alt={alt}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

interface ZoneDetailsFormProps {
  zones: Zone[];
  zonesWithFiles?: ZoneWithFile[];  // ✅ เพิ่ม prop สำหรับรับข้อมูลเดิม
  onChange: (zones: Zone[], zonesWithFiles: ZoneWithFile[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ZoneDetailsForm({ zones, zonesWithFiles: initialZonesWithFiles, onChange, onNext, onBack }: ZoneDetailsFormProps) {
  const [localZones, setLocalZones] = useState<Zone[]>(zones || []);
  const [zonesWithFiles, setZonesWithFiles] = useState<ZoneWithFile[]>(initialZonesWithFiles || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newZone, setNewZone] = useState<{
    title: string;        // ← แก้จาก name
    description?: string;
    file?: File;
  }>({ 
    title: '',           // ← แก้จาก name
    description: '' 
  });
  
  const [zoneImagePreview, setZoneImagePreview] = useState<string | null>(null);

  const handleAddZone = () => {
    if (newZone.title.trim()) {  // ← แก้จาก name
      const zoneToAdd: Zone = {
        zone_id: `zone-${Date.now()}`,  // ← แก้จาก id
        title: newZone.title,           // ← แก้จาก name
        description: newZone.description,
      };
      
      const updatedZones = [...localZones, zoneToAdd];
      setLocalZones(updatedZones);
      
      const zoneWithFile: ZoneWithFile = {
        title: newZone.title,  // ← แก้จาก name
        description: newZone.description,
        mapFile: newZone.file,
      };
      
      const updatedZonesWithFiles = [...zonesWithFiles, zoneWithFile];
      setZonesWithFiles(updatedZonesWithFiles);
      
      onChange(updatedZones, updatedZonesWithFiles);
      
      setNewZone({ title: '', description: '' });  // ← แก้จาก name
      setZoneImagePreview(null);
      setIsAdding(false);
    }
  };

  const handleRemoveZone = (index: number) => {
    const updatedZones = localZones.filter((_, i) => i !== index);
    const updatedZonesWithFiles = zonesWithFiles.filter((_, i) => i !== index);
    
    setLocalZones(updatedZones);
    setZonesWithFiles(updatedZonesWithFiles);
    onChange(updatedZones, updatedZonesWithFiles);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.warning('กรุณาเลือกไฟล์ภาพเท่านั้น (JPG, PNG, WEBP)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('ไฟล์มีขนาดใหญ่เกิน 5MB');
        return;
      }
      
      setNewZone({ ...newZone, file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setZoneImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveZoneImage = () => {
    setNewZone({ ...newZone, file: undefined });
    setZoneImagePreview(null);
  };

  return (
    <div className="space-y-8">
          <div className="pb-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">กรอกข้อมูลรายละเอียดโซน</h2>
        <p className="text-sm text-gray-500 text-center"></p>
      </div>
      {/* Zone Cards */}
      {localZones.length > 0 && (
        <div className="space-y-4 mb-6">
          {localZones.map((zone, index) => {
            const zoneFile = zonesWithFiles[index]?.mapFile;
            const isImage = zoneFile?.type.startsWith('image/');
            
            return (
              <div key={zone.zone_id || index} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">รายละเอียดโซน {index + 1}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Zone Info */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ชื่อของโซน:</p>
                        <p className="font-medium">{zone.title}</p>
                      </div>
                      {zone.description && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">รายละเอียดของโซน:</p>
                          <p className="font-medium">{zone.description}</p>
                        </div>
                      )}
                      
                      {/* Image Preview */}
                      {zoneFile && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-2">ไฟล์แผนที่:</p>
                          {isImage ? (
                            <ZoneImagePreview file={zoneFile} alt={zone.title} />
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-sm text-blue-700 font-medium">📎 {zoneFile.name}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemoveZone(index)}
                    className="ml-4 text-red-500 hover:text-red-700 transition"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Zone Form */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full md:w-auto px-8 py-3 border-2 border-[#3674B5] text-[#3674B5] font-semibold rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          เพิ่มโซน
        </button>
      ) : (
        <div className="bg-gray-50 border-2 border-[#3674B5] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">รายละเอียดโซน</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">ชื่อของโซน</label>
                <input
                  type="text"
                  value={newZone.title}
                  onChange={(e) => setNewZone({ ...newZone, title: e.target.value })}
                  placeholder="ระบุชื่อของโซน"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">รายละเอียดของโซน</label>
                <textarea
                  value={newZone.description || ''}
                  onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                  placeholder="รายละเอียดของโซน"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Right Column - Image Upload with Preview */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">แผนผังของโซน (Optional)</label>
              
              {zoneImagePreview ? (
                <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer" style={{ height: '160px' }}>
                  <img
                    src={zoneImagePreview}
                    alt="Zone Map Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      เปลี่ยน
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveZoneImage}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      ลบ
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl bg-white cursor-pointer hover:border-[#3674B5] hover:bg-[#EEF4FB] transition text-center" style={{ height: '160px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-sm font-medium text-gray-500">คลิกเพื่อเลือกรูปภาพ</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP · สูงสุด 5MB</p>
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4">
            <button
              type="button"
              onClick={handleAddZone}
              disabled={!newZone.title.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewZone({ title: '', description: '' });
                setZoneImagePreview(null);
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-6 flex justify-between border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
        >
          ← ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-8 py-2.5 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2"
        >
          <span>ดำเนินการต่อ</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="5 12 10 17 20 7"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}