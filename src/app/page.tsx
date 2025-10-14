'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FinSafeLogo } from '@/components/icons';
import { useAuth, useUser, initiateAnonymousSignIn, useFirestore, seedDatabase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const setupUser = async () => {
      if (user && firestore) {
        // Check if the user document exists.
        const userDocRef = doc(firestore, `users/${user.uid}`);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // If the document doesn't exist, it's a new user. Seed the database.
          setIsSeeding(true);
          try {
            await seedDatabase(firestore, user.uid);
          } catch (error) {
            console.error("Failed to seed database:", error);
            // Handle seeding failure if necessary, e.g., show an error to the user
          } finally {
            setIsSeeding(false);
          }
        }
        // Whether the user is new or returning, if the data is there (or has been seeded), we can redirect.
        router.push('/dashboard');
      }
    };

    if (!isUserLoading) {
      setupUser();
    }
  }, [user, isUserLoading, firestore, router]);

  const handleLogin = () => {
    if (auth) {
        initiateAnonymousSignIn(auth);
    }
  };

  if (isUserLoading || isSeeding || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        {isSeeding && <p className="mt-4 text-muted-foreground">Setting up your account...</p>}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <FinSafeLogo className="h-24 w-24 text-primary" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Welcome to FinSafe
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Your personal AI-powered finance assistant. Gain insights, track spending, and achieve your financial goals.
          </p>
        </div>
        <Button onClick={handleLogin} size="lg" className="px-8 py-6 text-lg">
          Get Started
        </Button>
      </div>
    </div>
  );
}
