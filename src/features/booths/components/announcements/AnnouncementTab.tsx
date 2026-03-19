// src/features/booths/components/announcements/AnnouncementsTab.tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Megaphone } from 'lucide-react';
import { AnnouncementCard } from './AnnouncementCard';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';
import { AnnouncementDetailModal } from './AnnouncementDetailModal';
import { getBoothAnnouncements, getBoothAnnouncementDetail } from '../../api/announcementApi';
import type { BoothAnnouncement, BoothAnnouncementDetail, AnnouncementStatus } from '../../types/announcement.types';
import { EditAnnouncementModal } from './EditAnnouncementModal';

interface AnnouncementsTabProps {
  expoID: string;
  boothID: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

export function AnnouncementsTab({
  expoID,
  boothID,
  canCreate,
  canEdit,
  canDelete,
  canPublish,
}: AnnouncementsTabProps) {
  const [announcements, setAnnouncements] = useState<BoothAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AnnouncementStatus>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<BoothAnnouncementDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [expoID, boothID]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await getBoothAnnouncements(expoID, boothID);
      setAnnouncements(data);
    } catch (error) {
      alert('ไม่สามารถโหลดประกาศได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (notiID: string) => {
    try {
      const detail = await getBoothAnnouncementDetail(expoID, notiID);
      setSelectedAnnouncement(detail);
      setIsDetailModalOpen(true);
    } catch (error) {
      alert('ไม่สามารถโหลดรายละเอียดประกาศได้');
    }
  };

  const handleEdit = async (notiID: string) => {
    try {
      const detail = await getBoothAnnouncementDetail(expoID, notiID);
      setSelectedAnnouncement(detail);
      setIsEditModalOpen(true);
    } catch (error) {
      alert('ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้');
    }
  };

  const handleEditFromDetail = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleRefreshFromDetail = async () => {
    await fetchAnnouncements();
    if (selectedAnnouncement) {
      try {
        const updated = await getBoothAnnouncementDetail(expoID, selectedAnnouncement.NotiID);
        setSelectedAnnouncement(updated);
      } catch (error) {
        // Announcement might be deleted
        setIsDetailModalOpen(false);
      }
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = announcement.Title.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
    const matchesStatus =
      statusFilter === 'all' || announcement.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (!a.PublishAt && !b.PublishAt) return 0;
    if (!a.PublishAt) return 1;
    if (!b.PublishAt) return -1;
    return new Date(b.PublishAt).getTime() - new Date(a.PublishAt).getTime();
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">ประกาศของบูธ</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            จัดการประกาศและโปรโมชั่นสำหรับผู้เข้าชม
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            สร้างประกาศ
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหาประกาศ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | AnnouncementStatus)}
          className="px-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] bg-white w-full sm:w-[180px]"
        >
          <option value="all">ทั้งหมด</option>
          <option value="publish">เผยแพร่แล้ว</option>
          <option value="unpublish">ยังไม่เผยแพร่</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl h-64 animate-pulse"
            />
          ))}
        </div>
      ) : sortedAnnouncements.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-[#E2E8F0]">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'ไม่พบประกาศที่ค้นหา'
              : 'ยังไม่มีประกาศ'}
          </h3>
          <p className="text-xs text-gray-400 mb-0">
            {searchQuery || statusFilter !== 'all'
              ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองของคุณ'
              : canCreate
              ? 'เริ่มต้นสร้างประกาศแรกของคุณ'
              : 'ยังไม่มีประกาศในบูธนี้'}
          </p>
          {canCreate && !searchQuery && statusFilter === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition"
            >
              <Plus className="w-4 h-4" />
              สร้างประกาศแรก
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAnnouncements.map((announcement) => (
            <AnnouncementCard
            key={announcement.NotiID}
            announcement={announcement}
            canManage={canEdit && canDelete}
            onView={() => handleViewDetail(announcement.NotiID)}
            onEdit={() => handleEdit(announcement.NotiID)}
            onRefresh={fetchAnnouncements}
            expoId={expoID}
            boothId={boothID} // ✅ เพิ่มบรรทัดนี้
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateAnnouncementModal
        expoID={expoID}
        boothID={boothID}
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchAnnouncements();
        }}
      />

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        expoId={expoID}
        boothId={boothID} // ✅ เพิ่มบรรทัดนี้
        canManage={canEdit && canDelete}
        canPublish={canPublish}
        onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAnnouncement(null);
        }}
        onEdit={handleEditFromDetail}
        onRefresh={handleRefreshFromDetail}
        open={isDetailModalOpen}
        />
      )}

      {/* Edit Modal */}
        <EditAnnouncementModal
        expoID={expoID}
        boothID={boothID} // ✅ เพิ่มบรรทัดนี้
        announcement={selectedAnnouncement}
        open={isEditModalOpen}
        onClose={() => {
            setIsEditModalOpen(false);
        }}
        onSuccess={() => {
            setIsEditModalOpen(false);
            fetchAnnouncements();
            if (isDetailModalOpen) {
            handleRefreshFromDetail();
            }
        }}
        />
    </div>
  );
}