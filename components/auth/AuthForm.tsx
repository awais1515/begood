
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from 'next/navigation'
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth"
import { useAuth, useFirestore } from "@/firebase/provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { FirebaseError } from "firebase/app"
import { doc, getDoc } from "firebase/firestore"

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
})

type AuthFormValues = z.infer<typeof authSchema>

export function AuthForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isResetSent, setIsResetSent] = useState(false)
  const { auth } = useAuth();
  const firestore = useFirestore();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  })

  const handleError = (error: any, action: string) => {
    setLoading(false);
    console.error(`Error during ${action}:`, error);

    let title = `Error during ${action}`;
    let description = "An unexpected error occurred. Please try again.";

    if (error instanceof FirebaseError) {
        switch (error.code) {
            case 'auth/user-not-found':
                title = 'Login Failed';
                description = 'No account found with this email. Please sign up instead.';
                break;
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                title = 'Login Failed';
                description = 'Incorrect password. Please try again or reset your password.';
                break;
            case 'auth/invalid-email':
                title = 'Invalid Email';
                description = 'The email address you entered is not valid.';
                break;
            case 'auth/email-already-in-use':
                title = 'Sign Up Failed';
                description = 'An account with this email already exists. Please log in.';
                break;
            case 'auth/weak-password':
                title = 'Sign Up Failed';
                description = 'Your password is too weak. Please use at least 6 characters.';
                break;
             case 'auth/email-not-verified':
                router.push('/verify-email');
                return;
            default:
                description = error.message;
        }
    }
    toast({ variant: "destructive", title, description });
  };

  const onSignIn = async (data: AuthFormValues) => {
    if (!auth || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "Firebase not initialized. Please wait a moment and try again." });
      return;
    }

    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      await user.reload();

      if (!user.emailVerified) {
          router.push('/verify-email');
          return;
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
          router.push('/signup');
          return;
      }
      
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/matches');

    } catch (error) {
      handleError(error, "sign in");
    } finally {
      setLoading(false)
    }
  }

  const onPasswordReset = async () => {
    if (!auth) {
      toast({ variant: "destructive", title: "Error", description: "Firebase not initialized. Please wait a moment and try again." });
      return;
    }
    await form.trigger("email");
    const email = form.getValues("email");
    const emailState = form.getFieldState("email");

    if (!email || emailState.invalid) {
      toast({ variant: "destructive", title: "Invalid Email", description: "Please enter a valid email to reset your password." });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsResetSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
    } catch (error) {
      handleError(error, "password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSignIn)} className="space-y-6 pt-6">
        <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-primary">Email</FormLabel>
                    <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <div className="pt-4">
          <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                  <FormItem>
                      <div className="flex items-center justify-between">
                          <FormLabel className="text-primary">Password</FormLabel>
                          <Button
                              variant="link"
                              type="button"
                              onClick={onPasswordReset}
                              disabled={loading || isResetSent}
                              className="p-0 h-auto text-sm font-normal text-primary/80 hover:text-primary disabled:text-green-600 disabled:no-underline disabled:cursor-default disabled:opacity-100"
                          >
                              {isResetSent ? "Reset link sent!" : "Forgot password?"}
                          </Button>
                      </div>
                      <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />
        </div>
          <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In
          </Button>
      </form>
    </Form>
  )
}
