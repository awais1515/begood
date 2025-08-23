
"use client"; 

import React, { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, type Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

type MatchProfile = {
  id: string; 
  username: string; 
  avatar: string;
  dataAiHint: string;
};

type ChatListItem = {
  id: string; // This will be the partner’s ID
  chatId: string; // The ID of the chat document (e.g., uid1_uid2)
  username: string;
  lastMessage: string;
  unread: boolean; // Changed to boolean to indicate new messages
  avatar: string;
  dataAiHint: string;
  lastMessageTimestamp: Timestamp | null;
};

export default function MessagesPage() {
  const [newMatches, setNewMatches] = useState<MatchProfile[]>([]);
  const [existingChats, setExistingChats] = useState<ChatListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setNewMatches([]);
      setExistingChats([]);
      return;
    }
  
    setLoading(true);
  
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );
  
    const unsubscribe = onSnapshot(chatsQuery, async (querySnapshot) => {
      const chatDocs = querySnapshot.docs;

      const interactionsDocRef = doc(db, 'userInteractions', currentUser.uid);
      const interactionsDocSnap = await getDoc(interactionsDocRef);
      const blockedIds = interactionsDocSnap.exists() ? (interactionsDocSnap.data().blocked || []) : [];
      
      const partnerDataPromises = chatDocs.map(async (chatDoc) => {
        const chatData = chatDoc.data();
        const partnerId = chatData.participants.find((p: string) => p !== currentUser.uid);
  
        if (!partnerId || blockedIds.includes(partnerId)) return null;
  
        const userDocRef = doc(db, 'users', partnerId);
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          const partnerData = userDocSnap.data();
          const isUnread = !!chatData.lastMessageSenderId && chatData.lastMessageSenderId !== currentUser.uid;

          return {
            chatId: chatDoc.id,
            isNew: chatData.lastMessage === null,
            partner: {
              id: partnerId,
              username: partnerData?.username || 'unknown',
              avatar: partnerData?.mainImage || 'https://placehold.co/100x100.png',
              dataAiHint: partnerData?.dataAiHints?.[0] || 'person',
            },
            chatInfo: {
              lastMessage: chatData.lastMessage || "No sparks yet... say hi!",
              unread: isUnread, 
              lastMessageTimestamp: chatData.lastMessageTimestamp || null,
            }
          };
        }
        return null;
      });
  
      const resolvedPartnersData = (await Promise.all(partnerDataPromises)).filter(Boolean);
  
      const newMatchesResult: MatchProfile[] = [];
      const existingChatsResult: ChatListItem[] = [];
  
      resolvedPartnersData.forEach(data => {
        if (!data) return;
        if (data.isNew) {
          newMatchesResult.push({
            id: data.partner.id,
            username: data.partner.username,
            avatar: data.partner.avatar,
            dataAiHint: data.partner.dataAiHint,
          });
        } else {
          existingChatsResult.push({
            id: data.partner.id,
            chatId: data.chatId,
            username: data.partner.username,
            avatar: data.partner.avatar,
            dataAiHint: data.partner.dataAiHint,
            lastMessage: data.chatInfo.lastMessage,
            unread: data.chatInfo.unread,
            lastMessageTimestamp: data.chatInfo.lastMessageTimestamp
          });
        }
      });
      
      setNewMatches(newMatchesResult);
      setExistingChats(existingChatsResult);
      setLoading(false);
  
    }, (error) => {
      console.error("Error fetching chats: ", error);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [currentUser]);
  
  const filteredChats = useMemo(() => {
    if (!searchTerm) {
      return existingChats;
    }
    return existingChats.filter(chat =>
      chat.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, existingChats]);

  if (loading || !hydrated) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-144px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold font-serif mb-8 text-center md:text-left">Messages</h1>
      {newMatches.length > 0 && (
        <Card className="mb-8 shadow-lg font-sans rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-primary">New Matches</CardTitle>
            <CardDescription className="font-sans text-base italic">Break the ice - write something flirty!</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-6 pb-2">
                {newMatches.map((match, index) => (
                  <Link href={`/messages/${match.id}`} key={match.id} className="block">
                    <div className="flex flex-col items-center space-y-1.5 w-20 sm:w-24 text-center group relative">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-transparent group-hover:border-primary transition-all duration-200">
                        <AvatarImage src={`${match.avatar}?id=${match.id}`} alt={match.username} data-ai-hint={match.dataAiHint} />
                        <AvatarFallback>{match.username.substring(0,1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <Badge className="absolute top-0 right-0 -mr-1 -mt-1 text-xs px-1.5 py-0.5" variant="destructive">New</Badge>
                      <p className="text-xs font-medium truncate w-full group-hover:text-primary transition-colors">{match.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl font-sans rounded-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-serif text-primary">Your Conversations</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-10 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredChats.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
                <MessageCircle className="mx-auto h-24 w-24 opacity-30" />
                <p className="mt-6 text-xl">
                  {searchTerm ? "No Matching Conversations" : "No Messages Yet"}
                </p>
                <p className="italic">
                  {searchTerm ? "Try a different search term." : "No sparks yet... say hi!"}
                </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filteredChats.map((chat, index) => (
                <li key={chat.id}>
                  <Link href={`/messages/${chat.id}`} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`${chat.avatar}?id=${chat.id}`} alt={chat.username} data-ai-hint={chat.dataAiHint}/>
                      <AvatarFallback>{chat.username.substring(0,1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0"> 
                      <h3 className="font-semibold font-serif text-lg">{chat.username}</h3>
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p> 
                    </div>
                    {chat.unread && (
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
