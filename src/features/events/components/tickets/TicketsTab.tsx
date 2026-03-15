// src/features/events/components/tickets/TicketsTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import type { Ticket } from '../../types/ticket.types';
import { getTicketList, deleteTicket } from '../../api/ticketApi';
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
      alert('ไม่สามารถลบตั๋วได้');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = tickets.filter(t =>
    t.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.Detail ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Ticket icon — SVG ไม่ใช้ lucide เพราะอยากให้ดูเหมือนตั๋วจริง */}
          <div className="w-10 h-10 rounded-xl bg-[#3674B5] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 1 1 0 6V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 1 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">การจัดการตั๋ว</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isLoading ? '...' : `${tickets.length} ประเภท`}
            </p>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5d96] transition text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            สร้างตั๋ว
          </button>
        )}
      </div>

      {/* ── Search — แสดงเมื่อมีตั๋วแล้ว ── */}
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
        /* ── Ticket List ── */
        <div className="space-y-3">
          {filtered.map((ticket, idx) => (
            <TicketRow
              key={ticket.TicketID}
              ticket={ticket}
              index={idx}
              canManage={canManage}
              onEdit={() => setEditingTicket(ticket)}
              onDelete={() => setDeletingTicket(ticket)}
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
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">ยืนยันลบตั๋ว?</p>
                <p className="text-xs text-gray-400 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700">
              ลบ <span className="font-semibold">"{deletingTicket.Title}"</span> ออกจากระบบ
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setDeletingTicket(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />กำลังลบ...</>
                  : 'ลบตั๋ว'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TicketRow — แถวตั๋วทรง physical ticket
// ─────────────────────────────────────────────
interface TicketRowProps {
  ticket: Ticket;
  index: number;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function TicketRow({ ticket, canManage, onEdit, onDelete }: TicketRowProps) {
  const priceNum = parseFloat(ticket.Price);
  const isFree = !isNaN(priceNum) && priceNum === 0;

  const priceDisplay = isNaN(priceNum)
    ? ticket.Price
    : isFree
      ? 'ฟรี'
      : `฿${priceNum.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  return (
    <div className="group relative flex items-stretch rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-[#3674B5]/40 transition-all duration-200 overflow-hidden">

      {/* ── Price stub (left) ── */}
      <div
        className="relative flex-shrink-0 flex flex-col items-center justify-center w-28 py-5 px-3"
        style={{
          background: isFree
            ? 'linear-gradient(160deg, #059669 0%, #10b981 100%)'
            : 'linear-gradient(160deg, #3674B5 0%, #4d8fc9 100%)',
        }}
      >
        {/* Notch cutouts */}
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-50 rounded-full z-10" style={{boxShadow:'inset 0 1px 3px rgba(0,0,0,0.08)'}} />
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-50 rounded-full z-10" style={{boxShadow:'inset 0 -1px 3px rgba(0,0,0,0.08)'}} />

        {/* Price text */}
        {isFree ? (
          <span className="text-white font-black text-xl tracking-tight">FREE</span>
        ) : (
          <div className="text-center">
            <div className="text-white/60 text-[10px] font-medium uppercase tracking-widest mb-0.5">ราคา</div>
            <div className="text-white font-black text-lg leading-none">{priceDisplay}</div>
          </div>
        )}
      </div>

      {/* ── Perforation ── */}
      <div className="self-stretch flex items-center">
        <div className="w-px h-full border-l-2 border-dashed border-gray-200 relative">
          {/* อยู่เหมือนเดิม notch จะซ่อนอยู่ตรงนี้โดย overflow hidden */}
        </div>
      </div>

      {/* ── Ticket body ── */}
      <div className="flex-1 flex items-center gap-4 px-5 py-4 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-[15px] truncate group-hover:text-[#3674B5] transition-colors">
            {ticket.Title}
          </p>
          {ticket.Detail ? (
            <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{ticket.Detail}</p>
          ) : (
            <p className="text-sm text-gray-300 mt-0.5 italic text-xs">ไม่มีรายละเอียด</p>
          )}
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex-shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#3674B5] bg-[#3674B5]/8 rounded-lg hover:bg-[#3674B5]/15 transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              แก้ไข
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-400 bg-red-50 rounded-lg hover:bg-red-100 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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
      {/* Ticket illustration */}
      <div className="mb-5">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="4" y="16" width="56" height="32" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5"/>
          {/* Notch left */}
          <circle cx="4" cy="32" r="6" fill="white" stroke="#BFDBFE" strokeWidth="1.5"/>
          {/* Notch right */}
          <circle cx="60" cy="32" r="6" fill="white" stroke="#BFDBFE" strokeWidth="1.5"/>
          {/* Dashed line */}
          <line x1="20" y1="20" x2="20" y2="44" stroke="#BFDBFE" strokeWidth="1.5" strokeDasharray="3 2.5"/>
          {/* Stub lines */}
          <rect x="8" y="26" width="6" height="2.5" rx="1.25" fill="#93C5FD"/>
          <rect x="8" y="31" width="4" height="2.5" rx="1.25" fill="#93C5FD" opacity="0.6"/>
          <rect x="8" y="36" width="5" height="2.5" rx="1.25" fill="#93C5FD" opacity="0.6"/>
          {/* Main area */}
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
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3674B5] text-white rounded-lg text-sm font-medium hover:bg-[#2d5d96] transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          สร้างตั๋วแรก
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
          <div className="w-28 bg-gray-200 animate-pulse" style={{minHeight:'72px'}} />
          <div className="flex-1 px-5 py-4 space-y-2.5">
            <div className="h-4 bg-gray-100 rounded-lg w-1/3 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}