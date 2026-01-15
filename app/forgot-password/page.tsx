"use client";

import { useState } from "react";
import { useAuth } from "@/firebase/provider";
import { sendPasswordResetEmail } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const { auth } = useAuth();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) return;

        setError("");
        setIsSubmitting(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to send reset email. Please try again.";
            if (errorMessage.includes("user-not-found")) {
                setError("No account found with this email address.");
            } else if (errorMessage.includes("invalid-email")) {
                setError("Please enter a valid email address.");
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center relative p-5 w-full" style={{ fontFamily: 'var(--font-montserrat)' }}>
            {/* Background Image */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 w-full h-full"
                style={{ backgroundImage: "url('/bg.jpg')" }}
            >
                <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Container */}
            <div className="flex flex-col items-center bg-[#140c0e]/75 rounded-2xl overflow-hidden max-w-[450px] w-full shadow-2xl backdrop-blur-xl relative z-10 border border-[#E296A3]/10 p-10">

                {/* Back Button */}
                <Link
                    href="/login"
                    className="absolute top-6 left-6 text-[#E296A3]/70 hover:text-[#E296A3] transition-colors flex items-center gap-2"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Back to Login</span>
                </Link>

                {/* Logo */}
                <Image src="/Logo.svg" alt="BeGood" width={140} height={60} priority className="mb-6 mt-6" />

                {success ? (
                    // Success Message
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle size={32} className="text-green-400" />
                        </div>
                        <h2 className="text-white text-2xl font-medium">Check Your Email</h2>
                        <p className="text-white/70 text-sm max-w-[280px]">
                            We&apos;ve sent a password reset link to <span className="text-[#E296A3]">{email}</span>
                        </p>
                        <p className="text-white/50 text-xs">
                            Didn&apos;t receive the email? Check your spam folder.
                        </p>
                        <Link
                            href="/login"
                            className="w-full py-3.5 bg-gradient-to-r from-[#C64D68] to-[#E8788F] border-none rounded-[25px] text-white text-base font-semibold cursor-pointer transition-all mt-4 hover:shadow-lg hover:shadow-[#C64D68]/40 hover:-translate-y-0.5 text-center"
                        >
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    // Reset Form
                    <>
                        <h2 className="text-white text-[28px] font-medium mb-2 text-center tracking-wide">
                            Forgot Password?
                        </h2>
                        <p className="text-white/60 text-sm text-center mb-8 max-w-[300px]">
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleResetPassword} className="flex flex-col gap-4 w-full">
                            {/* Email Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-white text-xs font-medium">Email</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-[42px] h-[calc(100%-8px)] flex items-center justify-center rounded-[20px]">
                                        <Mail size={16} className="text-[#E296A3]/80" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full py-4 pr-4 pl-14 bg-[#643c4b]/45 border-none rounded-[25px] text-white text-sm placeholder:text-white/60 focus:outline-none focus:bg-[#643c4b]/60 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gradient-to-r from-[#C64D68] to-[#E8788F] border-none rounded-[25px] text-white text-base font-semibold cursor-pointer transition-all mt-3 hover:shadow-lg hover:shadow-[#C64D68]/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </main>
    );
}
