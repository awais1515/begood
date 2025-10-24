
"use client"

import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/src/components/ui/toaster"
import { useState, useEffect } from 'react'
import { CookieBanner } from '@/src/components/CookieBanner'
import { getAnalytics, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { useFirebaseApp } from '@/src/firebase';

export function Providers({ children }: { children: React.ReactNode }) {
  const [showBanner, setShowBanner] = useState(false);
  const app = useFirebaseApp();

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const consent = localStorage.getItem('cookie_consent');
        if (consent === null) {
            setShowBanner(true);
        } else if (consent === 'true' && app) {
            const analytics = getAnalytics(app);
            setAnalyticsCollectionEnabled(analytics, true);
        }
    }
  }, [app]);

  const handleAccept = () => {
    setShowBanner(false);
    if (app) {
        const analytics = getAnalytics(app);
        setAnalyticsCollectionEnabled(analytics, true);
    }
  };

  const handleDecline = () => {
    setShowBanner(false);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      {children}
      {showBanner && <CookieBanner onAccept={handleAccept} onDecline={handleDecline} />}
      <Toaster />
    </ThemeProvider>
  )
}
