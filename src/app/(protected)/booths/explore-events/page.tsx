// src/app/(protected)/booths/explore-events/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { ExploreEventsPage } from '@/src/features/booths/components/booth-global/ExploreEventsPage';


export default function BoothExploreEventsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.Role !== 'booth_manager') router.push('/home');
  }, [user, router]);

  if (!user || user.Role !== 'booth_manager') return null;
  return <ExploreEventsPage />;
}