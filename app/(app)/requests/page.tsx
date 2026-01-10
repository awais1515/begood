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
                console.log('👥 Request IDs:', requestIds);

                if (requestIds.length === 0) {
                    console.log('📭 No requests found');
                    setRequests([]);
                    setLoading(false);
                    return;
                }

                // Fetch user details for each request
                console.log('🔄 Fetching user details for each request...');
                const requestPromises = requestIds.map(async (userId: string) => {
                    const userDocRef = doc(firestore, 'users', userId);
                    const userSnap = await getDoc(userDocRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        const currentYear = new Date().getFullYear();
                        const age = userData.birthYear ? currentYear - userData.birthYear : undefined;

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

            // Also add current user to requester's matches array (mutual match)
            await setDoc(requesterInteractionsDocRef, {
                matches: arrayUnion(currentUserId),
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
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold font-serif mb-8 text-center md:text-left">Requests</h1>

            <Card className="shadow-xl font-sans rounded-xl">
                <CardHeader className="border-b">
                    <CardTitle className="text-3xl font-serif text-primary">Message Requests</CardTitle>
                    <CardDescription className="font-sans text-base">
                        People who liked you and want to connect
                    </CardDescription>
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search requests..."
                            className="pl-10 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredRequests.length === 0 ? (
                        <div className="p-10 text-center text-muted-foreground">
                            <UserPlus className="mx-auto h-24 w-24 opacity-30" />
                            <p className="mt-6 text-xl">
                                {searchTerm ? "No Matching Requests" : "No Requests Yet"}
                            </p>
                            <p className="italic">
                                {searchTerm ? "Try a different search term." : "When someone likes you, they'll appear here"}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {filteredRequests.map((request) => (
                                <li key={request.id} className="p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <Link href={`/profile/${request.id}`}>
                                            <Avatar className="h-12 w-12 mt-1 cursor-pointer hover:opacity-80 transition-opacity">
                                                <AvatarImage
                                                    src={`${request.avatar}?id=${request.id}`}
                                                    alt={request.username}
                                                    data-ai-hint={request.dataAiHint}
                                                />
                                                <AvatarFallback>{request.username.substring(0, 1).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/profile/${request.id}`} className="hover:underline">
                                                <h3 className="font-semibold font-serif text-lg">
                                                    {request.username}
                                                    {request.age && <span className="text-muted-foreground ml-2">{request.age}</span>}
                                                </h3>
                                            </Link>
                                            {request.bio && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {request.bio}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="gap-1"
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
                                                size="sm"
                                                variant="outline"
                                                className="gap-1"
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
