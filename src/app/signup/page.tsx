'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinSafeLogo } from '@/components/icons';
import { useAuth, useUser, useFirestore, initiateEmailSignUp, initiateGoogleSignIn } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignUpFormValues = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);


  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);


  async function onSubmit(values: SignUpFormValues) {
     if (!auth || !firestore) return;
     setIsSubmitting(true);
     try {
       const userCredential = await initiateEmailSignUp(auth, values.email, values.password);
       
       const userDocRef = doc(firestore, 'users', userCredential.user.uid);
       await setDoc(userDocRef, {
           firstName: values.firstName,
           lastName: values.lastName,
           email: values.email,
           avatarUrl: 'user-avatar-1',
           monthlyIncome: 0,
           savingGoals: 'Get started with FinSafe!',
           assets: 0,
           region: 'US',
           currency: 'USD',
       });

       router.push('/dashboard');
       
     } catch (error: any) {
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already in use. Please log in or use a different email.';
        }
        toast({
            variant: 'destructive',
            title: 'Sign-up Failed',
            description,
        });
     } finally {
        setIsSubmitting(false);
     }
  }

  async function handleGoogleSignIn() {
    if (!auth || !firestore) return;
    setIsGoogleSubmitting(true);
    try {
      const userCredential = await initiateGoogleSignIn(auth);
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        const [firstName, lastName] = (userCredential.user.displayName || 'New User').split(' ');
        await setDoc(userDocRef, {
           firstName: firstName || 'New',
           lastName: lastName || 'User',
           email: userCredential.user.email,
           avatarUrl: 'user-avatar-1',
           monthlyIncome: 0,
           savingGoals: 'Get started with FinSafe!',
           assets: 0,
           region: 'US',
           currency: 'USD',
        });
      }
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: 'Could not sign in with Google. Please try again.',
      });
    } finally {
        setIsGoogleSubmitting(false);
    }
  }
  
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Setting up your account...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <FinSafeLogo className="h-12 w-12 text-primary" />
            </div>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Join FinSafe and take control of your finances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                        <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting || isGoogleSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
           <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                OR CONTINUE WITH
            </span>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting || isGoogleSubmitting}>
             {isGoogleSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 261.8 0 123.8 111.8 12.8 244 12.8c70.3 0 132.3 33.3 175.1 86.8L340 165.2c-20.7-20.7-52.4-33.3-85.9-33.3-71.5 0-129.5 58.8-129.5 131.3 0 72.5 58 131.3 129.5 131.3 76.3 0 120.3-53.9 124.2-82.9H244v-66h243.6c1.3 8.3 1.9 16.5 1.9 24.7z"></path></svg>}
            Sign up with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
