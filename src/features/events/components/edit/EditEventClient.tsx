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
            description: zone.description || undefined,
            mapFile: zone.mapFile,
            map: zone.originalMapPath,
          });
        } else if (zone.state === 'new') {
          await createZone(eventId, {
            title: zone.title,
            description: zone.description || undefined,
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

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#3674B5] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-2xl mb-4">⚠️</p>
          <h2 className="text-lg font-bold text-gray-900 mb-4">ไม่พบข้อมูลงาน</h2>
          <button
            onClick={() => router.push('/home')}
            className="px-5 py-2.5 bg-[#3674B5] text-white rounded-lg text-sm font-semibold hover:bg-[#2d6aa8] transition"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  const activeZones = zones.filter(z => z.state !== 'deleted');

  // ── Input class ──────────────────────────────────────────────────
  const inputCls = "w-full border border-gray-200 bg-gray-50 px-4 py-3.5 rounded-xl text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] focus:bg-white transition placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">

        {/* ── Back button ─────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => router.push(`/events/${eventId}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-500 shadow-sm hover:border-[#B8D0EA] hover:bg-[#EEF4FB] hover:text-[#3674B5] transition-all mb-5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </button>

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3674B5] to-[#498AC3] flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">แก้ไขงาน</h1>
            <p className="text-xs text-gray-400 mt-0.5">{event.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Section: ข้อมูลพื้นฐาน ─────────────────────────── */}
          <SectionCard
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
            title="ข้อมูลพื้นฐาน"
          >
            <div className="space-y-6">
              {/* ชื่องาน */}
              <Field label="ชื่องาน" required>
                <input
                  className={inputCls}
                  placeholder="ชื่องาน"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Field>

              {/* หมวดหมู่ */}
              <Field label="หมวดหมู่งาน" required>
                <input
                  className={inputCls}
                  placeholder="หมวดหมู่งาน"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </Field>

              {/* วันที่ */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="วันเริ่มต้น" required>
                  <input
                    type="date"
                    className={inputCls}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </Field>
                <Field label="วันสิ้นสุด" required>
                  <input
                    type="date"
                    className={inputCls}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </Field>
              </div>

              {/* เวลา */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="เวลาเริ่มต้น">
                  <input
                    type="time"
                    className={inputCls}
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </Field>
                <Field label="เวลาสิ้นสุด">
                  <input
                    type="time"
                    className={inputCls}
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </Field>
              </div>

              {/* สถานที่ */}
              <Field label="สถานที่จัดงาน" required>
                <input
                  className={inputCls}
                  placeholder="สถานที่จัดงาน"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </Field>

              {/* รายละเอียด */}
              <Field label="รายละเอียดงาน">
                <textarea
                  className={`${inputCls} min-h-[128px] resize-none`}
                  placeholder="รายละเอียดงาน"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── Section: ข้อมูลติดต่อ ───────────────────────────── */}
          <SectionCard
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>}
            title="ข้อมูลติดต่อ"
          >
            <div className="space-y-6">
              <Field label="ผู้จัดงาน">
                <input
                  className={inputCls}
                  placeholder="ผู้จัดงาน"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="อีเมล">
                  <input
                    type="email"
                    className={inputCls}
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Field>
                <Field label="เบอร์โทร">
                  <input
                    type="tel"
                    className={inputCls}
                    placeholder="0X-XXXX-XXXX"
                    value={formData.tel}
                    onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                  />
                </Field>
                <Field label="เว็บไซต์หลัก">
                  <input
                    type="url"
                    className={inputCls}
                    placeholder="https://..."
                    value={formData.website1}
                    onChange={(e) => setFormData({ ...formData, website1: e.target.value })}
                  />
                </Field>
                <Field label="เว็บไซต์เพิ่มเติม">
                  <input
                    type="url"
                    className={inputCls}
                    placeholder="https://..."
                    value={formData.website2}
                    onChange={(e) => setFormData({ ...formData, website2: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* ── Section: รูปภาพ ─────────────────────────────────── */}
          <SectionCard
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
            title="รูปภาพ"
          >
            <div className="grid grid-cols-2 gap-4">

              {/* โลโก้ */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">โลโก้งาน (Thumbnail)</p>
                {logoPreview ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                      <span className="text-xs font-semibold text-gray-500">
                        {logoFile ? 'รูปใหม่' : 'รูปปัจจุบัน'}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setLogoPreview(null); setLogoFile(null); }}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 transition"
                      >
                        ลบรูป
                      </button>
                    </div>
                    <img src={logoPreview} alt="Logo" className="w-full h-28 object-contain p-2" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl py-7 px-4 bg-gray-50 cursor-pointer hover:border-[#3674B5] hover:bg-[#EEF4FB] transition text-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-400">อัพโหลดโลโก้</span>
                    <span className="text-xs text-gray-300">PNG, JPG</span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                )}
                {logoPreview && (
                  <label className="mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-500 cursor-pointer hover:border-[#3674B5] hover:text-[#3674B5] hover:bg-[#EEF4FB] transition">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    เปลี่ยนรูปใหม่
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* แผนผัง */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">แผนผังงาน (Map)</p>
                {bannerPreview ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                      <span className="text-xs font-semibold text-gray-500">
                        {bannerFile ? 'แผนผังใหม่' : 'แผนผังปัจจุบัน'}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setBannerPreview(null); setBannerFile(null); }}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 transition"
                      >
                        ลบรูป
                      </button>
                    </div>
                    <img src={bannerPreview} alt="Map" className="w-full h-28 object-contain p-2" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl py-7 px-4 bg-gray-50 cursor-pointer hover:border-[#3674B5] hover:bg-[#EEF4FB] transition text-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-400">อัพโหลดแผนผัง</span>
                    <span className="text-xs text-gray-300">PNG, JPG</span>
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                  </label>
                )}
                {bannerPreview && (
                  <label className="mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-500 cursor-pointer hover:border-[#3674B5] hover:text-[#3674B5] hover:bg-[#EEF4FB] transition">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    เปลี่ยนรูปใหม่
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                  </label>
                )}
              </div>

            </div>
          </SectionCard>

          {/* ── Section: โซน ────────────────────────────────────── */}
          <SectionCard
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
            title="โซนภายในงาน"
            count={activeZones.length}
            action={
              <button
                type="button"
                onClick={addZone}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF4FB] text-[#3674B5] text-xs font-semibold hover:bg-[#3674B5] hover:text-white transition"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                เพิ่มโซน
              </button>
            }
          >
            <div className="space-y-3">
              {zones.map((zone, index) => {
                const zoneMapUrl = zone.map ? getMinioFileUrl(zone.map) : null;
                const isDeleted = zone.state === 'deleted';

                return (
                  <div
                    key={zone.zone_id || index}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      isDeleted
                        ? 'border-red-200 bg-red-50/50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Zone header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${
                      isDeleted ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0 ${
                          isDeleted ? 'bg-red-400' : 'bg-gradient-to-br from-[#3674B5] to-[#498AC3]'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isDeleted ? 'text-red-500' : 'text-gray-900'}`}>
                            {zone.state === 'new' ? 'โซนใหม่' : (zone.title || 'ไม่มีชื่อ')}
                          </p>
                          <p className={`text-xs ${isDeleted ? 'text-red-400' : 'text-gray-400'}`}>
                            {isDeleted ? 'จะถูกลบเมื่อบันทึก' : (zone.state === 'existing' ? `ID: ${zone.zone_id}` : 'โซนใหม่')}
                          </p>
                        </div>
                      </div>
                      {isDeleted ? (
                        <button
                          type="button"
                          onClick={() => restoreZone(index)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 transition"
                        >
                          กู้คืน
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeZone(index)}
                          className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Zone body */}
                    {!isDeleted && (
                      <div className="p-4 space-y-3">
                        <Field label="ชื่อโซน">
                          <input
                            className={inputCls}
                            placeholder="ชื่อโซน"
                            value={zone.title}
                            onChange={(e) => updateZoneData(index, { title: e.target.value })}
                          />
                        </Field>
                        <Field label="รายละเอียด">
                          <textarea
                            className={`${inputCls} min-h-[80px] resize-none`}
                            placeholder="รายละเอียดโซน"
                            value={zone.description || ''}
                            onChange={(e) => updateZoneData(index, { description: e.target.value })}
                          />
                        </Field>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">แผนที่โซน</p>
                          {(zone.mapPreview || zoneMapUrl) && (
                            <div className="mb-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                              <img
                                src={zone.mapPreview || zoneMapUrl || ''}
                                alt={`${zone.title} Map`}
                                className="w-full h-28 object-contain p-2"
                              />
                            </div>
                          )}
                          <label className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs font-semibold text-gray-400 cursor-pointer hover:border-[#3674B5] hover:text-[#3674B5] hover:bg-[#EEF4FB] transition">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            {(zone.mapPreview || zoneMapUrl) ? 'เปลี่ยนแผนที่' : 'อัพโหลดแผนที่'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleZoneMapChange(index, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty state */}
              {activeZones.length === 0 && (
                <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-400">ยังไม่มีโซนในงาน</p>
                  <p className="text-xs text-gray-300 mt-1">กด "เพิ่มโซน" เพื่อเริ่มต้น</p>
                </div>
              )}

              {/* Add zone button */}
              <button
                type="button"
                onClick={addZone}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#B8D0EA] bg-[#EEF4FB] text-[#3674B5] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#3674B5] hover:text-white hover:border-[#3674B5] transition"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                เพิ่มโซนใหม่
              </button>
            </div>
          </SectionCard>

        </form>
      </div>

      {/* ── Sticky footer ────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-end gap-3 z-50">
        <button
          type="button"
          onClick={() => router.push(`/events/${eventId}`)}
          disabled={saving}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          form="edit-form"
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-[#3674B5] text-white text-sm font-semibold hover:bg-[#2d6aa8] transition shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
              </svg>
              บันทึกการแก้ไข
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function SectionCard({ icon, title, count, action, children }: {
  icon: React.ReactElement;
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-[18px] border-b border-gray-100">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[15px] font-bold text-gray-800">{title}</span>
          {count !== undefined && (
            <span className="text-xs text-gray-400 font-medium">{count} โซน</span>
          )}
        </div>
        {action}
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}