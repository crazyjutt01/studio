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
        const batch = writeBatch(db);

        // Seed transactions
        const transactionsCol = collection(db, `users/${userId}/transactions`);
        defaultTransactions.forEach(transaction => {
            const docRef = doc(transactionsCol);
            batch.set(docRef, { ...transaction, userId });
        });

        // Seed savings goals
        const savingsCol = collection(db, `users/${userId}/savingGoals`);
        defaultSavingsGoals.forEach(goal => {
            const docRef = doc(savingsCol);
            batch.set(docRef, { ...goal, userId });
        });

        // Seed budgets
        const budgetsCol = collection(db, `users/${userId}/budgets`);
        defaultBudgets.forEach(budget => {
            const docRef = doc(budgetsCol);
            batch.set(docRef, { ...budget, userId });
        });

        // Seed alerts
        const alertsCol = collection(db, `users/${userId}/alerts`);
        defaultAlerts.forEach(alert => {
            const docRef = doc(alertsCol);
            batch.set(docRef, { ...alert, userId });
        });

        await batch.commit();

    } catch (error) {
        console.error("Error seeding database:", error);
        // We can't use the permission error emitter here reliably during the first write.
        // A console error is sufficient for debugging this initial setup phase.
        if (error instanceof Error && 'code' in error && (error as any).code === 'permission-denied') {
             throw new Error("Firestore Security Rules denied the initial database seed. Please check your rules to allow writes to the user's own data path.");
        }
        throw error; // Re-throw other errors
    }
}
