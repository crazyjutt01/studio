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
import type { SavingsGoal } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle, Target } from 'lucide-react';
import { AddGoalForm } from '@/components/forms/add-goal-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDistanceToNow, parseISO } from 'date-fns';

export function SavingsGoalsCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const goalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/savingGoals`));
  }, [user, firestore]);

  const { data: savingsGoals, isLoading } = useCollection<SavingsGoal>(goalsQuery);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Savings Goals (GoalGuru)
            </CardTitle>
            <CardDescription>
              Track your progress towards your financial goals.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Add Goal</span>
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          <ul className="space-y-6">
            {isLoading && Array.from({ length: 2 }).map((_, i) => (
              <li key={i}>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-48 mt-2" />
              </li>
            ))}
            {savingsGoals && savingsGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const timeLeft = goal.deadline ? formatDistanceToNow(parseISO(goal.deadline), { addSuffix: true }) : 'No deadline';

              return (
                <li key={goal.id}>
                  <div className="flex justify-between mb-1 font-medium">
                    <span>{goal.name}</span>
                    <span className="text-sm">
                      ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} aria-label={`${goal.name} progress`} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{Math.round(progress)}% complete</span>
                    <span>{timeLeft}</span>
                  </div>
                </li>
              );
            })}
             {savingsGoals?.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground pt-8">
                    <p>No savings goals set yet. Let's add one!</p>
                </div>
             )}
          </ul>
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Savings Goal</DialogTitle>
        </DialogHeader>
        <AddGoalForm onSuccess={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
