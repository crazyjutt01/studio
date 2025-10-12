'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { SavingsGoal } from '@/lib/data';
import { Scale } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
    { month: 'Jan', netWorth: 21500 },
    { month: 'Feb', netWorth: 22000 },
    { month: 'Mar', netWorth: 23200 },
    { month: 'Apr', netWorth: 22800 },
    { month: 'May', netWorth: 24500 },
    { month: 'Jun', netWorth: 25100 },
];


export function NetWorthCard() {
    const { user } = useUser();
    const firestore = useFirestore();

    const goalsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/savingGoals`));
    }, [user, firestore]);

    const { data: savingsGoals, isLoading } = useCollection<SavingsGoal>(goalsQuery);

    const totalSavings = savingsGoals?.reduce((acc, goal) => acc + goal.currentAmount, 0) ?? 0;

    // This is a simplified net worth calculation. A real app would be more complex.
    const netWorth = totalSavings + 15000; // Assuming 15k in other assets


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Net Worth
        </CardTitle>
        <CardDescription>
            A high-level snapshot of your financial position.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="w-full h-[100px]" />
            </div>
        ) : (
        <>
            <div className="text-4xl font-bold tracking-tight">${netWorth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mb-4">
                An increase of 5.2% from last month.
            </p>
            <div className="h-[100px] w-full">
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip
                            cursor={false}
                            contentStyle={{
                                background: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                        />
                        <Area type="monotone" dataKey="netWorth" stroke="hsl(var(--primary))" fill="url(#colorNetWorth)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </>
        )}
      </CardContent>
    </Card>
  );
}
