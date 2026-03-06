// src/app/(protected)/events/[eventId]/explore-booths/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ExploreBoothGroupPage } from '@/src/features/events/components/organizer/ExploreBoothGroupPage';

export default function ExploreBoothsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  // TODO: เช็ค permission ว่าเป็น organizer หรือไม่
  // const { user } = useAuthStore();
  // useEffect(() => {
  //   if (!user || user.Role !== 'organizer') {
  //     router.push('/home');
  //   }
  // }, [user, router]);

  if (!eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">ไม่พบข้อมูลงาน</p>
      </div>
    );
  }

  return <ExploreBoothGroupPage expoId={eventId} />;
}