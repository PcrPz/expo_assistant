// src/features/events/components/tickets/TicketsTab.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import type { Ticket } from '../../types/ticket.types';
import { getTicketList, deleteTicket, updateTicketStatus } from '../../api/ticketApi';
import { CreateTicketModal } from './CreateTicketModal';
import { EditTicketModal } from './EditTicketModal';

interface TicketsTabProps {
  expoID: string;
  canManage: boolean;
  onTicketsChange?: () => void;
}

export function TicketsTab({ expoID, canManage, onTicketsChange }: TicketsTabProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [confirmStatusTicket, setConfirmStatusTicket] = useState<Ticket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTicketList(expoID);
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [expoID]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleDelete = async () => {
    if (!deletingTicket) return;
    try {
      setIsDeleting(true);
      await deleteTicket(expoID, deletingTicket.TicketID);
      setDeletingTicket(null);
      loadTickets();
      onTicketsChange?.();
    } catch {
      toast.error('ไม่สามารถลบตั๋วได้');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (ticket: Ticket) => {
    const newStatus = ticket.Status === 'publish' ? 'unpublish' : 'publish';
    try {
      await updateTicketStatus(expoID, ticket.TicketID, { status: newStatus });
      setConfirmStatusTicket(null);
      loadTickets();
      onTicketsChange?.();
    } catch {
      toast.error('ไม่สามารถเปลี่ยนสถานะตั๋วได้');
    }
  };

  const filtered = tickets.filter(t =>
    t.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.Detail ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">การจัดการตั๋ว</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {isLoading ? '...' : `${tickets.length} ประเภทตั๋ว`}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}
          >
            <Plus className="w-4 h-4" />
            สร้างตั๋ว
          </button>
        )}
      </div>

      {/* ── Search ── */}
      {!isLoading && tickets.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือรายละเอียด..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-white transition-colors placeholder:text-gray-300"
          />
        </div>
      )}

      {/* ── States ── */}
      {isLoading ? (
        <SkeletonList />
      ) : tickets.length === 0 ? (
        <EmptyState canManage={canManage} onCreate={() => setShowCreateModal(true)} />
      ) : filtered.length === 0 ? (
        <p className="text-center py-10 text-sm text-gray-400">ไม่พบตั๋วที่ค้นหา</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <TicketRow
              key={ticket.TicketID}
              ticket={ticket}
              canManage={canManage}
              onEdit={() => setEditingTicket(ticket)}
              onDelete={() => setDeletingTicket(ticket)}
              onToggleStatus={() => setConfirmStatusTicket(ticket)}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {showCreateModal && (
        <CreateTicketModal
          expoID={expoID}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); loadTickets(); onTicketsChange?.(); }}
        />
      )}
      {editingTicket && (
        <EditTicketModal
          expoID={expoID}
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
          onSuccess={() => { setEditingTicket(null); loadTickets(); onTicketsChange?.(); }}
        />
      )}

      {/* ── Delete confirm ── */}
      {deletingTicket && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !isDeleting && setDeletingTicket(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">ยืนยันลบตั๋ว?</p>
                <p className="text-sm text-gray-400 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 text-center">
              ลบ <span className="font-semibold">"{deletingTicket.Title}"</span> ออกจากระบบ
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setDeletingTicket(null)} disabled={isDeleting}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
                ยกเลิก
              </button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isDeleting
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />กำลังลบ...</>
                  : 'ลบตั๋ว'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status confirm modal ── */}
      {confirmStatusTicket && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmStatusTicket(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#EEF4FB]">
              {confirmStatusTicket.Status === 'publish' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">
                  {confirmStatusTicket.Status === 'publish' ? 'ซ่อนตั๋วนี้?' : 'เผยแพร่ตั๋วนี้?'}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {confirmStatusTicket.Status === 'publish'
                    ? 'ตั๋วจะถูกซ่อนจากผู้เข้าร่วมงาน'
                    : 'ตั๋วจะแสดงให้ผู้เข้าร่วมงานเห็น'}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 text-center">
              <span className="font-semibold">"{confirmStatusTicket.Title}"</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setConfirmStatusTicket(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                ยกเลิก
              </button>
              <button
                onClick={() => handleToggleStatus(confirmStatusTicket)}
                className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition"
                style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
                {confirmStatusTicket.Status === 'publish' ? 'ยืนยันซ่อน' : 'ยืนยันเผยแพร่'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TicketRow
// ─────────────────────────────────────────────
interface TicketRowProps {
  ticket: Ticket;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

function TicketRow({ ticket, canManage, onEdit, onDelete, onToggleStatus }: TicketRowProps) {
  const priceNum = parseFloat(ticket.Price);
  const isFree = !isNaN(priceNum) && priceNum === 0;
  const isPublished = ticket.Status === 'publish';
  const soldOut = ticket.Amount !== null && ticket.Remaining !== null && ticket.Remaining === 0;
  const isLow = ticket.Amount !== null && ticket.Remaining !== null
    && ticket.Remaining > 0
    && (ticket.Remaining / ticket.Amount) <= 0.1;

  const priceDisplay = isNaN(priceNum) ? ticket.Price
    : isFree ? 'FREE'
    : `฿${priceNum.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const stripBg = soldOut ? '#9CA3AF'
    : isFree ? '#3B6D11'
    : isPublished ? '#3674B5'
    : '#9CA3AF';

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-[#3674B5]/40 hover:shadow-sm transition-all duration-200 flex items-stretch">

      {/* ── Price strip ── */}
      <div
        className="relative flex-shrink-0 flex flex-col items-center justify-center w-[88px] py-5 px-3"
        style={{ background: stripBg }}
      >
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#F0F4F8]" />
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#F0F4F8]" />
        {isFree ? (
          <span className="text-white font-black text-lg tracking-wide">FREE</span>
        ) : (
          <>
            <span className="text-white/60 text-[10px] uppercase tracking-widest mb-0.5">ราคา</span>
            <span className="text-white font-bold text-[17px] leading-tight">{priceDisplay}</span>
          </>
        )}
      </div>

      {/* ── Perforation ── */}
      <div className="self-stretch border-l-2 border-dashed border-gray-200 flex-shrink-0" />

      {/* ── Content ── */}
      <div className="flex-1 px-5 py-4 min-w-0">

        {/* Row 1: title + badges + actions */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <p className="font-semibold text-gray-900 text-[15px] group-hover:text-[#3674B5] transition-colors">
            {ticket.Title}
          </p>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
            isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isPublished ? 'เผยแพร่' : 'ยังไม่เผยแพร่'}
          </span>
          {soldOut && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700">
              หมดแล้ว
            </span>
          )}
          {isLow && !soldOut && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700">
              เหลือน้อย
            </span>
          )}

          {canManage && (
            <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onToggleStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition bg-[#EEF4FB] text-[#3674B5] hover:bg-[#D8EAF8]">
                {isPublished ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {isPublished ? 'ซ่อน' : 'เผยแพร่'}
              </button>
              <button onClick={onEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                <Pencil className="w-3.5 h-3.5" />แก้ไข
              </button>
              <button onClick={onDelete}
                className="p-1.5 text-red-400 bg-red-50 rounded-lg hover:bg-red-100 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Row 2: detail */}
        {ticket.Detail ? (
          <p className="text-sm text-gray-400 line-clamp-1 mb-3">{ticket.Detail}</p>
        ) : (
          <p className="text-xs text-gray-300 italic mb-3">ไม่มีรายละเอียด</p>
        )}

        {/* Row 3: stats */}
        <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 pt-3">
          {ticket.Amount === null ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-[12px] font-semibold text-gray-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              ไม่จำกัดจำนวน
            </span>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F1FB] rounded-lg">
                <span className="text-[12px] text-[#185FA5]">จำนวนทั้งหมด</span>
                <span className="text-[14px] font-semibold text-[#0C447C]">
                  {ticket.Amount.toLocaleString()} ใบ
                </span>
              </span>
              <span className="text-gray-200">·</span>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                soldOut ? 'bg-[#FCEBEB]' : isLow ? 'bg-amber-50' : 'bg-[#EAF3DE]'
              }`}>
                <span className={`text-[12px] ${
                  soldOut ? 'text-[#A32D2D]' : isLow ? 'text-amber-700' : 'text-[#3B6D11]'
                }`}>คงเหลือ</span>
                <span className={`text-[14px] font-semibold ${
                  soldOut ? 'text-[#791F1F]' : isLow ? 'text-amber-800' : 'text-[#27500A]'
                }`}>
                  {ticket.Remaining !== null
                    ? `${ticket.Remaining.toLocaleString()} ใบ`
                    : `${ticket.Amount.toLocaleString()} ใบ`}
                </span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────
function EmptyState({ canManage, onCreate }: { canManage: boolean; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
      <div className="mb-5">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="4" y="16" width="56" height="32" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5"/>
          <circle cx="4" cy="32" r="6" fill="white" stroke="#BFDBFE" strokeWidth="1.5"/>
          <circle cx="60" cy="32" r="6" fill="white" stroke="#BFDBFE" strokeWidth="1.5"/>
          <line x1="20" y1="20" x2="20" y2="44" stroke="#BFDBFE" strokeWidth="1.5" strokeDasharray="3 2.5"/>
          <rect x="8" y="26" width="6" height="2.5" rx="1.25" fill="#93C5FD"/>
          <rect x="8" y="31" width="4" height="2.5" rx="1.25" fill="#93C5FD" opacity="0.6"/>
          <rect x="8" y="36" width="5" height="2.5" rx="1.25" fill="#93C5FD" opacity="0.6"/>
          <rect x="27" y="25" width="24" height="4" rx="2" fill="#93C5FD"/>
          <rect x="27" y="33" width="17" height="3" rx="1.5" fill="#BFDBFE"/>
          <rect x="27" y="39" width="20" height="3" rx="1.5" fill="#BFDBFE"/>
        </svg>
      </div>
      <p className="font-semibold text-gray-600 text-base mb-1">ยังไม่มีตั๋ว</p>
      <p className="text-sm text-gray-400 mb-5 text-center max-w-[240px] leading-relaxed">
        สร้างประเภทตั๋วเพื่อให้ผู้เข้าร่วมงานเลือกลงทะเบียน
      </p>
      {canManage && (
        <button onClick={onCreate}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
          <Plus className="w-4 h-4" />สร้างตั๋วแรก
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
function SkeletonList() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex rounded-2xl overflow-hidden border border-gray-100">
          <div className="w-[88px] bg-gray-200 animate-pulse" style={{ minHeight: '88px' }} />
          <div className="flex-1 px-5 py-4 space-y-2.5">
            <div className="h-4 bg-gray-100 rounded-lg w-1/3 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
            <div className="h-7 bg-gray-100 rounded-lg w-2/5 animate-pulse mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}