
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, FileQuestion } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { EditProfileForm } from '@/components/profile/EditProfileForm';
import type { DetailedProfile } from '@/app/(app)/profile/me/page';

type ProfileWithStatus = DetailedProfile & { isSuspended?: boolean };

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<ProfileWithStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (!currentUser || !firestore) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
           const age = data.birthYear ? (new Date().getFullYear() - parseInt(data.birthYear, 10)) : data.age || 0;
          setProfile({
            id: currentUser.uid,
            ...data,
            age,
            isSuspended: data.isSuspended || false,
          } as ProfileWithStatus);
        } else {
          toast({
            title: "Profile Not Found",
            description: "You need to create a profile first.",
            variant: "destructive"
          });
          router.push('/signup');
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Could not fetch your profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, router, toast, firestore]);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Your Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <FileQuestion className="mx-auto h-24 w-24 text-destructive opacity-70" />
        <h2 className="mt-8 text-3xl font-semibold font-serif">Profile Not Found</h2>
        <p className="mt-2 text-muted-foreground font-sans">
          We couldn't load your profile. Please try again or create one if you're new.
        </p>
        <Button onClick={() => router.push('/signup')} className="mt-6">
          Create Profile
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-4xl font-bold font-serif">Edit Profile</h1>
      </div>
      <EditProfileForm profile={profile} />
    </div>
  );
}
