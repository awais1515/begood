
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BeGoodTitle from '@/src/components/BeGoodTitle';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';

export default function SplashPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Give the animation a moment to feel smooth before redirecting
    const timer = setTimeout(() => {
      if (user) {
        router.push('/matches');
      } else {
        router.push('/login');
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, [user, loading, router]);
  
  return (
    <>
      <BeGoodTitle />
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/50">
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
    </>
  );
}
