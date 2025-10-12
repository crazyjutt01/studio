import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Transaction, SavingsGoal } from './data';
import { user } from './data';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const defaultTransactions: Omit<Transaction, 'id' | 'userId'>[] = [
    { date: '2024-07-22', description: 'The Coffee Shop', amount: 5.75, category: 'Food' },
    { date: '2024-07-22', description: 'Grocery Mart', amount: 89.40, category: 'Food' },
    { date: '2024-07-21', description: 'FlyHigh Airlines', amount: 450.00, category: 'Travel' },
    { date: '2024-07-20', description: 'Tech Gadgets', amount: 999.99, category: 'Shopping' },
    { date: '2024-07-20', description: 'City Power & Light', amount: 120.34, category: 'Bills' },
    { date: '2024-07-19', description: 'The Great Steak', amount: 75.20, category: 'Food' },
    { date: '2024-07-18', description: 'Style Central', amount: 150.50, category: 'Shopping' },
    { date: '2024-07-17', description: 'Downtown Parking', amount: 25.00, category: 'Travel' },
  ];

const defaultSavingsGoals: Omit<SavingsGoal, 'id' | 'userId'>[] = [
    { name: 'New Car Fund', targetAmount: 25000, currentAmount: 12500 },
    { name: 'Vacation to Japan', targetAmount: 8000, currentAmount: 6000 },
    { name: 'Emergency Fund', targetAmount: 10000, currentAmount: 9500 },
  ];

export async function seedDatabase(db: Firestore, userId: string) {
    const transactionsCol = collection(db, `users/${userId}/transactions`);
    for (const trans of defaultTransactions) {
      const transWithUser: Omit<Transaction, 'id'> = { ...trans, userId };
      await addDoc(transactionsCol, transWithUser).catch(e => console.error(e));
    }

    const savingsCol = collection(db, `users/${userId}/savingGoals`);
    for (const goal of defaultSavingsGoals) {
        const goalWithUser: Omit<SavingsGoal, 'id'> = { ...goal, userId };
        await addDoc(savingsCol, goalWithUser).catch(e => console.error(e));
    }

    const userDocRef = doc(db, `users/${userId}`);
    const userData = {
        ...user,
        id: userId,
        email: 'anonymous@example.com',
    }
    await setDoc(userDocRef, userData, { merge: true }).catch(e => console.error(e));
}
