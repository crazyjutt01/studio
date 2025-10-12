import type { LucideIcon } from 'lucide-react';
import { Landmark, Plane, ShoppingCart, UtensilsCrossed } from 'lucide-react';

export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: 'Food' | 'Travel' | 'Shopping' | 'Bills';
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  description: string;
};

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
  monthlyIncome: number;
  savingGoals: string;
};

export type CategoryData = {
  name: string;
  total: number;
  icon: LucideIcon;
};

export const user: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: 'user-avatar-1',
  monthlyIncome: 5000,
  savingGoals: 'Save for a new car and a vacation to Japan.',
};

export const transactions: Transaction[] = [
  { id: '1', date: '2024-07-22', merchant: 'The Coffee Shop', amount: 5.75, category: 'Food' },
  { id: '2', date: '2024-07-22', merchant: 'Grocery Mart', amount: 89.40, category: 'Food' },
  { id: '3', date: '2024-07-21', merchant: 'FlyHigh Airlines', amount: 450.00, category: 'Travel' },
  { id: '4', date: '2024-07-20', merchant: 'Tech Gadgets', amount: 999.99, category: 'Shopping' },
  { id: '5', date: '2024-07-20', merchant: 'City Power & Light', amount: 120.34, category: 'Bills' },
  { id: '6', date: '2024-07-19', merchant: 'The Great Steak', amount: 75.20, category: 'Food' },
  { id: '7', date: '2024-07-18', merchant: 'Style Central', amount: 150.50, category: 'Shopping' },
  { id: '8', date: '2024-07-17', merchant: 'Downtown Parking', amount: 25.00, category: 'Travel' },
];

export const savingsGoals: SavingsGoal[] = [
  { id: '1', name: 'New Car Fund', targetAmount: 25000, currentAmount: 12500, description: 'Saving for a down payment on a new car.' },
  { id: '2', name: 'Vacation to Japan', targetAmount: 8000, currentAmount: 6000, description: 'Dream trip to explore Tokyo and Kyoto.' },
  { id: '3', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 9500, description: 'For unexpected life events.' },
];

export const getCategoryData = (): CategoryData[] => {
  const categoryMap: { [key: string]: { total: number; icon: LucideIcon } } = {
    Food: { total: 0, icon: UtensilsCrossed },
    Travel: { total: 0, icon: Plane },
    Shopping: { total: 0, icon: ShoppingCart },
    Bills: { total: 0, icon: Landmark },
  };

  transactions.forEach(transaction => {
    if (categoryMap[transaction.category]) {
      categoryMap[transaction.category].total += transaction.amount;
    }
  });

  return Object.entries(categoryMap).map(([name, { total, icon }]) => ({
    name,
    total: parseFloat(total.toFixed(2)),
    icon,
  }));
};

export const getWeeklySpendingForAI = () => {
    const data = getCategoryData();
    return JSON.stringify(data.map(d => ({ category: d.name, amount: d.total })));
}

export const getExpensesForAI = () => {
  const data = getCategoryData();
  return data.map(d => ({ category: d.name, amount: d.total }));
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
