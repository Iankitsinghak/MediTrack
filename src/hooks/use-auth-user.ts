
"use client"

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { BaseUser } from '@/lib/types';
import { onAuthStateChanged, User } from 'firebase/auth';

export function useAuthUser<T extends BaseUser>(collectionName: string) {
  const [user, setUser] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser: User | null) => {
      if (authUser) {
        try {
          const docRef = doc(db, collectionName, authUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser({ id: docSnap.id, ...docSnap.data() } as T);
          } else {
            // This case might happen if the user is authenticated but their profile
            // is not in the expected collection.
            setError(new Error("User profile not found in the specified collection."));
          }
        } catch (e: any) {
          setError(e);
        } finally {
          setLoading(false);
        }
      } else {
        // No user is signed in.
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [collectionName]);

  return { user, loading, error, setUser };
}
