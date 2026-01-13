
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase/provider';

export default function SplashPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Redirect immediately without splash delay
    if (user) {
      router.replace('/matches');
    } else {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#121212]">
      <Loader2 className="h-12 w-12 animate-spin text-[#C64D68]" />
    </div>
  );
}
