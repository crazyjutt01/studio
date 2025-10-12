'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { categoryIcons, type Transaction } from '@/lib/data';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddTransactionForm } from '@/components/forms/add-transaction-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


interface RecentTransactionsCardProps {
  transactions: Transaction[] | null;
}

export function RecentTransactionsCard({ transactions }: RecentTransactionsCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Here are the latest transactions from your accounts.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Add Transaction</span>
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!transactions &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-6 w-12 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              {transactions && transactions.slice(0, 5).map((transaction) => {
                const Icon = categoryIcons[transaction.category] as LucideIcon;
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex p-2 bg-muted rounded-md items-center justify-center">
                          {Icon ? <Icon className="w-4 h-4 text-muted-foreground" /> : null}
                        </span>
                        <div className="font-medium">{transaction.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Transaction</DialogTitle>
        </DialogHeader>
        <AddTransactionForm onSuccess={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}