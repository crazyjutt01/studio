import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { FinSafeLogo } from '@/components/icons';
import { OverviewCard } from '@/components/dashboard/overview-card';
import { RecentTransactionsCard } from '@/components/dashboard/recent-transactions-card';
import { SavingsGoalsCard } from '@/components/dashboard/savings-goals-card';
import { SpendSpyCard } from '@/components/dashboard/spend-spy-card';
import { BudgetBotCard } from '@/components/dashboard/budget-bot-card';
import { AdvisorAICard } from '@/components/dashboard/advisor-ai-card';
import { getCategoryData, transactions } from '@/lib/data';

export default function DashboardPage() {
    const categoryData = getCategoryData().map(c => ({...c, icon: c.icon.displayName as string}));
    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="bg-card border-r"
      >
        <SidebarHeader className="flex items-center gap-2 p-4">
          <FinSafeLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            FinSafe
          </span>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-secondary/50">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <OverviewCard categoryData={categoryData} totalSpending={totalSpending} />
                <RecentTransactionsCard />
                <SavingsGoalsCard />
                <SpendSpyCard />
                <BudgetBotCard />
                <AdvisorAICard />
            </div>
        </main>
      </SidebarInset>
    </div>
  );
}
