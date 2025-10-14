"use client";

import { useEffect, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Transaction, Budget } from '@/lib/data';
import { generateAlerts } from '@/ai/flows/alert-generator';
import { useToast } from './use-toast';

export function useCheckAlerts() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/budgets`));
  }, [user, firestore]);

  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);
  const { data: budgetsData } = useCollection<Budget>(budgetsQuery);

  const checkAlerts = useCallback(async () => {
    if (user && transactionsData && budgetsData && transactionsData.length > 0 && budgetsData.length > 0) {
      try {
        await generateAlerts({
          userId: user.uid,
          transactions: JSON.stringify(transactionsData),
          budgets: JSON.stringify(budgetsData),
        });
      } catch (error) {
        console.error("Failed to check for alerts:", error);
        // Optionally, you can show a toast message here for debugging, but it might be noisy for users.
        // toast({
        //   variant: 'destructive',
        //   title: 'Alert System Error',
        //   description: 'Could not check for new budget alerts.',
        // });
      }
    }
  }, [user, transactionsData, budgetsData, toast]);

  useEffect(() => {
    // Check for alerts when the hook is first mounted and data is available
    checkAlerts();

    // Set up an interval to check for alerts periodically (e.g., every 5 minutes)
    const interval = setInterval(checkAlerts, 5 * 60 * 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [checkAlerts]);
}
