'use client';
import { useEffect, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { usePathname } from 'next/navigation';
import { startOfDay, endOfDay, isAfter } from 'date-fns';
import type { Challenge, Transaction } from '@/lib/data';

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

export function useChallengeChecker() {
    const { user } = useUser();
    const firestore = useFirestore();
    const pathname = usePathname();

    const challengesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        const now = Timestamp.now();
        return query(
            collection(firestore, `users/${user.uid}/challenges`),
            where('expiresAt', '>', now)
        );
    }, [user, firestore]);

    const transactionsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        const todayStart = startOfDay(new Date());
        return query(collection(firestore, `users/${user.uid}/transactions`), where('date', '>=', todayStart.toISOString()));
    }, [user, firestore]);

    const { data: allChallenges } = useCollection<Challenge>(challengesQuery);
    const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);

    const fetchAndSetChallenges = useCallback(async () => {
        if (!user || !firestore) return;

        const challengesCol = collection(firestore, `users/${user.uid}/challenges`);
        const today = startOfDay(new Date());
        
        const dailyQuery = query(challengesCol, where('type', '==', 'daily'), where('expiresAt', '>', Timestamp.fromDate(today)));
        const dailySnapshot = await getDocs(dailyQuery);

        if (dailySnapshot.empty) {
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
    }, [user, firestore]);

    const checkChallengeEligibility = useCallback(async () => {
        if (!allChallenges?.length || !user || !firestore) return;

        const batch = writeBatch(firestore);
        let dirty = false;

        for (const challenge of allChallenges) {
            if (challenge.status !== 'active') continue;

            let isEligible = false;
            const todayStart = startOfDay(new Date());

            switch (challenge.title) {
                case 'Log a Transaction':
                    if (transactionsData && transactionsData.length > 0) {
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
                    if (pathname.includes('/advisor-ai')) {
                        isEligible = true;
                    }
                    break;
                case 'No-Spend Challenge':
                     const nonEssentialSpending = transactionsData?.filter(t => {
                        const isNonEssential = t.category === 'Shopping' || t.category === 'Food' || t.category === 'Travel';
                        return isNonEssential;
                    }).length;
                    if (nonEssentialSpending === 0) {
                        isEligible = true;
                    }
                    break;
            }

            if (isEligible) {
                const challengeRef = doc(firestore, `users/${user.uid}/challenges`, challenge.id);
                batch.update(challengeRef, { status: 'eligible' });
                dirty = true;
            }
        }

        if (dirty) {
            await batch.commit();
        }
    }, [allChallenges, transactionsData, user, firestore, pathname]);

    useEffect(() => {
        if (user) {
            fetchAndSetChallenges();
        }
    }, [user, fetchAndSetChallenges]);
    
    useEffect(() => {
        checkChallengeEligibility();
    }, [checkChallengeEligibility]);
}
