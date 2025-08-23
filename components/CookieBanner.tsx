
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie } from "lucide-react";
import Link from "next/link";

interface CookieBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function CookieBanner({ onAccept, onDecline }: CookieBannerProps) {
    
  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'false');
    onDecline();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 bg-background/80 backdrop-blur-sm">
      <Card className="max-w-3xl mx-auto shadow-2xl">
        <CardHeader className="flex-row items-start gap-4 space-y-0">
          <Cookie className="h-10 w-10 text-primary mt-1" />
          <div>
            <CardTitle className="font-serif text-2xl">Cookie Consent</CardTitle>
            <CardDescription className="mt-2">
              We use cookies to enhance your experience, analyze site traffic, and for security and marketing. By clicking "Accept All", you agree to our use of cookies. For more details, please see our{' '}
              <Link href="/cookies" target="_blank" className="underline text-primary hover:text-primary/80">Cookie Policy</Link>.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" onClick={handleDecline}>Decline</Button>
          <Button onClick={handleAccept}>Accept All</Button>
        </CardContent>
      </Card>
    </div>
  );
}
