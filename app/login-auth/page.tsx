
"use client";

import { AppLogo } from "@/components/AppLogo";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function LoginAuthPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <AppLogo className="h-10 text-3xl text-primary" />
                </div>
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>Log In to BeGood</CardTitle>
                        <CardDescription className="italic text-primary">Hey hottie - glad you're back!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin" />}>
                           <AuthForm />
                        </Suspense>
                    </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground text-center mt-6">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}
