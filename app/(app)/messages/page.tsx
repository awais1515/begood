"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, type Timestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';

type MatchProfile = {
  id: string;
  username: string;
  avatar: string;
  dataAiHint: string;
  age?: number;
  bio?: string;
  lastMessage?: string;
  unread?: boolean;
  lastMessageTimestamp?: Timestamp | null;
};

export default function MessagesPage() {
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const { user: currentUser, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!currentUser || !firestore) {
      if (!authLoading) {
        setLoading(false);
        setMatches([]);
      }
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoading(true);
        console.log('🔍 Messages Page - Fetching matches...');

        // Get current user's interactions to get matches array
        const interactionsDocRef = doc(firestore, 'userInteractions', currentUser.uid);
        const interactionsSnap = await getDoc(interactionsDocRef);

        if (!interactionsSnap.exists()) {
          console.log('⚠️ No interactions document found');
          setMatches([]);
          setLoading(false);
          return;
        }

        const interactionsData = interactionsSnap.data();
        const matchIds = interactionsData.matches || [];
        const blockedIds = interactionsData.blocked || [];

        console.log('👥 Match IDs:', matchIds);

        if (matchIds.length === 0) {
          console.log('📭 No matches found');
          setMatches([]);
          setLoading(false);
          return;
        }

        // Fetch user details and chat info for each match
        const matchPromises = matchIds.map(async (userId: string) => {
          // Skip if blocked
          if (blockedIds.includes(userId)) return null;

          // Get user profile
          const userDocRef = doc(firestore, 'users', userId);
          const userSnap = await getDoc(userDocRef);

          if (!userSnap.exists()) return null;

          const userData = userSnap.data();
          const currentYear = new Date().getFullYear();
          const age = userData.birthYear ? currentYear - userData.birthYear : undefined;

          // Get chat info if exists
          const ids = [currentUser.uid, userId].sort();
          const chatId = ids.join('_');
          const chatDocRef = doc(firestore, 'chats', chatId);
          const chatSnap = await getDoc(chatDocRef);

          let lastMessage = "No sparks yet... say hi!";
          let unread = false;
          let lastMessageTimestamp = null;

          if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            lastMessage = chatData.lastMessage || "No sparks yet... say hi!";
            unread = !!chatData.lastMessageSenderId && chatData.lastMessageSenderId !== currentUser.uid;
            lastMessageTimestamp = chatData.lastMessageTimestamp || null;
          }

          return {
            id: userSnap.id,
            username: userData.username || 'Unknown',
            avatar: userData.mainImage || 'https://placehold.co/100x100.png',
            dataAiHint: userData.dataAiHints?.[0] || 'person',
            age,
            bio: userData.bio,
            lastMessage,
            unread,
            lastMessageTimestamp,
          };
        });

        const resolvedMatches = (await Promise.all(matchPromises)).filter(Boolean) as MatchProfile[];

        // Sort by last message timestamp (most recent first)
        resolvedMatches.sort((a, b) => {
          if (!a.lastMessageTimestamp && !b.lastMessageTimestamp) return 0;
          if (!a.lastMessageTimestamp) return 1;
          if (!b.lastMessageTimestamp) return -1;
          return b.lastMessageTimestamp.seconds - a.lastMessageTimestamp.seconds;
        });

        console.log('✅ Resolved matches:', resolvedMatches);
        setMatches(resolvedMatches);
      } catch (error) {
        console.error("❗ Error fetching matches:", error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUser, firestore, authLoading]);

  const filteredMatches = useMemo(() => {
    if (!searchTerm) {
      return matches;
    }
    return matches.filter(match =>
      match.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, matches]);

  if (loading || authLoading || !hydrated) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-144px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold font-serif mb-8 text-center md:text-left">Messages</h1>

      <Card className="shadow-xl font-sans rounded-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-serif text-primary">Your Matches</CardTitle>
          <CardDescription className="font-sans text-base">
            Start a conversation with your matches
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search matches..."
              className="pl-10 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMatches.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <MessageCircle className="mx-auto h-24 w-24 opacity-30" />
              <p className="mt-6 text-xl">
                {searchTerm ? "No Matching Conversations" : "No Matches Yet"}
              </p>
              <p className="italic">
                {searchTerm ? "Try a different search term." : "Accept requests to start chatting!"}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filteredMatches.map((match) => (
                <li key={match.id}>
                  <Link href={`/messages/${match.id}`} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`${match.avatar}?id=${match.id}`} alt={match.username} data-ai-hint={match.dataAiHint} />
                      <AvatarFallback>{match.username.substring(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold font-serif text-lg">
                        {match.username}
                        {match.age && <span className="text-muted-foreground text-sm ml-2">{match.age}</span>}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{match.lastMessage}</p>
                    </div>
                    {match.unread && (
                      <Badge variant="destructive" className="shrink-0">New</Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
