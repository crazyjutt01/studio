'use client';

import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserData } from '@/lib/data';
import { currencies } from '@/lib/data';

export function useCurrency() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);

  const currencyCode = userData?.currency || 'USD';
  const currencySymbol = currencies[currencyCode]?.symbol || '$';

  return { currencyCode, currencySymbol };
}
