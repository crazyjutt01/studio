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
import { getPersonalizedBudget, type PersonalizedBudgetOutput } from '@/ai/flows/budget-bot-personalized-tips';
import { Loader2, Bot, CircleDollarSign } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Transaction, UserData, SavingsGoal } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';

export function BudgetBotCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [budgetResponse, setBudgetResponse] = useState<PersonalizedBudgetOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const { currencySymbol } = useCurrency();

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

  const handleGetBudget = async () => {
    if (!user || !transactionsData || !userData || !savingsGoalsData) {
        toast({
            variant: 'destructive',
            title: 'Not enough data',
            description: 'Cannot generate a budget without your complete financial data.',
        });
        return;
    }
    setIsLoading(true);
    setBudgetResponse(null);
    try {
      const result = await getPersonalizedBudget({
        userId: user.uid,
        income: userData.monthlyIncome,
        assets: userData.assets || 0,
        transactions: JSON.stringify(transactionsData),
        savingGoals: JSON.stringify(savingsGoalsData),
        region: userData.region || 'US',
        currency: userData.currency || 'USD',
      });
      setBudgetResponse(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Generating Budget',
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
            <Bot className="text-primary" />
            BudgetBot AI
        </CardTitle>
        <CardDescription>
          Get an AI-generated monthly budget based on your finances.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Generating your budget...</span>
          </div>
        )}
        {!isLoading && budgetResponse && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground italic">"{budgetResponse.summary}"</p>
            <div className="grid grid-cols-2 gap-4 pt-4">
                {budgetResponse.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{rec.category}</p>
                        <p className="text-xl font-bold">{currencySymbol}{rec.amount.toLocaleString()}</p>
                    </div>
                ))}
            </div>
          </div>
        )}
        {!isLoading && !budgetResponse && (
            <div className="text-center text-muted-foreground pt-8 flex flex-col items-center gap-2">
                <CircleDollarSign className="w-8 h-8" />
                <p>Let BudgetBot create a personalized spending plan for you!</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetBudget} disabled={isLoading || !transactionsData || !userData || !savingsGoalsData} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Generate My Budget'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
