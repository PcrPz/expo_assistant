// src/features/notifications/components/NotificationCard.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, X } from 'lucide-react';
import { NOTI_CONFIG } from '../config/notiConfig';
import {
  getNotiDetail,
  followBack, followResponse,
  respondExpoInvitation,
  respondBoothGroupInvitation,
  respondJoinBooth,
  getOtherUser, getExpoInfo, getBoothInfo,
  getBoothGroupInfo, getJoinFormInfo, getEventInfo,
} from '../api/notiApi';
import type { NotiItem, NotiDetail } from '../types/noti.types';
import { UserProfileModal } from './UserProfileModal';

interface Props {
  noti: NotiItem;
  onMarkRead: (id: string) => void;
  onMarkAccepted: (id: string, accepted: boolean) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'เมื่อกี้';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

const NEEDS_DETAIL: NotiItem['Type'][] = [
  'new_follower', 'following_request',
  'expo_invitation',
  'expo_payment_confirmed', 'expo_close_payment',
  'ticket_payment_confirmed', 'ticket_scanned',
  'waiting_queue', 'calling_queue',
  'booth_group_invitation',
  'booth_request_join', 'booth_invite_join', 'booth_response_join',
  'booth_payment_confirmed',
  'booth_noti',
  'event_reminder',
];

export function NotificationCard({ noti, onMarkRead, onMarkAccepted }: Props) {
  const router = useRouter();
  const config = NOTI_CONFIG[noti.Type];
  const Icon = config.icon;

  // title — ประโยคหลักที่อธิบายครบ (ดึงจาก detail)
  // ถ้ายังไม่โหลด ใช้ noti.Title จาก list ก่อน
  const [displayTitle, setDisplayTitle] = useState(
    noti.Title && !noti.Title.includes('_') ? noti.Title : config.label
  );
  // subtext — context สั้นๆ เช่น ชื่องาน · เวลา
  const [subtext, setSubtext] = useState(timeAgo(noti.CreatedAt));

  const [actionLoading, setActionLoading] = useState(false);
  const [actionDone, setActionDone] = useState(noti.IsAccept !== null);
  const [acceptedResult, setAcceptedResult] = useState<boolean | null>(noti.IsAccept);
  const [showModal, setShowModal] = useState(false);
  const [modalUserId, setModalUserId] = useState<string | null>(null);
  const detailCache = useRef<NotiDetail | null>(null);

  // ─── ดึง detail → set title + subtext ───────────────────
  useEffect(() => {
    if (!NEEDS_DETAIL.includes(noti.Type)) return;
    let cancelled = false;

    async function load() {
      try {
        const detail = await getNotiDetail(noti.NotiID, noti.Type);
        if (!detail || cancelled) return;
        detailCache.current = detail;
        const d = detail as any;

        switch (noti.Type) {
          // ── User ────────────────────────────────────────
          case 'new_follower': {
            const user = await getOtherUser(d.FollowUserID);
            if (!user || cancelled) break;
            setDisplayTitle(`${user.Firstname} ${user.Lastname} ติดตามคุณแล้ว`);
            setSubtext(timeAgo(noti.CreatedAt));
            break;
          }
          case 'following_request': {
            const user = await getOtherUser(d.FollowUserID);
            if (!user || cancelled) break;
            setDisplayTitle(`${user.Firstname} ${user.Lastname} ขอติดตามคุณ`);
            setSubtext(timeAgo(noti.CreatedAt));
            break;
          }

          // ── Expo ────────────────────────────────────────
          case 'expo_invitation': {
            const expo = await getExpoInfo(d.ExpoID);
            if (!expo || cancelled) break;
            setDisplayTitle(`ได้รับเชิญเป็น Staff งาน ${expo.Title}`);
            setSubtext(timeAgo(noti.CreatedAt));
            break;
          }

          // ── ExpoPayment ─────────────────────────────────
          case 'expo_payment_confirmed': {
            const expo = await getExpoInfo(d.ExpoID);
            if (!expo || cancelled) break;
            setDisplayTitle(`ชำระค่าใช้จ่ายภายในงาน ${expo.Title} สำเร็จ`);
            setSubtext(`${expo.Title} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }
          case 'expo_close_payment': {
            const expo = await getExpoInfo(d.ExpoID);
            if (!expo || cancelled) break;
            setDisplayTitle(`งาน ${expo.Title} จบแล้ว กรุณาชำระเงินค่าจัดงาน`);
            setSubtext(`${expo.Title} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }

          // ── ExpoTicket ──────────────────────────────────
          case 'ticket_payment_confirmed': {
            const expo = await getExpoInfo(d.ExpoID);
            if (!expo || cancelled) break;
            setDisplayTitle(`ชำระค่า Ticket งาน ${expo.Title} สำเร็จ`);
            setSubtext(`${expo.Title} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }
          case 'ticket_scanned': {
            const expo = await getExpoInfo(d.ExpoID);
            if (!expo || cancelled) break;
            setDisplayTitle(`Ticket งาน ${expo.Title} ถูก Scan แล้ว`);
            setSubtext(`${expo.Title} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }

          // ── BoothQueue ──────────────────────────────────
          case 'waiting_queue': {
            const booth = await getBoothInfo(d.ExpoID, d.BoothID);
            if (!booth || cancelled) break;
            setDisplayTitle(`ใกล้ถึงคิวของคุณที่บูธ ${booth.BoothNo}`);
            setSubtext(`บูธ ${booth.BoothNo} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }
          case 'calling_queue': {
            const booth = await getBoothInfo(d.ExpoID, d.BoothID);
            if (!booth || cancelled) break;
            setDisplayTitle(`ถึงคิวของคุณที่บูธ ${booth.BoothNo} แล้ว!`);
            setSubtext(`บูธ ${booth.BoothNo} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }

          // ── BoothGroup ──────────────────────────────────
          case 'booth_group_invitation': {
            const bg = await getBoothGroupInfo(d.BoothGroupID);
            if (!bg || cancelled) break;
            setDisplayTitle(`ได้รับเชิญเข้า Booth Group ${bg.Title}`);
            setSubtext(`${bg.Title} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }

          // ── BoothJoinForm ────────────────────────────────
          case 'booth_request_join': {
            const form = await getJoinFormInfo(d.RequestID);
            if (!form || cancelled) break;
            setDisplayTitle(`มีคำขอร่วมออกบูธ ${form.BoothNo} งาน ${form.ExpoTitle}`);
            setSubtext(`บูธ ${form.BoothNo} · ${form.ExpoTitle} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }
          case 'booth_invite_join': {
            const form = await getJoinFormInfo(d.RequestID);
            if (!form || cancelled) break;
            setDisplayTitle(`ได้รับคำเชิญร่วมออกบูธ ${form.BoothNo} งาน ${form.ExpoTitle}`);
            setSubtext(`บูธ ${form.BoothNo} · ${form.ExpoTitle} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }
          case 'booth_response_join': {
            const form = await getJoinFormInfo(d.RequestID);
            if (!form || cancelled) break;
            setDisplayTitle(`${form.BoothGroupTitle} ตอบรับคำขอบูธ ${form.BoothNo} งาน ${form.ExpoTitle}`);
            setSubtext(`บูธ ${form.BoothNo} · ${form.ExpoTitle} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }

          // ── BoothPayment ─────────────────────────────────
          case 'booth_payment_confirmed': {
            const form = await getJoinFormInfo(d.RequestID);
            if (!form || cancelled) break;
            setDisplayTitle(`ชำระค่าบูธ ${form.BoothNo} งาน ${form.ExpoTitle} สำเร็จ`);
            setSubtext(`บูธ ${form.BoothNo} · ${form.ExpoTitle} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }

          // ── BoothNoti ────────────────────────────────────
          case 'booth_noti': {
            const booth = await getBoothInfo(d.ExpoID, d.BoothID);
            if (!booth || cancelled) break;
            // title ใช้จาก noti.Title (ชื่อประกาศ) ไม่เปลี่ยน
            setSubtext(`บูธ ${booth.BoothNo} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }

          // ── Event ────────────────────────────────────────
          case 'event_reminder': {
            const ev = await getEventInfo(d.ExpoID, d.EventID);
            if (!ev || cancelled) break;
            setDisplayTitle(`กิจกรรม ${ev.Title} จะเริ่มเร็วๆ นี้`);
            setSubtext(`${ev.Title} · ${timeAgo(noti.CreatedAt)}`);
            break;
          }
        }
      } catch { /* silent */ }
    }

    load();
    return () => { cancelled = true; };
  }, [noti.NotiID, noti.Type]);

  // ─── Handle card click → navigate / open modal ──────────
  async function handleClick() {
    if (!noti.IsRead) onMarkRead(noti.NotiID);
    const detail = (detailCache.current ?? await getNotiDetail(noti.NotiID, noti.Type)) as any;
    if (!detail) return;
    detailCache.current = detail;

    switch (noti.Type) {
      case 'new_follower':
      case 'following_request':
        setModalUserId(detail.FollowUserID);
        setShowModal(true);
        break;
      case 'expo_payment_confirmed':
        router.push(`/events/${detail.ExpoID}`); break;
      case 'expo_close_payment':
        router.push(`/events/${detail.ExpoID}?tab=checkout`); break;
      case 'expo_noti':
        router.push(`/events/${detail.ExpoID}/announcements/${detail.ExpoNotiID}`); break;
      case 'booth_request_join':
        router.push(`/events/${detail.ExpoID}?tab=applications`); break;
      case 'booth_invite_join':
        router.push('/booths/my-invitations'); break;
    }
  }

  // ─── Handle action (✓/✗) ─────────────────────────────────
  async function handleAction(accepted: boolean) {
    setActionLoading(true);
    const detail = (detailCache.current ?? await getNotiDetail(noti.NotiID, noti.Type)) as any;
    if (!detail) { setActionLoading(false); return; }
    detailCache.current = detail;

    let ok = false;
    switch (noti.Type) {
      case 'new_follower':
        ok = await followBack(noti.NotiID); break;
      case 'following_request':
        ok = await followResponse(noti.NotiID, accepted); break;
      case 'expo_invitation':
        ok = await respondExpoInvitation(noti.NotiID, accepted); break;
      case 'booth_group_invitation':
        ok = await respondBoothGroupInvitation(noti.NotiID, accepted); break;

    }

    if (ok) {
      onMarkAccepted(noti.NotiID, accepted);
      onMarkRead(noti.NotiID);
      setActionDone(true);
      setAcceptedResult(accepted);
    }
    setActionLoading(false);
  }

  // navigate types ที่กด card แล้วไปหน้าอื่น (ไม่รวม new_follower/following_request ที่ใช้ modal)
  const hasNavigate = [
    'expo_payment_confirmed', 'expo_close_payment',
    'expo_noti', 'booth_request_join', 'booth_invite_join',
  ].includes(noti.Type);

  // user types ที่กด card แล้วเปิด modal
  const isUserType = noti.Type === 'new_follower' || noti.Type === 'following_request';

  const hasAction = config.group === 'A' && !actionDone;
  const isFollowBack = noti.Type === 'new_follower';

  // card กดได้ถ้า navigate หรือเป็น user type (เปิด modal)
  const isClickable = (hasNavigate && !hasAction) || isUserType;

  return (
    <div
      className={`relative flex gap-3 px-4 py-3 transition-colors
        ${isClickable ? 'cursor-pointer' : 'cursor-default'}
        ${!noti.IsRead
          ? 'bg-white border-l-[3px] border-l-[#3674B5]'
          : 'bg-[#F5F7FA] border-l-[3px] border-l-[#E9ECF0]'}
        hover:bg-[#EEF4FB]/60`}
      onClick={isClickable ? handleClick : undefined}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: config.iconBg }}
      >
        <Icon size={16} color={config.iconColor} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start gap-1.5">
          <p className={`text-[12.5px] font-semibold leading-snug line-clamp-2 flex-1
            ${!noti.IsRead ? 'text-gray-900' : 'text-gray-600'}`}>
            {displayTitle}
          </p>
          {/* dot ยังไม่อ่าน — ข้างๆ title ไม่ทับ arrow */}
          {!noti.IsRead && (
            <span className="w-2 h-2 rounded-full bg-[#3674B5] flex-shrink-0 mt-1.5" />
          )}
          {(hasNavigate && !hasAction || isUserType) && (
            <ArrowRight size={13} className="text-gray-400 flex-shrink-0 mt-1" />
          )}
        </div>

        {/* Subtext — context สั้นๆ */}
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
          {subtext}
        </p>

        {/* Action buttons */}
        {hasAction && (
          <div className="flex gap-1.5 mt-2" onClick={e => e.stopPropagation()}>
            {isFollowBack ? (
              <button
                onClick={() => handleAction(true)}
                disabled={actionLoading}
                className="flex items-center gap-1 px-3 rounded-lg bg-[#3674B5] text-white text-[11.5px] font-semibold
                  hover:bg-[#2d6aa8] transition disabled:opacity-50"
                style={{ height: 26 }}
              >
                <Check size={10} /> ติดตามกลับ
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleAction(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-1 px-3 rounded-lg bg-[#3674B5] text-white text-[11.5px] font-semibold
                    hover:bg-[#2d6aa8] transition disabled:opacity-50"
                  style={{ height: 26 }}
                >
                  <Check size={10} /> ยอมรับ
                </button>
                <button
                  onClick={() => handleAction(false)}
                  disabled={actionLoading}
                  className="flex items-center gap-1 px-3 rounded-lg bg-gray-100 text-gray-600 text-[11.5px] font-semibold
                    hover:bg-gray-200 transition disabled:opacity-50"
                  style={{ height: 26 }}
                >
                  <X size={10} /> ปฏิเสธ
                </button>
              </>
            )}
          </div>
        )}

        {/* Result */}
        {config.group === 'A' && actionDone && acceptedResult !== null && (
          <p className="text-[11px] mt-1.5 italic">
            {acceptedResult
              ? <span className="text-[#4CAF82]">✓ ยอมรับแล้ว</span>
              : <span className="text-red-400">✗ ปฏิเสธแล้ว</span>
            }
          </p>
        )}
      </div>

      {/* User Profile Modal */}
      {showModal && modalUserId && (noti.Type === 'new_follower' || noti.Type === 'following_request') && (
        <UserProfileModal
          userId={modalUserId}
          notiId={noti.NotiID}
          type={noti.Type}
          onClose={() => setShowModal(false)}
          onActionDone={(id, accepted) => {
            onMarkAccepted(id, accepted);
            onMarkRead(id);
            setActionDone(true);
            setAcceptedResult(accepted);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}