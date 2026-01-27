// src/features/events/components/edit/EditEventClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getEventById, updateEvent } from '@/src/features/events/api/eventApi';
import { updateZone, deleteZone, createZone } from '@/src/features/zones/api/zoneApi';
import { Event, Zone } from '@/src/features/events/types/event.types';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';

interface ZoneWithState extends Zone {
  state?: 'existing' | 'new' | 'deleted';
  mapFile?: File;
  mapPreview?: string;
  originalMapPath?: string;
}

export default function EditEventClient() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    organizer: '',
    email: '',
    tel: '',
    description: '',
    website1: '',
    website2: '',
  });

  const [zones, setZones] = useState<ZoneWithState[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [originalThumbnailPath, setOriginalThumbnailPath] = useState<string>('');
  const [originalMapPath, setOriginalMapPath] = useState<string>('');

  useEffect(() => {
    if (!eventId) {
      alert('ไม่พบรหัสงาน');
      router.push('/home');
      return;
    }
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await getEventById(eventId);
      
      if (!data) {
        alert('ไม่พบข้อมูลงาน');
        router.push('/home');
        return;
      }

      setEvent(data);
      
      let startDate = data.startDate || data.start_date || '';
      let endDate = data.endDate || data.end_date || '';
      
      if (startDate.includes('T')) startDate = startDate.split('T')[0];
      if (endDate.includes('T')) endDate = endDate.split('T')[0];
      
      const startTime = data.startTime || data.start_time || '';
      const endTime = data.endTime || data.end_time || '';
      
      setFormData({
        name: data.name || data.title || '',
        category: data.category || '',
        startDate,
        endDate,
        startTime: startTime.substring(0, 5),
        endTime: endTime.substring(0, 5),
        location: data.location || '',
        organizer: data.organizer || '',
        email: data.email || '',
        tel: data.tel || '',
        description: data.description || data.detail || '',
        website1: data.website1 || '',
        website2: data.website2 || '',
      });

      if (data.thumbnail) {
        setOriginalThumbnailPath(data.thumbnail);
        setLogoPreview(getMinioFileUrl(data.thumbnail));
      }
      
      if (data.map) {
        setOriginalMapPath(data.map);
        setBannerPreview(getMinioFileUrl(data.map));
      }
      
      const existingZones: ZoneWithState[] = (data.zones || []).map(z => ({
        ...z,
        state: 'existing' as const,
        originalMapPath: z.map || '',
      }));
      setZones(existingZones);
      
    } catch (error) {
      console.error('Failed to load event:', error);
      alert('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = () => setBannerPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addZone = () => {
    setZones([
      ...zones,
      { 
        zone_id: `new-zone-${Date.now()}`,
        title: '',
        description: '',
        state: 'new',
        originalMapPath: '',
      },
    ]);
  };

  const updateZoneData = (index: number, updates: Partial<ZoneWithState>) => {
    const newZones = [...zones];
    newZones[index] = { ...newZones[index], ...updates };
    setZones(newZones);
  };

  const handleZoneMapChange = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      updateZoneData(index, {
        mapFile: file,
        mapPreview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeZone = (index: number) => {
    const zone = zones[index];
    
    if (zone.state === 'existing') {
      const newZones = [...zones];
      newZones[index] = { ...zone, state: 'deleted' };
      setZones(newZones);
    } else {
      setZones(zones.filter((_, i) => i !== index));
    }
  };

  const restoreZone = (index: number) => {
    const newZones = [...zones];
    newZones[index] = { ...newZones[index], state: 'existing' };
    setZones(newZones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.startDate || 
        !formData.endDate || !formData.location) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    try {
      setSaving(true);

      const success = await updateEvent(eventId, {
        name: formData.name,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        organizer: formData.organizer,
        email: formData.email,
        tel: formData.tel,
        description: formData.description,
        website1: formData.website1,
        website2: formData.website2,
        logoFile: logoFile || undefined,
        bannerFile: bannerFile || undefined,
        thumbnail: originalThumbnailPath,
        map: originalMapPath,
      });

      if (!success) {
        alert('ไม่สามารถบันทึกข้อมูลงานได้');
        return;
      }

      for (const zone of zones) {
        if (zone.state === 'deleted' && zone.zone_id && !zone.zone_id.startsWith('new-')) {
          await deleteZone(eventId, zone.zone_id);
        } else if (zone.state === 'existing' && zone.zone_id) {
          await updateZone(eventId, zone.zone_id, {
            zone_id: zone.zone_id,
            title: zone.title,
            description: zone.description || undefined,  // ✅ แปลง null เป็น undefined
            mapFile: zone.mapFile,
            map: zone.originalMapPath,
          });
        } else if (zone.state === 'new') {
          await createZone(eventId, {
            title: zone.title,
            description: zone.description || undefined,  // ✅ แปลง null เป็น undefined
            mapFile: zone.mapFile,
          });
        }
      }

      alert('บันทึกข้อมูลสำเร็จ');
      router.push(`/events/${eventId}`);
      
    } catch (error) {
      console.error('Update failed:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#5B9BD5] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบข้อมูลงาน</h2>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-[#5B9BD5] text-white rounded-lg hover:bg-[#4A8BC2] font-medium"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  const activeZones = zones.filter(z => z.state !== 'deleted');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">ย้อนกลับ</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#5B9BD5] rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">แก้ไขงาน</h1>
              <p className="text-gray-600 mt-1">{event.name}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              ข้อมูลพื้นฐาน
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่องาน <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  placeholder="ชื่องาน"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  หมวดหมู่งาน <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  placeholder="หมวดหมู่งาน"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  วันเริ่มต้น <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  วันสิ้นสุด <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เวลาเริ่มต้น
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เวลาสิ้นสุด
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  สถานที่จัดงาน <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  placeholder="สถานที่จัดงาน"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รายละเอียดงาน
                </label>
                <textarea
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg min-h-[120px] focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  placeholder="รายละเอียดงาน"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              ข้อมูลติดต่อ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ผู้จัดงาน
                </label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  placeholder="ผู้จัดงาน"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เบอร์โทร
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  placeholder="0X-XXXX-XXXX"
                  value={formData.tel}
                  onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เว็บไซต์หลัก
                </label>
                <input
                  type="url"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  placeholder="https://..."
                  value={formData.website1}
                  onChange={(e) => setFormData({ ...formData, website1: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เว็บไซต์เพิ่มเติม
                </label>
                <input
                  type="url"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
                  placeholder="https://..."
                  value={formData.website2}
                  onChange={(e) => setFormData({ ...formData, website2: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              รูปภาพ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  โลโก้งาน (Thumbnail)
                </label>
                
                {logoPreview && !logoFile && (
                  <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-blue-900">รูปปัจจุบัน:</p>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setLogoFile(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        ลบรูป
                      </button>
                    </div>
                    <img
                      src={logoPreview}
                      alt="Current Logo"
                      className="w-full h-40 object-contain rounded"
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#5B9BD5] file:text-white hover:file:bg-[#4A8BC2] file:cursor-pointer"
                />
                
                {logoPreview && logoFile && (
                  <div className="mt-3 p-3 border-2 border-green-300 rounded-lg bg-green-50">
                    <p className="text-sm font-medium text-green-900 mb-2">รูปใหม่:</p>
                    <img
                      src={logoPreview}
                      alt="New Logo Preview"
                      className="w-full h-40 object-contain"
                    />
                  </div>
                )}
                
                {!logoPreview && (
                  <p className="text-sm text-gray-500 mt-2">ยังไม่มีรูปโลโก้</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  แผนผังงาน (Map)
                </label>
                
                {bannerPreview && !bannerFile && (
                  <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-blue-900">แผนผังปัจจุบัน:</p>
                      <button
                        type="button"
                        onClick={() => {
                          setBannerPreview(null);
                          setBannerFile(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        ลบรูป
                      </button>
                    </div>
                    <img
                      src={bannerPreview}
                      alt="Current Map"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#5B9BD5] file:text-white hover:file:bg-[#4A8BC2] file:cursor-pointer"
                />
                
                {bannerPreview && bannerFile && (
                  <div className="mt-3 p-3 border-2 border-green-300 rounded-lg bg-green-50">
                    <p className="text-sm font-medium text-green-900 mb-2">แผนผังใหม่:</p>
                    <img
                      src={bannerPreview}
                      alt="New Banner Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                )}
                
                {!bannerPreview && (
                  <p className="text-sm text-gray-500 mt-2">ยังไม่มีแผนผัง</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                โซนภายในงาน ({activeZones.length})
              </h2>
              <button
                type="button"
                onClick={addZone}
                className="px-4 py-2 bg-[#5B9BD5] text-white rounded-lg hover:bg-[#4A8BC2] font-medium transition flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                เพิ่มโซน
              </button>
            </div>

            <div className="space-y-4">
              {zones.map((zone, index) => {
                const zoneMapUrl = zone.map ? getMinioFileUrl(zone.map) : null;
                const isDeleted = zone.state === 'deleted';

                return (
                  <div
                    key={zone.zone_id || index}
                    className={`border-2 rounded-lg p-5 transition-all ${
                      isDeleted 
                        ? 'border-red-300 bg-red-50 opacity-60' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                          isDeleted ? 'bg-red-500' : 'bg-[#5B9BD5]'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {zone.state === 'new' ? 'โซนใหม่' : `โซน: ${zone.title || 'ไม่มีชื่อ'}`}
                          </h3>
                          {zone.state === 'existing' && (
                            <p className="text-xs text-gray-500">ID: {zone.zone_id}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isDeleted ? (
                          <button
                            type="button"
                            onClick={() => restoreZone(index)}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            กู้คืน
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeZone(index)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                          >
                            ลบ
                          </button>
                        )}
                      </div>
                    </div>

                    {!isDeleted && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ชื่อโซน
                          </label>
                          <input
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                            placeholder="ชื่อโซน"
                            value={zone.title}
                            onChange={(e) => updateZoneData(index, { title: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            รายละเอียด
                          </label>
                          <textarea
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                            placeholder="รายละเอียดโซน"
                            value={zone.description || ''}
                            onChange={(e) => updateZoneData(index, { description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            แผนที่โซน
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleZoneMapChange(index, file);
                            }}
                            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 file:cursor-pointer"
                          />
                          
                          {(zone.mapPreview || zoneMapUrl) && (
                            <div className="mt-2 p-2 border-2 border-gray-200 rounded-lg bg-white">
                              <img
                                src={zone.mapPreview || zoneMapUrl || ''}
                                alt={`${zone.title} Map`}
                                className="w-full h-32 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {isDeleted && (
                      <p className="text-sm text-red-600 italic">
                        โซนนี้จะถูกลบเมื่อบันทึกการแก้ไข
                      </p>
                    )}
                  </div>
                );
              })}

              {activeZones.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                    <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                  </svg>
                  <p className="text-gray-600 font-medium mb-2">ไม่มีโซนในงาน</p>
                  <p className="text-sm text-gray-500">คลิก "เพิ่มโซน" เพื่อเพิ่มโซนใหม่</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 sticky bottom-0 bg-gray-50 pb-6">
            <button
              type="button"
              onClick={() => router.push(`/events/${eventId}`)}
              disabled={saving}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>บันทึกการแก้ไข</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}