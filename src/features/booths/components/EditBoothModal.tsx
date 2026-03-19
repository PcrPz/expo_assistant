'use client';

import { useState, useEffect } from 'react';
import { updateBooth, updateBoothWithThumbnail } from '../api/boothApi';
import { getZonesByExpoId } from '@/src/features/zones/api/zoneApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { Booth, BoothType, UpdateBoothRequest } from '../types/booth.types';
import type { Zone } from '@/src/features/zones/types/zone.types';
import type { EventRole } from '@/src/features/events/types/event.types';

// ─── Icons (same as CreateBoothModal) ────────────────────────
const SmallBoothIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const BigBoothIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const StageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const BOOTH_TYPES = [
  { value: 'small_booth' as BoothType, label: 'บูธขนาดเล็ก', desc: 'เหมาะสำหรับธุรกิจขนาดเล็ก', Icon: SmallBoothIcon, color: '#3674B5', bg: '#EBF3FC' },
  { value: 'big_booth'   as BoothType, label: 'บูธขนาดใหญ่', desc: 'เหมาะสำหรับธุรกิจขนาดกลาง-ใหญ่', Icon: BigBoothIcon, color: '#498AC3', bg: '#EBF3FC' },
  { value: 'stage'       as BoothType, label: 'เวที',          desc: 'พื้นที่สำหรับกิจกรรมและการแสดง', Icon: StageIcon, color: '#749BC2', bg: '#EBF3FC' },
];

const STATUS_OPTIONS = [
  { value: 'available',   label: 'ว่าง',        desc: 'Booth Group สามารถขอเข้าร่วมได้' },
  { value: 'unavailable', label: 'ไม่เปิดรับ',  desc: 'เฉพาะ Expo เชิญเท่านั้น' },
  { value: 'pending',     label: 'รอชำระเงิน', desc: 'มีการตอบรับ รอ Booth Group ชำระ' },
  { value: 'reserved',    label: 'จองแล้ว',    desc: 'บูธถูกจองเรียบร้อยแล้ว' },
];

interface EditBoothModalProps {
  expoId: string;
  booth: Booth;
  userRole: EventRole;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditBoothModal({ expoId, booth, userRole, onClose, onSuccess }: EditBoothModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  // Thumbnail
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    booth_no: string; type: BoothType; price: string; status: string;
    title: string; detail: string; company: string; hall: string;
    zone_id: string; email: string; tel: string; website1: string; website2: string;
  }>({
    booth_no: booth.booth_no || '',
    type: (['small_booth', 'big_booth', 'stage'] as BoothType[]).includes(booth.type) ? booth.type : 'small_booth',
    price: String(booth.price ?? '0'),
    status: booth.status || 'available',
    title: booth.title || '',
    detail: booth.detail || '',
    company: booth.company || '',
    hall: booth.hall || '',
    zone_id: booth.zone_id || '',
    email: booth.email || '',
    tel: booth.tel || '',
    website1: booth.website1 || '',
    website2: booth.website2 || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Permission: booth_staff ไม่สามารถแก้ไข field หลักได้ ──────
  const isBoothStaff = userRole === 'booth_staff';

  useEffect(() => { loadZones(); }, [expoId]);

  const loadZones = async () => {
    try {
      setLoadingZones(true);
      const data = await getZonesByExpoId(expoId);
      setZones(data);
    } catch { } finally { setLoadingZones(false); }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErrors({ ...errors, thumbnail: 'กรุณาเลือกไฟล์รูปภาพ' }); return; }
    if (file.size > 5 * 1024 * 1024) { setErrors({ ...errors, thumbnail: 'ไฟล์รูปภาพต้องไม่เกิน 5MB' }); return; }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
    const newErrors = { ...errors }; delete newErrors.thumbnail; setErrors(newErrors);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.booth_no.trim()) newErrors.booth_no = 'กรุณาระบุเลขที่บูธ';
    if (!formData.type) newErrors.type = 'กรุณาเลือกประเภทบูธ';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (formData.tel && !/^[0-9]{9,10}$/.test(formData.tel.replace(/-/g, ''))) newErrors.tel = 'เบอร์โทรศัพท์ไม่ถูกต้อง (9-10 หลัก)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsLoading(true);
      const updateData: UpdateBoothRequest = {
        booth_no: formData.booth_no, type: formData.type,
        price: formData.price || '0', status: formData.status || 'available',
        title: formData.title || null, detail: formData.detail || null,
        company: formData.company || null, hall: formData.hall || null,
        zone_id: formData.zone_id || '', email: formData.email || null,
        tel: formData.tel || null, website1: formData.website1 || null,
        website2: formData.website2 || null,
      };
      if (thumbnailFile) {
        await updateBoothWithThumbnail(expoId, booth.booth_id, thumbnailFile, updateData);
      } else {
        await updateBooth(expoId, booth.booth_id, updateData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to update booth:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไขบูธ');
    } finally { setIsLoading(false); }
  };

  const currentThumbnailUrl = booth.thumbnail ? getMinioFileUrl(booth.thumbnail) : null;
  const displayThumbnail = thumbnailPreview || currentThumbnailUrl;

  // ── input className helper ────────────────────────────────────
  const inputCls = (field: string) =>
    `w-full px-3.5 py-3 rounded-xl border text-[15px] transition focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 focus:border-[#3674B5] focus:ring-[#3674B5]/15'
    }`;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">แก้ไขบูธ</h2>
                <p className="text-xs text-gray-400">บูธ {booth.booth_no}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Form (scrollable) ── */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* รูปภาพ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">รูปภาพบูธ</label>
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-3" style={{ height: '160px' }}>
                {displayThumbnail ? (
                  <div className="relative w-full h-full">
                    <img src={displayThumbnail} alt="preview" className="w-full h-full object-cover" />
                    {thumbnailPreview && (
                      <button type="button" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p className="text-xs text-gray-400">ยังไม่มีรูปภาพบูธ</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input type="file" id="edit-thumbnail" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                <label htmlFor="edit-thumbnail" className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition cursor-pointer">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  เปลี่ยนรูปภาพ
                </label>
                <span className="text-xs text-gray-400">JPG, PNG (สูงสุด 5MB)</span>
              </div>
              {errors.thumbnail && <p className="mt-1.5 text-xs text-red-500">{errors.thumbnail}</p>}
            </div>

            {/* เลขที่บูธ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                เลขที่บูธ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                </span>
                <input type="text" value={formData.booth_no}
                  onChange={(e) => { if (isBoothStaff) return; setFormData({ ...formData, booth_no: e.target.value }); setErrors({ ...errors, booth_no: '' }); }}
                  readOnly={isBoothStaff}
                  placeholder="เช่น A-101, B-205"
                  className={`${inputCls('booth_no')} pl-9 ${isBoothStaff ? 'bg-gray-50 text-gray-400 cursor-not-allowed select-none' : ''}`} />
                {isBoothStaff && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                )}
              </div>
              {errors.booth_no && <p className="mt-1.5 text-xs text-red-500">{errors.booth_no}</p>}
            </div>

            {/* ประเภทบูธ — card selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ประเภทบูธ <span className="text-red-500">*</span>
                {isBoothStaff && <span className="ml-2 text-[11px] font-normal text-gray-400 inline-flex items-center gap-1"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>เฉพาะผู้จัดงานเท่านั้น</span>}
              </label>
              <div className={`grid grid-cols-3 gap-2.5 ${isBoothStaff ? 'opacity-50 pointer-events-none' : ''}`}>
                {BOOTH_TYPES.map((type) => {
                  const isSelected = formData.type === type.value;
                  return (
                    <button key={type.value} type="button"
                      onClick={() => { if (isBoothStaff) return; setFormData({ ...formData, type: type.value }); setErrors({ ...errors, type: '' }); }}
                      disabled={isBoothStaff}
                      className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all text-center ${
                        isBoothStaff
                          ? isSelected ? 'border-[#3674B5] bg-[#EBF3FC] cursor-not-allowed' : 'border-gray-200 bg-white cursor-not-allowed'
                          : isSelected ? 'border-[#3674B5] bg-[#EBF3FC]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: isSelected ? type.color : '#F3F4F6', color: isSelected ? 'white' : '#9CA3AF' }}>
                        <type.Icon />
                      </div>
                      <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-[#3674B5]' : 'text-gray-600'}`}>{type.label}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#3674B5] rounded-full flex items-center justify-center">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.type && <p className="mt-1.5 text-xs text-red-500">{errors.type}</p>}
            </div>

            {/* ราคา + ฮอลล์ */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ราคา (บาท) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">฿</span>
                  <input type="number" min="0" step="0.01" value={formData.price}
                    onChange={(e) => { if (isBoothStaff) return; setFormData({ ...formData, price: e.target.value }); }}
                    readOnly={isBoothStaff}
                    placeholder="0.00"
                    className={`${inputCls('price')} pl-7 ${isBoothStaff ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`} />
                  {isBoothStaff && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">ใส่ 0 = ฟรี</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ฮอลล์ <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
                <div className="relative">
                  <input type="text" value={formData.hall}
                    onChange={(e) => { if (isBoothStaff) return; setFormData({ ...formData, hall: e.target.value }); }}
                    readOnly={isBoothStaff}
                    placeholder="เช่น Hall A"
                    className={`${inputCls('')} ${isBoothStaff ? 'bg-gray-50 text-gray-400 cursor-not-allowed pr-9' : ''}`} />
                  {isBoothStaff && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* สถานะ — 2x2 card selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                สถานะ <span className="text-red-500">*</span>
                {isBoothStaff && <span className="ml-2 text-[11px] font-normal text-gray-400 inline-flex items-center gap-1"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>เฉพาะผู้จัดงานเท่านั้น</span>}
              </label>
              <div className={`grid grid-cols-2 gap-2.5 ${isBoothStaff ? 'opacity-50 pointer-events-none' : ''}`}>
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = formData.status === opt.value;
                  const dotColor = { available: '#16A34A', unavailable: '#6B7280', pending: '#D97706', reserved: '#3674B5' }[opt.value] ?? '#9CA3AF';
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => { if (isBoothStaff) return; setFormData({ ...formData, status: opt.value }); }}
                      disabled={isBoothStaff}
                      className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        isBoothStaff
                          ? isSelected ? 'border-[#3674B5] bg-[#EBF3FC] cursor-not-allowed' : 'border-gray-200 bg-white cursor-not-allowed'
                          : isSelected ? 'border-[#3674B5] bg-[#EBF3FC]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-[#3674B5]' : 'text-gray-700'}`}>{opt.label}</p>
                        <p className={`text-[11px] mt-0.5 leading-tight truncate ${isSelected ? 'text-[#3674B5]/70' : 'text-gray-400'}`}>{opt.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#3674B5] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* โซน */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">โซน <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <select value={formData.zone_id}
                  onChange={(e) => { if (isBoothStaff) return; setFormData({ ...formData, zone_id: e.target.value }); }}
                  disabled={loadingZones || isBoothStaff}
                  className={`w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-[15px] focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 focus:outline-none transition appearance-none ${
                    isBoothStaff ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white disabled:bg-gray-50'
                  }`}>
                  <option value="">-- ไม่ระบุโซน --</option>
                  {zones.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>{zone.title}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  {isBoothStaff
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  }
                </span>
              </div>
              {loadingZones && !isBoothStaff && <p className="mt-1 text-xs text-gray-400">กำลังโหลดโซน...</p>}
            </div>

            {/* ── Section: ข้อมูลเพิ่มเติม ── */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <p className="text-sm font-bold text-gray-500">ข้อมูลเพิ่มเติม (ไม่บังคับ)</p>

              {/* ชื่อบูธ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อบูธ</label>
                <input type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ชื่อบูธ (ถ้ามี)" className={inputCls('')} />
              </div>

              {/* บริษัท */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อบริษัท / องค์กร</label>
                <input type="text" value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="ชื่อบริษัทหรือองค์กร" className={inputCls('')} />
              </div>

              {/* รายละเอียด */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">รายละเอียด</label>
                <textarea value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  rows={3} placeholder="รายละเอียดเกี่ยวกับบูธ..."
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[15px] focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 focus:outline-none transition resize-none" />
              </div>

              {/* อีเมล + โทร */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">อีเมล</label>
                  <input type="email" value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                    placeholder="email@example.com" className={inputCls('email')} />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">โทรศัพท์</label>
                  <input type="tel" value={formData.tel}
                    onChange={(e) => { setFormData({ ...formData, tel: e.target.value }); setErrors({ ...errors, tel: '' }); }}
                    placeholder="0812345678" className={inputCls('tel')} />
                  {errors.tel && <p className="mt-1 text-xs text-red-500">{errors.tel}</p>}
                </div>
              </div>

              {/* เว็บไซต์ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">เว็บไซต์ 1</label>
                  <input type="url" value={formData.website1}
                    onChange={(e) => setFormData({ ...formData, website1: e.target.value })}
                    placeholder="https://example.com" className={inputCls('')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">เว็บไซต์ 2</label>
                  <input type="url" value={formData.website2}
                    onChange={(e) => setFormData({ ...formData, website2: e.target.value })}
                    placeholder="https://example.com" className={inputCls('')} />
                </div>
              </div>
            </div>

          </form>

          {/* ── Footer ── */}
          <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              ยกเลิก
            </button>
            <button type="submit" form="" disabled={isLoading} onClick={handleSubmit as any}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
              {isLoading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังบันทึก...</>
              ) : (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>บันทึกการแก้ไข</>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}