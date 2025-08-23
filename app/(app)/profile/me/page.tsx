
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, FileQuestion, Edit, UserCircle, Users, Heart, HelpCircle, BookOpen, Search, LogOut, Settings } from "lucide-react"; 
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { formatDisplayValue } from '@/lib/utils';

export type DetailedProfile = {
  id: string;
  username?: string;
  age: number;
  personas: string[];
  lookingFor: string[];
  purpose?: 'friendship' | 'relationship' | 'exploring';
  gender: 'male' | 'female' | 'non-binary' | 'other' | 'prefer not to say';
  country: string;
  bio: string;
  mainImage: string;
  profileImages: string[];
  dataAiHints: string[];
  interests: string[];
  favoriteBook?: string;
};

const formatPurposeDisplay = (purpose?: 'friendship' | 'relationship' | 'exploring'): string => {
  if (!purpose) return '';
  switch (purpose) {
    case 'friendship': return 'Looking for Friends';
    case 'relationship': return 'Seeking a Relationship';
    case 'exploring': return 'Exploring Connections';
    default: return '';
  }
};

const getPurposeIcon = (purpose?: 'friendship' | 'relationship' | 'exploring'): React.ElementType | null => {
  if (!purpose) return null;
  switch (purpose) {
    case 'friendship': return Users;
    case 'relationship': return Heart;
    case 'exploring': return HelpCircle;
    default: return null;
  }
};

export default function MyProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<DetailedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>("");
  const [selectedImageDataAiHint, setSelectedImageDataAiHint] = useState<string>("");

  useEffect(() => {
    setHydrated(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setLoading(false);
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          const age = data.birthYear ? (new Date().getFullYear() - parseInt(data.birthYear, 10)) : data.age || 0;
          
          setProfile({
            id: currentUser.uid,
            ...data,
            age,
          } as DetailedProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Could not fetch your profile.",
          variant: "destructive",
        });
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [currentUser, toast]);


  const handleImageClick = (imageUrl: string, altText: string, dataAiHint: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageAlt(altText);
    setSelectedImageDataAiHint(dataAiHint);
    setIsImageDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Logout Failed",
        description: "There was an error trying to log you out.",
        variant: "destructive",
      });
    }
  };

  if (loading || !hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-sans">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <FileQuestion className="mx-auto h-24 w-24 text-destructive opacity-70" />
        <h2 className="mt-8 text-3xl font-semibold font-serif">Profile Incomplete or Error</h2>
        <p className="mt-2 text-muted-foreground font-sans">
          We couldn't load your profile. This might be a permission issue or your profile is not fully set up.
        </p>
        <div className="flex gap-4 mt-6">
            <Link href="/signup" passHref legacyBehavior>
                <Button variant="outline" asChild><a>Create Profile</a></Button>
            </Link>
            <Button onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Log Out & Try Again
            </Button>
        </div>
      </div>
    );
  }

  const PurposeIcon = getPurposeIcon(profile.purpose);
  const allImages = [...new Set([profile.mainImage, ...(profile.profileImages || [])])].filter(Boolean);
  const allDataAiHints = profile.dataAiHints || [];

  return (
    <>
      <div className="container mx-auto max-w-4xl py-8 px-4 font-sans">
        <Card className="shadow-xl rounded-xl overflow-hidden">
          <div className="relative h-72 md:h-96 w-full">
            <Carousel className="w-full h-full" opts={{ loop: allImages.length > 1 }}>
                <CarouselContent>
                    {allImages.map((imgSrc, index) => (
                        <CarouselItem key={`${imgSrc}-${index}`} className="p-0">
                            <button
                                className="w-full h-full relative"
                                onClick={() => handleImageClick(
                                    imgSrc,
                                    `My photo ${index + 1}`,
                                    allDataAiHints[index] || "person lifestyle"
                                )}
                                aria-label={`View larger image of my photo ${index + 1}`}
                            >
                                <Image
                                    src={imgSrc}
                                    alt={`My photo ${index + 1}`}
                                    fill
                                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                                    priority={index === 0}
                                    data-ai-hint={allDataAiHints[index] || "profile portrait"}
                                />
                                {index === 0 && (
                                  <Badge variant="secondary" className="absolute top-2 left-2 z-10">Main</Badge>
                                )}
                            </button>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {allImages.length > 1 && (
                    <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white border-none hover:bg-black/60" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white border-none hover:bg-black/60" />
                    </>
                )}
            </Carousel>

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Link href="/profile/edit">
                <Button variant="outline" size="icon" className="bg-background/70 hover:bg-background/90 border-foreground/50 backdrop-blur-sm">
                  <Edit className="h-5 w-5" />
                  <span className="sr-only">Edit Profile</span>
                </Button>
              </Link>
               <Link href="/settings">
                <Button variant="outline" size="icon" className="bg-background/70 hover:bg-background/90 border-foreground/50 backdrop-blur-sm">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </Link>
            </div>
            <div className="absolute bottom-0 left-0 p-6 text-primary pointer-events-none">
              <h1 className="text-4xl font-bold font-serif">{profile.username}, {profile.age}</h1>
              <p className="text-lg font-sans mt-1">
                {profile.personas?.map(formatDisplayValue).join(' & ')} • {formatDisplayValue(profile.gender)} • {profile.country}
              </p>
              {profile.purpose && (
                <div className="flex items-center mt-1.5">
                   {PurposeIcon && <PurposeIcon className="mr-2 h-5 w-5" />}
                  <p className="text-md font-sans">{formatPurposeDisplay(profile.purpose)}</p>
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-6 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold font-serif mb-3 text-primary flex items-center">
                <UserCircle className="mr-3 h-7 w-7" /> About Me
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </section>

             <section>
                <h2 className="text-2xl font-semibold font-serif mb-3 text-primary flex items-center gap-2">
                    <Search className="h-6 w-6" /> Seeking
                </h2>
                <div className="flex flex-wrap gap-2 pl-8">
                  {(profile.lookingFor && profile.lookingFor.length > 0) ? profile.lookingFor.map((item, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                      {formatDisplayValue(item)}
                    </Badge>
                  )) : <p className="text-muted-foreground">Anyone</p>}
                </div>
              </section>

            {profile.interests && profile.interests.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold font-serif mb-3 text-primary">My Interests & Hobbies</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {profile.favoriteBook && (
              <section>
                <h2 className="text-2xl font-semibold font-serif mb-3 text-primary flex items-center gap-2">
                    <BookOpen className="h-6 w-6" />Favorite Book
                </h2>
                <p className="text-muted-foreground italic pl-8">{profile.favoriteBook}</p>
              </section>
            )}

            <section className="pt-4 border-t border-border">
              <h2 className="text-2xl font-semibold font-serif mb-4 text-primary">Manage Profile</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/profile/edit" passHref legacyBehavior>
                  <Button size="lg" className="flex-1" asChild>
                    <a><Edit className="mr-2 h-5 w-5" /> Edit My Profile</a>
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="flex-1" onClick={handleLogout}>
                  <LogOut className="mr-2 h-5 w-5" />
                  Log Out
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                  This is where you can edit your profile or log out.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      {selectedImageUrl && (
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-2 sm:p-4 bg-background/90 backdrop-blur-sm border-border/50 !rounded-lg">
            <div className="relative w-full aspect-[4/3] sm:aspect-video max-h-[85vh]">
              <Image
                src={selectedImageUrl}
                alt={selectedImageAlt}
                fill
                style={{ objectFit: 'contain' }}
                data-ai-hint={selectedImageDataAiHint}
                className="rounded-md"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 70vw"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
