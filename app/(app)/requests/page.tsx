"use client";

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAuth, useFirestore } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

type RequestItem = {
    id: string;
    username: string;
    avatar: string;
    dataAiHint: string;
    age?: number;
    bio?: string;
};

export default function RequestsPage() {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const { user: currentUser, loading: authLoading } = useAuth();
    const firestore = useFirestore();
    const [loading, setLoading] = useState(true);
    const [hydrated, setHydrated] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        console.log('🔍 Requests Page - useEffect triggered');
        console.log('currentUser:', currentUser);
        console.log('firestore:', firestore);
        console.log('authLoading:', authLoading);

        if (!currentUser || !firestore) {
            console.log('❌ Missing currentUser or firestore');
            if (!authLoading) {
                setLoading(false);
                setRequests([]);
            }
            return;
        }

        const fetchRequests = async () => {
            try {
                console.log('🚀 Starting fetchRequests...');
                setLoading(true);

                // Get current user's interactions
                const interactionsDocRef = doc(firestore, 'userInteractions', currentUser.uid);
                console.log('📄 Fetching interactions for user:', currentUser.uid);

                const interactionsSnap = await getDoc(interactionsDocRef);
                console.log('📊 Interactions snap exists:', interactionsSnap.exists());

                if (!interactionsSnap.exists()) {
                    console.log('⚠️ No interactions document found');
                    setRequests([]);
                    setLoading(false);
                    return;
                }

                const interactionsData = interactionsSnap.data();
                console.log('📝 Interactions data:', interactionsData);

                const requestIds = interactionsData.requests || [];
                const matchedIds = interactionsData.matches || [];  // Get matched users
                console.log('👥 Request IDs:', requestIds);
                console.log('👥 Matched IDs:', matchedIds);

                // Filter out users who are already matched
                const filteredRequestIds = requestIds.filter((id: string) => !matchedIds.includes(id));

                if (filteredRequestIds.length === 0) {
                    console.log('📭 No requests found (after filtering matched users)');
                    setRequests([]);
                    setLoading(false);
                    return;
                }

                // Fetch user details for each request
                console.log('🔄 Fetching user details for each request...');
                const requestPromises = filteredRequestIds.map(async (userId: string) => {
                    const userDocRef = doc(firestore, 'users', userId);
                    const userSnap = await getDoc(userDocRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        const currentYear = new Date().getFullYear();
                        const age = userData.birthYear ? (() => {
                            const today = new Date();
                            const birthMonth = userData.birthMonth || 1;
                            const birthDay = userData.birthDay || 1;
                            let calculatedAge = currentYear - userData.birthYear;
                            if (today.getMonth() + 1 < birthMonth ||
                                (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
                                calculatedAge--;
                            }
                            return calculatedAge;
                        })() : undefined;

                        return {
                            id: userSnap.id,
                            username: userData.username || 'Unknown',
                            avatar: userData.mainImage || 'https://placehold.co/100x100.png',
                            dataAiHint: userData.dataAiHints?.[0] || 'person',
                            age,
                            bio: userData.bio,
                        };
                    }
                    return null;
                });

                const resolvedRequests = (await Promise.all(requestPromises)).filter(Boolean) as RequestItem[];
                console.log('✅ Resolved requests:', resolvedRequests);
                setRequests(resolvedRequests);
            } catch (error) {
                console.error("❗ Error fetching requests:", error);
                toast({
                    title: "Error",
                    description: "Failed to load requests. Please try again.",
                    variant: "destructive",
                });
                setRequests([]);
            } finally {
                setLoading(false);
                console.log('✅ fetchRequests completed');
            }
        };

        fetchRequests();
    }, [currentUser, firestore, authLoading, toast]);

    const handleAccept = async (requestUserId: string) => {
        if (!currentUser || !firestore || processingIds.has(requestUserId)) return;

        setProcessingIds(prev => new Set(prev).add(requestUserId));

        try {
            const currentUserId = currentUser.uid;
            const interactionsDocRef = doc(firestore, 'userInteractions', currentUserId);
            const requesterInteractionsDocRef = doc(firestore, 'userInteractions', requestUserId);

            // Update current user's interactions: add to matches, remove from requests
            await setDoc(interactionsDocRef, {
                matches: arrayUnion(requestUserId),
                requests: arrayRemove(requestUserId),
            }, { merge: true });

            // Also add current user to requester's matches array and remove from their liked array (cleanup)
            await setDoc(requesterInteractionsDocRef, {
                matches: arrayUnion(currentUserId),
                liked: arrayRemove(currentUserId),  // Clean up: remove from their liked since it's now a match
            }, { merge: true });

            // Create chat for the match
            const ids = [currentUserId, requestUserId].sort();
            const chatId = ids.join('_');
            const chatDocRef = doc(firestore, 'chats', chatId);

            await setDoc(chatDocRef, {
                participants: ids,
                createdAt: serverTimestamp(),
                lastMessage: null,
                lastMessageTimestamp: null,
            }, { merge: true });

            // Remove from local state
            setRequests(prev => prev.filter(req => req.id !== requestUserId));

            toast({
                title: "Request Accepted!",
                description: "You can now chat with this person.",
            });
        } catch (error) {
            console.error("Error accepting request:", error);
            toast({
                title: "Error",
                description: "Failed to accept request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(requestUserId);
                return next;
            });
        }
    };

    const handleReject = async (requestUserId: string) => {
        if (!currentUser || !firestore || processingIds.has(requestUserId)) return;

        setProcessingIds(prev => new Set(prev).add(requestUserId));

        try {
            const currentUserId = currentUser.uid;
            const interactionsDocRef = doc(firestore, 'userInteractions', currentUserId);

            // Update current user's interactions: add to dislikes, remove from requests
            await setDoc(interactionsDocRef, {
                disliked: arrayUnion(requestUserId),
                requests: arrayRemove(requestUserId),
            }, { merge: true });

            // Remove from local state
            setRequests(prev => prev.filter(req => req.id !== requestUserId));

            toast({
                title: "Request Rejected",
                description: "This person has been removed from your requests.",
            });
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast({
                title: "Error",
                description: "Failed to reject request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(requestUserId);
                return next;
            });
        }
    };

    const filteredRequests = searchTerm
        ? requests.filter(request =>
            request.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.bio?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : requests;

    if (loading || authLoading || !hydrated) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-144px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 h-full">
            <h1 className="hidden md:block text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Likes</h1>
            <p className="hidden md:block text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">People who want to connect with you</p>

            <Card className="bg-[#1a1a1a] border-white/5 text-white shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-white/5 px-4 md:px-6 py-3 md:py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base md:text-xl font-semibold text-white tracking-wide">Pending Requests</CardTitle>
                            <CardDescription className="text-white/40 mt-0.5 md:mt-1 text-xs md:text-sm">
                                Manage your incoming connection requests
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-[#A42347]/10 text-[#A42347] hover:bg-[#A42347]/20 border-0 px-2 md:px-3 py-0.5 md:py-1 text-xs">
                            {filteredRequests.length} New
                        </Badge>
                    </div>

                    <div className="relative mt-3 md:mt-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                            placeholder="Search by name or bio..."
                            className="pl-9 bg-[#121212] border-white/5 text-white placeholder:text-white/30 focus-visible:ring-[#A42347]/50 h-9 md:h-11 rounded-lg md:rounded-xl text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <UserPlus className="h-10 w-10 text-white/20" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">
                                {searchTerm ? "No matching requests" : "No new likes yet"}
                            </h3>
                            <p className="text-white/40 max-w-[250px]">
                                {searchTerm ? "Try searching for something else." : "When someone likes your profile, they'll appear here."}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-white/5">
                            {filteredRequests.map((request) => (
                                <li key={request.id} className="p-4 sm:p-6 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                        <Link href={`/profile/${request.id}`} className="relative shrink-0">
                                            <Avatar className="h-16 w-16 border-2 border-white/10 ring-4 ring-black/20">
                                                <AvatarImage
                                                    src={`${request.avatar}?id=${request.id}`}
                                                    alt={request.username}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-white/10 text-white">
                                                    {request.username.substring(0, 1).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-[#1a1a1a] p-1 rounded-full">
                                                <div className="bg-green-500 h-3 w-3 rounded-full border-2 border-[#1a1a1a]"></div>
                                            </div>
                                        </Link>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Link href={`/profile/${request.id}`} className="hover:underline">
                                                    <h3 className="font-semibold text-lg text-white">
                                                        {request.username}
                                                    </h3>
                                                </Link>
                                                {request.age && (
                                                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] font-medium text-white/60 border border-white/5">
                                                        {request.age}
                                                    </span>
                                                )}
                                            </div>

                                            {request.bio && (
                                                <p className="text-sm text-white/50 line-clamp-2 max-w-xl">
                                                    {request.bio}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 mt-2 text-xs text-white/30">
                                                <span>Active recently</span>
                                                <span>•</span>
                                                <span>{request.dataAiHint}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-3 sm:mt-0 w-full sm:w-auto">
                                            <Button
                                                className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-[#A42347] to-[#8B1D3B] hover:opacity-90 text-white border-0 shadow-lg shadow-[#A42347]/20 rounded-xl h-11"
                                                onClick={() => handleAccept(request.id)}
                                                disabled={processingIds.has(request.id)}
                                            >
                                                {processingIds.has(request.id) ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 sm:flex-none gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-11"
                                                onClick={() => handleReject(request.id)}
                                                disabled={processingIds.has(request.id)}
                                            >
                                                {processingIds.has(request.id) ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <X className="h-4 w-4" />
                                                )}
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
