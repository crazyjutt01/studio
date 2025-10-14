'use client';
import { Header } from '@/components/header';
import { SavingsGoalsCard } from '@/components/dashboard/savings-goals-card';
import { Target } from 'lucide-react';
import { GoalGuruAICard } from '@/components/dashboard/goal-guru-ai-card';

export default function GoalGuruPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
          <h1 className="text-lg font-semibold md:text-2xl">GoalGuru</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <SavingsGoalsCard />
            <GoalGuruAICard />
        </div>
      </main>
    </>
  );
}
