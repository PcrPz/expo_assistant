// src/features/events/components/tickets/CreateTicketModal.tsx
'use client';

import { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { createTicket } from '../../api/ticketApi';

interface CreateTicketModalProps {
  expoID: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TicketIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 1 1 0 6V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 1 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4z"/>
  </svg>
);

export function CreateTicketModal({ expoID, onClose, onSuccess }: CreateTicketModalProps) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const priceNum = parseFloat(price);
  const isFree = price !== '' && !isNaN(priceNum) && priceNum === 0;

  const handleSubmit = async () => {
    if (!title.trim()) { setError('กรุณากรอกชื่อประเภทตั๋ว'); return; }
    if (price === '' || isNaN(priceNum) || priceNum < 0) { setError('กรุณากรอกราคาที่ถูกต้อง (0 = ฟรี)'); return; }
    try {
      setIsSubmitting(true);
      setError('');
      await createTicket(expoID, { title: title.trim(), detail: detail.trim(), price: priceNum });
      onSuccess();
    } catch {
      setError('ไม่สามารถสร้างตั๋วได้ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-[18px] border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
              <TicketIcon />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">สร้างประเภทตั๋ว</h3>
              <p className="text-xs text-gray-400 mt-0.5">เพิ่มตั๋วในงาน Expo</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              ชื่อประเภทตั๋ว <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus type="text" value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              placeholder="เช่น บัตรทั่วไป, VIP, VVIP"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors"
            />
          </div>

          {/* Detail */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              รายละเอียด <span className="font-normal text-gray-400 text-xs">— ไม่บังคับ</span>
            </label>
            <textarea
              value={detail} onChange={e => setDetail(e.target.value)}
              placeholder="อธิบายสิทธิ์ที่ผู้ถือตั๋วจะได้รับ"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors resize-none"
            />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              ราคา <span className="text-red-400">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400 text-sm pointer-events-none select-none">฿</span>
              <input
                type="number" value={price} min="0" step="0.01"
                onChange={e => { setPrice(e.target.value); setError(''); }}
                placeholder="0"
                className="w-full pl-8 pr-20 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors"
              />
              {isFree && (
                <span className="absolute right-3 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full pointer-events-none">
                  ฟรี
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">ใส่ 0 หากต้องการให้เข้าร่วมงานฟรี</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-6 py-[18px] border-t border-gray-100">
          <button onClick={onClose} disabled={isSubmitting}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            ยกเลิก
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
            {isSubmitting
              ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />กำลังสร้าง...</>
              : <><Plus className="w-4 h-4" />สร้างตั๋ว</>}
          </button>
        </div>
      </div>
    </div>
  );
}