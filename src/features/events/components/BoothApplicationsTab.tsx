// src/features/events/components/BoothApplicationsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BoothApplication {
  id: string;
  boothId: string;
  boothName: string;
  boothCompany: string;
  boothProfilePic?: string;
  applicantName: string;
  subBoothName: string;
  subBoothId: string;
  status: 'pending' | 'accepted' | 'rejected';
  boothDetails: {
    title: string;
    detail: string;
    company: string;
    email: string;
    tel: string;
  };
  createdAt: string;
}

interface BoothApplicationsTabProps {
  eventId: string;
}

/**
 * Booth Applications Tab
 * แสดงรายการคำขอเข้าบูธ
 * Organizer สามารถ Accept/Reject
 */
export function BoothApplicationsTab({ eventId }: BoothApplicationsTabProps) {
  const [applications, setApplications] = useState<BoothApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<BoothApplication | null>(null);

  useEffect(() => {
    loadApplications();
  }, [eventId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await getBoothApplications(eventId);
      
      // Mock data for now
      const mockData: BoothApplication[] = [
        {
          id: '1',
          boothId: 'booth-1',
          boothName: 'Tech Startup Booth',
          boothCompany: 'StartupXYZ Co.',
          applicantName: 'John Doe',
          subBoothName: 'Zone A - Booth 1',
          subBoothId: 'sub-booth-1',
          status: 'pending',
          boothDetails: {
            title: 'Tech Startup Booth',
            detail: 'Innovative tech solutions for businesses',
            company: 'StartupXYZ Co.',
            email: 'contact@startupxyz.com',
            tel: '02-123-4567'
          },
          createdAt: new Date().toISOString()
        }
      ];
      
      setApplications(mockData);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (applicationId: string) => {
    try {
      // TODO: API call to accept application
      console.log('Accept application:', applicationId);
      await loadApplications();
    } catch (error) {
      console.error('Error accepting application:', error);
    }
  };

  const handleReject = async (applicationId: string, reason: string) => {
    try {
      // TODO: API call to reject application
      console.log('Reject application:', applicationId, reason);
      await loadApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
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
      case 'pending': return 'รอดำเนินการ';
      case 'accepted': return 'อนุมัติ';
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
          คำขอเข้าร่วมบูธ
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

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">ยังไม่มีคำขอเข้าบูธ</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                {/* Left: Booth Info */}
                <div className="flex gap-4 flex-1">
                  {/* Booth Logo */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {app.boothProfilePic ? (
                      <Image
                        src={app.boothProfilePic}
                        alt={app.boothName}
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
                      {app.boothName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {app.boothCompany}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📍 {app.subBoothName}</span>
                      <span>👤 {app.applicantName}</span>
                      <span>📅 {new Date(app.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>

                  {app.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                      >
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => handleAccept(app.id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('เหตุผลในการปฏิเสธ:');
                          if (reason) handleReject(app.id, reason);
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">รายละเอียดบูธ</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ชื่อบูธ</label>
                <p className="text-lg font-semibold text-gray-900">{selectedApp.boothDetails.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">รายละเอียด</label>
                <p className="text-gray-900">{selectedApp.boothDetails.detail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">บริษัท</label>
                <p className="text-gray-900">{selectedApp.boothDetails.company}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">อีเมล</label>
                  <p className="text-gray-900">{selectedApp.boothDetails.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">เบอร์โทร</label>
                  <p className="text-gray-900">{selectedApp.boothDetails.tel}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedApp(null)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                ปิด
              </button>
              {selectedApp.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleAccept(selectedApp.id);
                      setSelectedApp(null);
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    อนุมัติ
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('เหตุผลในการปฏิเสธ:');
                      if (reason) {
                        handleReject(selectedApp.id, reason);
                        setSelectedApp(null);
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                  >
                    ปฏิเสธ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}