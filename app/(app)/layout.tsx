
"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MessageSquare, User, Shield, Loader2, Search, LogOut } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useFirestore } from "@/firebase/provider";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { usePresence } from "@/hooks/use-presence";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, auth } = useAuth();
  const firestore = useFirestore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [userProfile, setUserProfile] = useState<{ displayName?: string; photoURL?: string } | null>(null);

  // Track user presence (online status)
  usePresence();

  // Page titles mapping
  const getPageTitle = () => {
    if (pathname === '/matches' || pathname === '/') return 'Discover';
    if (pathname.startsWith('/requests')) return 'Likes';
    if (pathname.startsWith('/messages')) return 'Messages';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/policies')) return 'Policies';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'BeGood';
  };

  // Fetch user profile
  useEffect(() => {
    if (!user || !firestore) return;

    const fetchUserProfile = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserProfile({
            displayName: data.displayName || data.firstName || data.username || data.name || user.displayName || 'User',
            photoURL: data.photoURL || data.mainImage || data.photos?.[0] || user.photoURL || undefined
          });
        } else {
          setUserProfile({
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || undefined
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || undefined
        });
      }
    };

    fetchUserProfile();
  }, [user, firestore]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.emailVerified) {
      // Redirect unverified users to verify-email page
      router.push('/verify-email');
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

      // Get current chat partner ID from pathname (if viewing a specific chat)
      const currentChatPartnerId = pathname.startsWith('/messages/')
        ? pathname.split('/messages/')[1]
        : null;

      querySnapshot.forEach((docSnap) => {
        const chatData = docSnap.data();
        const chatId = docSnap.id;

        // Only count as unread if the last message exists and was sent by the other person
        if (chatData.lastMessage && chatData.lastMessageSenderId && chatData.lastMessageSenderId !== user.uid) {
          // Don't count if user is currently viewing this chat
          // Check if the current chat partner is part of this chat OR if chatId matches the URL partner
          const isViewingThisChat = currentChatPartnerId && (
            currentChatPartnerId === chatData.lastMessageSenderId ||
            chatId === currentChatPartnerId ||
            chatId.includes(currentChatPartnerId)
          );

          if (!isViewingThisChat) {
            count++;
          }
        }
      });
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user, firestore, pathname]);

  // Track requests count (for Likes) - Real-time
  useEffect(() => {
    if (!user || !firestore) return;

    const interactionsDocRef = doc(firestore, 'userInteractions', user.uid);

    const unsubscribe = onSnapshot(interactionsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const requests = data.requests || [];
        setRequestsCount(requests.length);
      } else {
        setRequestsCount(0);
      }
    }, (error) => {
      console.error('Error listening to requests count:', error);
      setRequestsCount(0);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { title: "Discover", href: "/matches", icon: Search },
    { title: "Likes", href: "/requests", icon: Heart, badge: requestsCount !== 0 ? requestsCount : "" },
    { title: "Messages", href: "/messages", icon: MessageSquare, badge: unreadCount !== 0 ? unreadCount : "" },
    { title: "Profile", href: "/profile/me", icon: User },
    { title: "Policies", href: "/policies", icon: Shield },
  ];

  const isActive = (href: string) => {
    if (href === '/matches') {
      return pathname === '/matches' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

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
    <div className="flex min-h-screen w-full bg-background font-sans">
      {/* Sidebar - Hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-white/5 bg-gradient-to-t from-[#792C3D] via-[#1B1B1B] via-50% to-[#1B1B1B] z-50 shadow-xl">
        {/* Logo - Using SVG from public folder */}
        <div className="flex flex-col items-center pt-8 pb-10">
          <div className="relative w-32 h-16">
            <Image
              src="/Logo.svg"
              alt="BeGood Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive(item.href)
                ? 'bg-gradient-to-b from-[#9F3C52] to-[#C64D68] text-white shadow-[0_4px_20px_-5px_rgba(159,60,82,0.4)]'
                : 'text-[#C64D68] hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon className={`h-[22px] w-[22px] ${isActive(item.href) ? 'text-white' : 'text-current group-hover:text-white transition-colors'}`} />
              <span className={`text-[15px] font-medium tracking-wide ${isActive(item.href) ? 'text-white' : 'text-current group-hover:text-white transition-colors'}`}>
                {item.title}
              </span>

              {/* Badge - Right aligned */}
              {typeof item.badge === 'number' && item.badge > 0 && (
                <div className="ml-auto">
                  <div className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold shadow-sm ${isActive(item.href)
                    ? 'bg-white text-[#A42347]'
                    : 'bg-[#A42347] text-white'
                    }`}>
                    {item.badge}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#C64D68]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-3.5 w-full rounded-2xl text-[#C64D68] hover:bg-[#A42347]/10 hover:text-[#A42347] transition-all duration-300 group"
          >
            <LogOut className="h-[22px] w-[22px] group-hover:scale-110 transition-transform" />
            <span className="text-[15px] font-medium tracking-wide">Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation - Visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#1B1B1B] to-[#1B1B1B]/95 border-t border-white/10 backdrop-blur-lg safe-area-pb">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${isActive(item.href)
                ? 'text-[#C64D68]'
                : 'text-white/50 hover:text-white/80'
                }`}
            >
              <div className="relative">
                <item.icon className={`h-6 w-6 ${isActive(item.href) ? 'text-[#C64D68]' : ''}`} />
                {/* Badge for mobile */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#A42347] px-1 text-[9px] font-bold text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive(item.href) ? 'text-[#C64D68]' : ''}`}>
                {item.title}
              </span>
            </Link>
          ))}
          {/* More menu / Profile on mobile */}
          <Link
            href="/profile/me"
            className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${isActive('/profile')
              ? 'text-[#C64D68]'
              : 'text-white/50 hover:text-white/80'
              }`}
          >
            <div className="relative h-6 w-6 rounded-full overflow-hidden bg-muted border border-[#A42347]/30">
              {userProfile?.photoURL ? (
                <Image
                  src={userProfile.photoURL}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-[#A42347]/10">
                  <User className="h-3 w-3 text-[#A42347]" />
                </div>
              )}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${isActive('/profile') ? 'text-[#C64D68]' : ''}`}>
              Profile
            </span>
          </Link>
        </div>
      </nav>

      {/* Main Content - No margin on mobile, ml-64 on md+ */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col bg-[#121212] pb-20 md:pb-0">
        {/* Top Header/Navbar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-[#121212]/95 backdrop-blur-sm border-b border-white/5">
          {/* Page Title */}
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{getPageTitle()}</h1>

          {/* Right Side - User Profile (hidden on mobile as it's in bottom nav) */}
          <Link href="/profile/me" className="hidden md:flex items-center gap-4 hover:bg-white/5 px-3 py-2 rounded-xl transition-all">
            <span className="text-sm font-semibold text-white/90">{userProfile?.displayName || 'User'}</span>
            <div className="relative h-11 w-11 rounded-full overflow-hidden bg-muted border-2 border-[#A42347]/30 ring-2 ring-[#A42347]/10">
              {userProfile?.photoURL ? (
                <Image
                  src={userProfile.photoURL}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-[#A42347]/10">
                  <User className="h-5 w-5 text-[#A42347]" />
                </div>
              )}
            </div>
          </Link>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
