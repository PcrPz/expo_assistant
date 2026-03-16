// src/features/notifications/components/UserProfileModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Mail, Phone, Briefcase, Building2,
  FileText, UserPlus, UserCheck
} from 'lucide-react';
import { getOtherUser, followBack, followResponse } from '../api/notiApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { OtherUserInfo } from '../types/noti.types';

interface Props {
  userId: string;
  notiId: string;
  type: 'new_follower' | 'following_request';
  onClose: () => void;
  onActionDone: (notiId: string, accepted: boolean) => void;
}

export function UserProfileModal({ userId, notiId, type, onClose, onActionDone }: Props) {
  const [user, setUser] = useState<OtherUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const [acceptedResult, setAcceptedResult] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  const isFollowRequest = type === 'following_request';

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getOtherUser(userId);
      setUser(data);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function handleAction(accepted: boolean) {
    setActionLoading(true);
    let ok = false;

    if (type === 'new_follower') {
      ok = await followBack(notiId);
    } else {
      ok = await followResponse(notiId, accepted);
    }

    if (ok) {
      setActionDone(true);
      setAcceptedResult(accepted);
      onActionDone(notiId, accepted);
    }
    setActionLoading(false);
  }

  const initials = user
    ? `${user.Firstname?.[0] ?? ''}${user.Lastname?.[0] ?? ''}`
    : '?';

  const profilePicUrl = user?.ProfilePic ? getMinioFileUrl(user.ProfilePic) : null;

  if (!mounted) return null;

  // ── Portal render ออกไปที่ document.body โดยตรง ──────────
  return createPortal(
    <>
      {/* Backdrop — คลิกปิด modal */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ zIndex: 9998 }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      />

      {/* Modal wrapper */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl pointer-events-auto" data-modal="user-profile" onClick={e => e.stopPropagation()}>

          {/* Header gradient */}
          <div
            className="relative h-24 overflow-hidden rounded-t-2xl"
            style={{ background: 'linear-gradient(135deg, #3674B5 0%, #5B9BD5 100%)' }}
          >
            <div className="absolute w-32 h-32 rounded-full bg-white/[0.07] -top-10 -right-8" />
            <div className="absolute w-16 h-16 rounded-full bg-white/[0.05] top-3 right-20" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              <X size={14} color="white" strokeWidth={2.5} />
            </button>
          </div>

          {/* Avatar — ล้นออกมาจาก header */}
          <div className="flex flex-col items-center -mt-11 px-5 pb-4 relative z-10">
            <div
              className="w-[88px] h-[88px] rounded-full border-4 border-white shadow-lg overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3674B5, #5B9BD5)' }}
            >
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt={user?.Firstname}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-[#3674B5]/20 border-t-[#3674B5] rounded-full animate-spin" />
                <p className="text-xs text-gray-400">กำลังโหลด...</p>
              </div>
            ) : user ? (
              <>
                <h2 className="text-lg font-bold text-gray-900 mt-3 text-center">
                  {user.Firstname} {user.Lastname}
                </h2>
                {user.Career && (
                  <span className="mt-1.5 text-xs font-semibold text-[#5B8FC9] bg-[#EEF4FB] rounded-full px-3 py-1">
                    {user.Career}
                  </span>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {isFollowRequest ? 'ขอติดตามคุณ' : 'ติดตามคุณแล้ว'}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-4">ไม่พบข้อมูลผู้ใช้</p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mx-5" />

          {/* Info rows */}
          {user && (
            <div className="px-5 py-2">
              {[
                { icon: Mail,      label: 'อีเมล',         value: user.Email },
                { icon: Phone,     label: 'เบอร์โทรศัพท์', value: user.Tel },
                { icon: Briefcase, label: 'อาชีพ',         value: user.Career },
                { icon: Building2, label: 'บริษัท/องค์กร', value: user.Company },
                { icon: FileText,  label: 'เกี่ยวกับ',      value: user.Detail },
              ].map(({ icon: Icon, label, value }) => {
                if (!value) return null;
                return (
                  <div key={label} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-[9px] bg-[#EEF4FB] flex items-center justify-center flex-shrink-0">
                      <Icon size={13} color="#5B8FC9" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10.5px] text-gray-400 font-medium mb-0.5">{label}</p>
                      <p className="text-[13px] text-gray-800 font-medium leading-snug">{value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action footer */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            {actionDone ? (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center
                  ${acceptedResult ? 'bg-[#ECFDF5]' : 'bg-red-50'}`}>
                  <UserCheck size={14} color={acceptedResult ? '#4CAF82' : '#F87171'} strokeWidth={2.5} />
                </div>
                <p className={`text-sm font-semibold ${acceptedResult ? 'text-[#4CAF82]' : 'text-red-400'}`}>
                  {isFollowRequest
                    ? (acceptedResult ? 'ยอมรับคำขอแล้ว' : 'ปฏิเสธคำขอแล้ว')
                    : 'ติดตามกลับแล้ว'
                  }
                </p>
              </div>
            ) : isFollowRequest ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction(false)}
                  disabled={actionLoading || loading || !user}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                    bg-gray-100 text-gray-600 text-sm font-semibold
                    hover:bg-gray-200 transition disabled:opacity-50"
                >
                  <X size={14} /> ปฏิเสธ
                </button>
                <button
                  onClick={() => handleAction(true)}
                  disabled={actionLoading || loading || !user}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                    text-white text-sm font-semibold
                    hover:opacity-90 transition disabled:opacity-50 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}
                >
                  <UserCheck size={14} /> ยอมรับ
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAction(true)}
                disabled={actionLoading || loading || !user}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                  text-white text-sm font-semibold
                  hover:opacity-90 transition disabled:opacity-50 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}
              >
                <UserPlus size={15} /> ติดตามกลับ
              </button>
            )}
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}