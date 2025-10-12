'use client';

import { Header } from '@/components/header';
import { OverviewCard } from '@/components/dashboard/overview-card';
import { RecentTransactionsCard } from '@/components/dashboard/recent-transactions-card';
import { SavingsGoalsCard } from '@/components/dashboard/savings-goals-card';
import { SpendSpyCard } from '@/components/dashboard/spend-spy-card';
import { BudgetBotCard } from '@/components/dashboard/budget-bot-card';
import { AdvisorAICard } from '@/components/dashboard/advisor-ai-card';
import { useUser } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { CategoryData, Transaction, UserData } from '@/lib/data';
import { BudgetsCard } from '@/components/dashboard/budgets-card';
import { NetWorthCard } from '@/components/dashboard/net-worth-card';

function getCategoryData(transactions: Transaction[] | null): CategoryData[] | null {
  if (!transactions) return null;

  const categoryMap: { [key: string]: number } = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Bills: 0,
  };

  transactions.forEach(transaction => {
    // Ensure category exists before adding to it
    if (Object.prototype.hasOwnProperty.call(categoryMap, transaction.category)) {
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

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);

  const categoryData = getCategoryData(transactionsData);
  const totalSpending = transactionsData ? transactionsData.reduce((sum, t) => sum + t.amount, 0) : null;

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <OverviewCard categoryData={categoryData} totalSpending={totalSpending} userData={userData} />
          <NetWorthCard />
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
