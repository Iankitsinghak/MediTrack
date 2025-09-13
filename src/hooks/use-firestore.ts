"use client"

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, QueryConstraint } from 'firebase/firestore';

export function useFirestore<T>(collectionName: string, ...constraints: (QueryConstraint | undefined)[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const validConstraints = constraints.filter(c => c !== undefined) as QueryConstraint[];

  // Create a stable dependency from the constraints
  const constraintsJSON = useMemo(() => JSON.stringify(validConstraints.map(c => {
      // This is a simplified way to serialize constraints.
      // A more robust solution might inspect the constraint properties.
      return c.type;
  })), [validConstraints]);


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
  }, [collectionName, constraintsJSON]); 

  return { data, loading, error };
}
