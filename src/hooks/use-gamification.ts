'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { UserData, BadgeInfo, SavingsGoal, Transaction } from '@/lib/data';
import { badges } from '@/lib/data';
import { useToast } from './use-toast';

type LevelUpInfo = {
  newLevel: number;
};

type Action = 'add_transaction' | 'add_budget' | 'add_goal' | 'claim_challenge';

const XP_REWARDS: Record<Action, number> = {
  add_transaction: 10,
  add_budget: 25,
  add_goal: 50,
  claim_challenge: 0, // This will be dynamic
};

const COIN_REWARDS: Record<Action, number> = {
    add_transaction: 10,
    add_budget: 25,
    add_goal: 50,
    claim_challenge: 0, // This will be dynamic
  };

export function useGamification() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  
  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/transactions`);
    }, [user, firestore]);

  const goalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/savingGoals`);
    }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: transactions } = useCollection<Transaction>(transactionsQuery);
  const { data: goals } = useCollection<SavingsGoal>(goalsQuery);

  const awardXP = async (action: Action, dynamicXp = 0, dynamicCoins = 0) => {
    if (!userDocRef || !userData) return;

    const xpGained = action === 'claim_challenge' ? dynamicXp : XP_REWARDS[action];
    const coinsGained = action === 'claim_challenge' ? dynamicCoins : COIN_REWARDS[action];
    
    if (xpGained === 0 && coinsGained === 0) return;

    const currentXp = userData.xp ?? 0;
    let currentLevel = userData.level ?? 1;
    const currentCoins = userData.coins ?? 0;
    const currentBadges = userData.badges ?? [];
    
    const newXp = currentXp + xpGained;
    let newLevel = currentLevel;
    let newCoins = currentCoins + coinsGained;
    
    const xpForNextLevel = currentLevel * 100;
    if (newXp >= xpForNextLevel) {
      newLevel = currentLevel + 1;
      setLevelUpInfo({ newLevel });
      setShowLevelUp(true);
      newCoins += 100;
    }

    const newlyEarnedBadges: string[] = [];
    badges.forEach(badge => {
        if (currentBadges.includes(badge.id)) return;

        let isEarned = false;
        if(badge.type === 'level' && badge.value) {
            isEarned = newLevel >= badge.value;
        } else if (badge.type === 'transactions' && badge.value) {
            isEarned = (transactions?.length || 0) + (action === 'add_transaction' ? 1 : 0) >= badge.value;
        } else if (badge.type === 'savings_goal_amount' && badge.value) {
            isEarned = goals?.some(g => g.targetAmount >= badge.value) || false;
        } else if (badge.type === 'xp') {
            isEarned = newXp >= badge.value;
        }

        if (isEarned) {
            newlyEarnedBadges.push(badge.id);
            toast({
                title: '🏆 Badge Unlocked!',
                description: `You've earned the "${badge.name}" badge.`,
            });
        }
    });

    const updatedBadges = [...currentBadges, ...newlyEarnedBadges];

    updateDocumentNonBlocking(userDocRef, { 
        xp: newXp,
        level: newLevel,
        coins: newCoins,
        badges: updatedBadges
    });

    toast({
        title: `+${xpGained} XP & +${coinsGained} Coins!`,
        description: `You earned rewards for your action. Keep it up! 💪`,
    });
  };

  return {
    awardXP,
    showLevelUp,
    setShowLevelUp,
    levelUpInfo,
  };
}
