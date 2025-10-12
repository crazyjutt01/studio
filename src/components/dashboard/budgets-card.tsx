'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Budget, Transaction } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddBudgetForm } from '@/components/forms/add-budget-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function getSpentAmount(transactions: Transaction[] | null, budget: Budget): number {
    if (!transactions) return 0;

    const budgetStart = new Date(budget.startDate);
    const budgetEnd = new Date(budget.endDate);

    return transactions
        .filter(t => {
            const tDate = new Date(t.date);
            // This logic is simplified. A real app might check budget category vs transaction category
            return tDate >= budgetStart && tDate <= budgetEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);
}


export function BudgetsCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/budgets`));
  }, [user, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const { data: budgets, isLoading: isLoadingBudgets } = useCollection<Budget>(budgetsQuery);
  const { data: transactions } = useCollection<Transaction>(transactionsQuery);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>
              Keep track of your spending against your budgets.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Add Budget</span>
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          <ul className="space-y-6">
            {isLoadingBudgets && Array.from({ length: 2 }).map((_, i) => (
              <li key={i}>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-48 mt-1" />
              </li>
            ))}
            {budgets && budgets.map((budget) => {
              const spent = getSpentAmount(transactions, budget);
              const progress = (spent / budget.amount) * 100;
              return (
                <li key={budget.id}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{budget.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ${spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} aria-label={`${budget.name} progress`} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(progress)}% of budget used
                  </p>
                </li>
              );
            })}
             {budgets?.length === 0 && !isLoadingBudgets && (
                <div className="text-center text-muted-foreground pt-8">
                    <p>You haven't set any budgets yet.</p>
                </div>
             )}
          </ul>
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Budget</DialogTitle>
        </DialogHeader>
        <AddBudgetForm onSuccess={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}