'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ArrowDown, ArrowUp, TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import type { UserData, CategoryData } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';

type OverviewCardProps = {
  categoryData: CategoryData[] | null;
  totalSpending: number | null;
  userData: UserData | null;
};

const chartConfig = {
  spending: {
    label: 'Spending',
  },
  food: {
    label: 'Food',
    color: 'hsl(var(--chart-1))',
  },
  travel: {
    label: 'Travel',
    color: 'hsl(var(--chart-2))',
  },
  shopping: {
    label: 'Shopping',
    color: 'hsl(var(--chart-3))',
  },
  bills: {
    label: 'Bills',
    color: 'hsl(var(--chart-4))',
  },
};

export function OverviewCard({ categoryData, totalSpending, userData }: OverviewCardProps) {
  const chartData = categoryData?.map(c => ({
    category: c.name,
    spending: c.total
  }));

  const income = userData?.monthlyIncome ?? 0;
  const spending = totalSpending ?? 0;
  const netFlow = income - spending;
  const savingsRate = income > 0 ? ((income - spending) / income) * 100 : 0;
  const isLoading = categoryData === null || totalSpending === null || userData === null;


  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
        <CardDescription>Your financial summary for this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${income.toLocaleString()}</div>}
                    <p className="text-xs text-muted-foreground">Based on your profile</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${spending.toLocaleString()}</div>}
                    <p className="text-xs text-muted-foreground flex items-center">
                        This month's expenses
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                     <PiggyBank className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>}
                     <p className="text-xs text-muted-foreground flex items-center">
                        {savingsRate >= 20 ? <ArrowUp className="w-3 h-3 mr-1 text-green-500" /> : <ArrowDown className="w-3 h-3 mr-1 text-red-500" />}
                        {savingsRate >= 20 ? 'Good Job!' : 'Could be better'}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
                         <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {netFlow >= 0 ? '+' : '-'}${Math.abs(netFlow).toLocaleString()}
                        </div>
                    )}
                     <p className="text-xs text-muted-foreground">
                        This month's balance
                    </p>
                </CardContent>
            </Card>
        </div>
        {isLoading ? (
          <div className="w-full h-[250px]"><Skeleton className="w-full h-full" /></div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-[250px]">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0}}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `$${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="spending" radius={8}>
                  {chartData?.map((entry) => (
                      <Bar
                        key={entry.category}
                        dataKey="spending"
                        fill={chartConfig[entry.category.toLowerCase() as keyof typeof chartConfig]?.color || 'hsl(var(--primary))'}
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
