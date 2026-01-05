import { useState, useEffect } from 'react';
import { db, storage } from './firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- HOOKS ---

export function useOrders(filterStatus = null) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    if (filterStatus) {
      q = query(collection(db, 'orders'), where('status', '==', filterStatus), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Timestamp to Date/ISO string if needed for compatibility
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt
      }));
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [filterStatus]);

  return { orders, loading };
}

export function useMechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'mechanics'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMechanics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching mechanics:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { mechanics, loading };
}

// --- ACTIONS ---

export async function createOrder(orderData, files = []) {
  try {
    // 1. Create order doc first to get ID
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date(), // Firestore Timestamp
      documents: [] // Placeholder
    });

    // 2. Upload files if any
    if (files.length > 0) {
      const uploadedDocs = await Promise.all(files.map(async (file) => {
        const storageRef = ref(storage, `orders/${docRef.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return { name: file.name, url, type: file.type };
      }));

      // 3. Update order with file URLs
      await updateDoc(docRef, { documents: uploadedDocs });
    }

    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function updateOrder(id, data) {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, data);
}

export async function addMechanic(data) {
  await addDoc(collection(db, 'mechanics'), data);
}

export async function deleteMechanic(id) {
  await deleteDoc(doc(db, 'mechanics', id));
}
