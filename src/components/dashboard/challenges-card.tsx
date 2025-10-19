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

export function ChallengesCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { awardXP } = useGamification();
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  const [tipContent, setTipContent] = useState({ title: '', tip: '' });
  
  const challengesQuery = useMemoFirebase(() => {
    if(!user || !firestore) return null;
    const now = Timestamp.now();
    return query(
        collection(firestore, `users/${user.uid}/challenges`),
        where('expiresAt', '>', now)
    );
  }, [user, firestore]);

  const { data: allChallenges, isLoading: areChallengesLoading } = useCollection<Challenge>(challengesQuery);

  const handleClaimReward = (challenge: Challenge) => {
    if (!user || !firestore || !challenge.id) return;
    const challengeRef = doc(firestore, `users/${user.uid}/challenges`, challenge.id);
    updateDocumentNonBlocking(challengeRef, { status: 'completed', isCompleted: true });
    
    // Use the specific XP and Coin values from the challenge itself
    awardXP('claim_challenge', challenge.xp, challenge.coins);
  };
  
  const handleShowTip = (challenge: Challenge) => {
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
        {areChallengesLoading && (
            <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        )}
        {!areChallengesLoading && sortedChallenges.length === 0 && (
          <div className="text-center text-muted-foreground pt-12">
            <p>No active challenges right now. Come back tomorrow for new ones!</p>
          </div>
        )}
        {!areChallengesLoading && (
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
            <p className="text-muted-foreground italic">"{tipContent.tip}"</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTipDialogOpen(false)}>Got it!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
