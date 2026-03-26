// src/features/events/components/tickets/EditTicketModal.tsx
'use client';

import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Ticket } from '../../types/ticket.types';
import { updateTicket } from '../../api/ticketApi';

interface EditTicketModalProps {
  expoID: string;
  ticket: Ticket;
  onClose: () => void;
  onSuccess: () => void;
}

const TicketIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 1 1 0 6V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 1 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4z"/>
  </svg>
);

export function EditTicketModal({ expoID, ticket, onClose, onSuccess }: EditTicketModalProps) {
  const [title, setTitle] = useState(ticket.Title);
  const [detail, setDetail] = useState(ticket.Detail ?? '');
  const [price, setPrice] = useState(ticket.Price);
  // amount — ถ้า null เดิม = ไม่จำกัด (ล็อคไม่ให้เปลี่ยน)
  // ถ้ามีตัวเลขเดิม = จำกัด ต้องเพิ่มเท่านั้น
  const [amount, setAmount] = useState(ticket.Amount !== null ? String(ticket.Amount) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const originalAmount = ticket.Amount; // null = ไม่จำกัดเดิม
  const priceNum = parseFloat(price);
  const isFree = !isNaN(priceNum) && priceNum === 0;
  const amountNum = parseInt(amount);

  const validateAmount = (): string | null => {
    // ถ้าเดิมเป็น null → ไม่สามารถเปลี่ยนได้
    if (originalAmount === null) return null;
    // ถ้าเดิมมีตัวเลข → ต้องมากกว่าเดิม
    if (amount === '' || isNaN(amountNum) || amountNum <= 0) {
      return 'กรุณากรอกจำนวนตั๋วที่ถูกต้อง';
    }
    if (amountNum < originalAmount) {
      return `จำนวนต้องไม่น้อยกว่าเดิม (${originalAmount.toLocaleString()} ใบ)`;
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('กรุณากรอกชื่อประเภทตั๋ว'); return; }
    if (isNaN(priceNum) || priceNum < 0) { setError('กรุณากรอกราคาที่ถูกต้อง'); return; }
    const amountErr = validateAmount();
    if (amountErr) { setError(amountErr); return; }

    try {
      setIsSubmitting(true);
      setError('');
      await updateTicket(expoID, {
        ticket_id: ticket.TicketID,
        title: title.trim(),
        detail: detail.trim(),
        price: priceNum,
        amount: originalAmount === null ? null : amountNum,
      });
      onSuccess();
    } catch {
      setError('ไม่สามารถแก้ไขตั๋วได้ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-[18px] border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
              <TicketIcon />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">แก้ไขประเภทตั๋ว</h3>
              <p className="text-xs text-gray-400 mt-0.5 max-w-[240px] truncate">{ticket.Title}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
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
            <input autoFocus type="text" value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors"
            />
          </div>

          {/* Detail */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              รายละเอียด <span className="font-normal text-gray-400 text-xs">— ไม่บังคับ</span>
            </label>
            <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={3}
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
              <input type="number" value={price} min="0" step="0.01"
                onChange={e => { setPrice(e.target.value); setError(''); }}
                className="w-full pl-8 pr-20 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors"
              />
              {isFree && (
                <span className="absolute right-3 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full pointer-events-none">
                  ฟรี
                </span>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">จำนวนตั๋ว</label>

            {originalAmount === null ? (
              // เดิมไม่จำกัด → ล็อค ไม่ให้เปลี่ยน
              <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <p className="text-sm text-gray-500">ไม่จำกัดจำนวน</p>
                <span className="ml-auto text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">ไม่สามารถเปลี่ยนได้</span>
              </div>
            ) : (
              // เดิมมีตัวเลข → แก้ได้ แต่ต้องมากกว่าเดิม
              <div>
                <div className="relative">
                  <input type="number" value={amount} min={originalAmount} step="1"
                    onChange={e => { setAmount(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">ใบ</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-xs text-amber-600">
                    สามารถเพิ่มได้เท่านั้น (เดิม {originalAmount.toLocaleString()} ใบ
                    {ticket.Remaining !== null && ` · คงเหลือ ${ticket.Remaining.toLocaleString()} ใบ`})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-6 py-[18px] border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} disabled={isSubmitting}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            ยกเลิก
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
            {isSubmitting
              ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />กำลังบันทึก...</>
              : <><Save className="w-4 h-4" />บันทึก</>}
          </button>
        </div>
      </div>
    </div>
  );
}