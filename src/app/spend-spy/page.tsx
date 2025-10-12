'use client';
import { useState } from 'react';
import { Header } from '@/components/header';
import { SpendSpyCard } from '@/components/dashboard/spend-spy-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddTransactionForm } from '@/components/forms/add-transaction-form';
import { PlusCircle } from 'lucide-react';

export default function SpendSpyPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">SpendSpy</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Add Transaction</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Add a New Transaction</DialogTitle>
                </DialogHeader>
                <AddTransactionForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <SpendSpyCard />
          </div>
        </div>
      </main>
    </>
  );
}
