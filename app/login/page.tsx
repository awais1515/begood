
"use client";

import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";


export default function WelcomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If user is logged in, check for profile and redirect
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          router.push('/matches');
        } else {
          router.push('/signup');
        }
      } else {
        // If no user is logged in, stop loading and show the page
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans animate-in fade-in duration-500">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <AppLogo className="h-10 text-3xl text-primary" />
        </div>
        <Card>
            <CardHeader className="text-center">
                <CardTitle>Welcome!</CardTitle>
                <CardDescription className="italic text-primary">Find your good girl or good boy!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Link href="/login-auth" passHref legacyBehavior>
                    <Button asChild size="lg"><a>Log In</a></Button>
                </Link>
                <Link href="/signup" passHref legacyBehavior>
                    <Button asChild variant="outline" size="lg"><a>Sign Up</a></Button>
                </Link>
            </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground text-center mt-6 px-4">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-primary">
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
