
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageSquare, Heart, Loader2, FileQuestion, Users, HelpCircle, UserX, ShieldAlert, BookOpen, Search } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase/provider';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, arrayUnion, runTransaction, updateDoc } from "firebase/firestore";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useUserLocation } from '@/hooks/use-user-location';
import { getDistance, formatDisplayValue } from '@/lib/utils';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';


export type DetailedProfile = {
  id: string;
  username: string; 
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
  latitude?: number;
  longitude?: number;
  favoriteBook?: string;
  isSuspended?: boolean;
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


export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  if (!params || !params.userId || typeof params.userId !== "string") {
    // This case should ideally be handled by Next.js routing, but as a fallback:
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <FileQuestion className="mx-auto h-24 w-24 text-destructive opacity-70" />
        <h2 className="mt-8 text-3xl font-semibold font-serif">Invalid URL</h2>
        <p className="mt-2 text-muted-foreground font-sans">The user ID is missing from the URL.</p>
        <Button onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const userId = params.userId;
  
  const [profile, setProfile] = useState<DetailedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [isAlreadyLiked, setIsAlreadyLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>("");
  const [selectedImageDataAiHint, setSelectedImageDataAiHint] = useState<string>("");
  const [reportReason, setReportReason] = useState("");

  const { userLocation } = useUserLocation();
  const [distance, setDistance] = useState<number|null>(null);
  const { user: currentUser } = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (userLocation && profile?.latitude && profile?.longitude) {
        const dist = getDistance(
            userLocation.latitude,
            userLocation.longitude,
            profile.latitude,
            profile.longitude
        );
        setDistance(dist);
    }
  }, [userLocation, profile]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && userId && firestore) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const userDocRef = doc(firestore, 'users', userId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const firestoreData = userDocSnap.data();
            const age = firestoreData.birthYear ? (new Date().getFullYear() - parseInt(firestoreData.birthYear, 10)) : firestoreData.age || 0;
            
            setProfile({ 
                id: userDocSnap.id, 
                ...firestoreData,
                age
            } as DetailedProfile);

          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast({
            title: "Error",
            description: "Could not fetch user profile.",
            variant: "destructive",
          });
          setProfile(null);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [userId, hydrated, toast, firestore]);
  
  useEffect(() => {
    if (!currentUser || !userId || !firestore) return;

    const checkLikeStatus = async () => {
        const interactionsDocRef = doc(firestore, "userInteractions", currentUser.uid);
        const interactionsDocSnap = await getDoc(interactionsDocRef);

        if (interactionsDocSnap.exists()) {
            const data = interactionsDocSnap.data();
            if (data.liked && data.liked.includes(userId)) {
                setIsAlreadyLiked(true);
            }
        }
    };

    checkLikeStatus();
}, [currentUser, userId, firestore]);


  const handleLike = async () => {
    if (!profile || !currentUser || !firestore || isProcessing) {
        if(!isProcessing) toast({
            title: "Action failed",
            description: "You must be logged in to like a user.",
            variant: "destructive",
        });
        return;
    }
    setIsProcessing(true);
    
    const currentUserId = currentUser.uid;
    const targetUserId = profile.id;

    const interactionsDocRef = doc(firestore, "userInteractions", currentUserId);
    const targetInteractionsDocRef = doc(firestore, "userInteractions", targetUserId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const targetInteractionsSnap = await transaction.get(targetInteractionsDocRef);
            const targetInteractionsData = targetInteractionsSnap.exists() ? targetInteractionsSnap.data() : {};
            const targetLiked = targetInteractionsData.liked || [];

            // Update current user's interactions to record the like
            transaction.set(interactionsDocRef, {
                liked: arrayUnion(targetUserId)
            }, { merge: true });
            
            toast({
                title: "Profile Liked!",
                description: `You've liked ${profile.username}. If they like you back, you'll be matched!`,
            });
            setIsAlreadyLiked(true);

            // Check for a mutual match
            if (targetLiked.includes(currentUserId)) {
                toast({
                    title: "Hot Match!",
                    description: `You and ${profile.username} have liked each other!`,
                });
                
                const ids = [currentUserId, targetUserId].sort();
                const chatId = ids.join('_');
                const chatDocRef = doc(firestore, 'chats', chatId);

                transaction.set(chatDocRef, {
                    participants: ids,
                    createdAt: serverTimestamp(),
                    lastMessage: null,
                    lastMessageTimestamp: null,
                }, { merge: true });
            }
        });
    } catch (error) {
        console.error("Transaction failed: ", error);
        toast({
            title: "Interaction Error",
            description: "There was a problem saving your like. Please try again.",
            variant: "destructive",
        });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlockUser = async () => {
    if (!profile || !currentUser || !firestore || isProcessing) {
       if(!isProcessing) toast({
        title: "Action failed",
        description: "You must be logged in to block a user.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    
    const interactionsDocRef = doc(firestore, "userInteractions", currentUser.uid);
    try {
      await updateDoc(interactionsDocRef, {
        blocked: arrayUnion(profile.id)
      });

      toast({
        title: "User Blocked",
        description: `You have blocked ${profile.username}. You will no longer see their profile or messages.`,
        variant: "destructive",
      });
      router.push('/matches');
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Error",
        description: "Could not block the user. Please try again.",
        variant: "destructive",
      });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleReportUser = async () => {
    if (!profile || !currentUser || !firestore || isProcessing) {
       if(!isProcessing) toast({
        title: "Action failed",
        description: "You must be logged in to report a user.",
        variant: "destructive",
      });
      return;
    }
    if (!reportReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the report.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await addDoc(collection(firestore, "reports"), {
        reporterId: currentUser.uid,
        reportedUserId: profile.id,
        reportedUserName: profile.username,
        reason: reportReason,
        timestamp: serverTimestamp()
      });

      toast({
        title: "Report Submitted",
        description: `Your report for ${profile.username} has been submitted for review. Thank you for helping keep the community safe.`,
      });
    } catch (error) {
      console.error("Error reporting user:", error);
      toast({
        title: "Error",
        description: "Could not submit your report. Please try again.",
        variant: "destructive",
      });
    } finally {
        setReportReason("");
        setIsProcessing(false);
    }
  };


  const handleImageClick = (imageUrl: string, altTextPrefix: string, photoIndex: number, dataAiHint: string) => {
    setSelectedImageUrl(`${imageUrl}?id=${profile?.id}-gallery-${photoIndex}-large`);
    setSelectedImageAlt(`${altTextPrefix}'s photo ${photoIndex + 1}`);
    setSelectedImageDataAiHint(dataAiHint);
    setIsImageDialogOpen(true);
  };

  if (!hydrated || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-sans">Loading profile...</p>
      </div>
    );
  }

  if (!profile || profile.isSuspended) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <FileQuestion className="mx-auto h-24 w-24 text-destructive opacity-70" />
        <h2 className="mt-8 text-3xl font-semibold font-serif">Profile Not Found</h2>
        <p className="mt-2 text-muted-foreground font-sans">Sorry, we couldn't find the profile you're looking for. It may have been suspended or no longer exists.</p>
        <Button onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  const PurposeIcon = getPurposeIcon(profile.purpose);
  const allImages = [...new Set([profile.mainImage, ...(profile.profileImages || [])])].filter(Boolean);
  const allDataAiHints = profile.dataAiHints || [];


  return (
    <>
      <div className="container mx-auto max-w-4xl py-8 px-4 font-sans">
        <Button onClick={() => router.back()} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="shadow-xl rounded-xl overflow-hidden">
          <div className="relative h-72 md:h-96 w-full">
            <Carousel className="w-full h-full" opts={{ loop: allImages.length > 1 }}>
              <CarouselContent>
                {allImages.map((imgSrc, index) => (
                  <CarouselItem key={index} className="p-0">
                    <button
                      className="w-full h-full relative"
                      onClick={() => handleImageClick(
                        imgSrc, 
                        profile.username,
                        index,
                        allDataAiHints[index] || "person lifestyle"
                      )}
                      aria-label={`View larger image of ${profile.username}'s photo ${index + 1}`}
                    >
                      <Image
                        src={`${imgSrc}?id=${profile.id}-carousel-${index}`}
                        alt={`${profile.username}'s photo ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        priority={index === 0}
                        data-ai-hint={allDataAiHints[index] || "profile portrait"}
                      />
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
            <div className="absolute bottom-0 left-0 p-6 text-primary pointer-events-none">
              <div className="flex items-baseline gap-3">
                <h1 className="text-4xl font-bold font-serif">{profile.username}, {profile.age}</h1>
                {distance !== null && distance <= 20 && (
                    <Badge className="bg-green-500 hover:bg-green-500 border-none text-white">Nearby</Badge>
                )}
              </div>
              <p className="text-lg font-sans mt-0.5">
                {profile.personas?.map(formatDisplayValue).join(' & ')} • {formatDisplayValue(profile.gender)}
              </p>
              <p className="text-lg font-sans mt-1">{profile.country}</p>
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
              <h2 className="text-2xl font-semibold font-serif mb-3 text-primary">About {profile.username}</h2>
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
                <h2 className="text-2xl font-semibold font-serif mb-3 text-primary">Interests & Hobbies</h2>
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
              <h2 className="text-2xl font-semibold font-serif mb-4 text-primary">Connect with {profile.username}</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/messages/${profile.id}`} className="flex-1">
                  <Button size="lg" className="w-full" disabled={isProcessing}>
                    <MessageSquare className="mr-2 h-5 w-5" /> Send Message
                  </Button>
                </Link>
                {!isAlreadyLiked && (
                  <Button onClick={handleLike} size="lg" variant="success-outline" className="flex-1" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Heart className="mr-2 h-5 w-5" />}
                     Add to Matches (Like)
                  </Button>
                )}
              </div>
              <Separator className="my-6" />
              <h3 className="text-xl font-semibold font-serif mb-3 text-primary/90">Safety Options</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                    size="lg" 
                    variant="outline" 
                    className="flex-1 text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleBlockUser}
                    disabled={isProcessing}
                >
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserX className="mr-2 h-5 w-5" />}
                     Block User
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="flex-1"
                        disabled={isProcessing}
                    >
                        <ShieldAlert className="mr-2 h-5 w-5" /> Report User
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Report {profile.username}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please provide a reason for reporting this user. Your feedback is important for maintaining a safe community.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid w-full gap-2">
                      <Label htmlFor="report-reason" className="text-primary">Reason for Report</Label>
                      <Textarea 
                        id="report-reason" 
                        placeholder="e.g., Inappropriate photos, spam, harassment..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReportUser} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit Report
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
