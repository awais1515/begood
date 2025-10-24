
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Suspense, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BirthDateSelector } from "@/components/ui/birth-date-selector";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "@/lib/firebase";
import { sendEmailVerification, createUserWithEmailAndPassword } from "firebase/auth";
import Image from 'next/image';
import Link from "next/link";
import { UploadCloud, Trash2, Loader2, Users, Heart, HelpCircle, BookOpen, ArrowLeft } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { FirebaseError } from 'firebase/app';


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

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other"
];

const formSchema = z.object({
  // Step 1
  personas: z.array(z.string()).min(1, "Please select at least one persona."),
  // Step 2
  lookingFor: z.array(z.string()).min(1, "Please select who you're looking for."),
  // Step 3
  purpose: z.string({ required_error: "Please select your intention." }),
  // Step 4
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  birthDate: z.date({ required_error: "Your birth date is required." }),
  gender: z.string({ required_error: "Please select your gender." }),
  country: z.string({ required_error: "Please select your country." }),
  bio: z.string().max(300, { message: "Bio cannot exceed 300 characters." }).optional(),
  interests: z.array(z.string()).max(10, { message: "You can select a maximum of 10 interests." }).optional(),
  favoriteBook: z.string().optional(),
  profileImages: z.array(z.any()).min(1, "Please upload at least one photo.").max(5, "You can upload a maximum of 5 photos."),
  legalConfirmation: z
  .boolean()
  .refine(val => val === true, {
    message: "You must confirm you are over 18 and accept the terms.",
  }),

  dataAccuracyConfirmation: z 
  .boolean()
  .refine(val => val === true, {
    message: "You must confirm that your provided data is accurate and truthful.",
  }),

}).refine((data) => {
    if (!data.birthDate) return true; // Let the required check handle this
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return data.birthDate <= eighteenYearsAgo;
}, {
    message: "You must be at least 18 years old to register.",
    path: ["birthDate"],
});

type FormValues = z.infer<typeof formSchema>;

const stepFields: (keyof FormValues)[][] = [
    ["personas"],
    ["lookingFor"],
    ["purpose"],
    ["email", "password", "username", "fullName", "birthDate", "gender", "country", "bio", "interests", "favoriteBook", "profileImages", "legalConfirmation", "dataAccuracyConfirmation"],
];

const stepTitles = [
    "Who are you?",
    "Who are you looking for?",
    "What are you hoping to find?",
    "Complete Your Profile"
];

const stepDescriptions = [
    "This helps us understand your vibe. Select all that apply.",
    "Let us know who you'd like to connect with.",
    "What is your main goal for using BeGood?",
    "The final details! This information will be on your public profile."
];


function SignUpForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [images, setImages] = useState<{ file: File; url: string }[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            personas: [],
            lookingFor: [],
            purpose: undefined,
            email: '',
            password: '',
            username: '',
            fullName: '',
            gender: undefined,
            country: undefined,
            bio: '',
            interests: [],
            favoriteBook: '',
            profileImages: [],
            legalConfirmation: false,
            dataAccuracyConfirmation: false,
        },
        mode: "onBlur",
    });

    const handleNextStep = async () => {
        const fieldsToValidate = stepFields[step - 1];
        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            setStep(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        setStep(prev => prev - 1);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        if (images.length + newFiles.length > 5) {
            toast({ title: "Too many images", description: "You can upload a maximum of 5 photos.", variant: "destructive"});
            return;
        }

        const newImages = newFiles.map(file => ({
            file: file,
            url: URL.createObjectURL(file)
        }));
        
        const allImages = [...images, ...newImages];
        setImages(allImages);
        form.setValue("profileImages", allImages, { shouldValidate: true });
    };

    const handleImageDelete = (indexToDelete: number) => {
        const imageToDelete = images[indexToDelete];
        if (imageToDelete) {
            URL.revokeObjectURL(imageToDelete.url);
        }
        const newImages = images.filter((_, index) => index !== indexToDelete);
        setImages(newImages);
        form.setValue("profileImages", newImages, { shouldValidate: true });
    };

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);
    
        const processRegistration = async (location: { latitude: number; longitude: number } | null) => {
            try {
                // 1. Create user in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                const user = userCredential.user;
    
                // 2. Upload images to storage
                const uploadPromises = images.map(async ({ file }) => {
                    const storageRef = ref(storage, `users/${user.uid}/images/${Date.now()}-${file.name}`);
                    await uploadBytes(storageRef, file);
                    return getDownloadURL(storageRef);
                });
                const uploadedImageUrls = await Promise.all(uploadPromises);
    
                // 3. Create user document in Firestore
                const userDocRef = doc(db, "users", user.uid);
                const birthYear = data.birthDate.getFullYear();
    
                const profileData = {
                    username: data.username,
                    fullName: data.fullName,
                    birthYear,
                    gender: data.gender,
                    country: data.country,
                    bio: data.bio || '',
                    interests: data.interests || [],
                    favoriteBook: data.favoriteBook || '',
                    mainImage: uploadedImageUrls[0],
                    profileImages: uploadedImageUrls,
                    dataAiHints: [],
                    personas: data.personas,
                    lookingFor: data.lookingFor,
                    purpose: data.purpose,
                    updatedAt: new Date(),
                    latitude: location?.latitude || null,
                    longitude: location?.longitude || null,
                    isSuspended: false,
                };
    
                await setDoc(userDocRef, profileData);
    
                // 4. Create their interactions doc
                const interactionsDocRef = doc(db, "userInteractions", user.uid);
                await setDoc(interactionsDocRef, { liked: [], disliked: [], blocked: [] });
    
                // 5. Send verification email
                await sendEmailVerification(user);
    
                toast({
                    title: "Profile Created!",
                    description: "We've sent a verification link to your email."
                });
    
                router.push('/verify-email');
    
            } catch (error: any) {
                console.error("Profile submission error:", error);
                let title = "Submission Error";
                let description = error.message || "There was a problem creating your profile.";
    
                if (error instanceof FirebaseError) {
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            title = "Email in Use";
                            description = "This email is already registered. Please try logging in.";
                            setStep(4); // Go back to the form step with the email field
                            break;
                        case 'auth/weak-password':
                            title = 'Sign Up Failed';
                            description = 'Your password is too weak. Please use at least 6 characters.';
                            setStep(4);
                            break;
                    }
                }
    
                toast({ title, description, variant: "destructive" });
            } finally {
                setIsSubmitting(false);
            }
        };
    
        // Get location and then process registration
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    processRegistration({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                () => {
                    // Geolocation failed or was denied
                    console.warn("Geolocation permission denied or failed. Proceeding without location.");
                    processRegistration(null);
                },
                { timeout: 10000, enableHighAccuracy: false }
            );
        } else {
            // Geolocation is not supported
            console.warn("Geolocation is not supported by this browser. Proceeding without location.");
            processRegistration(null);
        }
    }

    const totalSteps = stepFields.length;

    return (
        <main className="container mx-auto max-w-2xl py-8 font-sans">
            <div className="text-center mb-6">
                 <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary">
                    {stepTitles[step - 1]}
                </h1>
                <p className="text-muted-foreground mt-3 font-sans text-lg">
                    {stepDescriptions[step - 1]}
                </p>
            </div>
            <div className="mb-8 px-4">
                <Progress value={(step / totalSteps) * 100} className="w-full" />
                <p className="text-center text-sm text-muted-foreground mt-2">Step {step} of {totalSteps}</p>
            </div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    <div className="animate-in fade-in-50 duration-500">
                        {step === 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Who I am</CardTitle>
                                    <CardDescription>Select all that apply to you.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="personas"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex flex-col gap-4">
                                                    {personaOptions.map((item) => (
                                                        <FormItem key={item.id} className="flex items-center space-x-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    id={`persona-${item.id}`}
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const currentValue = field.value || [];
                                                                        return checked
                                                                            ? field.onChange([...currentValue, item.id])
                                                                            : field.onChange(currentValue.filter((value) => value !== item.id));
                                                                    }}
                                                                    className="sr-only"
                                                                />
                                                            </FormControl>
                                                            <Label
                                                                htmlFor={`persona-${item.id}`}
                                                                className={`flex flex-row items-center justify-center gap-4 rounded-md border p-6 text-lg font-medium cursor-pointer transition-colors w-full
                                                                hover:bg-accent hover:text-accent-foreground
                                                                ${field.value?.includes(item.id) && "bg-primary text-primary-foreground hover:bg-primary/90"}`
                                                                }
                                                            >
                                                                <item.icon className="h-8 w-8" />
                                                                {item.label}
                                                            </Label>
                                                        </FormItem>
                                                    ))}
                                                </div>
                                                <FormMessage className="pt-2" />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {step === 2 && (
                             <Card>
                                <CardHeader>
                                    <CardTitle>Who I'm looking for</CardTitle>
                                    <CardDescription>Select who you'd like to connect with.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="lookingFor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex flex-col gap-4">
                                                    {personaOptions.map((item) => (
                                                        <FormItem key={item.id} className="flex items-center space-x-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    id={`lookingFor-${item.id}`}
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const currentValue = field.value || [];
                                                                        return checked
                                                                            ? field.onChange([...currentValue, item.id])
                                                                            : field.onChange(currentValue.filter((value) => value !== item.id));
                                                                    }}
                                                                    className="sr-only"
                                                                />
                                                            </FormControl>
                                                            <Label
                                                                htmlFor={`lookingFor-${item.id}`}
                                                                className={`flex flex-row items-center justify-center gap-4 rounded-md border p-6 text-lg font-medium cursor-pointer transition-colors w-full
                                                                hover:bg-accent hover:text-accent-foreground
                                                                ${field.value?.includes(item.id) && "bg-primary text-primary-foreground hover:bg-primary/90"}`
                                                                }
                                                            >
                                                                <item.icon className="h-8 w-8" />
                                                                {item.label}
                                                            </Label>
                                                        </FormItem>
                                                    ))}
                                                </div>
                                                <FormMessage className="pt-2" />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>I'm hoping to find</CardTitle>
                                    <CardDescription>What's your main reason for joining?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="purpose"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col gap-4"
                                                    >
                                                        {purposeOptions.map((option) => (
                                                            <FormItem key={option.value}>
                                                                <FormControl>
                                                                     <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                                                                </FormControl>
                                                                <Label
                                                                    htmlFor={option.value}
                                                                    className={`flex items-center justify-center gap-4 rounded-md border p-6 text-lg font-medium cursor-pointer transition-colors w-full
                                                                    hover:bg-accent hover:text-accent-foreground
                                                                    ${field.value === option.value && "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                                                                >
                                                                    <option.icon className="h-8 w-8" />
                                                                    {option.label}
                                                                </Label>
                                                            </FormItem>
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage className="pt-2" />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {step === 4 && (
                            <div className="space-y-10">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Credentials</CardTitle>
                                        <CardDescription>First, let's set up your login details.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary">Email</FormLabel>
                                                <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary">Password</FormLabel>
                                                <FormControl><Input type="password" placeholder="Choose a strong password" {...field} /></FormControl>
                                                <FormDescription>Must be at least 6 characters long.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>


                                <Card>
                                    <CardHeader>
                                        <CardTitle>The Basics</CardTitle>
                                        <CardDescription>This information will be visible on your profile.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField control={form.control} name="username" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary">Username</FormLabel>
                                                <FormControl><Input placeholder="A unique username" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="fullName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary">Full Name</FormLabel>
                                                <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                                                <FormDescription>This will not be shown on your public profile.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="birthDate" render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-primary">Birth Date</FormLabel>
                                                <BirthDateSelector
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>

                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Your Profile Details</CardTitle>
                                        <CardDescription>This information will help others get to know you better.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField control={form.control} name="gender" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary">Gender</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="non-binary">Non-binary</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="country" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary">Country</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="bio" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary">About Me (Optional)</FormLabel>
                                                <FormControl><Textarea placeholder="Tell us a little bit about yourself" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="profileImages" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary">Your Photos</FormLabel>
                                                <FormDescription>Upload at least 1 and up to 5 photos. The first one will be your main photo.</FormDescription>
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

                                        <FormField
                                            control={form.control}
                                            name="interests"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-primary">Interests & Hobbies (Optional)</FormLabel>
                                                    <FormDescription>Select up to 10 things you're into.</FormDescription>
                                                    <FormControl>
                                                        <div className="flex flex-wrap gap-2">
                                                            {interestOptions.map((interest) => (
                                                                <Button
                                                                    key={interest}
                                                                    type="button"
                                                                    variant={field.value?.includes(interest) ? "default" : "secondary"}
                                                                    onClick={() => {
                                                                        const currentInterests = field.value || [];
                                                                        if (currentInterests.includes(interest)) {
                                                                            field.onChange(currentInterests.filter(i => i !== interest));
                                                                        } else if (currentInterests.length < 10) {
                                                                            field.onChange([...currentInterests, interest]);
                                                                        } else {
                                                                            toast({ title: "Limit reached", description: "You can select a maximum of 10 interests.", variant: "destructive" });
                                                                        }
                                                                    }}
                                                                >
                                                                    {interest}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField control={form.control} name="favoriteBook" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary">Favorite Book (Optional)</FormLabel>
                                                <FormControl><Input placeholder="e.g. The Lord of the Rings" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Final Confirmation</CardTitle>
                                        <CardDescription>Please confirm the following to complete your registration.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                         <FormField
                                            control={form.control}
                                            name="legalConfirmation"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                                <FormControl>
                                                    <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                    I confirm I am 18 or older and agree to the{' '}
                                                    <Link href="/terms" target="_blank" className="text-primary hover:underline">
                                                        Terms of Use
                                                    </Link>{' '}
                                                    and{' '}
                                                    <Link href="/privacy" target="_blank" className="text-primary hover:underline">
                                                        Privacy Policy
                                                    </Link>
                                                    .
                                                    </FormLabel>
                                                    <FormMessage />
                                                </div>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="dataAccuracyConfirmation"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                                <FormControl>
                                                    <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                    I confirm that the information provided is accurate and truthful.
                                                    </FormLabel>
                                                    <FormMessage />
                                                </div>
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                    

                    <div className="flex flex-col-reverse sm:flex-row gap-4">
                        {step > 1 && (
                            <Button type="button" variant="outline" onClick={handlePrevStep} className="w-full" size="lg">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                        )}
                        {step < totalSteps ? (
                            <Button type="button" onClick={handleNextStep} className="w-full" size="lg">Continue</Button>
                        ) : (
                            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Complete Profile & Create Account
                            </Button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </main>
    );
}


export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <SignUpForm />
        </Suspense>
    )
}

    