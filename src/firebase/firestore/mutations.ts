'use client';

import {
  writeBatch,
  type Firestore,
} from 'firebase/firestore';

export async function seedDatabase(db: Firestore, userId: string) {
    try {
        const batch = writeBatch(db);
        // This function is now empty but preserved to avoid breaking imports.
        // All data seeding has been removed per user request.
        // You could add new seeding logic here if needed in the future.
        await batch.commit();

    } catch (error) {
        console.error("Error seeding database:", error);
        if (error instanceof Error && 'code' in error && (error as any).code === 'permission-denied') {
             throw new Error("Firestore Security Rules denied the initial database seed. Please check your rules to allow writes to the user's own data path.");
        }
        throw error; // Re-throw other errors
    }
}
