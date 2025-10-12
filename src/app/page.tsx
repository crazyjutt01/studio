'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FinSafeLogo } from '@/components/icons';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = () => {
    initiateAnonymousSignIn(auth);
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
