
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Send, Loader2, AlertTriangle, UserX, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUserLocation } from "@/hooks/use-user-location";
import { getDistance } from "@/lib/utils";
import { collection, addDoc, query, orderBy, limit, startAfter, endBefore, limitToLast, getDocs, onSnapshot, serverTimestamp, type Timestamp, type QueryDocumentSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { useAuth, useFirestore } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";

const MESSAGES_PER_PAGE = 15;

type PartnerProfile = {
  id: string;
  username: string;
  avatar: string;
  dataAiHint: string;
  latitude?: number;
  longitude?: number;
  isSuspended?: boolean;
};

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | null;
};

export default function ChatPage() {
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const params = useParams();
  const router = useRouter();
  const partnerId = typeof params?.chatId === 'string' ? params.chatId : null;
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { userLocation } = useUserLocation();
  const [distance, setDistance] = useState<number | null>(null);
  const { user: currentUser, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Pagination state
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [oldestDoc, setOldestDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (currentUser && partnerId) {
      const ids = [currentUser.uid, partnerId];
      ids.sort();
      setChatId(ids.join('_'));
    }
  }, [currentUser, partnerId]);

  useEffect(() => {
    if (!partnerId || !firestore) {
      if (firestore) {
        setLoading(false);
        setChatError("Could not determine the chat partner from the URL.");
      }
      return;
    }

    const fetchPartnerData = async () => {
      try {
        const userDocRef = doc(firestore, 'users', partnerId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          const partnerProfile = {
            id: userDocSnap.id,
            username: data.username || 'unknown',
            avatar: data.mainImage || 'https://placehold.co/100x100.png',
            dataAiHint: (data.dataAiHints && data.dataAiHints[0]) || 'person',
            latitude: data.latitude,
            longitude: data.longitude,
            isSuspended: data.isSuspended || false,
          };
          setPartner(partnerProfile);
          if (partnerProfile.isSuspended) {
            setChatError("This user's profile is currently suspended.");
          }
        } else {
          setChatError("Could not find the user you're trying to chat with.");
          setPartner(null);
        }
      } catch (error) {
        console.error("Error fetching partner data:", error);
        setChatError("Failed to load partner information.");
        setPartner(null);
      }
    };

    fetchPartnerData();
  }, [partnerId, firestore]);

  useEffect(() => {
    if (userLocation && partner?.latitude && partner?.longitude) {
      const dist = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        partner.latitude,
        partner.longitude
      );
      setDistance(dist);
    }
  }, [userLocation, partner]);

  // Mark chat as read
  const markChatAsRead = useCallback(async () => {
    if (!chatId || !firestore || !partnerId) return;
    try {
      const chatDocRef = doc(firestore, 'chats', chatId);
      const chatDocSnap = await getDoc(chatDocRef);
      if (chatDocSnap.exists()) {
        const chatData = chatDocSnap.data();
        if (chatData.lastMessageSenderId === partnerId) {
          await updateDoc(chatDocRef, {
            lastMessageSenderId: null
          });
        }
      }
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  }, [chatId, firestore, partnerId]);

  // Real-time listener for messages
  useEffect(() => {
    if (!chatId || !currentUser || !partnerId || !firestore) {
      if (currentUser && partnerId && firestore) {
        setLoading(true);
      }
      return;
    }

    const checkBlocksAndSetupListener = async () => {
      try {
        // Check blocks
        const currentUserInteractionsRef = doc(firestore, 'userInteractions', currentUser.uid);
        const partnerInteractionsRef = doc(firestore, 'userInteractions', partnerId);

        const [currentUserInteractionsSnap, partnerInteractionsSnap] = await Promise.all([
          getDoc(currentUserInteractionsRef),
          getDoc(partnerInteractionsRef)
        ]);

        if (currentUserInteractionsSnap.exists() && currentUserInteractionsSnap.data().blocked?.includes(partnerId)) {
          setChatError("You have blocked this user. Unblock them to continue the conversation.");
          setLoading(false);
          return null;
        }

        if (partnerInteractionsSnap.exists() && partnerInteractionsSnap.data().blocked?.includes(currentUser.uid)) {
          setChatError("You can no longer message this user.");
          setLoading(false);
          return null;
        }

        await markChatAsRead();

        // Real-time listener for latest messages (ordered ascending for display)
        const messagesCollectionRef = collection(firestore, `chats/${chatId}/messages`);
        const messagesQuery = query(
          messagesCollectionRef,
          orderBy("timestamp", "desc"),
          limit(MESSAGES_PER_PAGE)
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          if (!chatError) setChatError(null);

          const fetchedMessages = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              senderId: data.senderId,
              text: data.text,
              timestamp: data.timestamp as Timestamp,
            };
          }).reverse(); // Reverse for chronological order

          setMessages(prevMessages => {
            // Get IDs of messages in the latest snapshot
            const snapshotIds = new Set(fetchedMessages.map(m => m.id));

            if (prevMessages.length === 0) {
              // Initial load
              if (snapshot.docs.length > 0) {
                setOldestDoc(snapshot.docs[snapshot.docs.length - 1]);
              }
              setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
              setIsInitialLoad(false);
              return fetchedMessages;
            }

            // Keep older messages that are NOT in the latest snapshot (pagination data)
            // These are messages loaded via "Load More"
            const olderMessages = prevMessages.filter(m => !snapshotIds.has(m.id));

            // Combine older messages with the latest snapshot messages
            const allMessages = [...olderMessages, ...fetchedMessages];

            // Sort by timestamp to ensure correct order
            allMessages.sort((a, b) => {
              if (!a.timestamp && !b.timestamp) return 0;
              if (!a.timestamp) return 1;
              if (!b.timestamp) return -1;
              return a.timestamp.seconds - b.timestamp.seconds;
            });

            return allMessages;
          });

          setLoading(false);
        }, (error: any) => {
          console.error("Error fetching messages:", error);
          if (error.code === 'permission-denied') {
            setChatError("You do not have permission to access this chat.");
          } else {
            setChatError("An error occurred while loading messages.");
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error checking block status:", error);
        setChatError("Failed to load chat information.");
        setLoading(false);
        return null;
      }
    };

    let unsubscribe: (() => void) | null = null;

    const runEffect = async () => {
      const unsub = await checkBlocksAndSetupListener();
      if (unsub) {
        unsubscribe = unsub;
      }
    };
    runEffect();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId, currentUser, partnerId, firestore, chatError, markChatAsRead]);

  // Load more messages (older messages)
  const loadMoreMessages = useCallback(async () => {
    if (!chatId || !firestore || !hasMore || loadingMore || !oldestDoc || !scrollAreaRef.current) return;

    // Save current scroll position before loading
    const scrollDiv = scrollAreaRef.current;
    const previousScrollHeight = scrollDiv.scrollHeight;
    const previousScrollTop = scrollDiv.scrollTop;

    setLoadingMore(true);
    console.log('📥 Loading more messages...');

    try {
      const messagesCollectionRef = collection(firestore, `chats/${chatId}/messages`);
      const messagesQuery = query(
        messagesCollectionRef,
        orderBy("timestamp", "desc"),
        startAfter(oldestDoc),
        limit(MESSAGES_PER_PAGE)
      );

      const snapshot = await getDocs(messagesQuery);

      if (snapshot.empty) {
        setHasMore(false);
        setLoadingMore(false);
        console.log('📭 No more messages to load');
        return;
      }

      const olderMessages = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp as Timestamp,
        };
      }).reverse(); // Reverse for chronological order

      // Prepend older messages, avoiding duplicates
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueOlder = olderMessages.filter(m => !existingIds.has(m.id));
        return [...uniqueOlder, ...prev];
      });

      setOldestDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);

      // Restore scroll position after messages are prepended
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const newScrollHeight = scrollAreaRef.current.scrollHeight;
          const heightDifference = newScrollHeight - previousScrollHeight;
          scrollAreaRef.current.scrollTop = previousScrollTop + heightDifference;
        }
      }, 50);

      console.log(`📨 Loaded ${olderMessages.length} more messages`);
    } catch (error) {
      console.error("Error loading more messages:", error);
      toast({
        title: "Error",
        description: "Failed to load older messages.",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  }, [chatId, firestore, hasMore, loadingMore, oldestDoc, toast]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current || loadingMore || !hasMore) return;

    const scrollTop = scrollAreaRef.current.scrollTop;

    // If scrolled near top (within 100px), load more
    if (scrollTop < 100) {
      loadMoreMessages();
    }
  }, [loadMoreMessages, loadingMore, hasMore]);

  // Scroll to bottom on initial load and new messages
  const hasScrolledInitial = useRef(false);

  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0 && !loading) {
      const scrollDiv = scrollAreaRef.current;

      // Always scroll to bottom on first load
      if (!hasScrolledInitial.current) {
        hasScrolledInitial.current = true;
        setTimeout(() => {
          scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: 'auto' });
        }, 100);
        return;
      }

      // For subsequent updates (real-time messages), only auto-scroll if user is near bottom  
      const isNearBottom = scrollDiv.scrollHeight - scrollDiv.scrollTop - scrollDiv.clientHeight < 150;
      if (isNearBottom) {
        setTimeout(() => {
          scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [messages, loading]);

  // Add scroll event listener
  useEffect(() => {
    const scrollDiv = scrollAreaRef.current;
    if (scrollDiv) {
      scrollDiv.addEventListener('scroll', handleScroll);
      return () => scrollDiv.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !currentUser || !partnerId || !firestore || isSending) return;
    if (chatError && !chatError.includes('suspended')) {
      toast({ title: "Cannot Send Message", description: chatError, variant: "destructive" });
      return;
    }

    setIsSending(true);

    try {
      const currentUserInteractionsRef = doc(firestore, 'userInteractions', currentUser.uid);
      const partnerInteractionsRef = doc(firestore, 'userInteractions', partnerId);

      const [currentUserInteractionsSnap, partnerInteractionsSnap] = await Promise.all([
        getDoc(currentUserInteractionsRef),
        getDoc(partnerInteractionsRef)
      ]);

      if (currentUserInteractionsSnap.exists() && currentUserInteractionsSnap.data().blocked?.includes(partnerId)) {
        toast({ title: "Cannot Send Message", description: "You have blocked this user.", variant: "destructive" });
        setIsSending(false);
        router.refresh();
        return;
      }

      if (partnerInteractionsSnap.exists() && partnerInteractionsSnap.data().blocked?.includes(currentUser.uid)) {
        toast({ title: "Cannot Send Message", description: "You are blocked by this user.", variant: "destructive" });
        setIsSending(false);
        router.refresh();
        return;
      }
    } catch (error) {
      console.error("Error checking block status on send:", error);
      toast({ title: "Error", description: "Could not verify chat status. Please try again.", variant: "destructive" });
      setIsSending(false);
      return;
    }

    const textToSend = newMessage.trim();
    setNewMessage("");

    const chatDocRef = doc(firestore, 'chats', chatId);
    const messagesCollectionRef = collection(chatDocRef, 'messages');

    try {
      await updateDoc(chatDocRef, {
        lastMessage: textToSend,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: currentUser.uid,
      });

      await addDoc(messagesCollectionRef, {
        senderId: currentUser.uid,
        text: textToSend,
        timestamp: serverTimestamp(),
      });

      // Message will appear via onSnapshot listener (real-time)

    } catch (error: any) {
      setNewMessage(textToSend); // Restore message on failure
      console.error("Error sending message:", error);
      toast({
        title: "Message Not Sent",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };


  if (loading || !hydrated || authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (chatError && !chatError.includes('suspended')) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 font-sans">
        {chatError.includes('block') ? <UserX className="mx-auto h-16 w-16 text-destructive" /> : <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />}
        <h2 className="mt-6 text-2xl font-semibold font-serif">Chat Unavailable</h2>
        <p className="mt-2 text-muted-foreground">{chatError}</p>
        <Link href="/messages" className="mt-6">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Messages
          </Button>
        </Link>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="p-4 text-center font-sans h-full flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-card shadow-xl rounded-lg overflow-hidden font-sans">
      <div className="flex items-center p-4 border-b border-border">
        <Link href="/messages" passHref legacyBehavior>
          <Button variant="ghost" size="icon" className="mr-2 md:hidden" asChild>
            <a><ArrowLeft className="h-6 w-6" /></a>
          </Button>
        </Link>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={partner.avatar} alt={partner.username} data-ai-hint={partner.dataAiHint} />
          <AvatarFallback>{partner.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex items-center">
          <Link href={`/profile/${partner.id}`} className="hover:underline">
            <h2 className="text-xl font-semibold font-serif">{partner.username}</h2>
          </Link>
          {distance !== null && distance <= 20 && (
            <Badge className="bg-green-500 border-none text-white ml-2">Nearby</Badge>
          )}
        </div>
      </div>

      <ScrollArea viewportRef={scrollAreaRef} className="flex-1 p-4 space-y-2 overflow-y-auto bg-background/50">
        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreMessages}
              disabled={loadingMore}
              className="text-muted-foreground"
            >
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ChevronUp className="h-4 w-4 mr-2" />
              )}
              {loadingMore ? 'Loading...' : 'Load older messages'}
            </Button>
          </div>
        )}

        {messages.length === 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-serif">Safety Tip</AlertTitle>
            <AlertDescription className="font-sans">Never share personal financial information and be cautious with links or attachments.</AlertDescription>
          </Alert>
        )}

        {messages.map((msg, index) => (
          <div
            key={`${msg.id}-${index}`}
            className={`flex gap-2 items-start mb-3 ${msg.senderId === currentUser?.uid ? "justify-end" : "justify-start"
              }`}
          >
            {msg.senderId !== currentUser?.uid && partner && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={partner.avatar} alt={partner.username} />
                <AvatarFallback>{partner.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`px-3 py-2 rounded-lg max-w-[70%] break-words shadow ${msg.senderId === currentUser?.uid ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <div className={`text-xs mt-1 text-right ${msg.senderId === currentUser?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{hydrated && msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""}</div>
            </div>
          </div>
        ))}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
        {chatError && chatError.includes('suspended') && (
          <div className="text-center text-xs text-destructive mb-2">{chatError}</div>
        )}
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-background"
            aria-label="Chat message input"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending} aria-label="Send message">
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
