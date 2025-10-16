'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createChallenges, type CreateChallengesOutput } from '@/ai/flows/challenge-creator';
import { getChallengeTip } from '@/ai/flows/get-challenge-tip';
import { Loader2, Dices, Award, HelpCircle, Check, Sparkles, X } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, doc, where, getDocs, Timestamp } from 'firebase/firestore';
import type { UserData, SavingsGoal, Challenge } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { add, endOfDay, endOfWeek, endOfMonth, isBefore } from 'date-fns';
import { useGamification } from '@/hooks/use-gamification';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';

export function ChallengesCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const { awardXP } = useGamification();
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  const [tipContent, setTipContent] = useState({ title: '', tip: '' });
  const [isTipLoading, setIsTipLoading] = useState(false);


  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  
  const savingsGoalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/savingGoals`));
  }, [user, firestore]);

  const challengesQuery = useMemoFirebase(() => {
    if(!user || !firestore) return null;
    const now = Timestamp.now();
    return query(
        collection(firestore, `users/${user.uid}/challenges`),
        where('expiresAt', '>', now)
    );
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: savingsGoalsData } = useCollection<SavingsGoal>(savingsGoalsQuery);
  const { data: existingChallenges, isLoading: areChallengesLoading } = useCollection<Challenge>(challengesQuery);

  const fetchAndSetChallenges = async () => {
    if (!user || !userData) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const neededTypes: ('daily' | 'weekly' | 'monthly')[] = ['daily', 'weekly', 'monthly'];
    const activeChallenges: Challenge[] = existingChallenges || [];
    
    const hasDaily = activeChallenges.some(c => c.type === 'daily');
    const hasWeekly = activeChallenges.some(c => c.type === 'weekly');
    const hasMonthly = activeChallenges.some(c => c.type === 'monthly');

    if (hasDaily && hasWeekly && hasMonthly) {
      setChallenges(activeChallenges);
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await createChallenges({
        userId: user.uid,
        level: userData.level || 1,
        savingGoals: JSON.stringify(savingsGoalsData),
        region: userData.region || 'US',
        currency: userData.currency || 'USD',
      });
      
      const challengesCol = collection(firestore, `users/${user.uid}/challenges`);
      const now = new Date();
      const newChallenges: Challenge[] = [];

      if (result.daily && !hasDaily) {
        const dailyChallenge: Omit<Challenge, 'id'> = { ...result.daily, type: 'daily', isCompleted: false, expiresAt: Timestamp.fromDate(endOfDay(now)) };
        addDocumentNonBlocking(challengesCol, dailyChallenge);
        newChallenges.push(dailyChallenge as Challenge);
      }
      if (result.weekly && !hasWeekly) {
        const weeklyChallenge: Omit<Challenge, 'id'> = { ...result.weekly, type: 'weekly', isCompleted: false, expiresAt: Timestamp.fromDate(endOfWeek(now)) };
        addDocumentNonBlocking(challengesCol, weeklyChallenge);
        newChallenges.push(weeklyChallenge as Challenge);
      }
      if (result.monthly && !hasMonthly) {
        const monthlyChallenge: Omit<Challenge, 'id'> = { ...result.monthly, type: 'monthly', isCompleted: false, expiresAt: Timestamp.fromDate(endOfMonth(now)) };
        addDocumentNonBlocking(challengesCol, monthlyChallenge);
        newChallenges.push(monthlyChallenge as Challenge);
      }
      
      // We can't know the ID from non-blocking add, so we'll rely on the next fetch
      setChallenges([...activeChallenges, ...newChallenges]);

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
    if(!areChallengesLoading && userData) {
        fetchAndSetChallenges();
    }
  }, [areChallengesLoading, userData, savingsGoalsData]);

  const handleCompleteChallenge = (challenge: Challenge) => {
    if (!user || !firestore || !challenge.id) return;
    const challengeRef = doc(firestore, `users/${user.uid}/challenges/${challenge.id}`);
    updateDocumentNonBlocking(challengeRef, { isCompleted: true });
    
    awardXP('add_goal'); // Using add_goal XP for now
    
    setChallenges(prev => prev.map(c => c.id === challenge.id ? {...c, isCompleted: true} : c));
  };
  
  const handleShowTip = async (challenge: Challenge) => {
    setTipContent({ title: challenge.title, tip: challenge.tip });
    setIsTipDialogOpen(true);
  };
  
  const sortedChallenges = challenges.sort((a,b) => {
      const order = { daily: 1, weekly: 2, monthly: 3 };
      return order[a.type] - order[b.type];
  });

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Award className="text-primary" />
            Your Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges to earn XP and coins. New challenges generate automatically.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="min-h-[250px] space-y-4">
        {(isLoading || areChallengesLoading) && (
            <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        )}
        {!isLoading && !areChallengesLoading && sortedChallenges.length === 0 && (
          <div className="text-center text-muted-foreground pt-12">
            <p>No active challenges right now. Come back later for new ones!</p>
            {(!savingsGoalsData || savingsGoalsData.length === 0) && (
                <p className="text-sm mt-2">Add a savings goal to unlock weekly and monthly challenges!</p>
            )}
          </div>
        )}
        {!isLoading && !areChallengesLoading && (
          <div className="space-y-4">
            {sortedChallenges.map((challenge) => (
              <div key={challenge.id} className="p-4 bg-secondary/50 rounded-lg flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs uppercase text-muted-foreground font-semibold">{challenge.type}</p>
                    <p className="font-semibold text-base">{challenge.title}</p>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs font-medium">
                        <span className="text-primary">+{challenge.xp} XP</span>
                        <span className="text-yellow-500">+{challenge.coins} Coins</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleShowTip(challenge)}>
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Help
                    </Button>
                    <Button 
                        size="sm" 
                        disabled={challenge.isCompleted} 
                        onClick={() => handleCompleteChallenge(challenge)}
                        className={challenge.isCompleted ? 'bg-green-600' : ''}
                    >
                       {challenge.isCompleted ? <Check className="w-4 h-4" /> : 'Complete' }
                    </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={isTipDialogOpen} onOpenChange={setIsTipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Challenge Tip
            </DialogTitle>
            <DialogDescription>
             Here's a helpful tip for completing the "{tipContent.title}" challenge.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isTipLoading ? (
                <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin"/>
                </div>
            ) : (
                <p className="text-muted-foreground italic">"{tipContent.tip}"</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTipDialogOpen(false)}>Got it!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
