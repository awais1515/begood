
"use client"

import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from 'react'
import { CookieBanner } from '@/components/CookieBanner'
import { getAnalytics, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { useFirebaseApp } from '@/firebase';

export function Providers({ children }: { children: React.ReactNode }) {
  const [showBanner, setShowBanner] = useState(false);
  const app = useFirebaseApp();

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const consent = localStorage.getItem('cookie_consent');
        if (consent === null) {
            setShowBanner(true);
        } else if (consent === 'true' && app) {
            try {
              const analytics = getAnalytics(app);
              setAnalyticsCollectionEnabled(analytics, true);
            } catch (error) {
              console.error("Failed to initialize Analytics", error);
            }
        }
    }
  }, [app]);

  const handleAccept = () => {
    setShowBanner(false);
    if (app) {
        try {
          const analytics = getAnalytics(app);
          setAnalyticsCollectionEnabled(analytics, true);
        } catch (error) {
          console.error("Failed to initialize Analytics on accept", error);
        }
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
