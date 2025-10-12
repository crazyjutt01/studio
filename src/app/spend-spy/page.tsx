'use client';
import { Header } from '@/components/header';
import { SpendSpyCard } from '@/components/dashboard/spend-spy-card';
import { RecentTransactionsCard } from '@/components/dashboard/recent-transactions-card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Transaction } from '@/lib/data';

export default function SpendSpyPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">SpendSpy</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <SpendSpyCard />
            <RecentTransactionsCard transactions={transactionsData} />
        </div>
      </main>
    </>
  );
}
