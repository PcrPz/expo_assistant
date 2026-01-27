// src/features/booths/components/staff/BoothStaffSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface AvailableStaff {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  profile_pic: string | null;
  role: string;
  status: string;
  is_staff: boolean; // อยู่ในบูธนี้แล้วหรือยัง
}

interface BoothStaffSelectorProps {
  expoId: string;
  boothId: string;
  onUpdate: () => void; // Callback เมื่อเพิ่ม/ลบสำเร็จ
}

export function BoothStaffSelector({ expoId, boothId, onUpdate }: BoothStaffSelectorProps) {
  const [staff, setStaff] = useState<AvailableStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Selections
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStaff();
  }, [expoId, boothId]);

  // โหลดรายชื่อ Staff ที่สามารถเพิ่มได้
  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/get-staff/${boothId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }
      
      const data: AvailableStaff[] = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Selection (Add)
  const toggleAdd = (userId: string) => {
    const newSelection = new Set(selectedToAdd);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedToAdd(newSelection);
  };

  // Toggle Selection (Remove)
  const toggleRemove = (userId: string) => {
    const newSelection = new Set(selectedToRemove);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedToRemove(newSelection);
  };

  // Apply Changes
  const handleApply = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/update-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booth_id: boothId,
          add_staff_list: Array.from(selectedToAdd),
          delete_staff_list: Array.from(selectedToRemove),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update staff');
      }

      // Success
      setSelectedToAdd(new Set());
      setSelectedToRemove(new Set());
      await loadStaff();
      onUpdate();
    } catch (error) {
      console.error('Failed to update staff:', error);
      alert('เกิดข้อผิดพลาดในการอัพเดทพนักงาน');
    }
  };

  // Filter Staff
  const filteredStaff = staff.filter(person => {
    // Search Filter
    const matchesSearch = 
      person.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Show Only Available Filter
    const matchesAvailable = !showOnlyAvailable || !person.is_staff;

    return matchesSearch && matchesAvailable;
  });

  // Separate Lists
  const currentStaff = filteredStaff.filter(p => p.is_staff);
  const availableStaff = filteredStaff.filter(p => !p.is_staff);

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">กำลังโหลดรายชื่อ...</p>
        </div>
      </div>
    );
  }

  const hasChanges = selectedToAdd.size > 0 || selectedToRemove.size > 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ หรืออีเมล..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition">
          <input
            type="checkbox"
            checked={showOnlyAvailable}
            onChange={(e) => setShowOnlyAvailable(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            แสดงเฉพาะที่เลือกได้
          </span>
        </label>
      </div>

      {/* Current Staff */}
      {currentStaff.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              พนักงานในบูธปัจจุบัน ({currentStaff.length} คน)
            </h3>
            {selectedToRemove.size > 0 && (
              <span className="text-sm text-red-600 font-medium">
                เลือกลบ {selectedToRemove.size} คน
              </span>
            )}
          </div>

          <div className="space-y-2">
            {currentStaff.map((person) => (
              <StaffCard
                key={person.id}
                person={person}
                isSelected={selectedToRemove.has(person.id)}
                onToggle={() => toggleRemove(person.id)}
                variant="remove"
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Staff */}
      {availableStaff.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              พนักงานที่เลือกได้ ({availableStaff.length} คน)
            </h3>
            {selectedToAdd.size > 0 && (
              <span className="text-sm text-green-600 font-medium">
                เลือกเพิ่ม {selectedToAdd.size} คน
              </span>
            )}
          </div>

          <div className="space-y-2">
            {availableStaff.map((person) => (
              <StaffCard
                key={person.id}
                person={person}
                isSelected={selectedToAdd.has(person.id)}
                onToggle={() => toggleAdd(person.id)}
                variant="add"
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-600">
            {searchQuery
              ? 'ไม่พบรายชื่อที่ค้นหา'
              : 'ยังไม่มีพนักงานที่เป็น Booth Staff'
            }
          </p>
        </div>
      )}

      {/* Apply Button */}
      {hasChanges && (
        <div className="sticky bottom-0 pt-4 pb-2 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              {selectedToAdd.size > 0 && (
                <span className="text-green-600 font-medium">เพิ่ม {selectedToAdd.size}</span>
              )}
              {selectedToAdd.size > 0 && selectedToRemove.size > 0 && <span> · </span>}
              {selectedToRemove.size > 0 && (
                <span className="text-red-600 font-medium">ลบ {selectedToRemove.size}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedToAdd(new Set());
                  setSelectedToRemove(new Set());
                }}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Staff Card Component
// ============================================

interface StaffCardProps {
  person: AvailableStaff;
  isSelected: boolean;
  onToggle: () => void;
  variant: 'add' | 'remove';
}

function StaffCard({ person, isSelected, onToggle, variant }: StaffCardProps) {
  return (
    <label
      className={`
        flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition
        ${isSelected
          ? variant === 'add'
            ? 'border-green-500 bg-green-50'
            : 'border-red-500 bg-red-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className={`
          w-5 h-5 rounded focus:ring-2
          ${variant === 'add'
            ? 'text-green-600 focus:ring-green-500'
            : 'text-red-600 focus:ring-red-500'
          }
        `}
      />

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {person.firstname[0]?.toUpperCase()}
        {person.lastname[0]?.toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">
          {person.firstname} {person.lastname}
        </p>
        <p className="text-sm text-gray-600 truncate">{person.email}</p>
      </div>

      {/* Status Badge */}
      {person.is_staff && (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
          อยู่ในบูธ
        </span>
      )}
    </label>
  );
}