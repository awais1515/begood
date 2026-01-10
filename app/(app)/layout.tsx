
"use client";

import Link from "next/link";
import { Heart, MessageSquare, User, Shield, Loader2, UserPlus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore } from "@/firebase/provider";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const firestore = useFirestore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !firestore) return;

    const chatsQuery = query(
      collection(firestore, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      let count = 0;
      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        // Only count as unread if the last message exists and was sent by the other person
        if (chatData.lastMessage && chatData.lastMessageSenderId && chatData.lastMessageSenderId !== user.uid) {
          count++;
        }
      });
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  // Track requests count
  useEffect(() => {
    if (!user || !firestore) return;

    const fetchRequestsCount = async () => {
      try {
        const interactionsDocRef = doc(firestore, 'userInteractions', user.uid);
        const interactionsSnap = await getDoc(interactionsDocRef);

        if (interactionsSnap.exists()) {
          const data = interactionsSnap.data();
          const requests = data.requests || [];
          setRequestsCount(requests.length);
        } else {
          setRequestsCount(0);
        }
      } catch (error) {
        console.error('Error fetching requests count:', error);
        setRequestsCount(0);
      }
    };

    fetchRequestsCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchRequestsCount, 30000);

    return () => clearInterval(interval);
  }, [user, firestore]);


  const navItems = [
    { title: "Discover", href: "/matches", icon: Heart },
    { title: "Messages", href: "/messages", icon: MessageSquare },
    { title: "Requests", href: "/requests", icon: UserPlus },
    { title: "Profile", href: "/profile/me", icon: User },
    { title: "Policies", href: "/policies", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background font-sans">
      <main className="flex-1 pb-16">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary"
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.title}</span>
              {item.href === '/messages' && unreadCount > 0 && (
                <div className="absolute top-0 right-0 -mr-2 mt-0.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                    {unreadCount}
                  </div>
                </div>
              )}
              {item.href === '/requests' && requestsCount > 0 && (
                <div className="absolute top-0 right-0 -mr-2 mt-0.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {requestsCount}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
