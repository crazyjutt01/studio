'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getGoalAdvice } from '@/ai/flows/goal-guru-advice';
import { Loader2, Zap } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Transaction, UserData, SavingsGoal } from '@/lib/data';

const getExpensesForAI = (transactions: Transaction[]) => {
  const categoryMap: { [key: string]: number } = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Bills: 0,
  };
  transactions.forEach(transaction => {
      if (transaction.category && Object.prototype.hasOwnProperty.call(categoryMap, transaction.category)) {
          categoryMap[transaction.category] += transaction.amount;
      }
  });
  return Object.entries(categoryMap).map(([name, total]) => ({
      category: name,
      amount: parseFloat(total.toFixed(2)),
  }));
}


export function GoalGuruAICard() {
  const [isLoading, setIsLoading] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);
  
  const savingsGoalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/savingGoals`));
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);
  const { data: savingsGoalsData } = useCollection<SavingsGoal>(savingsGoalsQuery);

  const handleGetTips = async () => {
    if (!user || !transactionsData || !userData || !savingsGoalsData) {
        toast({
            variant: 'destructive',
            title: 'Not enough data',
            description: 'Cannot generate advice without your financial data.',
        });
        return;
    }
    setIsLoading(true);
    setTips([]);
    try {
      const expenses = getExpensesForAI(transactionsData);
      const result = await getGoalAdvice({
        userId: user.uid,
        income: userData.monthlyIncome,
        expenses: JSON.stringify(expenses),
        savingGoals: JSON.stringify(savingsGoalsData),
      });
      setTips(result.tips);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Getting Advice',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Zap className="text-primary" />
            GoalGuru AI
        </CardTitle>
        <CardDescription>
          Get personalized tips to achieve your savings goals faster.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Generating advice...</span>
          </div>
        )}
        {!isLoading && tips.length > 0 && (
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start text-sm">
                <Zap className="h-4 w-4 mr-3 mt-1 text-accent-foreground" style={{ color: 'hsl(var(--accent))' }}/>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && tips.length === 0 && (
            <div className="text-center text-muted-foreground pt-8">
                <p>Click the button below to get AI-powered tips for reaching your goals!</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetTips} disabled={isLoading || !transactionsData || !userData || !savingsGoalsData} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Get Goal-Hacking Tips'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
