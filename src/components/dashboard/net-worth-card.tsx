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
import type { SavingsGoal, UserData } from '@/lib/data';
import { Scale } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { subMonths, format } from 'date-fns';

// Helper to generate chart data
const generateChartData = (savingsGoals: SavingsGoal[] | null) => {
    if (!savingsGoals) return [];
    
    const data = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(new Date(), 5 - i);
        const month = format(date, 'MMM');
        // This is a simplified simulation of net worth growth.
        // A real app might pull historical data or calculate it more accurately.
        const netWorth = savingsGoals.reduce((acc, goal) => acc + goal.currentAmount, 0) * (1 + (i - 5) * 0.05);
        return { month, netWorth: Math.max(0, netWorth) };
    });

    return data;
};


export function NetWorthCard() {
    const { user } = useUser();
    const firestore = useFirestore();

    const goalsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/savingGoals`));
    }, [user, firestore]);

    const { data: savingsGoals, isLoading } = useCollection<SavingsGoal>(goalsQuery);

    const totalSavings = savingsGoals?.reduce((acc, goal) => acc + goal.currentAmount, 0) ?? 0;
    const chartData = generateChartData(savingsGoals);
    const lastMonthWorth = chartData[chartData.length - 2]?.netWorth ?? 0;
    const currentWorth = chartData[chartData.length - 1]?.netWorth ?? 0;
    const percentageChange = lastMonthWorth > 0 ? ((currentWorth - lastMonthWorth) / lastMonthWorth) * 100 : 0;

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
                {percentageChange >= 0 ? 'An increase' : 'A decrease'} of {Math.abs(percentageChange).toFixed(1)}% from last month.
            </p>
            <div className="h-[100px] w-full">
                <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
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
