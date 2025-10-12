'use client';
import { Header } from '@/components/header';
import { BudgetBotCard } from '@/components/dashboard/budget-bot-card';

export default function BudgetBotPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">BudgetBot</h1>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <BudgetBotCard />
          </div>
        </div>
      </main>
    </>
  );
}
