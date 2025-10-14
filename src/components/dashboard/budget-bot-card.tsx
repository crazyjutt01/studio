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
import { getPersonalizedTips } from '@/ai/flows/budget-bot-personalized-tips';
import { Loader2, Lightbulb } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Transaction, UserData } from '@/lib/data';
import { getExpensesForAI } from '@/lib/data';

export function BudgetBotCard() {
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

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);

  const handleGetTips = async () => {
    if (!transactionsData || !userData) {
        toast({
            variant: 'destructive',
            title: 'Not enough data',
            description: 'Cannot generate tips without transaction history and user profile information.',
        });
        return;
    }
    setIsLoading(true);
    setTips([]);
    try {
      const expenses = getExpensesForAI(transactionsData);
      const result = await getPersonalizedTips({
        income: userData.monthlyIncome,
        expenses: expenses,
        savingGoals: userData.savingGoals,
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
                <Lightbulb className="h-4 w-4 mr-3 mt-1 text-accent-foreground" style={{ color: 'hsl(var(--accent))' }}/>
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
        <Button onClick={handleGetTips} disabled={isLoading || !transactionsData || !userData} className="w-full">
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
