// src/app/(protected)/booths/booth-group/[boothGroupId]/page.tsx
'use client';

import { BoothGroupDetailPage } from '@/src/features/events/components/organizer/BoothGroupDetailPage';
import { useParams, useSearchParams } from 'next/navigation';

export default function BoothGroupDetailPageWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const boothGroupId = params.boothGroupId as string;
  const fromExpoId = searchParams.get('from_expo'); // ถ้ามาจากหน้า Explore Booths

  return (
    <BoothGroupDetailPage
      boothGroupId={boothGroupId} 
      fromExpoId={fromExpoId || undefined}
    />
  );
}