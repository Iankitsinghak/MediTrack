"use client"

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, QueryConstraint } from 'firebase/firestore';

export function useFirestore<T>(collectionName: string, ...constraints: (QueryConstraint | undefined)[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const validConstraints = constraints.filter(c => c !== undefined) as QueryConstraint[];

  useEffect(() => {
    const q = query(collection(db, collectionName), ...validConstraints);
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      setData(documents);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError(err);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, ...validConstraints.map(c => c.toString())]); // Naive dependency array, might need optimization for complex constraints

  return { data, loading, error };
}
