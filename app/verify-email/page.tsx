
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, sendEmailVerification, signOut } from 'firebase/auth';
import { MailCheck, Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setUserEmail(user.email);
        // If user is already verified, redirect them to the matches page.
        await user.reload();
        if (user.emailVerified) {
          toast({ title: "Email Verified!", description: "Welcome to the community!" });
          router.push('/matches');
        }
      } else {
        // If no user is logged in, they shouldn't be here. Redirect to login.
        router.push('/');
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);
  
  const handleResendVerification = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({ title: "Error", description: "You are not logged in.", variant: "destructive" });
      return;
    }
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast({ title: "Email Sent", description: "A new verification link has been sent to your email." });
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      let errorTitle = "Error";
      let errorMessage = "Failed to send verification email. Please try again later.";

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-credential':
            errorTitle = "Configuration Error";
            errorMessage = "Could not send email. Your app's API key might be restricted. Please check your Google Cloud Console.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "You've requested this too many times. Please wait a while before trying again.";
            break;
        }
      }
      
      toast({ title: errorTitle, description: errorMessage, variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  const handleLogoutAndLogin = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Error", description: "Failed to log out.", variant: "destructive" });
    }
  };

  if (isAuthLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 font-sans">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
      );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <MailCheck className="mx-auto h-16 w-16 text-primary" />
          <CardTitle className="mt-4 text-3xl font-serif">Verify Your Email</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            We've sent a verification link to <span className="font-semibold text-primary">{userEmail || 'your email address'}</span>. Please check your inbox and click the link to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once you've verified, you can log in to your account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleResendVerification} disabled={isResending}>
              {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Resend Verification Email
            </Button>
            <Button variant="outline" onClick={handleLogoutAndLogin}>
              Go to Login
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            Didn't receive the email? Check your spam folder or click the resend button.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
