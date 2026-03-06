// src/app/(protected)/booths/create/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { CreateBoothForm } from '@/src/features/booths/components/booth-global/CreateBoothForm';

export default function CreateBoothPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.Role !== 'booth_manager') router.push('/home');
  }, [user, router]);

  if (!user || user.Role !== 'booth_manager') return null;
  return <CreateBoothForm />;
}