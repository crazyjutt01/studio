'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { categoryIcons } from '@/lib/data';
import { ArrowDown, ArrowUp } from 'lucide-react';

type OverviewCardProps = {
  categoryData: {
    name: string;
    total: number;
    icon: string;
  }[];
  totalSpending: number;
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

export function OverviewCard({ categoryData, totalSpending }: OverviewCardProps) {
  const chartData = categoryData.map(c => ({
    category: c.name,
    spending: c.total
  }));

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Your financial summary for this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <span className="text-green-500">$</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$5,000.00</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                        <ArrowUp className="w-3 h-3 mr-1 text-green-500" />
                        +2.1% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
                    <span className="text-red-500">$</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalSpending.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                        <ArrowDown className="w-3 h-3 mr-1 text-red-500" />
                        -5.3% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                     <span className="text-blue-500">%</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">23.2%</div>
                     <p className="text-xs text-muted-foreground flex items-center">
                        <ArrowUp className="w-3 h-3 mr-1 text-green-500" />
                        +1.8% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
                    <span className="text-green-500">→</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        +${(5000 - totalSpending).toLocaleString()}
                    </div>
                     <p className="text-xs text-muted-foreground">
                        This month's balance
                    </p>
                </CardContent>
            </Card>
        </div>
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
                 {chartData.map((entry) => (
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
      </CardContent>
    </Card>
  );
}
