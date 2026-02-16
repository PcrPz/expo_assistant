// src/features/events/components/BoothInvitationsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BoothInvitation {
  id: string;
  boothId: string;
  boothName: string;
  boothCompany: string;
  boothProfilePic?: string;
  subBoothName: string;
  subBoothId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface BoothInvitationsTabProps {
  eventId: string;
}

/**
 * Booth Invitations Tab
 * แสดงรายการคำเชิญที่ส่งไปยังบูธสากล
 * Organizer สามารถยกเลิกคำเชิญ (ถ้ายัง Pending)
 */
export function BoothInvitationsTab({ eventId }: BoothInvitationsTabProps) {
  const [invitations, setInvitations] = useState<BoothInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    loadInvitations();
  }, [eventId]);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await getBoothInvitations(eventId);
      
      // Mock data for now
      const mockData: BoothInvitation[] = [
        {
          id: '1',
          boothId: 'booth-1',
          boothName: 'Digital Marketing Booth',
          boothCompany: 'MarketPro Ltd.',
          subBoothName: 'Zone B - Booth 5',
          subBoothId: 'sub-booth-5',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];
      
      setInvitations(mockData);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('คุณต้องการยกเลิกคำเชิญนี้หรือไม่?')) return;

    try {
      // TODO: API call to cancel invitation
      console.log('Cancel invitation:', invitationId);
      await loadInvitations();
    } catch (error) {
      console.error('Error canceling invitation:', error);
    }
  };

  const filteredInvitations = invitations.filter(inv => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'รอตอบรับ';
      case 'accepted': return 'ตอบรับ';
      case 'rejected': return 'ปฏิเสธ';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          คำเชิญที่ส่งไป
        </h2>
        
        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'pending', 'accepted', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'ทั้งหมด' : getStatusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Invitations List */}
      {filteredInvitations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">ยังไม่มีคำเชิญที่ส่งออก</p>
          <p className="text-gray-500 text-sm mt-2">
            ไปที่ "สำรวจบูธ" เพื่อเชิญบูธเข้างานของคุณ
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInvitations.map((inv) => (
            <div
              key={inv.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                {/* Left: Booth Info */}
                <div className="flex gap-4 flex-1">
                  {/* Booth Logo */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {inv.boothProfilePic ? (
                      <Image
                        src={inv.boothProfilePic}
                        alt={inv.boothName}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {inv.boothName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {inv.boothCompany}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📍 {inv.subBoothName}</span>
                      <span>📅 ส่งเมื่อ {new Date(inv.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(inv.status)}`}>
                    {getStatusLabel(inv.status)}
                  </span>

                  {inv.status === 'pending' && (
                    <button
                      onClick={() => handleCancelInvitation(inv.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 transition"
                    >
                      ยกเลิกคำเชิญ
                    </button>
                  )}

                  {inv.status === 'accepted' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>บูธตอบรับแล้ว</span>
                    </div>
                  )}

                  {inv.status === 'rejected' && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>บูธปฏิเสธ</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}