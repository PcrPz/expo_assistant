"use client";

import { useState, useMemo } from "react";
import { UserPlus, Search, Check } from "lucide-react";
import { updateBoothStaff } from "../../api/boothApi";
import type { BoothStaff } from "../../types/booth.types";

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  boothId: string;
  expoId: string;
  allStaff: BoothStaff[];
  onSuccess?: () => void;
}

export function AssignStaffModal({
  isOpen,
  onClose,
  boothId,
  expoId,
  allStaff,
  onSuccess,
}: AssignStaffModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableStaff = useMemo(() => {
    return allStaff.filter((staff) => !staff.is_staff);
  }, [allStaff]);

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return availableStaff;

    const searchLower = searchQuery.toLowerCase();
    return availableStaff.filter(
      (staff) =>
        (staff.firstname || '').toLowerCase().includes(searchLower) ||
        (staff.lastname || '').toLowerCase().includes(searchLower) ||
        (staff.email || '').toLowerCase().includes(searchLower)
    );
  }, [availableStaff, searchQuery]);

  const toggleStaff = (staffId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(staffId)) {
      newSelected.delete(staffId);
    } else {
      newSelected.add(staffId);
    }
    setSelectedIds(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      alert("กรุณาเลือกทีมงานอย่างน้อย 1 คน");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ เรียกแบบใหม่ที่ถูกต้อง
      const success = await updateBoothStaff(expoId, {
        booth_id: boothId,
        add_staff_list: Array.from(selectedIds),
        delete_staff_list: [],
      });

      if (success) {
        alert(`เพิ่มทีมงาน ${selectedIds.size} คนสำเร็จ`);
        onSuccess?.();
        handleClose();
      } else {
        alert("เกิดข้อผิดพลาดในการเพิ่มทีมงาน");
      }
    } catch (error: any) {
      console.error('Error adding staff:', error);
      alert(error.message || "เกิดข้อผิดพลาดในการเพิ่มทีมงาน");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedIds(new Set());
    onClose();
  };

  const getInitials = (firstname: string, lastname: string) => {
    const first = (firstname || '').charAt(0).toUpperCase();
    const last = (lastname || '').charAt(0).toUpperCase();
    return first + last || '??';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[600px] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">เพิ่มทีมงานเข้าบูธ</h2>
          <p className="text-sm text-gray-500 mt-1">
            เลือกทีมงานที่ต้องการมอบหมายให้ดูแลบูธนี้
          </p>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อหรืออีเมล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="px-6 py-2 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Check className="h-4 w-4" />
              <span>เลือกแล้ว {selectedIds.size} คน</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredStaff.length === 0 ? (
            <div className="py-12 text-center">
              <UserPlus className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">
                {searchQuery ? "ไม่พบทีมงานที่ค้นหา" : "ไม่มีทีมงานที่พร้อมมอบหมาย"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    selectedIds.has(staff.id)
                      ? "bg-blue-50 border-blue-500"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => toggleStaff(staff.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(staff.id)}
                    onChange={() => toggleStaff(staff.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium">
                    {getInitials(staff.firstname, staff.lastname)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {staff.firstname || '(ไม่มีชื่อ)'} {staff.lastname || '(ไม่มีนามสกุล)'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {staff.email || '(ไม่มีอีเมล)'}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      staff.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {staff.status === "accepted" ? "เข้าร่วมแล้ว" : "รอยืนยัน"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedIds.size === 0 || isSubmitting}
            className="px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>กำลังเพิ่ม...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>เพิ่มทีมงาน ({selectedIds.size})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}