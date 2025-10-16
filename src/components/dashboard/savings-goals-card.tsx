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
import { useCollection, useFirestore, useUser, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { SavingsGoal } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Target } from 'lucide-react';
import { AddGoalForm } from '@/components/forms/add-goal-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '@/components/ui/alert-dialog';


export function SavingsGoalsCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const goalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/savingGoals`));
  }, [user, firestore]);

  const { data: savingsGoals, isLoading } = useCollection<SavingsGoal>(goalsQuery);

  const openEditDialog = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!user || !firestore || !selectedGoal) return;
    const goalRef = doc(firestore, `users/${user.uid}/savingGoals/${selectedGoal.id}`);
    deleteDocumentNonBlocking(goalRef);
    setIsDeleteDialogOpen(false);
    setSelectedGoal(null);
  };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Savings Goals
            </CardTitle>
            <CardDescription>
              Track your progress towards your financial goals.
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Goal</span>
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-6">
            {isLoading &&
              Array.from({ length: 2 }).map((_, i) => (
                <li key={i}>
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </li>
              ))}
            {savingsGoals &&
              savingsGoals.map((goal) => {
                const progress =
                  (goal.currentAmount / goal.targetAmount) * 100;
                const timeLeft = goal.deadline
                  ? formatDistanceToNow(parseISO(goal.deadline), {
                      addSuffix: true,
                    })
                  : 'No deadline';

                return (
                  <li key={goal.id} className="group">
                     <div className="flex justify-between mb-1 font-medium">
                        <span className="flex items-center gap-2">{goal.name}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">
                                ${goal.currentAmount.toLocaleString()} / $
                                {goal.targetAmount.toLocaleString()}
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(goal)}>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => openDeleteDialog(goal)}
                                >
                                    Delete
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <Progress
                      value={progress}
                      aria-label={`${goal.name} progress`}
                    />
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

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Savings Goal</DialogTitle>
          </DialogHeader>
          <AddGoalForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Savings Goal</DialogTitle>
          </DialogHeader>
          <AddGoalForm goal={selectedGoal} onSuccess={() => {
              setIsEditDialogOpen(false);
              setSelectedGoal(null);
          }} />
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your savings goal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
