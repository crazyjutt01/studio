"use client";

import { useEffect, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Transaction, Budget, UserData, SavingsGoal } from '@/lib/data';
import { generateAlerts } from '@/ai/flows/alert-generator';
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

  const checkAlerts = useCallback(async () => {
    if (user && userData && userData.smartReminders && transactionsData && budgetsData && savingsGoalsData && transactionsData.length > 0) {
      try {
        await generateAlerts({
          userId: user.uid,
          transactions: JSON.stringify(transactionsData),
          budgets: JSON.stringify(budgetsData),
          goals: JSON.stringify(savingsGoalsData),
          monthlyIncome: userData.monthlyIncome,
        });
      } catch (error) {
        console.error("Failed to check for alerts:", error);
      }
    }
  }, [user, userData, transactionsData, budgetsData, savingsGoalsData, toast]);

  useEffect(() => {
    // This interval check can be for less frequent, summary-style alerts.
    // The more immediate alerts are triggered by user actions.
    const interval = setInterval(checkAlerts, 5 * 60 * 1000); // 5 minutes

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [checkAlerts]);
}
