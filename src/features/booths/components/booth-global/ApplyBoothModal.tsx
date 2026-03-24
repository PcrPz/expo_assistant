// src/features/booths/components/booth-global/ApplyBoothModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';

interface ApplyBoothModalProps {
  event: {
    expo_id: string;
    title: string;
    location: string;
    start_date: string;
    end_date: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const BOOTH_TYPES = [
  { 
    value: 'small_booth' as const, 
    label: 'บูธขนาดเล็ก',
    price: '15,000',
    size: '3x3 เมตร',
    desc: 'เหมาะสำหรับธุรกิจขนาดเล็ก',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
      </svg>
    )
  },
  { 
    value: 'big_booth' as const, 
    label: 'บูธขนาดใหญ่',
    price: '35,000',
    size: '6x6 เมตร',
    desc: 'เหมาะสำหรับธุรกิจขนาดกลาง',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="2"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="12" y1="2" x2="12" y2="22"/>
      </svg>
    )
  },
  { 
    value: 'stage' as const, 
    label: 'เวที',
    price: '80,000',
    size: '10x10 เมตร',
    desc: 'พื้นที่สำหรับกิจกรรมพิเศษ',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="1.5">
        <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    )
  },
];

// Mock API
async function mockApplyBooth(expoId: string, boothType: string) {
  console.log('📦 [MOCK] POST /booth-application/apply', { expoId, boothType });
  await new Promise(r => setTimeout(r, 1000));
  return { success: true };
}

export function ApplyBoothModal({ event, onClose, onSuccess }: ApplyBoothModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    try {
      const result = await mockApplyBooth(event.expo_id, selectedType);
      if (result.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#3674B5] to-[#498AC3] p-6 rounded-t-2xl">
          <div className="flex items-start justify-between text-white">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">สมัครบูธ</h2>
              <h3 className="text-lg font-semibold text-white/90 mb-1">{event.title}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {event.location}
                </span>
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {event.start_date} - {event.end_date}
                </span>
              </div>
            </div>
            <button onClick={onClose} disabled={loading}
              className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg disabled:opacity-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">เลือกประเภทบูธ</h3>
            <p className="text-sm text-gray-500">เลือกขนาดบูธที่เหมาะสมกับธุรกิจของคุณ</p>
          </div>

          {/* Booth Types */}
          <div className="space-y-3">
            {BOOTH_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                disabled={loading}
                className={`w-full p-5 rounded-xl border-2 transition text-left
                  ${selectedType === type.value
                    ? 'border-[#3674B5] bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">{type.label}</h4>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#3674B5]">{type.price}</p>
                        <p className="text-xs text-gray-500">บาท</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">ขนาด:</span> {type.size}
                      </p>
                      <p className="text-sm text-gray-500">{type.desc}</p>
                    </div>
                  </div>
                  {selectedType === type.value && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="3" className="flex-shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <div className="flex-1 text-sm">
                <p className="font-semibold text-[#3674B5] mb-1">หมายเหตุ</p>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• คำขอจะถูกส่งไปยังผู้จัดงานเพื่อพิจารณา</li>
                  <li>• หลังจากได้รับการอนุมัติ จะต้องชำระเงินภายใน 7 วัน</li>
                  <li>• ติดตามสถานะได้ที่หน้า "คำขอของฉัน"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition disabled:opacity-50">
            ยกเลิก
          </button>
          <button onClick={handleSubmit} disabled={!selectedType || loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-bold rounded-xl hover:shadow-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10"/>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                กำลังส่งคำขอ...
              </span>
            ) : 'ส่งคำขอสมัคร'}
          </button>
        </div>

      </div>
    </div>
  );
}