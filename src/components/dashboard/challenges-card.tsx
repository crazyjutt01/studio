'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createChallenges, type CreateChallengesOutput } from '@/ai/flows/challenge-creator';
import { Loader2, Dices, Award } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { UserData, SavingsGoal } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';

export function ChallengesCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [challenges, setChallenges] = useState<CreateChallengesOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  
  const savingsGoalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/savingGoals`));
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: savingsGoalsData } = useCollection<SavingsGoal>(savingsGoalsQuery);

  const handleGetChallenges = async () => {
    if (!user || !userData) {
      toast({
        variant: 'destructive',
        title: 'Not enough data',
        description: 'Cannot generate challenges without user data.',
      });
      return;
    }
    setIsLoading(true);
    setChallenges(null);
    try {
      const result = await createChallenges({
        userId: user.uid,
        level: userData.level || 1,
        savingGoals: JSON.stringify(savingsGoalsData),
        region: userData.region || 'US',
        currency: userData.currency || 'USD',
      });
      setChallenges(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Generating Challenges',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetChallenges();
  }, [user, userData, savingsGoalsData]);

  const ChallengeDisplay = ({ title, description, xp, coins }: { title: string, description: string, xp: number, coins: number }) => (
    <div className="p-3 bg-secondary/50 rounded-lg">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex items-center gap-4 mt-2 text-xs font-medium">
        <span className="text-primary">+{xp} XP</span>
        <span className="text-yellow-500">+{coins} Coins</span>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Award className="text-primary" />
            Your Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges to earn XP and coins.
          </CardDescription>
        </div>
        <Button onClick={handleGetChallenges} size="sm" variant="outline" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Dices className="mr-2 h-4 w-4" />}
          New Challenges
        </Button>
      </CardHeader>
      <CardContent className="min-h-[150px] space-y-4">
        {isLoading && (
            <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        )}
        {!isLoading && challenges && (
          <div className="space-y-3">
            <ChallengeDisplay {...challenges.daily} />
            <ChallengeDisplay {...challenges.weekly} />
            <ChallengeDisplay {...challenges.monthly} />
          </div>
        )}
        {!isLoading && !challenges && (
          <div className="text-center text-muted-foreground pt-8">
            <p>Click "New Challenges" to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
