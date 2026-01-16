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
    <div className="max-w-5xl mx-auto p-4 md:p-6 h-full">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Messages</h1>
      <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">Start a conversation with your matches</p>

      <Card className="bg-[#1a1a1a] border-white/5 text-white shadow-xl rounded-2xl md:rounded-3xl overflow-hidden h-[calc(100vh-260px)] md:h-[calc(100vh-200px)] flex flex-col">
        <CardHeader className="border-b border-white/5 px-4 md:px-6 py-3 md:py-5 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base md:text-xl font-semibold text-white tracking-wide">Your Matches</CardTitle>
              <CardDescription className="text-white/40 mt-0.5 md:mt-1 text-xs md:text-sm">
                Recent conversations
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-[#A42347]/10 text-[#A42347] hover:bg-[#A42347]/20 border-0 px-2 md:px-3 py-0.5 md:py-1 text-xs">
              {filteredMatches.length} Matches
            </Badge>
          </div>

          <div className="relative mt-3 md:mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search matches..."
              className="pl-9 bg-[#121212] border-white/5 text-white placeholder:text-white/30 focus-visible:ring-[#A42347]/50 h-9 md:h-11 rounded-lg md:rounded-xl text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {filteredMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 h-full">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <MessageCircle className="h-10 w-10 text-white/20" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  {searchTerm ? "No Matching Conversations" : "No Matches Yet"}
                </h3>
                <p className="text-white/40 max-w-[250px]">
                  {searchTerm ? "Try a different search term." : "Accept requests to start chatting!"}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {filteredMatches.map((match) => (
                  <li key={match.id}>
                    <Link
                      href={`/messages/${match.id}`}
                      className="flex items-center gap-3 md:gap-5 p-3 md:p-4 sm:px-6 sm:py-5 hover:bg-white/[0.02] transition-all group border-l-4 border-transparent hover:border-[#A42347]"
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11 md:h-14 md:w-14 border-2 border-white/10 ring-2 md:ring-4 ring-black/20 group-hover:border-[#A42347]/50 transition-colors">
                          <AvatarImage src={`${match.avatar}?id=${match.id}`} alt={match.username} data-ai-hint={match.dataAiHint} className="object-cover" />
                          <AvatarFallback className="bg-white/10 text-white text-sm md:text-base">
                            {match.username.substring(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {match.unread && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3 md:h-4 md:w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A42347] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-[#A42347]"></span>
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5 md:mb-1">
                          <h3 className="font-semibold text-white text-sm md:text-lg group-hover:text-[#A42347] transition-colors truncate">
                            {match.username}
                          </h3>
                          {match.lastMessageTimestamp && (
                            <span className="text-xs text-white/30 font-medium">
                              {new Date(match.lastMessageTimestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs md:text-sm truncate ${match.unread ? 'text-white font-medium' : 'text-white/40 group-hover:text-white/60'}`}>
                            {match.lastMessage}
                          </p>
                          {match.unread && (
                            <Badge variant="default" className="bg-[#A42347] hover:bg-[#A42347] h-4 md:h-5 px-1 md:px-1.5 text-[9px] md:text-[10px] shrink-0">New</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
