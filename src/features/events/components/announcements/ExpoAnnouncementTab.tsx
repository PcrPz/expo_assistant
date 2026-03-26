// src/features/events/components/announcements/ExpoAnnouncementTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Megaphone, Send, Edit2, Trash2, Eye } from 'lucide-react';
import {
  getExpoAnnouncements,
  getExpoAnnouncementDetail,
} from '../../api/expoAnnouncementApi';
import { CreateExpoAnnouncementModal } from './CreateExpoAnnouncementModal';
import { EditExpoAnnouncementModal } from './EditExpoAnnouncementModal';
import { ExpoAnnouncementDetailModal } from './ExpoAnnouncementDetailModal';
import { PublishExpoAnnouncementModal } from './PublishExpoAnnouncementModal';
import { DeleteExpoAnnouncementModal } from './DeleteExpoAnnouncementModal';
import type {
  ExpoAnnouncement,
  ExpoAnnouncementDetail,
  ExpoAnnouncementStatus,
} from '../../types/expoAnnouncement.types';
import type { EventRole } from '../../types/event.types';

// ─── Constants ────────────────────────────────────────────────
const BLUE  = '#3674B5';
const BLUE2 = '#498AC3';

interface Props {
  expoID: string;
  role: EventRole;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ══════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════

export function ExpoAnnouncementTab({ expoID, role }: Props) {
  const [announcements, setAnnouncements] = useState<ExpoAnnouncement[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState<'all' | ExpoAnnouncementStatus>('all');

  const [createOpen,     setCreateOpen]     = useState(false);
  const [selected,       setSelected]       = useState<ExpoAnnouncementDetail | null>(null);
  const [detailOpen,     setDetailOpen]     = useState(false);
  const [editOpen,       setEditOpen]       = useState(false);
  const [publishTarget,  setPublishTarget]  = useState<ExpoAnnouncement | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<ExpoAnnouncement | null>(null);

  const canManage = role === 'owner' || role === 'admin' || role === 'system_admin';
  const canPublish = canManage;

  useEffect(() => { load(); }, [expoID]);

  async function load() {
    setIsLoading(true);
    try {
      const data = await getExpoAnnouncements(expoID);
      setAnnouncements(data);
    } catch {
      console.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  }

  async function openDetail(notiID: string) {
    try {
      const detail = await getExpoAnnouncementDetail(expoID, notiID);
      setSelected(detail);
      setDetailOpen(true);
    } catch { console.error('Failed to load detail'); }
  }

  async function openEdit(notiID: string) {
    try {
      const detail = await getExpoAnnouncementDetail(expoID, notiID);
      setSelected(detail);
      setEditOpen(true);
    } catch { console.error('Failed to load for edit'); }
  }

  async function refreshDetail() {
    await load();
    if (selected) {
      try {
        const updated = await getExpoAnnouncementDetail(expoID, selected.NotiID);
        setSelected(updated);
      } catch { setDetailOpen(false); }
    }
  }

  const filtered = announcements
    .filter(a => {
      const matchSearch = a.Title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.Status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (!a.PublishAt && !b.PublishAt) return 0;
      if (!a.PublishAt) return 1;
      if (!b.PublishAt) return -1;
      return new Date(b.PublishAt).getTime() - new Date(a.PublishAt).getTime();
    });

  const totalCount     = announcements.length;
  const publishedCount = announcements.filter(a => a.Status === 'publish').length;
  const draftCount     = announcements.filter(a => a.Status === 'unpublish').length;

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-[3px] border-gray-200 border-t-[#3674B5] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">กำลังโหลดประกาศ...</p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">ประกาศจากงาน</h2>
          <p className="text-sm text-gray-400 mt-0.5">จัดการประกาศสำหรับผู้เข้าร่วมงาน</p>
        </div>
        {canManage && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
          >
            <Plus className="w-4 h-4" />
            สร้างประกาศ
          </button>
        )}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

        {/* Stat pills */}
        {announcements.length > 0 && (
          <>
            <div className="flex items-center gap-2.5 px-4 pt-4 pb-3.5">
              {[
                { label: 'ทั้งหมด',   value: totalCount,     color: BLUE      },
                { label: 'เผยแพร่',   value: publishedCount, color: '#16A34A' },
                { label: 'ฉบับร่าง',  value: draftCount,     color: '#6B7280' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50">
                  <span className="text-base font-black leading-none" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-xs font-semibold text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mx-4" />
          </>
        )}

        {/* Search + filter */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาประกาศ..."
              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-white"
            />
          </div>
          <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
            {([
              { key: 'all',       label: 'ทั้งหมด' },
              { key: 'publish',   label: 'เผยแพร่' },
              { key: 'unpublish', label: 'ร่าง' },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === f.key
                    ? 'bg-white text-[#3674B5] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Empty ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 px-6 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1">
            {search || statusFilter !== 'all' ? 'ไม่พบประกาศที่ค้นหา' : 'ยังไม่มีประกาศ'}
          </p>
          <p className="text-xs text-gray-400">
            {search || statusFilter !== 'all'
              ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'
              : canManage ? 'กดปุ่ม "สร้างประกาศ" เพื่อเริ่มต้น' : 'ยังไม่มีประกาศในงานนี้'}
          </p>
          {canManage && !search && statusFilter === 'all' && (
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-4 px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-sm"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
            >
              สร้างประกาศแรก
            </button>
          )}
        </div>
      ) : (

        /* ── Table ──────────────────────────────────────────── */
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_160px_140px] bg-gray-50 border-b border-gray-100 px-5 py-2.5">
            {['ประกาศ', 'สถานะ', 'วันที่เผยแพร่', 'จัดการ'].map((h, i) => (
              <div
                key={h}
                className="text-[11px] font-bold text-gray-400 uppercase tracking-wide"
                style={i === 3 ? { textAlign: 'right' } : undefined}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((ann, idx) => {
            const isPublished = ann.Status === 'publish';
            return (
              <div
                key={ann.NotiID}
                onClick={() => openDetail(ann.NotiID)}
                className={`group grid grid-cols-[1fr_120px_160px_140px] items-center px-5 py-3.5 cursor-pointer hover:bg-[#F8FAFC] transition-colors ${
                  idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                {/* Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: isPublished ? '#EEF4FB' : '#F3F4F6' }}
                  >
                    <Megaphone
                      className="w-4 h-4"
                      style={{ color: isPublished ? BLUE : '#9CA3AF' }}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[13px] font-semibold truncate group-hover:text-[#3674B5] transition-colors ${
                      isPublished ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {ann.Title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {isPublished ? 'เผยแพร่แล้ว' : 'ยังไม่ได้เผยแพร่'}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <div>
                  {isPublished ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-[5px] h-[5px] rounded-full bg-emerald-500 flex-shrink-0" />
                      เผยแพร่แล้ว
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                      <span className="w-[5px] h-[5px] rounded-full bg-gray-400 flex-shrink-0" />
                      ฉบับร่าง
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="text-[12px] text-gray-500">
                  {ann.PublishAt ? (
                    <span className="flex items-center gap-1.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {formatDate(ann.PublishAt)}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-1.5 justify-end"
                  onClick={e => e.stopPropagation()}
                >
                  {/* ดูรายละเอียด */}
                  <button
                    onClick={() => openDetail(ann.NotiID)}
                    className="w-[30px] h-[30px] rounded-lg flex items-center justify-center transition hover:bg-[#ddeaf5]"
                    style={{ backgroundColor: '#EEF4FB' }}
                    title="ดูรายละเอียด"
                  >
                    <Eye className="w-3.5 h-3.5" style={{ color: BLUE }} />
                  </button>

                  {/* เผยแพร่ — เฉพาะร่าง */}
                  {!isPublished && canPublish && (
                    <button
                      onClick={() => setPublishTarget(ann)}
                      className="w-[30px] h-[30px] rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition"
                      title="เผยแพร่"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  )}

                  {/* แก้ไข */}
                  {canManage && (
                    <button
                      onClick={() => openEdit(ann.NotiID)}
                      className="w-[30px] h-[30px] rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  )}

                  {/* ลบ */}
                  {canManage && (
                    <button
                      onClick={() => setDeleteTarget(ann)}
                      className="w-[30px] h-[30px] rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────── */}
      <CreateExpoAnnouncementModal
        expoID={expoID}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); load(); }}
      />

      {selected && (
        <ExpoAnnouncementDetailModal
          announcement={selected}
          expoID={expoID}
          canManage={canManage}
          canPublish={canPublish}
          open={detailOpen}
          onClose={() => { setDetailOpen(false); setSelected(null); }}
          onEdit={() => { setDetailOpen(false); setEditOpen(true); }}
          onRefresh={refreshDetail}
        />
      )}

      <EditExpoAnnouncementModal
        expoID={expoID}
        announcement={selected}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => { setEditOpen(false); load(); if (detailOpen) refreshDetail(); }}
      />

      {publishTarget && (
        <PublishExpoAnnouncementModal
          expoID={expoID}
          announcement={publishTarget}
          onClose={() => setPublishTarget(null)}
          onSuccess={() => { setPublishTarget(null); load(); }}
        />
      )}

      {deleteTarget && (
        <DeleteExpoAnnouncementModal
          expoID={expoID}
          announcement={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => { setDeleteTarget(null); load(); }}
        />
      )}
    </div>
  );
}