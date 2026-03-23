// src/features/events/components/create/SuccessScreen.tsx
'use client';

import { useRouter } from 'next/navigation';

interface SuccessScreenProps {
  eventId: string;
}

/**
 * Success Screen - แสดงหลังสร้างงาน Expo สำเร็จ
 * ให้เลือกไปหน้า Home หรือ Event Detail
 */
export default function SuccessScreen({ eventId }: SuccessScreenProps) {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Outer Circle - Animated */}
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
            
            {/* Main Circle */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl">
              <svg 
                className="w-12 h-12 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={3}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          สร้างงานสำเร็จเเล้ว
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          งาน Expo ของคุณถูกสร้างเรียบร้อยแล้ว
          <br />
          <span className="text-sm text-gray-500 mt-2 block">
            สถานะ: <span className="font-semibold text-yellow-600">รอชำระเงินมัดจำ</span>
          </span>
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">ขั้นตอนถัดไป:</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>ชำระเงินมัดจำเพื่อเผยแพร่งาน</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>งานจะแสดงให้ผู้ร่วมบูธเห็นหลังชำระเงิน</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>คุณสามารถแก้ไขรายละเอียดได้ตลอดเวลา</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Go to Event Detail */}
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="px-8 py-4 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span>ไปหน้างาน</span>
          </button>

          {/* Go to Home */}
          <button
            onClick={() => router.push('/home')}
            className="px-8 py-4 bg-white text-[#3674B5] font-bold text-lg rounded-xl border-2 border-[#3674B5] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>กลับหน้าแรก</span>
          </button>
        </div>

        {/* Tips */}
        <p className="mt-8 text-sm text-gray-500">
          <span className="font-medium">!เพิ่มเติม:</span> คุณสามารถชำระเงินมัดจำได้จากหน้ารายละเอียดงาน
        </p>
      </div>
    </div>
  );
}