// src/features/booths/components/staff/BoothStaffList.tsx
"use client";

import { useState } from "react";
import { Users, Mail, Trash2, AlertCircle } from "lucide-react";
import type { BoothStaff } from "../../types/booth.types";
import type { EventRole } from '@/src/features/events/types/event.types';
import { canRemoveStaffFromBooth } from "../../utils/permissions";

interface BoothStaffListProps {
  staff: BoothStaff[];
  canManage: boolean;
  currentUserEmail: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
  onRemove?: (staffId: string) => void;
}

export function BoothStaffList({
  staff,
  canManage,
  currentUserEmail,
  userRole,
  isAssignedStaff,
  onRemove,
}: BoothStaffListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const assignedStaff = staff.filter((s) => s.is_staff);

  const handleRemove = async (staffId: string) => {
    if (!confirm("คุณต้องการลบทีมงานคนนี้ออกจากบูธหรือไม่?")) {
      return;
    }

    setRemovingId(staffId);
    try {
      await onRemove?.(staffId);
    } finally {
      setRemovingId(null);
    }
  };

  const getInitials = (firstname: string, lastname: string) => {
    const first = (firstname || '').charAt(0).toUpperCase();
    const last = (lastname || '').charAt(0).toUpperCase();
    return first + last || '??';
  };

  if (assignedStaff.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">ยังไม่มีทีมงาน</h3>
          <p className="text-sm text-gray-500 mt-2">
            {canManage
              ? "เริ่มต้นโดยการเพิ่มทีมงานเข้าบูธนี้"
              : "ยังไม่มีการมอบหมายทีมงานให้บูธนี้"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">ทีมงานในบูธ</h3>
        <p className="text-sm text-gray-500 mt-1">
          ทีมงานที่ได้รับมอบหมายให้ดูแลบูธนี้ ({assignedStaff.length} คน)
        </p>
      </div>

      {!canManage && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              คุณไม่สามารถจัดการทีมงานได้ กรุณาติดต่อผู้จัดงาน
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่อ-นามสกุล
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                อีเมล
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              {canManage && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assignedStaff.map((member) => {
              // ✅ เช็ค permission ด้วย email
              const canRemoveThisStaff = canRemoveStaffFromBooth(
                userRole,
                isAssignedStaff,
                member.email,
                currentUserEmail
              );

              const isCurrentUser = member.email === currentUserEmail;

              return (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-sm">
                        {getInitials(member.firstname, member.lastname)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.firstname || '(ไม่มีชื่อ)'} {member.lastname || '(ไม่มีนามสกุล)'}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-blue-600">(คุณ)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.role === "booth_staff"
                            ? "ทีมงานบูธ"
                            : member.role || 'ไม่ระบุ'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {member.email || '(ไม่มีอีเมล)'}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        member.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : member.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {member.status === "accepted"
                        ? "เข้าร่วมแล้ว"
                        : member.status === "pending"
                        ? "รอยืนยัน"
                        : member.status || "ไม่ทราบ"}
                    </span>
                  </td>

                  {canManage && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {canRemoveThisStaff ? (
                        <button
                          onClick={() => handleRemove(member.id)}
                          disabled={removingId === member.id}
                          className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="ลบทีมงาน"
                        >
                          {removingId === member.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400" title="ไม่สามารถลบตัวเองได้">
                          -
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}