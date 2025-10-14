'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { SavingsGoal, UserData } from '@/lib/data';
import { Scale } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { subMonths, format } from 'date-fns';

// Helper to generate chart data
const generateChartData = (totalAssets: number) => {
    if (totalAssets === null) return [];
    
    const data = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(new Date(), 5 - i);
        const month = format(date, 'MMM');
        // This is a simplified simulation of net worth growth.
        // A real app might pull historical data or calculate it more accurately.
        // Let's simulate a modest growth/fluctuation.
        const fluctuation = (Math.random() - 0.5) * 0.1; // between -5% and +5%
        const baseWorth = totalAssets / (1 + (5 - i) * 0.02); // Simulate past lower value
        const netWorth = baseWorth * (1 + fluctuation);

        return { month, netWorth: Math.max(0, netWorth) };
    });

    return data;
};


export function NetWorthCard() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);

    const goalsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/savingGoals`));
    }, [user, firestore]);
    
    const { data: userData, isLoading: isUserLoading } = useDoc<UserData>(userDocRef);
    const { data: savingsGoals, isLoading: areGoalsLoading } = useCollection<SavingsGoal>(goalsQuery);

    const totalSavings = savingsGoals?.reduce((acc, goal) => acc + goal.currentAmount, 0) ?? 0;
    const userAssets = userData?.assets ?? 0;
    const netWorth = totalSavings + userAssets;

    const chartData = generateChartData(netWorth);
    const lastMonthWorth = chartData[chartData.length - 2]?.netWorth ?? 0;
    const currentWorth = netWorth;
    const percentageChange = lastMonthWorth > 0 ? ((currentWorth - lastMonthWorth) / lastMonthWorth) * 100 : 0;

    const isLoading = isUserLoading || areGoalsLoading;

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
