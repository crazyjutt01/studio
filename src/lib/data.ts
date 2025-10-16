'use client';
import type { LucideIcon } from 'lucide-react';
import { Landmark, MoreHorizontal, Plane, ShoppingCart, UtensilsCrossed, Trophy, Star, Shield, Gem, Crown, Rocket } from 'lucide-react';

export type Transaction = {
  id: string;
  userId: string;
  date: string;
  amount: number;
  description: string;
  category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Others';
};

export type Budget = {
    id: string;
    userId: string;
    name: string;
    amount: number;
    startDate: string;
    endDate: string;
    category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Overall' | 'Others';
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
  xp?: number;
  level?: number;
  coins?: number;
  streak?: number;
  badges?: string[];
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

export type BadgeInfo = {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    xpThreshold?: number;
    type?: 'level' | 'transactions' | 'savings_goal_amount';
    value?: number;
  };
  
  export const badges: BadgeInfo[] = [
    { id: 'first-transaction', name: 'First Step', description: 'Added your first transaction.', icon: Star, xpThreshold: 10 },
    { id: 'first-budget', name: 'Budget Beginner', description: 'Created your first budget.', icon: Shield, xpThreshold: 25 },
    { id: 'first-goal', name: 'Goal Setter', description: 'Set your first savings goal.', icon: Rocket, xpThreshold: 50 },
    { id: 'level-5', name: 'Level 5', description: 'Reached level 5.', icon: Trophy, type: 'level', value: 5 },
    { id: 'level-10', name: 'Level 10', description: 'Reached level 10.', icon: Gem, type: 'level', value: 10 },
    { id: 'transaction-master', name: 'Transaction Master', description: 'Logged 50 transactions.', icon: Crown, type: 'transactions', value: 50 },
    { id: 'big-saver', name: 'Big Saver', description: 'Reached a savings goal of over 10,000.', icon: Landmark, type: 'savings_goal_amount', value: 10000 },
  ];

export const getWeeklySpendingForAI = (transactions: Transaction[]) => {
    const categoryMap: { [key: string]: number } = {
        Food: 0,
        Travel: 0,
        Shopping: 0,
        Bills: 0,
        Others: 0,
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
    Others: 0,
  };
  transactions.forEach(transaction => {
      if (transaction.category && Object.prototype.hasOwnProperty.call(categoryMap, transaction.category)) {
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
  Bills: Landmark,
  Others: MoreHorizontal
};

export const regions = [
    { value: 'US', label: 'United States', currency: 'USD' },
    { value: 'GB', label: 'United Kingdom', currency: 'GBP' },
    { value: 'EU', label: 'European Union', currency: 'EUR' },
    { value: 'IN', label: 'India', currency: 'INR' },
    { value: 'JP', label: 'Japan', currency: 'JPY' },
    { value: 'CA', label: 'Canada', currency: 'CAD' },
    { value: 'AU', label: 'Australia', currency: 'AUD' },
    { value: 'PK', label: 'Pakistan', currency: 'PKR' },
];
  
export const currencies: { [key: string]: { symbol: string, name: string } } = {
    USD: { symbol: '$', name: 'US Dollar' },
    GBP: { symbol: '£', name: 'British Pound' },
    EUR: { symbol: '€', name: 'Euro' },
    INR: { symbol: '₹', name: 'Indian Rupee' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    CAD: { symbol: '$', name: 'Canadian Dollar' },
    AUD: { symbol: '$', name: 'Australian Dollar' },
    PKR: { symbol: '₨', name: 'Pakistani Rupee' },
};
