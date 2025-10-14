'use client';

import {
  doc,
  collection,
  writeBatch,
  type Firestore,
  addDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Transaction, SavingsGoal, User, Budget } from '@/lib/data';

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

export async function seedDatabase(db: Firestore, userId: string) {
  const batch = writeBatch(db);

  // Seed user profile
  const userRef = doc(db, 'users', userId);
  const userData: Partial<User> = {
    email: 'demo@example.com', // Using a placeholder for anonymous auth
    name: 'Demo User',
    avatarUrl: 'user-avatar-1',
    monthlyIncome: 5000,
    savingGoals: 'Save for a new car and a vacation to Japan.',
  };
  batch.set(userRef, userData, { merge: true });

  // Seed transactions
  const transactionsCol = collection(db, `users/${userId}/transactions`);
  defaultTransactions.forEach(transaction => {
    const newTransactionRef = doc(transactionsCol);
    batch.set(newTransactionRef, { ...transaction, userId });
  });

  // Seed savings goals
  const savingsCol = collection(db, `users/${userId}/savingGoals`);
  defaultSavingsGoals.forEach(goal => {
    const newGoalRef = doc(savingsCol);
    batch.set(newGoalRef, { ...goal, userId });
  });

  // Seed budgets
  const budgetsCol = collection(db, `users/${userId}/budgets`);
  defaultBudgets.forEach(budget => {
    const newBudgetRef = doc(budgetsCol);
    batch.set(newBudgetRef, { ...budget, userId });
  });

  // Commit the batch
  try {
    await batch.commit();
  } catch(error) {
    const permissionError = new FirestorePermissionError({
        path: `users/${userId}`,
        operation: 'write',
        requestResourceData: {
          message: 'This write operation is a batch write to seed the database for a new user.',
        },
      });
      errorEmitter.emit('permission-error', permissionError);
  }
}

/** Non-blocking add document */
export function addDocument(colRef: collection, data: any) {
  return addDoc(colRef, data).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      })
    );
  });
}
