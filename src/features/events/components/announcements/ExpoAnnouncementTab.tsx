// src/features/events/components/announcements/ExpoAnnouncementTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Send } from 'lucide-react';
import {
  getExpoAnnouncements,
  getExpoAnnouncementDetail,
  deleteExpoAnnouncement,
} from '../../api/expoAnnouncementApi';
import { CreateExpoAnnouncementModal } from './CreateExpoAnnouncementModal';
import { EditExpoAnnouncementModal } from './EditExpoAnnouncementModal';
import { ExpoAnnouncementDetailModal } from './ExpoAnnouncementDetailModal';
import { PublishExpoAnnouncementModal } from './PublishExpoAnnouncementModal';
import { DeleteExpoAnnouncementModal } from './DeleteExpoAnnouncementModal';
import type { ExpoAnnouncement, ExpoAnnouncementDetail, ExpoAnnouncementStatus } from '../../types/expoAnnouncement.types';
import type { EventRole } from '../../types/event.types';

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

function StatusBadge({ status }: { status: ExpoAnnouncementStatus }) {
  return status === 'publish' ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
      เผยแพร่แล้ว
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
      ฉบับร่าง
    </span>
  );
}

export function ExpoAnnouncementTab({ expoID, role }: Props) {
  const [announcements, setAnnouncements] = useState<ExpoAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ExpoAnnouncementStatus>('all');

  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<ExpoAnnouncementDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [publishTarget, setPublishTarget] = useState<ExpoAnnouncement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpoAnnouncement | null>(null);

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

  const publishedCount = announcements.filter(a => a.Status === 'publish').length;
  const draftCount = announcements.filter(a => a.Status === 'unpublish').length;

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

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">ประกาศจากงาน</h2>
          <div className="flex items-center gap-3 mt-0.5">
            {publishedCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                เผยแพร่ {publishedCount}
              </span>
            )}
            {draftCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                ร่าง {draftCount}
              </span>
            )}
          </div>
        </div>
        {canManage && (
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
            <Plus className="w-4 h-4" />
            สร้างประกาศ
          </button>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาประกาศ..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-white" />
        </div>
        <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
          {([
            { key: 'all', label: 'ทั้งหมด' },
            { key: 'publish', label: 'เผยแพร่' },
            { key: 'unpublish', label: 'ร่าง' },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${statusFilter === f.key ? 'bg-white text-[#3674B5] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 px-6 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
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
            <button onClick={() => setCreateOpen(true)}
              className="mt-4 px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-sm"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
              สร้างประกาศแรก
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(ann => (
            <div key={ann.NotiID} onClick={() => openDetail(ann.NotiID)}
              className="group bg-white border border-gray-100 rounded-xl px-4 py-3 cursor-pointer flex items-center gap-3 hover:border-[#C7DDF4] hover:shadow-sm transition-all">

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${ann.Status === 'publish' ? 'bg-[#EEF4FB]' : 'bg-gray-50'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={ann.Status === 'publish' ? '#3674B5' : '#9CA3AF'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className={`text-sm font-semibold leading-snug truncate
                    ${ann.Status === 'publish' ? 'text-gray-900' : 'text-gray-600'}`}>
                    {ann.Title}
                  </p>
                  <StatusBadge status={ann.Status} />
                </div>
                <div className="flex items-center justify-between">
                  {ann.PublishAt ? (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {formatDate(ann.PublishAt)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">ยังไม่ได้เผยแพร่</span>
                  )}

                  {canManage && (
                    <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                      {/* ปุ่มเผยแพร่ — เฉพาะร่าง */}
                      {ann.Status === 'unpublish' && (
                        <button onClick={() => setPublishTarget(ann)}
                          className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold text-white transition"
                          style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
                          <Send className="w-3 h-3" />
                          เผยแพร่
                        </button>
                      )}
                      <button onClick={() => openEdit(ann.NotiID)}
                        className="w-7 h-7 rounded-lg bg-[#EEF4FB] hover:bg-[#ddeaf5] flex items-center justify-center transition">
                        <Edit2 className="w-3 h-3 text-[#3674B5]" />
                      </button>
                      <button onClick={() => setDeleteTarget(ann)}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition">
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <svg className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <CreateExpoAnnouncementModal
        expoID={expoID} open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); load(); }}
      />

      {selected && (
        <ExpoAnnouncementDetailModal
          announcement={selected} expoID={expoID}
          canManage={canManage} canPublish={canPublish}
          open={detailOpen}
          onClose={() => { setDetailOpen(false); setSelected(null); }}
          onEdit={() => { setDetailOpen(false); setEditOpen(true); }}
          onRefresh={refreshDetail}
        />
      )}

      <EditExpoAnnouncementModal
        expoID={expoID} announcement={selected}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => { setEditOpen(false); load(); if (detailOpen) refreshDetail(); }}
      />

      {publishTarget && (
        <PublishExpoAnnouncementModal
          expoID={expoID} announcement={publishTarget}
          onClose={() => setPublishTarget(null)}
          onSuccess={() => { setPublishTarget(null); load(); }}
        />
      )}

      {deleteTarget && (
        <DeleteExpoAnnouncementModal
          expoID={expoID} announcement={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => { setDeleteTarget(null); load(); }}
        />
      )}
    </div>
  );
}