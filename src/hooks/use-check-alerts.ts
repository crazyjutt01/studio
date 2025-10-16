'use client';

import { useEffect, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, addDocumentNonBlocking } from '@/firebase';
import { collection, query, doc, where, getDocs, limit, orderBy } from 'firebase/firestore';
import type { Transaction, Budget, UserData, SavingsGoal, Alert } from '@/lib/data';
import { generateAlerts } from '@/ai/flows/alert-generator';
import { getDailyFinancialSummary } from '@/ai/flows/daily-financial-summary';
import { useToast } from './use-toast';

export function useCheckAlerts() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/budgets`));
  }, [user, firestore]);
  
  const savingsGoalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/savingGoals`));
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);
  const { data: budgetsData } = useCollection<Budget>(budgetsQuery);
  const { data: savingsGoalsData } = useCollection<SavingsGoal>(savingsGoalsQuery);

  const checkSmartReminders = useCallback(async () => {
    if (user && firestore && userData && userData.smartReminders && transactionsData && budgetsData && savingsGoalsData && transactionsData.length > 0) {
      try {
        const alertSuggestions = await generateAlerts({
          userId: user.uid,
          transactions: JSON.stringify(transactionsData),
          budgets: JSON.stringify(budgetsData),
          goals: JSON.stringify(savingsGoalsData),
          monthlyIncome: userData.monthlyIncome,
          currency: userData.currency || 'USD',
          region: userData.region || 'US',
        });

        if (!alertSuggestions || alertSuggestions.length === 0) {
            return;
        }

        const alertsCol = collection(firestore, `users/${user.uid}/alerts`);

        for (const suggestion of alertSuggestions) {
            if (suggestion.shouldCreate && suggestion.trigger) {
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const recentAlertsQuery = query(
                    alertsCol,
                    where('trigger', '==', suggestion.trigger),
                    limit(1)
                );

                const recentAlertsSnapshot = await getDocs(recentAlertsQuery);
                
                if (recentAlertsSnapshot.empty || new Date(recentAlertsSnapshot.docs[0].data().timestamp) < sevenDaysAgo) {
                    const alertData: Omit<Alert, 'id'> = {
                        userId: user.uid,
                        type: suggestion.type!,
                        message: suggestion.message!,
                        trigger: suggestion.trigger,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                    };
                    addDocumentNonBlocking(alertsCol, alertData);
                }
            }
        }
      } catch (error) {
        console.error("Failed to check for smart reminders:", error);
      }
    }
  }, [user, firestore, userData, transactionsData, budgetsData, savingsGoalsData]);

  const checkDailyDigest = useCallback(async () => {
    if (user && firestore && userData && userData.dailyDigest && transactionsData) {
        const now = new Date();
        const digestTimeParts = userData.digestTime?.split(':').map(Number) || [8, 0];
        const currentHour = now.getHours();

        // Only run around the user's chosen hour
        if (currentHour !== digestTimeParts[0]) {
            return;
        }

        const alertsCol = collection(firestore, `users/${user.uid}/alerts`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const recentDigestQuery = query(
            alertsCol,
            where('type', '==', 'Daily Digest'),
            where('timestamp', '>=', today.toISOString()),
            orderBy('timestamp', 'desc'),
            limit(1)
        );
        
        const snapshot = await getDocs(recentDigestQuery);
        if (!snapshot.empty) {
            // Already sent today
            return;
        }

        try {
            const result = await getDailyFinancialSummary({
                userId: user.uid,
                transactions: JSON.stringify(transactionsData),
                region: userData.region || 'US',
                currency: userData.currency || 'USD',
            });
            const alertData: Omit<Alert, 'id'> = {
                userId: user.uid,
                type: 'Daily Digest',
                message: `${result.summary} - "${result.quote}"`,
                timestamp: new Date().toISOString(),
                isRead: false,
                trigger: 'daily_digest'
            };
            addDocumentNonBlocking(alertsCol, alertData);

        } catch(error) {
            console.error("Failed to generate daily digest:", error);
        }
    }
  }, [user, firestore, userData, transactionsData]);


  useEffect(() => {
    // This interval checks for both types of alerts.
    const interval = setInterval(() => {
        checkSmartReminders();
        checkDailyDigest();
    }, 5 * 60 * 1000); // 5 minutes

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [checkSmartReminders, checkDailyDigest]);
}
