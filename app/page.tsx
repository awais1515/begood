
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import BeGoodTitle from '@/components/BeGoodTitle';
import { Loader2 } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      // Give the animation a moment to feel smooth before redirecting
      setTimeout(() => {
        if (user) {
          router.push('/matches');
        } else {
          router.push('/login');
        }
      }, 500); 
    });

    // Fallback to show a loader while waiting for the auth state
    const timer = setTimeout(() => {
        setLoading(false);
    }, 200);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);
  
  // This will show the splash title briefly, then a loader if needed.
  return (
    <>
      <BeGoodTitle />
      {!loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/50">
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
    </>
  );
}
