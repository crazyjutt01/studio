'use client';
import { useState, useMemo } from 'react';
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
import { getPersonalizedTips } from '@/ai/flows/budget-bot-personalized-tips';
import { Loader2, Lightbulb } from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Transaction } from '@/lib/data';
import { user as mockUser, getExpensesForAI } from '@/lib/data';

export function BudgetBotCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);

  const handleGetTips = async () => {
    if (!transactionsData) {
        toast({
            variant: 'destructive',
            title: 'No transaction data available',
            description: 'Cannot generate tips without spending history.',
        });
        return;
    }
    setIsLoading(true);
    setTips([]);
    try {
      const expenses = getExpensesForAI(transactionsData);
      const result = await getPersonalizedTips({
        income: mockUser.monthlyIncome,
        expenses: expenses,
        savingGoals: mockUser.savingGoals,
      });
      setTips(result.tips);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Getting Tips',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>BudgetBot</CardTitle>
        <CardDescription>
          Get personalized tips to improve your financial management.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Generating tips...</span>
          </div>
        )}
        {!isLoading && tips.length > 0 && (
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start text-sm">
                <Lightbulb className="h-4 w-4 mr-3 mt-1 text-accent-foreground flex-shrink-0" style={{ color: 'hsl(var(--accent))' }}/>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && tips.length === 0 && (
            <div className="text-center text-muted-foreground pt-8">
                <p>Click the button below to get your personalized financial advice!</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetTips} disabled={isLoading || !transactionsData} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Get My Tips'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
