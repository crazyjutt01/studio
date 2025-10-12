'use client';

import { Header } from '@/components/header';
import { OverviewCard } from '@/components/dashboard/overview-card';
import { RecentTransactionsCard } from '@/components/dashboard/recent-transactions-card';
import { SavingsGoalsCard } from '@/components/dashboard/savings-goals-card';
import { SpendSpyCard } from '@/components/dashboard/spend-spy-card';
import { BudgetBotCard } from '@/components/dashboard/budget-bot-card';
import { AdvisorAICard } from '@/components/dashboard/advisor-ai-card';
import { useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { CategoryData, Transaction } from '@/lib/data';
import { BudgetsCard } from '@/components/dashboard/budgets-card';

function getCategoryData(transactions: Transaction[] | null): CategoryData[] {
  const categoryMap: { [key: string]: number } = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Bills: 0,
  };

  if (!transactions) {
    return Object.entries(categoryMap).map(([name, total]) => ({
      name,
      total,
    }));
  }

  transactions.forEach(transaction => {
    if (categoryMap[transaction.category] !== undefined) {
      categoryMap[transaction.category] += transaction.amount;
    }
  });

  return Object.entries(categoryMap).map(([name, total]) => ({
    name,
    total: parseFloat(total.toFixed(2)),
  }));
};


export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);

  const categoryData = getCategoryData(transactionsData);
  const totalSpending = transactionsData ? transactionsData.reduce((sum, t) => sum + t.amount, 0) : 0;

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <OverviewCard categoryData={categoryData} totalSpending={totalSpending} />
          <RecentTransactionsCard transactions={transactionsData} />
          <BudgetsCard />
          <SavingsGoalsCard />
          <SpendSpyCard />
          <BudgetBotCard />
          <AdvisorAICard />
        </div>
      </main>
    </>
  );
}
