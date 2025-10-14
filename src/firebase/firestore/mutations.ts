'use client';

import {
  doc,
  collection,
  writeBatch,
  type Firestore,
  addDoc,
  setDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Transaction, SavingsGoal, UserData, Budget, Alert } from '@/lib/data';
import { addDocumentNonBlocking } from '@/firebase';

// Default data for seeding
const defaultTransactions: Omit<Transaction, 'id' | 'userId'>[] = [
    { date: new Date().toISOString(), amount: 5.75, description: 'The Coffee Shop', category: 'Food' },
    { date: new Date().toISOString(), amount: 89.40, description: 'Grocery Mart', category: 'Food' },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), amount: 450.00, description: 'FlyHigh Airlines', category: 'Travel' },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), amount: 999.99, description: 'Tech Gadgets', category: 'Shopping' },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), amount: 120.34, description: 'City Power & Light', category: 'Bills' },
];

const defaultSavingsGoals: Omit<SavingsGoal, 'id' | 'userId'>[] = [
    { name: 'New Car Fund', targetAmount: 25000, currentAmount: 12500, deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() },
    { name: 'Vacation to Japan', targetAmount: 8000, currentAmount: 6000, deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString() },
    { name: 'Emergency Fund', targetAmount: 10000, currentAmount: 9500 },
];

const defaultBudgets: Omit<Budget, 'id' | 'userId'>[] = [
    { name: 'Monthly Groceries', amount: 500, startDate: new Date().toISOString(), endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString() },
    { name: 'Entertainment', amount: 200, startDate: new Date().toISOString(), endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString() }
];

const defaultAlerts: Omit<Alert, 'id' | 'userId'>[] = [
    { type: 'Overspending', message: 'You have exceeded your monthly budget for Shopping by $50.', timestamp: new Date().toISOString(), isRead: false },
    { type: 'Goal Update', message: 'You are 75% of the way to your Vacation to Japan goal!', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), isRead: true },
]

export async function seedDatabase(db: Firestore, userId: string) {
    try {
        // NOTE: The user document is now created on sign-up. 
        // This function seeds the sub-collections.

        // Seed transactions
        const transactionsCol = collection(db, `users/${userId}/transactions`);
        for (const transaction of defaultTransactions) {
            await addDoc(transactionsCol, { ...transaction, userId });
        }

        // Seed savings goals
        const savingsCol = collection(db, `users/${userId}/savingGoals`);
        for (const goal of defaultSavingsGoals) {
            await addDoc(savingsCol, { ...goal, userId });
        }

        // Seed budgets
        const budgetsCol = collection(db, `users/${userId}/budgets`);
        for (const budget of defaultBudgets) {
            await addDoc(budgetsCol, { ...budget, userId });
        }

        // Seed alerts
        const alertsCol = collection(db, `users/${userId}/alerts`);
        for (const alert of defaultAlerts) {
            await addDoc(alertsCol, { ...alert, userId });
        }

    } catch (error) {
        console.error("Error seeding database:", error);
        // We can't use the permission error emitter here reliably during the first write.
        // A console error is sufficient for debugging this initial setup phase.
        if (error instanceof Error && 'code' in error && error.code === 'permission-denied') {
             throw new Error("Firestore Security Rules denied the initial database seed. Please check your rules to allow writes to the user's own data path.");
        }
        throw error; // Re-throw other errors
    }
}
