// src/features/booths/components/staff/BoothStaffTab.tsx
"use client";

import { useState, useEffect } from "react";
import { UserPlus, RefreshCw } from "lucide-react";
import { BoothStaffList } from "./BoothStaffList";
import { AssignStaffModal } from "./AssignStaffModal";
import { canAddStaffToBooth } from "../../utils/permissions";
import type { BoothStaff } from "../../types/booth.types";
import type { EventRole } from '@/src/features/events/types/event.types';
import { getBoothStaff, updateBoothStaff } from "../../api/boothApi";
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { canRemoveStaffFromBooth } from "../../utils/permissions";

interface BoothStaffTabProps {
  boothId: string;
  expoId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
}

export function BoothStaffTab({
  boothId,
  expoId,
  userRole,
  isAssignedStaff,
}: BoothStaffTabProps) {
  const user = useAuthStore((state) => state.user);
  const [staffList, setStaffList] = useState<BoothStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const canAddStaff = canAddStaffToBooth(userRole, isAssignedStaff);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data = await getBoothStaff(expoId, boothId);
      setStaffList(data);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      alert(error.message || "ไม่สามารถโหลดข้อมูลทีมงานได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [boothId, expoId]);

  // ✅ ใช้ Email แทน UserID
  const handleRemoveStaff = async (staffId: string) => {
    // หา staff object เพื่อเอา email
    const staffToRemove = staffList.find(s => s.id === staffId);
    if (!staffToRemove) {
      alert("ไม่พบข้อมูลทีมงาน");
      return;
    }

    // เช็ค permission ด้วย email
    const canRemove = canRemoveStaffFromBooth(
      userRole,
      isAssignedStaff,
      staffToRemove.email,
      user?.Email || ''
    );

    if (!canRemove) {
      alert("⚠️ คุณไม่สามารถลบตัวเองออกจากบูธได้");
      return;
    }

    try {
      const success = await updateBoothStaff(expoId, {
        booth_id: boothId,
        add_staff_list: [],
        delete_staff_list: [staffId],
      });

      if (success) {
        alert("ลบทีมงานสำเร็จ");
        fetchStaff();
      } else {
        alert("ไม่สามารถลบทีมงานได้");
      }
    } catch (error: any) {
      console.error('Error removing staff:', error);
      alert(error.message || "ไม่สามารถลบทีมงานได้");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">จัดการทีมงาน</h3>
          <p className="text-sm text-gray-500 mt-1">
            มอบหมายและจัดการทีมงานที่ดูแลบูธนี้
          </p>
        </div>
        {canAddStaff && (
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition"
          >
            <UserPlus className="h-4 w-4" />
            เพิ่มทีมงาน
          </button>
        )}
      </div>

      <BoothStaffList
        staff={staffList}
        canManage={canAddStaff}
        currentUserEmail={user?.Email || ''}
        userRole={userRole}
        isAssignedStaff={isAssignedStaff}
        onRemove={handleRemoveStaff}
      />

      {canAddStaff && (
        <AssignStaffModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          boothId={boothId}
          expoId={expoId}
          allStaff={staffList}
          onSuccess={fetchStaff}
        />
      )}
    </div>
  );
}