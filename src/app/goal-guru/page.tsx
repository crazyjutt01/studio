'use client';
import { Header } from '@/components/header';
import { SavingsGoalsCard } from '@/components/dashboard/savings-goals-card';

export default function GoalGuruPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">GoalGuru</h1>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <SavingsGoalsCard />
          </div>
        </div>
      </main>
    </>
  );
}
