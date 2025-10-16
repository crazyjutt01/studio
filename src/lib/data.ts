'use client';
import type { LucideIcon } from 'lucide-react';
import { Landmark, Plane, ShoppingCart, UtensilsCrossed } from 'lucide-react';

export type Transaction = {
  id: string;
  userId: string;
  date: string;
  amount: number;
  description: string;
  category: 'Food' | 'Travel' | 'Shopping' | 'Bills';
};

export type Budget = {
    id: string;
    userId: string;
    name: string;
    amount: number;
    startDate: string;
    endDate: string;
    category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Overall';
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
  firstName: string;
  lastName: string;
  email: string | null;
  avatarUrl: string;
  monthlyIncome: number;
  savingGoals: string;
  assets: number;
  smartReminders?: boolean;
  dailyDigest?: boolean;
  digestTime?: string;
  region?: string;
  currency?: string;
};

export type Alert = {
  id: string;
  userId: string;
  type: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  trigger?: string;
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

export const regions = [
    { value: 'US', label: 'United States', currency: 'USD' },
    { value: 'GB', label: 'United Kingdom', currency: 'GBP' },
    { value: 'EU', label: 'European Union', currency: 'EUR' },
    { value: 'IN', label: 'India', currency: 'INR' },
    { value: 'JP', label: 'Japan', currency: 'JPY' },
    { value: 'CA', label: 'Canada', currency: 'CAD' },
    { value: 'AU', label: 'Australia', currency: 'AUD' },
];
  
export const currencies: { [key: string]: { symbol: string, name: string } } = {
    USD: { symbol: '$', name: 'US Dollar' },
    GBP: { symbol: '£', name: 'British Pound' },
    EUR: { symbol: '€', name: 'Euro' },
    INR: { symbol: '₹', name: 'Indian Rupee' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    CAD: { symbol: '$', name: 'Canadian Dollar' },
    AUD: { symbol: '$', name: 'Australian Dollar' },
};
