'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserData, BadgeInfo } from '@/lib/data';
import { badges } from '@/lib/data';
import { useToast } from './use-toast';

type LevelUpInfo = {
  newLevel: number;
};

const XP_REWARDS = {
  add_transaction: 10,
  add_budget: 25,
  add_goal: 50,
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

  const { data: userData } = useDoc<UserData>(userDocRef);

  const awardXP = async (action: keyof typeof XP_REWARDS) => {
    if (!userDocRef || !userData) return;

    const xpGained = XP_REWARDS[action];
    const currentXp = userData.xp ?? 0;
    const currentLevel = userData.level ?? 1;
    const currentCoins = userData.coins ?? 0;
    const currentBadges = userData.badges ?? [];
    
    const newXp = currentXp + xpGained;
    const xpForNextLevel = currentLevel * 100;
    let newLevel = currentLevel;
    let newCoins = currentCoins + xpGained; // Award coins equal to XP

    if (newXp >= xpForNextLevel) {
      newLevel = currentLevel + 1;
      setLevelUpInfo({ newLevel });
      setShowLevelUp(true);
      newCoins += 100; // Bonus coins for leveling up
    }

    // Check for new badges
    const newBadges = badges.filter(badge => 
        !currentBadges.includes(badge.id) && newXp >= badge.xpThreshold
    );

    if (newBadges.length > 0) {
        newBadges.forEach(badge => {
            toast({
                title: '🏆 Badge Unlocked!',
                description: `You've earned the "${badge.name}" badge.`,
            });
        });
    }

    const updatedBadges = [...currentBadges, ...newBadges.map(b => b.id)];

    updateDocumentNonBlocking(userDocRef, { 
        xp: newXp,
        level: newLevel,
        coins: newCoins,
        badges: updatedBadges
    });

    toast({
        title: `+${xpGained} XP!`,
        description: `You earned experience for your action. Keep it up! 💪`,
    });
  };

  return {
    awardXP,
    showLevelUp,
    setShowLevelUp,
    levelUpInfo,
  };
}
