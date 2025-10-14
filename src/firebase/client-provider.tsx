'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider, useUser, useFirestore } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { seedDatabase } from './firestore/mutations';
import { collection, getDocs } from 'firebase/firestore';


interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <DataSeeder />
      {children}
    </FirebaseProvider>
  );
}

function DataSeeder() {
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    async function checkAndSeed() {
      if (user && firestore) {
        const transactionsCol = collection(firestore, `users/${user.uid}/transactions`);
        try {
          const snapshot = await getDocs(transactionsCol);
          if (snapshot.empty) {
            console.log('Seeding database for new user...');
            await seedDatabase(firestore, user.uid);
          }
        } catch (error) {
           console.error("Error checking or seeding database:", error);
        }
      }
    }
    checkAndSeed();
  }, [user, firestore]);

  return null; // This component doesn't render anything
}
