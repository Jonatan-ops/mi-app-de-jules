// Constants for Statuses
export const ORDER_STATUS = {
  RECEPCION: 'Recepción',
  DIAGNOSTICO: 'Diagnóstico', // This is technically the step where we create the diagnosis, but the order remains in Recepcion until diagnosis starts? Or is it a state?
  // Based on flow: Recepcion -> (Diagnosis happens) -> Pendiente Aprobacion -> Reparacion -> Listo -> Pagado
  // The user requirement says:
  // 1. Recepcion creates order in state 'Recepción'
  // 2. Diagnosis view sees 'Recepción'. Changes state to 'Diagnóstico' (or 'Pendiente Aprobación' after quote?)
  // The user prompt said: "Action: Botón 'Generar Presupuesto' que cambia el estado a Pendiente Aprobación."
  // And "Permite al mecánico escribir el diagnóstico técnico final y cambiar el estado a Diagnóstico."

  // Let's stick to user defined states mostly:
  RECEPCION: 'Recepción',
  DIAGNOSTICO: 'Diagnóstico',
  APROBACION: 'Pendiente Aprobación',
  REPARACION: 'En Reparación',
  LISTO: 'Listo',
  PAGADO: 'Pagado'
};

const STORAGE_KEY = 'fd_auto_repair_orders';

// Helper to get orders
export const getOrders = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save orders
const saveOrders = (orders) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  // Dispatch a custom event so components can subscribe to updates if needed,
  // though we will likely use a simple poll or context re-fetch.
  window.dispatchEvent(new Event('storage-update'));
};

// Add a new order
export const addOrder = (client, vehicle, issue) => {
  const orders = getOrders();
  const newOrder = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    status: ORDER_STATUS.RECEPCION,
    client,
    vehicle,
    issue,
    diagnosis: '',
    items: [], // { description, type: 'part'|'labor', price, quantity }
    totals: { subtotal: 0, tax: 0, total: 0 }
  };
  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
};

// Update an order
export const updateOrder = (orderId, updates) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    saveOrders(orders);
    return orders[index];
  }
  return null;
};

// Delete an order (optional, for cleanup)
export const deleteOrder = (orderId) => {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== orderId);
  saveOrders(filtered);
};

// Hook for React to subscribe to storage changes
import { useState, useEffect } from 'react';

export const useOrders = () => {
  const [orders, setOrders] = useState(getOrders());

  useEffect(() => {
    const handleStorageChange = () => {
      setOrders(getOrders());
    };

    window.addEventListener('storage-update', handleStorageChange);
    // Also listen to 'storage' event for multi-tab sync
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage-update', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    ORDER_STATUS
  };
};
