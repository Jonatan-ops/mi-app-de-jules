import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function useOrders(filterStatus = null) {
  const { companyId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
        setOrders([]);
        setLoading(false);
        return;
    }

    let constraints = [where('companyId', '==', companyId), orderBy('createdAt', 'desc')];

    if (filterStatus) {
      constraints = [
          where('companyId', '==', companyId),
          where('status', '==', filterStatus),
          orderBy('createdAt', 'desc')
      ];
    }

    const q = query(collection(db, 'orders'), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt
      }));
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [companyId, filterStatus]);

  return { orders, loading };
}

export function useMechanics() {
  const { companyId } = useAuth();
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
        setMechanics([]);
        setLoading(false);
        return;
    }

    const q = query(collection(db, 'mechanics'), where('companyId', '==', companyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMechanics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching mechanics:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, [companyId]);

  return { mechanics, loading };
}
