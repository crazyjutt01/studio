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
import type { Budget, Transaction } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { AddBudgetForm } from '@/components/forms/add-budget-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useCurrency } from '@/hooks/use-currency';

function getSpentAmount(
  transactions: Transaction[] | null,
  budget: Budget
): number {
  if (!transactions) return 0;

  const budgetStart = new Date(budget.startDate);
  const budgetEnd = new Date(budget.endDate);

  return transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      // Filter by date and category
      return (
        tDate >= budgetStart &&
        tDate <= budgetEnd &&
        t.category === budget.category
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export function BudgetsCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { currencySymbol } = useCurrency();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/budgets`));
  }, [user, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const { data: budgets, isLoading: isLoadingBudgets } =
    useCollection<Budget>(budgetsQuery);
  const { data: transactions } = useCollection<Transaction>(transactionsQuery);

  const openEditDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!user || !firestore || !selectedBudget) return;
    const budgetRef = doc(firestore, `users/${user.uid}/budgets/${selectedBudget.id}`);
    deleteDocumentNonBlocking(budgetRef);
    setIsDeleteDialogOpen(false);
    setSelectedBudget(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>
              Keep track of your spending against your budgets.
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Budget</span>
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-6">
            {isLoadingBudgets &&
              Array.from({ length: 2 }).map((_, i) => (
                <li key={i}>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-48 mt-1" />
                </li>
              ))}
            {budgets &&
              budgets.map((budget) => {
                const spent = getSpentAmount(transactions, budget);
                const progress = (spent / budget.amount) * 100;
                return (
                  <li key={budget.id} className="group">
                    <div className="flex justify-between mb-1">
                        <div className="flex flex-col">
                            <span className="font-medium">{budget.name}</span>
                            <span className="text-xs text-muted-foreground">{budget.category}</span>
                        </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {currencySymbol}{spent.toLocaleString()} / {currencySymbol}
                          {budget.amount.toLocaleString()}
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(budget)}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => openDeleteDialog(budget)}
                            >
                                Delete
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <Progress
                      value={progress}
                      aria-label={`${budget.name} progress`}
                    />
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
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Budget</DialogTitle>
          </DialogHeader>
          <AddBudgetForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <AddBudgetForm budget={selectedBudget} onSuccess={() => {
              setIsEditDialogOpen(false);
              setSelectedBudget(null);
          }} />
        </DialogContent>
      </Dialog>
      
       {/* Delete Alert Dialog */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your budget.
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
