// src/app/(protected)/events/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BasicInfoForm from '@/src/features/events/components/create/BasicInfoForm';
import ZoneDetailsForm from '@/src/features/events/components/create/ZoneDetailsForm';
import SummaryPreview from '@/src/features/events/components/create/SummaryPreview';
import PaymentMethodForm from '@/src/features/events/components/create/PaymentMethodForm';
import SuccessScreen from '@/src/features/events/components/create/SuccessScreen';
import type { CreateEventRequest, Zone } from '@/src/features/events/types/event.types';
import type { ZoneWithFile } from '@/src/features/zones/api/zoneApi';

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<CreateEventRequest>({
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
    zones: [],
  });

  const [zonesWithFiles, setZonesWithFiles] = useState<ZoneWithFile[]>([]);
  const [createdExpoID, setCreatedExpoID] = useState<string | null>(null);

  const handleFormDataChange = (updates: Partial<CreateEventRequest>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // ✅ แก้ signature ให้ตรงกับ ZoneDetailsForm
  const handleZonesChange = (updatedZones: Zone[], updatedZonesWithFiles: ZoneWithFile[]) => {
    setZonesWithFiles(updatedZonesWithFiles);
    setFormData(prev => ({ ...prev, zones: updatedZones }));
  };

  const handleEventCreated = (expoId: string) => {
    console.log('✅ Event created with ID:', expoId);
    setCreatedExpoID(expoId);
  };

  const handleFinish = () => {
    if (createdExpoID) {
      router.push(`/events/${createdExpoID}`);
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
            สร้างงาน Expo
          </h1>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4, 5].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl transition-all
                    ${step < currentStep 
                      ? 'bg-[#5B9BD5] text-white' 
                      : step === currentStep
                      ? 'bg-[#5B9BD5] text-white'
                      : 'bg-gray-300 text-gray-600'
                    }
                  `}>
                    {step < currentStep ? (
                      <svg 
                        width="28" 
                        height="28" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      step
                    )}
                  </div>

                  {index < 4 && (
                    <div className={`
                      w-20 h-1 mx-2 transition-all
                      ${step < currentStep ? 'bg-[#5B9BD5]' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div>
            {currentStep === 1 && (
              <BasicInfoForm
                formData={formData}
                onChange={handleFormDataChange}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <ZoneDetailsForm
                zones={formData.zones || []}
                onChange={handleZonesChange}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <SummaryPreview
                formData={formData}
                zones={zonesWithFiles}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
                onEventCreated={handleEventCreated}
              />
            )}

            {currentStep === 4 && (
              <PaymentMethodForm
                expoId={createdExpoID}
                onNext={() => setCurrentStep(5)}
                onBack={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 5 && (
              <SuccessScreen
                expoId={createdExpoID}
                onFinish={handleFinish}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}