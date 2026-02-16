// src/app/(protected)/events/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BasicInfoForm from '@/src/features/events/components/create/BasicInfoForm';
import ZoneDetailsForm from '@/src/features/events/components/create/ZoneDetailsForm';
import SummaryPreview from '@/src/features/events/components/create/SummaryPreview';
import SuccessScreen from '@/src/features/events/components/create/SuccessScreen';
import type { CreateEventRequest, Zone } from '@/src/features/events/types/event.types';
import type { ZoneWithFile } from '@/src/features/zones/api/zoneApi';

/**
 * Create Event Page - 3 Steps Version + Success Screen
 * 
 * Step 1: ข้อมูลพื้นฐาน (Basic Info)
 * Step 2: โซนและบูธย่อย (Zones & Sub-booths)
 * Step 3: สรุปและสร้างงาน (Summary & Create) → Status: Pending
 * Step 4: Success Screen (แสดงหลังสร้างเสร็จ)
 */
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

  const handleZonesChange = (updatedZones: Zone[], updatedZonesWithFiles: ZoneWithFile[]) => {
    setZonesWithFiles(updatedZonesWithFiles);
    setFormData(prev => ({ ...prev, zones: updatedZones }));
  };

  const handleEventCreated = (expoId: string) => {
    console.log('✅ Event created with ID:', expoId);
    setCreatedExpoID(expoId);
    // ✅ ไปหน้า Success Screen
    setCurrentStep(4);
  };

  // Step labels (only 3 creation steps)
  const stepLabels = [
    'ข้อมูลพื้นฐาน',
    'โซนและบูธ',
    'สรุปและสร้างงาน'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
            {currentStep === 4 ? 'งานสร้างสำเร็จ' : 'สร้างงาน Expo'}
          </h1>
          <p className="text-center text-gray-600 mb-12">
            {currentStep === 4 
              ? 'งาน Expo ของคุณพร้อมแล้ว'
              : 'กรอกข้อมูลเพื่อสร้างงาน Expo ของคุณ'
            }
          </p>

          {/* Progress Bar - Hide on Success Screen */}
          {currentStep < 4 && (
            <div className="mb-12">
              <div className="flex items-center justify-center">
                {[1, 2, 3].map((step, index) => (
                  <div key={step} className="flex items-center">
                    {/* Step Circle */}
                    <div className="flex flex-col items-center">
                      <div className={`
                        flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl transition-all
                        ${step < currentStep 
                          ? 'bg-[#3674B5] text-white' 
                          : step === currentStep
                          ? 'bg-[#3674B5] text-white ring-4 ring-blue-200'
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
                      {/* Step Label */}
                      <p className={`
                        mt-2 text-sm font-medium text-center
                        ${step === currentStep ? 'text-[#3674B5]' : 'text-gray-500'}
                      `}>
                        {stepLabels[step - 1]}
                      </p>
                    </div>

                    {/* Connector Line */}
                    {index < 2 && (
                      <div className={`
                        w-24 h-1 mx-4 transition-all
                        ${step < currentStep ? 'bg-[#3674B5]' : 'bg-gray-300'}
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Content */}
          <div>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <BasicInfoForm
                formData={formData}
                onChange={handleFormDataChange}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {/* Step 2: Zones & Sub-booths */}
            {currentStep === 2 && (
              <ZoneDetailsForm
                zones={formData.zones || []}
                zonesWithFiles={zonesWithFiles}
                onChange={handleZonesChange}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {/* Step 3: Summary & Create */}
            {currentStep === 3 && (
              <SummaryPreview
                formData={formData}
                zones={zonesWithFiles}
                onBack={() => setCurrentStep(2)}
                onEventCreated={handleEventCreated}
              />
            )}

            {/* Step 4: Success Screen */}
            {currentStep === 4 && createdExpoID && (
              <SuccessScreen eventId={createdExpoID} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}