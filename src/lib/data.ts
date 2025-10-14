import type { LucideIcon } from 'lucide-react';
import { Landmark, Plane, ShoppingCart, UtensilsCrossed } from 'lucide-react';

export type Transaction = {
  id: string;
  userId: string;
  date: string;
  amount: number;
  description: string;
  category?: 'Food' | 'Travel' | 'Shopping' | 'Bills';
};

export type Budget = {
    id: string;
    userId: string;
    name: string;
    amount: number;
    startDate?: string;
    endDate?: string;
};

export type SavingsGoal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
};

export type EmergencyContact = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
};

export type UserData = {
  id?: string;
  name: string;
  email: string | null;
  avatarUrl: string;
  monthlyIncome: number;
  savingGoals: string;
};

export type Alert = {
  id: string;
  userId: string;
  type: string;
  message: string;
  timestamp: string;
  isRead: boolean;
};

export type CategoryData = {
  name: string;
  total: number;
};

export const getWeeklySpendingForAI = (transactions: Transaction[]) => {
    const categoryMap: { [key: string]: number } = {
        Food: 0,
        Travel: 0,
        Shopping: 0,
        Bills: 0,
    };
    transactions.forEach(transaction => {
        if (transaction.category && categoryMap[transaction.category]) {
            categoryMap[transaction.category] += transaction.amount;
        }
    });
    const data = Object.entries(categoryMap).map(([name, total]) => ({
        category: name,
        amount: parseFloat(total.toFixed(2)),
    }));
    return JSON.stringify(data);
}

export const getExpensesForAI = (transactions: Transaction[]) => {
  const categoryMap: { [key: string]: number } = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Bills: 0,
  };
  transactions.forEach(transaction => {
      if (transaction.category && categoryMap[transaction.category]) {
          categoryMap[transaction.category] += transaction.amount;
      }
  });
  return Object.entries(categoryMap).map(([name, total]) => ({
      category: name,
      amount: parseFloat(total.toFixed(2)),
  }));
}

type CategoryIcons = {
    [key: string]: LucideIcon;
}

export const categoryIcons: CategoryIcons = {
  Food: UtensilsCrossed,
  Travel: Plane,
  Shopping: ShoppingCart,
  Bills: Landmark
};
