
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, UploadCloud, Trash2, Users, Heart, HelpCircle, BookOpen, KeyRound } from 'lucide-react';
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase/provider";
import Image from 'next/image';
import type { DetailedProfile } from '@/types/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FirebaseError } from "firebase/app";

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

const purposeOptions = [
    { value: "friendship", label: "Friendship", icon: Users },
    { value: "relationship", label: "A Relationship", icon: Heart },
    { value: "exploring", label: "Don't know yet", icon: HelpCircle },
];

const interestOptions = ["Cosplay", "Romance Books", "Fantasy Books", "Dark Romance Books", "Historical Books", "Sci-fi Books", "Fanfiction", "Horror Books", "Horror Movies", "Comedy", "Book Shopping", "Motorcycling", "Baking", "Football", "Volleyball", "Tennis", "Golf", "Basketball", "Rugby", "Swimming", "Pop", "Alter", "Rap", "Techno", "Heavy Metal", "Country Music", "Hip Hop Music", "Jazz", "R&B", "K-pop", "Punk Rock", "Rock", "Rave", "Metal", "Party", "Xbox", "Singing", "Tattoos", "Painting", "Drawing", "Blogging", "DIY", "Online Games", "Gardening", "Shopping", "Skating", "Ice Skating", "Bicycle", "Box", "Pilates", "Yoga", "Gymnastics", "Running", "Marathon", "Baseball", "Hiking", "Table Tennis", "Gym", "Weight Lifting", "Horse Riding", "Nature", "Car Trips", "Surf", "Picnic", "Fishing", "Museum", "Festival", "Karaoke", "Exhibition", "Concerts", "Bowling", "Art Galleries", "Wine", "Coctails", "Fast Food", "Vegan", "Vegetarian", "Foodie", "Reading", "Traveling", "Cooking", "Gaming", "Movies", "Music", "Sports", "Art", "Photography", "Coding"];

const editProfileFormSchema = z.object({
    bio: z.string().max(300, { message: "Bio cannot exceed 300 characters." }).optional(),
    interests: z.array(z.string()).optional(),
    favoriteBook: z.string().optional(),
    profileImages: z.array(z.string()).min(1, "Please upload at least one photo.").max(5, "You can upload a maximum of 5 photos."),
    personas: z.array(z.string()).refine((value) => value && value.length > 0, {
        message: "You have to select at least one persona.",
    }),
    lookingFor: z.array(z.string()).refine((value) => value && value.length > 0, {
        message: "You have to select at least one type to look for.",
    }),
    purpose: z.string({
        required_error: "You need to select your purpose.",
    }),
    newPassword: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
    confirmNewPassword: z.string().optional(),
}).refine(data => {
    if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
});


type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;

interface EditProfileFormProps {
    profile: DetailedProfile;
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user: currentUser, storage } = useAuth();
    const firestore = useFirestore();

    const [images, setImages] = useState<{ url: string; file?: File; }[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const form = useForm<EditProfileFormValues>({
        resolver: zodResolver(editProfileFormSchema),
        defaultValues: {
            bio: profile.bio || '',
            interests: profile.interests || [],
            favoriteBook: profile.favoriteBook || '',
            profileImages: profile.profileImages || [],
            personas: profile.personas || [],
            lookingFor: profile.lookingFor || [],
            purpose: profile.purpose || '',
            newPassword: '',
            confirmNewPassword: '',
        },
        mode: "onBlur",
    });

    useEffect(() => {
        const initialImages = [...new Set([profile.mainImage, ...(profile.profileImages || [])])]
            .filter(Boolean)
            .map(url => ({ url }));
        setImages(initialImages);
        form.setValue("profileImages", initialImages.map(img => img.url));
    }, [profile, form]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        if (images.length + newFiles.length > 5) {
            toast({ title: "Too many images", description: "You can upload a maximum of 5 photos.", variant: "destructive" });
            return;
        }

        const newImageObjects = newFiles.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));

        const allImages = [...images, ...newImageObjects];
        setImages(allImages);
        form.setValue("profileImages", allImages.map(img => img.url), { shouldValidate: true });
    };

    const handleImageDelete = (indexToDelete: number) => {
        if (images.length <= 1) {
            toast({ title: "Cannot remove", description: "You must have at least one photo.", variant: "destructive" });
            return;
        }

        const imageToDelete = images[indexToDelete];

        if (imageToDelete && !imageToDelete.file) {
            setImagesToDelete(prev => [...prev, imageToDelete.url]);
        } else if (imageToDelete) {
            URL.revokeObjectURL(imageToDelete.url);
        }

        const newImages = images.filter((_, index) => index !== indexToDelete);
        setImages(newImages);
        form.setValue("profileImages", newImages.map(img => img.url), { shouldValidate: true });
    };

    async function onSubmit(data: EditProfileFormValues) {
        setIsSubmitting(true);
        console.log("DEBUG - currentUser:", currentUser);
        console.log("DEBUG - firestore:", firestore);
        console.log("DEBUG - storage:", storage);
        if (!currentUser || !firestore || !storage) {
            console.log("DEBUG - Missing:", { currentUser: !currentUser, firestore: !firestore, storage: !storage });
            toast({ title: "Not Authenticated", description: "You must be logged in to update your profile.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        try {
            // Password Update Logic
            if (data.newPassword) {
                try {
                    await updatePassword(currentUser, data.newPassword);
                    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
                } catch (error) {
                    if (error instanceof FirebaseError && error.code === 'auth/requires-recent-login') {
                        toast({
                            title: "Action Required",
                            description: "Changing your password is a sensitive action. Please log out and log back in to proceed.",
                            variant: "destructive",
                            duration: 10000,
                        });
                    } else {
                        throw error; // Re-throw other password errors
                    }
                    setIsSubmitting(false);
                    return;
                }
            }


            const deletePromises = imagesToDelete.map(url => {
                const imageRef = ref(storage, url);
                return deleteObject(imageRef).catch(err => console.warn("Failed to delete image, it might not exist:", err));
            });
            await Promise.all(deletePromises);

            const newImagesToUpload = images.filter(img => !!img.file);
            const existingImageUrls = images.filter(img => !img.file).map(img => img.url);

            const uploadPromises = newImagesToUpload.map(async ({ file }) => {
                if (!file) return "";
                const storageRef = ref(storage, `users/${currentUser.uid}/images/${Date.now()}-${file.name}`);
                await uploadBytes(storageRef, file);
                return getDownloadURL(storageRef);
            });
            const newUploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean);

            const allFinalImageUrls = [...existingImageUrls, ...newUploadedUrls];
            if (allFinalImageUrls.length === 0) {
                toast({ title: "No Photos", description: "You must have at least one profile photo.", variant: "destructive" });
                setIsSubmitting(false);
                return;
            }

            const userDocRef = doc(firestore, "users", currentUser.uid);

            const updatedProfileData = {
                bio: data.bio,
                interests: data.interests || [],
                favoriteBook: data.favoriteBook,
                mainImage: allFinalImageUrls[0],
                profileImages: allFinalImageUrls,
                personas: data.personas,
                lookingFor: data.lookingFor,
                purpose: data.purpose,
                updatedAt: new Date(),
            };

            await updateDoc(userDocRef, updatedProfileData);

            toast({ title: "Profile Updated!", description: "Your changes have been saved successfully." });
            router.push('/profile/me');
            router.refresh();
        } catch (error: any) {
            console.error("Profile update error:", error);
            toast({ title: "Update Failed", description: "There was a problem updating your profile. Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="shadow-lg font-sans rounded-xl">
                    <CardHeader>
                        <CardTitle>Core Preferences</CardTitle>
                        <CardDescription>Update your identity, who you're looking for, and your intentions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <FormField
                            control={form.control}
                            name="personas"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-primary text-base">Who I am</FormLabel>
                                        <FormDescription>Select all that apply to you.</FormDescription>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {personaOptions.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="personas"
                                                render={({ field }) => (
                                                    <FormItem
                                                        key={item.id}
                                                        className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:text-accent-foreground has-[:checked]:bg-accent has-[:checked]:text-accent-foreground"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), item.id])
                                                                        : field.onChange(field.value?.filter((value) => value !== item.id));
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                                                            <item.icon className="h-5 w-5" />
                                                            {item.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lookingFor"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-primary text-base">Who I'm looking for</FormLabel>
                                        <FormDescription>Select who you'd like to connect with.</FormDescription>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {personaOptions.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="lookingFor"
                                                render={({ field }) => (
                                                    <FormItem
                                                        key={item.id}
                                                        className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:text-accent-foreground has-[:checked]:bg-accent has-[:checked]:text-accent-foreground"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), item.id])
                                                                        : field.onChange(field.value?.filter((value) => value !== item.id));
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                                                            <item.icon className="h-5 w-5" />
                                                            {item.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-primary text-base">I'm hoping to find</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                                        >
                                            {purposeOptions.map(option => (
                                                <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value={option.value} />
                                                    </FormControl>
                                                    <FormLabel className="font-normal flex items-center gap-2">
                                                        <option.icon className="h-5 w-5" />
                                                        {option.label}
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-lg font-sans rounded-xl">
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>Update your photos and other profile details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <FormField control={form.control} name="bio" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary">About Me</FormLabel>
                                <FormControl><Textarea placeholder="Tell us a little bit about yourself" {...field} className="min-h-[120px]" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField
                            control={form.control}
                            name="interests"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-primary">Interests &amp; Hobbies</FormLabel>
                                    <FormDescription>Select a few things you're into.</FormDescription>
                                    <FormControl>
                                        <div className="flex flex-wrap gap-2">
                                            {interestOptions.map((interest) => (
                                                <Badge
                                                    key={interest}
                                                    variant={field.value?.includes(interest) ? "default" : "secondary"}
                                                    className={cn("cursor-pointer", {
                                                        "border-primary": field.value?.includes(interest)
                                                    })}
                                                    onClick={() => {
                                                        const currentInterests = field.value || [];
                                                        const newInterests = currentInterests.includes(interest)
                                                            ? currentInterests.filter(i => i !== interest)
                                                            : [...currentInterests, interest];
                                                        field.onChange(newInterests);
                                                    }}
                                                >
                                                    {interest}
                                                </Badge>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField control={form.control} name="favoriteBook" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary">Favorite Book</FormLabel>
                                <FormControl><Input placeholder="e.g. The Lord of the Rings" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <Separator />

                        <FormField control={form.control} name="profileImages" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-primary">Your Photos</FormLabel>
                                <FormDescription>Update your photos here. You can have up to 5, and the first is your main one.</FormDescription>
                                <FormControl>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {images.map(({ url }, index) => (
                                            <div key={url} className="relative aspect-square group">
                                                <Image src={url} alt={`Profile photo preview ${index + 1}`} fill className="object-cover rounded-md" />
                                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleImageDelete(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {images.length < 5 && (
                                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-md cursor-pointer hover:bg-muted/50">
                                                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground mt-2">Upload Photo</span>
                                                <input type="file" multiple accept="image/png, image/jpeg, image/webp" className="sr-only" onChange={handleImageUpload} disabled={isSubmitting} />
                                            </label>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card className="shadow-lg font-sans rounded-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><KeyRound /> Account Security</CardTitle>
                        <CardDescription>Update your password here. Leave blank to keep your current password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="newPassword" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-primary">New Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="Enter new password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="confirmNewPassword" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-primary">Confirm New Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="Confirm new password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save All Changes
                </Button>
            </form>
        </Form>
    );
}
