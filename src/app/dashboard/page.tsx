'use client';

import { useMemo } from 'react';
import { Header } from '@/components/header';
import { OverviewCard } from '@/components/dashboard/overview-card';
import { RecentTransactionsCard } from '@/components/dashboard/recent-transactions-card';
import { useUser } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { Budget, CategoryData, Transaction, UserData } from '@/lib/data';
import { NetWorthCard } from '@/components/dashboard/net-worth-card';
import { useCheckAlerts } from '@/hooks/use-check-alerts';

const getCategoryData = (transactions: Transaction[] | null): CategoryData[] | null => {
  if (!transactions) return null;

  const categoryMap: { [key: string]: number } = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Bills: 0,
  };

  transactions.forEach(transaction => {
    const category = transaction.category;
    if (category && Object.prototype.hasOwnProperty.call(categoryMap, category)) {
      categoryMap[category] += transaction.amount;
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

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/budgets`));
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);
  const { data: budgetsData } = useCollection<Budget>(budgetsQuery);

  // Hook to check for alerts
  useCheckAlerts();

  const categoryData = useMemo(() => getCategoryData(transactionsData), [transactionsData]);
  const totalSpending = useMemo(() => transactionsData ? transactionsData.reduce((sum, t) => sum + t.amount, 0) : null, [transactionsData]);

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
        </div>
      </main>
    </>
  );
}
