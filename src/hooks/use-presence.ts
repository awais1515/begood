'use client';

import { useEffect, useRef } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';

/**
 * A hook that tracks user presence by updating their `lastActive` timestamp
 * periodically in Firestore. This allows other users to see if someone is 
 * currently online/active.
 * 
 * The hook updates the timestamp:
 * - Immediately when mounted (on app load/login)
 * - Every 2 minutes while the user keeps the app open
 * 
 * A user is considered "online" if their lastActive timestamp is within the last 5 minutes.
 */
export function usePresence() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user || !firestore) return;

        const updatePresence = async () => {
            try {
                const userDocRef = doc(firestore, 'users', user.uid);
                await updateDoc(userDocRef, {
                    lastActive: serverTimestamp(),
                    isOnline: true
                });
            } catch (error) {
                // Silently fail - presence is not critical
                console.debug('Failed to update presence:', error);
            }
        };

        // Update immediately on mount
        updatePresence();

        // Update every 2 minutes
        intervalRef.current = setInterval(updatePresence, 2 * 60 * 1000);

        // Cleanup: set offline when unmounting
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            // Try to mark as offline when closing
            if (user && firestore) {
                const userDocRef = doc(firestore, 'users', user.uid);
                updateDoc(userDocRef, {
                    isOnline: false,
                    lastActive: serverTimestamp()
                }).catch(() => {
                    // Silently fail
                });
            }
        };
    }, [user, firestore]);
}

/**
 * Helper function to determine if a user is online based on their lastActive timestamp.
 * A user is considered online if they were active within the last 5 minutes.
 * 
 * @param lastActive - The user's last active timestamp (can be Firestore Timestamp or Date)
 * @returns { isOnline: boolean, statusText: string }
 */
export function getOnlineStatus(lastActive: any): { isOnline: boolean; statusText: string } {
    if (!lastActive) {
        // No lastActive timestamp - show as "New" user
        return { isOnline: false, statusText: 'New' };
    }

    // Convert Firestore Timestamp to Date if needed
    const lastActiveDate = lastActive?.toDate ? lastActive.toDate() : new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    // Online: active within last 5 minutes
    if (diffMinutes < 5) {
        return { isOnline: true, statusText: 'Online' };
    }

    // Recently active: within last hour
    if (diffMinutes < 60) {
        const mins = Math.floor(diffMinutes);
        return { isOnline: false, statusText: `Active ${mins}m ago` };
    }

    // Active today: within last 24 hours
    if (diffMinutes < 24 * 60) {
        const hours = Math.floor(diffMinutes / 60);
        return { isOnline: false, statusText: `Active ${hours}h ago` };
    }

    // More than 24 hours ago
    const days = Math.floor(diffMinutes / (24 * 60));
    if (days === 1) {
        return { isOnline: false, statusText: 'Active yesterday' };
    }
    if (days < 7) {
        return { isOnline: false, statusText: `Active ${days}d ago` };
    }

    // More than a week ago
    return { isOnline: false, statusText: 'Inactive' };
}
