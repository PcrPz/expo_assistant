// src/features/events/components/NoTicketWarningSection.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface NoTicketWarningSectionProps {
  onGoToTickets: () => void;
}

export function NoTicketWarningSection({ onGoToTickets }: NoTicketWarningSectionProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Banner — 🔴 Rose */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-1">ยังไม่สามารถเผยแพร่งานได้</h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              งานนี้ยังไม่มีประเภทตั๋ว กรุณาสร้างตั๋วอย่างน้อย 1 ประเภทก่อนเผยแพร่งาน
              เมื่อสร้างตั๋วแล้ว ปุ่มเผยแพร่งานจะปรากฏขึ้นโดยอัตโนมัติ
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-rose-100 text-rose-700 text-sm font-semibold rounded-lg hover:bg-rose-200 transition-all flex items-center gap-1.5 border border-rose-200"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 1 1 0 6V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 1 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4z" />
              </svg>
              ดูรายละเอียด
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">ยังไม่สามารถเผยแพร่ได้</h3>
                <p className="text-xs text-gray-400 mt-0.5">ต้องดำเนินการก่อนเผยแพร่งาน</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="bg-rose-50 rounded-xl p-4 space-y-2.5">
                {['สร้างประเภทตั๋วอย่างน้อย 1 ประเภท', 'กำหนดราคาตั๋วให้เรียบร้อย', 'จากนั้นจึงจะสามารถเผยแพร่งานได้'].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2.5 px-6 pb-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                ปิด
              </button>
              <button onClick={() => { setShowModal(false); onGoToTickets(); }}
                className="flex-1 py-2.5 bg-rose-100 text-rose-700 rounded-xl text-sm font-semibold hover:bg-rose-200 transition border border-rose-200 flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 1 1 0 6V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 1 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4z" />
                </svg>
                จัดการตั๋ว
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}