
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, deleteUser, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/components/settings/ThemeSwitcher";
import { PreferencesSelector } from "@/components/settings/PreferencesSelector";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FirebaseError } from "firebase/app";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isTogglingSuspend, setIsTogglingSuspend] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setIsSuspended(userDocSnap.data().isSuspended || false);
        }
      } catch (error) {
        console.error("Error fetching user status:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);
  
  const handleToggleSuspend = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setIsTogglingSuspend(true);
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { isSuspended: !isSuspended });
        setIsSuspended(!isSuspended);
        toast({
            title: "Success",
            description: `Your profile has been ${!isSuspended ? "suspended" : "reactivated"}.`
        });
    } catch (error: any) {
        toast({ title: "Error", description: "Could not update your profile status.", variant: "destructive" });
    } finally {
        setIsTogglingSuspend(false);
    }
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

  const handleDeleteProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    setIsDeleting(true);
    try {
        // The most important step is deleting the auth user.
        // A Cloud Function will trigger on this deletion to clean up all associated data.
        await deleteUser(currentUser);
        
        toast({ title: "Profile Deleted", description: "Your account and all data have been permanently deleted." });
        router.push('/');

    } catch (error: any) {
        let description = "An unexpected error occurred. Please try again.";
        if (error instanceof FirebaseError) {
             switch (error.code) {
                case 'auth/requires-recent-login':
                    description = "This is a sensitive operation. Please log out and log back in before deleting your profile.";
                    break;
                default:
                     console.error("Error deleting profile:", error);
             }
        } else {
             console.error("Error deleting profile:", error);
        }
        toast({ title: "Deletion Failed", description, variant: "destructive" });
    } finally {
        setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8 font-serif text-center md:text-left text-primary">Settings</h1>
      
      <ThemeSwitcher />

      <Separator className="my-10" />

      <PreferencesSelector />

      <Separator className="my-10" />
      
      <Card className="shadow-lg font-sans rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Manage Your Profile</CardTitle>
          <CardDescription>Update your photos, bio, and other account settings.</CardDescription>
        </CardHeader>
        <CardContent>
            <Link href="/profile/edit">
                <Button>Go to Edit Profile</Button>
            </Link>
        </CardContent>
      </Card>
      
      <Separator className="my-10" />
      
      <Card className="shadow-lg font-sans rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Account Actions</CardTitle>
          <CardDescription>Log out from your current session.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/>
                Log Out
            </Button>
        </CardContent>
      </Card>

      <Separator className="my-10" />

      <Card className="shadow-lg font-sans border-destructive rounded-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-serif text-destructive">Danger Zone</CardTitle>
                <CardDescription>Manage your account status and deletion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Suspend Profile</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        {isSuspended
                            ? "Your profile is currently hidden. Reactivate it to appear in matches again."
                            : "Suspending your account will temporarily hide your profile from others. You can reactivate it at any time."
                        }
                    </p>
                    <Button variant="outline" className="w-full md:w-auto border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleToggleSuspend} disabled={isTogglingSuspend}>
                        {isTogglingSuspend && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSuspended ? "Reactivate Profile" : "Suspend Profile"}
                    </Button>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-medium">Delete Profile Permanently</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        This action is irreversible and will permanently delete all your data, including matches and messages.
                    </p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full md:w-auto" disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Delete Profile
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                            onClick={handleDeleteProfile}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                            >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yes, delete my account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
