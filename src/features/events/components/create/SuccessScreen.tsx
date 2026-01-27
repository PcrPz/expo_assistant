// src/features/events/components/create/SuccessScreen.tsx
'use client';

import { useRouter } from 'next/navigation';

interface SuccessScreenProps {
  expoId: string | null;
  onFinish: () => void;
}

export default function SuccessScreen({ expoId, onFinish }: SuccessScreenProps) {
  const router = useRouter();

  // ✅ เปลี่ยนให้ไปหน้า Home แทน
  const handleGoToHome = () => {
    router.push('/home');
  };

  // ✅ (Optional) ไปหน้า Events List
  const handleGoToEventsList = () => {
    router.push('/events');
  };

  return (
    <div className="text-center py-16">
      {/* Success Icon */}
      <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <svg 
          width="64" 
          height="64" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#10B981" 
          strokeWidth="3"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        สร้างงานสำเร็จ! 🎉
      </h2>

      {/* Event ID */}
      {expoId && (
        <div className="mb-8 max-w-md mx-auto">
          <div className="bg-blue-50 border-2 border-[#5B9BD5] rounded-xl p-6">
            <p className="text-sm text-gray-700 mb-2">รหัสงาน</p>
            <p className="text-2xl font-bold text-[#5B9BD5]">{expoId}</p>
          </div>
        </div>
      )}

      {/* Message */}
      <p className="text-gray-600 text-xl mb-4">
        งานของคุณถูกสร้างเรียบร้อยแล้ว
      </p>
      <p className="text-gray-500 text-sm mb-12">
        ทีมงานจะตรวจสอบข้อมูลและอนุมัติงานภายใน 1-2 วันทำการ
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        {/* ✅ ปุ่มหลัก: กลับหน้าหลัก */}
        <button
          onClick={handleGoToHome}
          className="flex-1 px-8 py-4 bg-[#5B9BD5] text-white text-lg font-semibold rounded-xl hover:bg-[#4A8BC2] transition shadow-lg"
        >
          กลับหน้าหลัก
        </button>
        
        {/* ✅ ปุ่มรอง: ดูงานทั้งหมด */}
        <button
          onClick={handleGoToEventsList}
          className="flex-1 px-8 py-4 border-2 border-[#5B9BD5] text-[#5B9BD5] text-lg font-semibold rounded-xl hover:bg-blue-50 transition"
        >
          ดูงานทั้งหมด
        </button>
      </div>

      {/* Info Note */}
      <div className="mt-8 max-w-lg mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-semibold">หมายเหตุ:</span> งานของคุณอยู่ในสถานะ "รอการอนุมัติ" 
                คุณสามารถดูและแก้ไขข้อมูลได้ที่หน้าจัดการงาน
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}