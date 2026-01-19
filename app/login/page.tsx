
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, useFirestore } from "@/firebase/provider";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "react-day-picker";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, auth } = useAuth();
  const firestore = useFirestore();

  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show splash for 3 seconds
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      if (!loading && user && firestore) {
        // Check if email is verified first
        if (!user.emailVerified) {
          router.push('/verify-email');
          return;
        }
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          router.push('/matches');
        } else {
          router.push('/signup');
        }
      }
    };
    checkUser();
  }, [user, loading, firestore, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setError("");
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Update lastActive timestamp on login
      try {
        const userDocRef = doc(firestore, 'users', userCredential.user.uid);
        await updateDoc(userDocRef, {
          lastActive: serverTimestamp(),
          isOnline: true
        });
      } catch (presenceError) {
        // Silently fail - presence update is not critical
        console.debug('Failed to update presence on login:', presenceError);
      }

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        router.push('/verify-email');
      } else {
        router.push('/matches');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show splash screen first
  if (showSplash) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a1213] via-[#231418] to-[#1a1213] overflow-hidden">
        {/* Top Right Flowers - Smaller on mobile */}
        <div className="absolute -top-5 -right-5 opacity-85 animate-in fade-in slide-in-from-top-5 duration-1000">
          <Image src="/Top.svg" alt="" width={400} height={300} priority className="w-48 sm:w-64 md:w-[400px] h-auto" />
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center gap-4 z-10 animate-in fade-in zoom-in-95 duration-1000 px-4">
          <Image src="/Logo.svg" alt="BeGood" width={320} height={140} priority className="w-48 sm:w-64 md:w-80 h-auto" />

        </div>

        {/* Bottom Left Flowers - Smaller on mobile */}
        <div className="absolute -bottom-5 -left-5 opacity-85 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
          <Image src="/Bottom.svg" alt="" width={400} height={300} priority className="w-48 sm:w-64 md:w-[400px] h-auto" />
        </div>
      </main>
    );
  }

  // Login Form Screen
  return (
    <main className="min-h-screen flex items-center justify-center relative p-4 md:p-5 w-full" style={{ fontFamily: 'var(--font-montserrat)' }}>
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 w-full h-full"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Login Container - Stack on mobile */}
      <div className="flex flex-col md:flex-row items-stretch bg-[#140c0e]/75 rounded-2xl overflow-hidden max-w-[750px] w-full shadow-2xl backdrop-blur-xl relative z-10 border border-[#E296A3]/10">

        {/* Left Side - Welcome (hidden on mobile) */}
        <div className="hidden md:flex flex-[0.9] flex-col items-center justify-center py-12 px-9 gap-2">
          <h1 className="text-white text-3xl font-semibold mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>Welcome</h1>
          <Image src="/Logo.svg" alt="BeGood" width={180} height={78} priority />
        </div>

        {/* Divider (hidden on mobile) */}
        <div className="hidden md:block w-px bg-[#E296A3]/25 my-10" />

        {/* Right Side - Login Form */}
        <div className="flex-[1.1] p-6 sm:p-8 md:p-10 md:px-11">
          {/* Mobile Logo - shown only on mobile */}
          <div className="flex md:hidden justify-center mb-6">
            <Image src="/Logo.svg" alt="BeGood" width={140} height={60} priority />
          </div>
          <h2 className="text-white text-2xl sm:text-[28px] font-medium mb-6 sm:mb-8 text-center tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>Log In</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-xs font-medium">Email</label>
              <div className="relative flex items-center">
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-[42px] h-[calc(100%-8px)] flex items-center justify-center  rounded-[20px]">
                  <Mail size={16} className="text-[#E296A3]/80" />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-4 pr-4 pl-14 bg-[#643c4b]/45 border-none rounded-[25px] text-white text-sm placeholder:text-white/60 focus:outline-none focus:bg-[#643c4b]/60 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-xs font-medium">Password</label>
              <div className="relative flex items-center">
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-[42px] h-[calc(100%-8px)] flex items-center justify-center  rounded-[20px]">
                  <Image src="/password.svg" alt="Password" width={16} height={16} className="text-[#E296A3]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-4 pr-12 pl-14 bg-[#643c4b]/45 border-none rounded-[25px] text-white text-sm placeholder:text-white/60 focus:outline-none focus:bg-[#643c4b]/60 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#E296A3]/60 hover:text-[#E296A3] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-start ">

              <button>
                <Link href="/forgot-password" className="text-[#E296A3] text-[13px] opacity-80 hover:opacity-100 -mt-1">
                  Forgot Password
                </Link>
              </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#C64D68] to-[#E8788F] border-none rounded-[25px] text-white text-base font-semibold cursor-pointer transition-all mt-3 hover:shadow-lg hover:shadow-[#C64D68]/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-white text-[12px] mt-6">
            New to our app? Start your journey today{" "}
            <Link href="/signup" className="text-[#E296A3] font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
