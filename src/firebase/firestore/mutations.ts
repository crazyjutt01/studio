'use client';

import {
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Transaction, SavingsGoal, User } from '@/lib/data';

// Default data for seeding
const defaultTransactions: Omit<Transaction, 'id' | 'userId'>[] = [
    { date: '2024-07-22', amount: 5.75, description: 'The Coffee Shop', category: 'Food' },
    { date: '2024-07-22', amount: 89.40, description: 'Grocery Mart', category: 'Food' },
    { date: '2024-07-21', amount: 450.00, description: 'FlyHigh Airlines', category: 'Travel' },
    { date: '2024-07-20', amount: 999.99, description: 'Tech Gadgets', category: 'Shopping' },
    { date: '2024-07-20', amount: 120.34, description: 'City Power & Light', category: 'Bills' },
];

const defaultSavingsGoals: Omit<SavingsGoal, 'id' | 'userId'>[] = [
    { name: 'New Car Fund', targetAmount: 25000, currentAmount: 12500 },
    { name: 'Vacation to Japan', targetAmount: 8000, currentAmount: 6000 },
    { name: 'Emergency Fund', targetAmount: 10000, currentAmount: 9500 },
];

export function seedDatabase(db: Firestore, userId: string) {
  const batch = writeBatch(db);

  // Seed user profile
  const userRef = doc(db, 'users', userId);
  const userData: Partial<User> = {
    email: 'anonymous@example.com',
    name: 'Anonymous User',
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

  // Commit the batch
  batch.commit().catch(error => {
    const permissionError = new FirestorePermissionError({
        path: `users/${userId}`,
        operation: 'write',
        requestResourceData: {
          message: 'This write operation is a batch write to seed the database for a new user.',
          userData,
          defaultTransactions,
          defaultSavingsGoals,
        },
      });
      errorEmitter.emit('permission-error', permissionError);
  });
}

/** Non-blocking add document */
export function addDocumentNonBlocking(colRef: collection, data: any) {
  addDoc(colRef, data).catch(error => {
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
