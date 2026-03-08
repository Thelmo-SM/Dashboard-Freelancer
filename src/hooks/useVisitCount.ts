import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export function useVisitCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const getVisitCount = async () => {
      const snapshot = await getDocs(collection(db, 'visits'));
      setCount(snapshot.size);
    };
    getVisitCount();
  }, []);

  return count;
}
