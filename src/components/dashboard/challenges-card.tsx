'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Award, HelpCircle, Check, Sparkles } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, doc, where, getDocs, Timestamp, writeBatch } from 'firebase/firestore';
import type { UserData, Challenge, Transaction, Budget } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { endOfDay, startOfDay, isAfter } from 'date-fns';
import { useGamification } from '@/hooks/use-gamification';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { usePathname } from 'next/navigation';

const defaultDailyChallenges: Omit<Challenge, 'id' | 'userId' | 'expiresAt' | 'isCompleted' | 'type' | 'status' | 'actionType' | 'actionValue'>[] = [
    {
        title: 'Log a Transaction',
        description: 'Manually add one transaction or upload a receipt via SpendSpy.',
        xp: 15,
        coins: 15,
        tip: 'Use SpendSpy for a quick way to track expenses. Just upload a receipt!',
    },
    {
        title: 'Review Your Budget',
        description: 'Visit the BudgetBot page to check on your spending limits.',
        xp: 10,
        coins: 10,
        tip: 'Knowing your budget is the first step to staying on track!',
    },
    {
        title: 'Check Your Goals',
        description: 'Visit the GoalGuru page to review your savings progress.',
        xp: 10,
        coins: 10,
        tip: 'Keeping your goals in mind helps you stay motivated.',
    },
    {
        title: 'Ask for Advice',
        description: 'Ask AdvisorAI a question about your finances.',
        xp: 20,
        coins: 20,
        tip: 'Try asking "How much did I spend this week?" for an instant summary.',
    },
    {
        title: 'No-Spend Challenge',
        description: 'Try not to spend any money on non-essential items today.',
        xp: 50,
        coins: 50,
        tip: 'Unsubscribe from marketing emails to reduce temptation!',
    },
];

export function ChallengesCard() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const { awardXP } = useGamification();
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  const [tipContent, setTipContent] = useState({ title: '', tip: '' });
  const [isTipLoading, setIsTipLoading] = useState(false);
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  
  const challengesQuery = useMemoFirebase(() => {
    if(!user || !firestore) return null;
    const now = Timestamp.now();
    return query(
        collection(firestore, `users/${user.uid}/challenges`),
        where('expiresAt', '>', now)
    );
  }, [user, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if(!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);
  const { data: allChallenges, isLoading: areChallengesLoading } = useCollection<Challenge>(challengesQuery);

  const fetchAndSetChallenges = useCallback(async () => {
    if (!user || !userData || !firestore) {
      return;
    }

    setIsLoading(true);
    
    const challengesCol = collection(firestore, `users/${user.uid}/challenges`);
    const today = startOfDay(new Date());

    const dailyChallengesExist = allChallenges?.some(c => c.type === 'daily' && isAfter(c.expiresAt.toDate(), today));

    if (!dailyChallengesExist) {
        const batch = writeBatch(firestore);
        defaultDailyChallenges.forEach(challengeDef => {
            const newChallengeRef = doc(challengesCol);
            const dailyChallenge: Omit<Challenge, 'id'> = {
                ...challengeDef,
                userId: user.uid,
                type: 'daily',
                status: 'active',
                expiresAt: Timestamp.fromDate(endOfDay(today)),
                actionType: 'none',
                isCompleted: false,
                actionValue: 0
            };
            batch.set(newChallengeRef, dailyChallenge);
        });
        await batch.commit();
    }
    
    setIsLoading(false);

  }, [user, firestore, userData, allChallenges]);


  useEffect(() => {
    if(userData && user) {
        fetchAndSetChallenges();
    }
  }, [userData, user, fetchAndSetChallenges]);
  
  const checkChallengeEligibility = useCallback(async () => {
    if (!allChallenges?.length || !user || !firestore) return;

    const batch = writeBatch(firestore);
    let dirty = false;

    for (const challenge of allChallenges) {
        if(challenge.status !== 'active') continue;

        let isEligible = false;
        const todayStart = startOfDay(new Date());

        switch (challenge.title) {
          case 'Log a Transaction':
            if (transactionsData?.some(t => new Date(t.date) >= todayStart)) {
              isEligible = true;
            }
            break;
          case 'Review Your Budget':
            if (pathname.includes('/budget-bot')) {
              isEligible = true;
            }
            break;
          case 'Check Your Goals':
            if (pathname.includes('/goal-guru')) {
              isEligible = true;
            }
            break;
          case 'Ask for Advice':
             // This can be triggered by just visiting the page for simplicity
            if (pathname.includes('/advisor-ai')) {
              isEligible = true;
            }
            break;
          case 'No-Spend Challenge':
            // If there are no transactions for non-essential items today
            const nonEssentialSpending = transactionsData?.filter(t => {
                const isToday = new Date(t.date) >= todayStart;
                const isNonEssential = t.category === 'Shopping' || t.category === 'Food' || t.category === 'Travel';
                return isToday && isNonEssential;
            }).length;
            if (nonEssentialSpending === 0) {
                isEligible = true;
            }
            break;
        }

        if(isEligible) {
            const challengeRef = doc(firestore, `users/${user.uid}/challenges`, challenge.id);
            batch.update(challengeRef, { status: 'eligible' });
            dirty = true;
        }
    }

    if(dirty) {
        await batch.commit();
    }
  }, [allChallenges, transactionsData, user, firestore, pathname]);

  useEffect(() => {
    checkChallengeEligibility();
  }, [checkChallengeEligibility]);


  const handleClaimReward = (challenge: Challenge) => {
    if (!user || !firestore || !challenge.id) return;
    const challengeRef = doc(firestore, `users/${user.uid}/challenges`, challenge.id);
    updateDocumentNonBlocking(challengeRef, { status: 'completed', isCompleted: true });
    
    awardXP('add_goal', challenge.xp);
  };
  
  const handleShowTip = async (challenge: Challenge) => {
    setTipContent({ title: challenge.title, tip: challenge.tip });
    setIsTipDialogOpen(true);
  };
  
  const sortedChallenges = useMemo(() => {
    if (!allChallenges) return [];
    return [...allChallenges].sort((a,b) => {
        const order = { daily: 1, weekly: 2, monthly: 3 };
        const typeOrder = order[a.type] - order[b.type];
        if (typeOrder !== 0) return typeOrder;
        
        const statusOrder = { eligible: 1, active: 2, completed: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [allChallenges]);


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
            Complete challenges to earn XP and coins. New challenges appear daily.
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
            <p>No active challenges right now. Come back tomorrow for new ones!</p>
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
                    {challenge.tip && (
                        <Button variant="outline" size="sm" onClick={() => handleShowTip(challenge)}>
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Tip
                        </Button>
                    )}
                    {challenge.status === 'active' && (
                        <Button size="sm" disabled>
                           Pending
                        </Button>
                    )}
                    {challenge.status === 'eligible' && (
                         <Button size="sm" onClick={() => handleClaimReward(challenge)}>
                           Claim Reward
                        </Button>
                    )}
                    {challenge.status === 'completed' && (
                        <Button size="sm" disabled className="bg-green-600">
                           <Check className="w-4 h-4 mr-2" /> Claimed
                        </Button>
                    )}
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
