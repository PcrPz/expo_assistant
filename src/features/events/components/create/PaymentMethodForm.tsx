// src/features/events/components/create/PaymentMethodForm.tsx
'use client';

import { useState } from 'react';

interface PaymentMethodFormProps {
  expoId: string | null;
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentMethodForm({ expoId, onNext, onBack }: PaymentMethodFormProps) {
  const [selectedMethod, setSelectedMethod] = useState('');

  const paymentMethods = [
    {
      id: 'mobile-banking',
      name: 'Mobile Banking',
      description: 'SCB, Kbank, BBL',
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
    },
    {
      id: 'digital-wallet',
      name: 'Digital Wallet',
      description: 'SCB, Kbank, BBL',
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
        </svg>
      ),
    },
    {
      id: 'mobile-banking-2',
      name: 'Mobile Banking',
      description: 'SCB, Kbank, BBL',
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      ),
    },
  ];

  const pricingItems = [
    { name: 'Booth Rental', description: 'Standard 3x3m (3 days)', price: 500 },
    { name: 'App Service', description: 'Management System', price: 1200 },
    { name: 'Design Mapping 3D', description: 'Design Mapping for Expo', price: 1700 },
  ];

  const totalPrice = pricingItems.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = () => {
    if (!selectedMethod) {
      alert('กรุณาเลือกวิธีการชำระเงิน');
      return;
    }
    onNext();
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Payment Methods */}
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">วิธีการชำระเงิน</h3>

          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`
                  w-full p-5 rounded-xl border-2 transition-all text-left flex items-center gap-4
                  ${selectedMethod === method.id
                    ? 'border-[#5B9BD5] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className={`flex-shrink-0 ${selectedMethod === method.id ? 'text-[#5B9BD5]' : 'text-gray-600'}`}>
                  {method.icon}
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>

                <div className="flex-shrink-0">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${selectedMethod === method.id ? 'border-[#5B9BD5]' : 'border-gray-300'}
                  `}>
                    {selectedMethod === method.id && (
                      <div className="w-3 h-3 rounded-full bg-[#5B9BD5]"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Price Summary */}
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">สรุปค่าใช้จ่ายทั้งหมด</h3>

          <div className="space-y-6">
            {pricingItems.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-900">{item.name}</span>
                  <span className="font-bold text-[#5B9BD5] text-lg">${item.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            ))}

            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-xl">Total Price</span>
                <span className="font-bold text-[#5B9BD5] text-2xl">${totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          onClick={handleSubmit}
          className="px-12 py-4 bg-[#5B9BD5] text-white text-lg font-semibold rounded-xl hover:bg-[#4A8BC2] transition shadow-lg"
        >
          ดำเนินการชำระเงิน
        </button>
      </div>
    </div>
  );
}