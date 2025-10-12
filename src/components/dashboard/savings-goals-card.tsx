'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { SavingsGoal } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { useMemo } from 'react';


export function SavingsGoalsCard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const goalsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/savingGoals`));
  }, [user, firestore]);

  const { data: savingsGoals, isLoading } = useCollection<SavingsGoal>(goalsQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Goals (GoalGuru)</CardTitle>
        <CardDescription>
          Track your progress towards your financial goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-6">
          {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <li key={i}>
              <div className="flex justify-between mb-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-48 mt-1" />
            </li>
          ))}
          {savingsGoals && savingsGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <li key={goal.id}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                  </span>
                </div>
                <Progress value={progress} aria-label={`${goal.name} progress`} />
                 <p className="text-xs text-muted-foreground mt-1">{goal.name}</p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
