// src/features/events/components/create/ZoneDetailsForm.tsx
'use client';

import { useState } from 'react';
import type { Zone } from '../../types/event.types';
import type { ZoneWithFile } from '@/src/features/zones/api/zoneApi';

interface ZoneDetailsFormProps {
  zones: Zone[];
  onChange: (zones: Zone[], zonesWithFiles: ZoneWithFile[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ZoneDetailsForm({ zones, onChange, onNext, onBack }: ZoneDetailsFormProps) {
  const [localZones, setLocalZones] = useState<Zone[]>(zones || []);
  const [zonesWithFiles, setZonesWithFiles] = useState<ZoneWithFile[]>([]);
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
        alert('กรุณาเลือกไฟล์ภาพเท่านั้น (JPG, PNG, WEBP)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์มีขนาดใหญ่เกิน 5MB');
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
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">กรอกข้อมูลรายละเอียดโซน</h2>

      {/* Zone Cards */}
      {localZones.length > 0 && (
        <div className="space-y-4 mb-6">
          {localZones.map((zone, index) => (
            <div key={zone.zone_id || index} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">รายละเอียดบูธ {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {zonesWithFiles[index]?.mapFile && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600 mb-1">ไฟล์แผนที่:</p>
                        <p className="text-sm text-[#5B9BD5]">📎 {zonesWithFiles[index].mapFile!.name}</p>
                      </div>
                    )}
                  </div>
                </div>
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
          ))}
        </div>
      )}

      {/* Add Zone Form */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full md:w-auto px-8 py-3 border-2 border-[#5B9BD5] text-[#5B9BD5] font-semibold rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          เพิ่มโซน
        </button>
      ) : (
        <div className="bg-gray-50 border-2 border-[#5B9BD5] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">รายละเอียดบูธ</h3>
          
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
                <div className="border-2 border-[#5B9BD5] rounded-xl p-4 bg-white">
                  <img 
                    src={zoneImagePreview} 
                    alt="Zone Map Preview" 
                    className="w-full h-48 object-contain rounded-lg"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      📎 {newZone.file?.name}
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveZoneImage}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#5B9BD5] transition cursor-pointer bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="zone-image"
                  />
                  <label htmlFor="zone-image" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="mb-3">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p className="text-gray-600 text-sm mb-1">คลิกเพื่อเลือกรูปภาพ</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP (สูงสุด 5MB)</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4">
            <button
              type="button"
              onClick={handleAddZone}
              disabled={!newZone.title.trim()}
              className="flex-1 px-6 py-3 bg-[#5B9BD5] text-white font-semibold rounded-xl hover:bg-[#4A8BC2] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="mt-10 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-12 py-4 border-2 border-[#5B9BD5] text-[#5B9BD5] text-lg font-semibold rounded-xl hover:bg-blue-50 transition"
        >
          ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-12 py-4 bg-[#5B9BD5] text-white text-lg font-semibold rounded-xl hover:bg-[#4A8BC2] transition shadow-lg"
        >
          ดำเนินการต่อ
        </button>
      </div>
    </div>
  );
}