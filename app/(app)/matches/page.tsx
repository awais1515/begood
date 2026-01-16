
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { collection, doc, getDoc, getDocs, setDoc, arrayUnion, serverTimestamp, query, where, runTransaction, type QueryConstraint } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase/provider";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, X, SlidersHorizontal, Search, BookOpen, RefreshCw, Users, HelpCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WelcomeNotification } from "@/components/WelcomeNotification";
import { formatDisplayValue } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  age?: number;
  bio?: string;
  mainImage?: string;
  dataAiHints?: string[];
  country?: string;
  gender?: string;
  birthYear?: number;
  personas?: string[];
  interests?: string[];
  isSuspended?: boolean;
}

// Define custom SVG icons
const HelmetIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Helmet Icon"
  >
    <path d="M25 5C15.5817 5 8 12.5817 8 22V33C8 38.5228 12.4772 43 18 43H32C37.5228 43 42 38.5228 42 33V22C42 12.5817 34.4183 5 25 5Z" fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth="1.5" />
    <path d="M14 21C14 19 17 18 25 18C33 18 36 19 36 21V31C36 33.5 34.5 35 32 35H18C15.5 35 14 33.5 14 31V21Z" fill="hsl(var(--popover))" />
    <rect x="18" y="26" width="2" height="7" rx="1" fill="hsl(var(--primary-foreground))" />
    <rect x="24" y="26" width="2" height="7" rx="1" fill="hsl(var(--primary-foreground))" />
    <rect x="30" y="26" width="2" height="7" rx="1" fill="hsl(var(--primary-foreground))" />
    <path d="M19 12L22 15L25 12L28 15L31 12" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BalaclavaIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 40 52" // ViewBox: width 40, height 52
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Balaclava Mask Icon"
  >
    <path
      d="M20 0C10.0589 0 2 8.05887 2 18C2 27.3333 5.6 35.2 10.4 40.4C10.7017 40.7695 10.8683 41.2134 10.8683 41.6667V49C10.8683 50.6569 12.2114 52 13.8683 52H26.1317C27.7886 52 29.1317 50.6569 29.1317 49V41.6667C29.1317 41.2134 29.2983 40.7695 29.6 40.4C34.4 35.2 38 27.3333 38 18C38 8.05887 29.9411 0 20 0Z"
      fill="currentColor"
    />
    <ellipse cx="13" cy="18" rx="4.5" ry="2.5" fill="hsl(var(--background))" />
    <line x1="10" y1="18" x2="16" y2="18" stroke="hsl(var(--foreground))" strokeOpacity="0.4" strokeWidth="0.7" />

    <ellipse cx="27" cy="18" rx="4.5" ry="2.5" fill="hsl(var(--background))" />
    <line x1="24" y1="18" x2="30" y2="18" stroke="hsl(var(--foreground))" strokeOpacity="0.4" strokeWidth="0.7" />
  </svg>
);

const personaOptions = [
  { id: "booklover", label: "Booklover", icon: BookOpen },
  { id: "biker", label: "Biker", icon: HelmetIcon },
  { id: "masked-guy", label: "Masked Guy", icon: BalaclavaIcon },
];

const purposeFilterOptions = [
  { value: "any", label: "Anything" },
  { value: "friendship", label: "Friendship", icon: Users },
  { value: "relationship", label: "A Relationship", icon: Heart },
  { value: "exploring", label: "Don't know yet", icon: HelpCircle },
];

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe",
  "Other"
];

const genderFilterOptions = [
  { value: 'any', label: 'Any Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' }
];

function SearchFilters({ closeDialog }: { closeDialog: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [country, setCountry] = useState('any');
  const [gender, setGender] = useState('any');
  const [purpose, setPurpose] = useState('any');

  useEffect(() => {
    if (searchParams) {
      setCountry(searchParams.get('country') || 'any');
      setGender(searchParams.get('gender') || 'any');
      setPurpose(searchParams.get('purpose') || 'any');
    }
  }, [searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (country && country !== 'any') params.append('country', country);
    if (gender && gender !== 'any') params.append('gender', gender);
    if (purpose && purpose !== 'any') params.append('purpose', purpose);

    router.push(`/matches?${params.toString()}`);
    closeDialog();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6 text-primary" />
          Filter Profiles
        </DialogTitle>
        <DialogDescription>
          Refine your search to find the perfect match.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <div className="md:col-span-2">
          <Label htmlFor="lookingFor" className="text-primary">Looking For</Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger id="lookingFor">
              <SelectValue placeholder="Anything" />
            </SelectTrigger>
            <SelectContent>
              {purposeFilterOptions.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="country" className="text-primary">Country</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country">
              <SelectValue placeholder="Any Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Country</SelectItem>
              {countries.map(countryItem => (
                <SelectItem key={countryItem} value={countryItem}>{countryItem}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="gender" className="text-primary">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Any Gender" />
            </SelectTrigger>
            <SelectContent>
              {genderFilterOptions.map(genderItem => (
                <SelectItem key={genderItem.value} value={genderItem.value}>{genderItem.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button size="lg" className="w-full" onClick={handleApplyFilters}>
          <Search className="mr-2 h-5 w-5" /> Apply Filters
        </Button>
      </DialogFooter>
    </>
  )
}

export default function MatchesPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const { user: currentUser, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const profilesRef = useRef<UserProfile[]>([]);
  const { toast } = useToast();
  const [matchData, setMatchData] = useState<UserProfile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const searchParams = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);
  const [errorState, setErrorState] = useState<{ hasError: boolean, message: string }>({ hasError: false, message: '' });

  useEffect(() => {
    // This check now runs only on the client, preventing build errors
    const hasAccepted = localStorage.getItem('hasAcceptedWelcomeRules');
    if (!hasAccepted) {
      setShowWelcome(true);
    }
  }, []);

  const handleAcceptWelcome = () => {
    localStorage.setItem('hasAcceptedWelcomeRules', 'true');
    setShowWelcome(false);
  };

  const fetchData = useCallback(async () => {
    if (!currentUser || !firestore) {
      setLoadingProfiles(false);
      setProfiles([]);
      return;
    }

    const currentUserId = currentUser.uid;

    setLoadingProfiles(true);
    setErrorState({ hasError: false, message: '' });
    try {
      const currentUserDocRef = doc(firestore, "users", currentUserId);
      const currentUserDocSnap = await getDoc(currentUserDocRef);

      if (currentUserDocSnap.exists()) {
        const profileData = { id: currentUserDocSnap.id, ...currentUserDocSnap.data() } as UserProfile;
        if (profileData.birthYear) {
          profileData.age = new Date().getFullYear() - profileData.birthYear;
        }
        setCurrentUserProfile(profileData);
      }

      const interactionsDocRef = doc(firestore, "userInteractions", currentUserId);
      const interactionsDocSnap = await getDoc(interactionsDocRef);

      let seenIds: string[] = [currentUserId];
      if (interactionsDocSnap.exists()) {
        const data = interactionsDocSnap.data();
        // Exclude: liked, disliked, blocked, and matches (already friends)
        seenIds.push(
          ...(data.liked || []),
          ...(data.disliked || []),
          ...(data.blocked || []),
          ...(data.matches || [])  // Don't show matched users
        );
      }

      const usersRef = collection(firestore, "users");

      const finalQuery = query(usersRef, where("isSuspended", "==", false));
      const querySnapshot = await getDocs(finalQuery);

      const currentYear = new Date().getFullYear();
      let fetchedUsers: UserProfile[] = [];
      querySnapshot.forEach(docSnap => {
        const id = docSnap.id;
        if (!seenIds.includes(id)) {
          const data = docSnap.data();
          const age = data.birthYear ? currentYear - data.birthYear : data.age;
          fetchedUsers.push({ id, ...data, age } as UserProfile);
        }
      });

      profilesRef.current = fetchedUsers;
      setProfiles(fetchedUsers);

    } catch (error: any) {
      console.error("Error fetching data:", error);

      let description = "There was a problem loading profiles. It might be a temporary issue.";
      if (error.code === 'failed-precondition' || (error.message && error.message.includes("indexes"))) {
        description = "The database needs a new index for this query. Please check the browser console for a link to create it, or adjust your filters.";
      } else if (error.code === 'permission-denied') {
        description = "You don't have permission to view these profiles. This could be due to a security rule configuration issue.";
      }

      setErrorState({ hasError: true, message: description });
      toast({
        title: "Error Fetching Profiles",
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoadingProfiles(false);
    }
  }, [currentUser, firestore, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleInteraction(targetProfile: UserProfile, type: "liked" | "disliked") {
    if (!currentUser || !firestore || isInteracting) return;
    setIsInteracting(true);

    const currentUserId = currentUser.uid;
    const targetUserId = targetProfile.id;

    const originalProfiles = [...profilesRef.current];

    const newProfiles = originalProfiles.filter(profile => profile.id !== targetUserId);
    profilesRef.current = newProfiles;
    setProfiles(newProfiles);

    const interactionsDocRef = doc(firestore, "userInteractions", currentUserId);
    const targetInteractionsDocRef = doc(firestore, "userInteractions", targetUserId);

    try {
      await runTransaction(firestore, async (transaction) => {
        const targetInteractionsSnap = await transaction.get(targetInteractionsDocRef);
        const targetInteractionsData = targetInteractionsSnap.exists() ? targetInteractionsSnap.data() : {};
        const targetLiked = targetInteractionsData.liked || [];

        // Add to current user's liked/disliked array
        transaction.set(interactionsDocRef, { [type]: arrayUnion(targetUserId) }, { merge: true });

        // NEW: If current user liked target, add current user to target's requests array
        if (type === "liked") {
          console.log(`🎯 Adding ${currentUserId} to ${targetUserId}'s requests array`);
          transaction.set(targetInteractionsDocRef, {
            requests: arrayUnion(currentUserId)
          }, { merge: true });
        }

        // Check for mutual match
        if (type === "liked" && targetLiked.includes(currentUserId)) {
          setMatchData(targetProfile);

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
        description: "There was a problem saving your choice. Please try again.",
        variant: "destructive",
      });
      profilesRef.current = originalProfiles;
      setProfiles(originalProfiles);
    } finally {
      setIsInteracting(false);
    }
  }

  if (authLoading || loadingProfiles) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center p-4">
        <h2 className="text-2xl font-semibold font-serif">Please Log In</h2>
        <p className="mt-2 text-muted-foreground">You need to be logged in to discover new profiles.</p>
        <Link href="/" className="mt-4">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  const currentProfile = profiles[0];

  // Get interests/hobbies from profile (mock data for now, should come from user profile)
  const interests = currentProfile?.dataAiHints || ['Football', 'Singing', 'Nature', 'Baking', 'Hiking', 'Book Shopping', 'Horse Riding', 'Tennis'];

  return (
    <>
      <WelcomeNotification isOpen={showWelcome} onAccept={handleAcceptWelcome} />

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <SearchFilters closeDialog={() => setIsFilterDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {matchData && currentUserProfile && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-0">
          <div className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-md w-full text-center p-8 relative transform transition-all animate-in zoom-in-95">
            <h2 className="text-5xl font-bold font-serif text-primary [text-shadow:0_0_15px_hsl(var(--primary)/0.5)]">
              Hot Match!
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              You and {matchData.username} have liked each other!
            </p>
            <div className="flex justify-center items-center my-8 space-x-[-2rem]">
              <Avatar className="w-32 h-32 border-4 border-primary ring-4 ring-primary/50">
                <AvatarImage src={currentUserProfile.mainImage || "https://placehold.co/128x128.png"} alt={currentUserProfile.username || 'You'} />
                <AvatarFallback>{currentUserProfile.username?.charAt(0) || 'Y'}</AvatarFallback>
              </Avatar>
              <Avatar className="w-32 h-32 border-4 border-primary ring-4 ring-primary/50">
                <AvatarImage src={matchData.mainImage || "https://placehold.co/128x128.png"} alt={matchData.username} />
                <AvatarFallback>{matchData.username.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col space-y-4">
              <Link href={`/messages/${matchData.id}`} passHref>
                <Button size="lg" className="w-full">Send a Message</Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full" onClick={() => setMatchData(null)}>
                Keep Swiping
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 h-full">
        {/* Action Buttons - Right aligned below header */}
        <div className="flex justify-end px-4 md:px-6 py-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData()}
              className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              aria-label="Reload profiles"
            >
              <RefreshCw className="h-5 w-5 text-[#C64D68]" />
            </button>
            <button
              onClick={() => setIsFilterDialogOpen(true)}
              className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              aria-label="Open search filters"
            >
              <SlidersHorizontal className="h-5 w-5 text-[#C64D68]" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-6 pb-2">
          {errorState.hasError ? (
            <div className="flex flex-col items-center justify-center text-center p-4 text-destructive-foreground bg-destructive/80 rounded-lg shadow-lg max-w-sm w-full">
              <AlertTriangle className="mx-auto h-12 w-12" />
              <h2 className="mt-4 text-2xl font-semibold font-serif">Error Fetching Profiles</h2>
              <p className="mt-2">{errorState.message}</p>
              <Button variant="outline" onClick={() => fetchData()} className="mt-4 text-destructive border-destructive-foreground/50 hover:bg-destructive-foreground/10 hover:text-destructive-foreground">
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </div>
          ) : currentProfile ? (
            <div className="relative w-full max-w-sm mx-auto">
              {/* Profile Card */}
              <Card className="overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-b from-primary/5 to-primary/20 border-primary/20 mt-0 md:mt-[-30px]">
                {/* Image Section */}
                <div className="relative w-full h-[calc(100vh-220px)] md:h-[calc(100vh-180px)]">
                  <Image
                    src={currentProfile.mainImage || "https://placehold.co/600x800.png"}
                    alt={currentProfile.username}
                    fill
                    sizes="(max-width: 640px) 100vw, 384px"
                    className="object-cover"
                    priority
                  />

                  {/* Noshaba Gradient overlay - Dark Pink at bottom, covering 60% height */}
                  <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[#4A1A25] via-[#792C3D]/95 to-transparent z-10" />

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                    <div className="flex flex-col mb-2">
                      {/* Name */}
                      <Link href={`/profile/${currentProfile.id}`}>
                        <h2 className="text-3xl font-[600px] text-white tracking-wide hover:underline drop-shadow-md">
                          {currentProfile.name || currentProfile.username}
                        </h2>
                      </Link>

                      {/* Active Status */}
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                        <span className="text-xs font-normal text-green-400">Online</span>
                      </div>

                      {/* Age & Gender */}
                      <div className="text-white/90 font-medium text-sm mt-1">
                        {currentProfile.age && <span>{currentProfile.age} Years</span>}
                        {currentProfile.age && currentProfile.gender && <span className="mx-2 text-white/60">|</span>}
                        {currentProfile.gender && <span>{formatDisplayValue(currentProfile.gender)}</span>}
                      </div>

                      {/* Location */}
                      {currentProfile.country && (
                        <div className="flex items-center gap-1 mt-0.5 text-white/80 text-sm">
                          <span className="text-white fill-current w-3 h-3"><Image src="/location.svg" alt="Location" width={20} height={20} /></span>
                          <span>{currentProfile.country}</span>
                        </div>
                      )}

                      {/* Persona Badge */}
                      {currentProfile.personas && currentProfile.personas.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 ">
                          {currentProfile.personas.map((persona, idx) => {
                            const personaInfo = personaOptions.find(p => p.id === persona);
                            return (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 text-xs font-semibold text-white rounded-[5px] border border-white/40 bg-white/5 backdrop-blur-sm"
                              >
                                {personaInfo?.label || formatDisplayValue(persona)}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Interest Tags */}
                      <div className="flex flex-wrap gap-0.5 mt-3 pr-24">
                        {currentProfile?.interests?.slice(0, 7).map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-[8px] font-medium bg-[#4F1D28] text-white/90 rounded-full border border-white/5 shadow-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons - Absolute positioned bottom right in card */}
                    <div className="absolute bottom-5 right-5 flex gap-3 z-30">
                      <Button
                        onClick={() => handleInteraction(currentProfile, "disliked")}
                        size="icon"
                        className="h-10 w-10 rounded-full bg-white hover:bg-white/90 text-black hover:text-black/80 transition-all duration-200 shadow-xl border border-white/20"
                        aria-label={`Dislike ${currentProfile.username}`}
                        disabled={isInteracting}
                      >
                        <X className="h-5 w-5 stroke-[3]" />
                      </Button>
                      <Button
                        onClick={() => handleInteraction(currentProfile, "liked")}
                        size="icon"
                        className="h-10 w-10 rounded-full bg-white hover:bg-white/90 text-[#FF4D4D] hover:text-[#FF4D4D]/80 transition-all duration-200 shadow-xl border border-white/20"
                        aria-label={`Like ${currentProfile.username}`}
                        disabled={isInteracting}
                      >
                        <Heart className="h-5 w-5 fill-current" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <h2 className="text-2xl font-semibold font-serif">That's Everyone For Now</h2>
              <p className="mt-2 text-muted-foreground">You've seen all available profiles. Check back later or adjust your filters!</p>
              <div className="flex items-center gap-4 mt-4">
                <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Adjust Filters
                </Button>
                <Button onClick={() => fetchData()}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reload Profiles
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
