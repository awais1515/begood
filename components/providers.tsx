
"use client"

import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from 'react'
import { CookieBanner } from '@/components/CookieBanner'
import { getAnalytics, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { app } from '@/lib/firebase';

export function Providers({ children }: { children: React.ReactNode }) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // This runs only on the client
    if (typeof window !== 'undefined') {
        const consent = localStorage.getItem('cookie_consent');
        if (consent === null) {
            setShowBanner(true);
        } else if (consent === 'true') {
            // If consent was already given, ensure analytics is enabled.
            const analytics = getAnalytics(app);
            setAnalyticsCollectionEnabled(analytics, true);
        }
    }
  }, []);

  const handleAccept = () => {
    setShowBanner(false);
    const analytics = getAnalytics(app);
    setAnalyticsCollectionEnabled(analytics, true);
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
