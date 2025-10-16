'use client';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { advisorAIWeeklySummary } from '@/ai/flows/advisor-ai-weekly-summary';
import { Loader2, Bot, Calendar } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Transaction, Budget, SavingsGoal, UserData } from '@/lib/data';
import { subDays, format } from 'date-fns';

type TimeRange = 'daily' | 'weekly' | 'monthly';

export function FinancialSummaryAgentCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [activeRange, setActiveRange] = useState<TimeRange | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/budgets`));
  }, [user, firestore]);

  const savingsGoalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/savingGoals`));
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);
  const { data: budgetsData } = useCollection<Budget>(budgetsQuery);
  const { data: savingsGoalsData } = useCollection<SavingsGoal>(savingsGoalsQuery);

  const getFilteredTransactions = (range: TimeRange) => {
    if (!transactionsData) return [];
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'daily':
        startDate = subDays(now, 1);
        break;
      case 'weekly':
        startDate = subDays(now, 7);
        break;
      case 'monthly':
        startDate = subDays(now, 30);
        break;
      default:
        return transactionsData;
    }
    return transactionsData.filter(t => new Date(t.date) >= startDate);
  };


  const handleGetSummary = async (range: TimeRange) => {
    if (!user || !transactionsData || !budgetsData || !savingsGoalsData || !userData) {
      toast({
        variant: 'destructive',
        title: 'Not enough data',
        description: 'Cannot generate a summary without your financial data.',
      });
      return;
    }
    setIsLoading(true);
    setSummary(null);
    setActiveRange(range);

    const filteredTransactions = getFilteredTransactions(range);
    const question = `Give me a ${range} summary of my finances. Today is ${format(new Date(), 'MMMM dd, yyyy')}.`;

    try {
      const result = await advisorAIWeeklySummary({
        userId: user.uid,
        transactions: JSON.stringify(filteredTransactions),
        budgets: JSON.stringify(budgetsData),
        savingGoals: JSON.stringify(savingsGoalsData),
        question: question,
        region: userData.region || 'US',
        currency: userData.currency || 'USD',
      });
      setSummary(result.summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error Generating Summary',
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
          FinPulse AI Summary
        </CardTitle>
        <CardDescription>
          Get a quick summary of your financial activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Generating your {activeRange} summary...</span>
          </div>
        )}
        {!isLoading && summary && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground italic">{summary}</p>
          </div>
        )}
        {!isLoading && !summary && (
          <div className="text-center text-muted-foreground pt-8 flex flex-col items-center gap-2">
            <Calendar className="w-8 h-8" />
            <p>Select a period below to generate a summary.</p>
          </div>
        )}
      </CardContent>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
            <Button onClick={() => handleGetSummary('daily')} disabled={isLoading} variant={activeRange === 'daily' ? 'default' : 'outline'}>
                Daily
            </Button>
            <Button onClick={() => handleGetSummary('weekly')} disabled={isLoading} variant={activeRange === 'weekly' ? 'default' : 'outline'}>
                Weekly
            </Button>
            <Button onClick={() => handleGetSummary('monthly')} disabled={isLoading} variant={activeRange === 'monthly' ? 'default' : 'outline'}>
                Monthly
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
