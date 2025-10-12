'use client';
import { Header } from '@/components/header';
import { BudgetBotCard } from '@/components/dashboard/budget-bot-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetsCard } from '@/components/dashboard/budgets-card';
import { CircleDollarSign } from 'lucide-react';

export default function BudgetBotPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center gap-2">
            <CircleDollarSign className="w-8 h-8 text-primary" />
          <h1 className="text-lg font-semibold md:text-2xl">Budgeting Tools</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetsCard />
            <BudgetBotCard />
        </div>
      </main>
    </>
  );
}
