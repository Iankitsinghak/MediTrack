
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
        setLoading(true);
        try {
          const docRef = doc(db, collectionName, authUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser({ ...docSnap.data(), id: docSnap.id, uid: authUser.uid } as T);
          } else {
            setError(new Error(`User profile not found in '${collectionName}'.`));
            setUser(null);
          }
        } catch (e: any) {
          console.error("useAuthUser hook error:", e);
          setError(e);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [collectionName]);

  return { user, loading, error, setUser };
}
