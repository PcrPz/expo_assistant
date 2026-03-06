// src/app/(protected)/booths/my-booth/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { MyBoothDashboard } from '@/src/features/booths/components/booth-global/MyBoothDashboard';

export default function MyBoothPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.Role !== 'booth_manager') {
      router.push('/home');
    }
  }, [user, router]);

  if (!user || user.Role !== 'booth_manager') return null;
  return <MyBoothDashboard />;
}