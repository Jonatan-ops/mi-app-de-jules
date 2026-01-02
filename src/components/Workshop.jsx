import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ORDER_STATUS, formatCurrency } from '../lib/constants';
import { CheckCircle, Wrench, Clock, Plus, Trash2 } from 'lucide-react';

export default function Workshop() {
  const pendingApproval = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.APROBACION).toArray());
  const inRepair = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.REPARACION).toArray());

  // Edit Mode state
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [extraItems, setExtraItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', type: 'part', price: '', quantity: 1 });

  const handleApprove = async (orderId) => {
    if (confirm('¿Confirmar que el cliente aprobó el presupuesto?')) {
      await db.orders.update(orderId, { status: ORDER_STATUS.REPARACION });
    }
  };

  const handleFinish = async (orderId) => {
    if (confirm('¿Marcar trabajo como completado y listo para entrega?')) {
      await db.orders.update(orderId, { status: ORDER_STATUS.LISTO });
    }
  };

  // --- Editing Items in Repair ---
  const startEditing = (order) => {
    setEditingOrderId(order.id);
    setExtraItems(order.items || []);
  };

  const addExtraItem = () => {
    if (!newItem.description || !newItem.price) return;
    setExtraItems([...extraItems, { ...newItem, id: Date.now() }]);
    setNewItem({ description: '', type: 'part', price: '', quantity: 1 });
  };

  const removeExtraItem = (itemId) => {
     setExtraItems(extraItems.filter(i => i.id !== itemId));
  };

  const saveExtras = async () => {
    // Recalculate totals
    const subtotal = extraItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    await db.orders.update(editingOrderId, {
      items: extraItems,
      totals: { subtotal, tax, total }
    });
    setEditingOrderId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Pendientes de Aprobación */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-600">
          <Clock /> Pendientes de Aprobación
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingApproval?.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-amber-500">
              <div className="font-bold text-lg mb-1">{order.vehicle.brand} {order.vehicle.model}</div>
              <div className="text-sm text-gray-600 mb-2">Cliente: {order.client.name}</div>
              <div className="bg-gray-100 p-2 rounded text-sm mb-3">
                <div className="font-semibold text-gray-700">Presupuesto:</div>
                <div className="text-right font-mono font-bold">{formatCurrency(order.totals.total)}</div>
              </div>
              <button
                onClick={() => handleApprove(order.id)}
                className="w-full bg-amber-500 text-white font-bold py-2 rounded hover:bg-amber-600 transition-colors"
              >
                Cliente Aprobó
              </button>
            </div>
          ))}
          {pendingApproval?.length === 0 && (
            <div className="text-gray-400 text-sm italic col-span-full">No hay órdenes esperando aprobación.</div>
          )}
        </div>
      </section>

      {/* En Reparación */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-600">
          <Wrench /> En Reparación
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inRepair?.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500 relative">
              <div className="font-bold text-lg mb-1">{order.vehicle.brand} {order.vehicle.model}</div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Diagnóstico:</span> {order.diagnosis.substring(0, 50)}...
              </div>

              {/* Items List (Editable or View) */}
              {editingOrderId === order.id ? (
                <div className="bg-blue-50 p-2 rounded mb-3 border border-blue-200">
                  <div className="text-xs font-bold text-blue-800 mb-2">Agregando Ítems Adicionales:</div>
                  <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                    {extraItems.map(item => (
                       <div key={item.id} className="flex justify-between text-xs bg-white p-1 rounded">
                         <span>{item.description} ({item.quantity})</span>
                         <button onClick={() => removeExtraItem(item.id)} className="text-red-500"><Trash2 size={12}/></button>
                       </div>
                    ))}
                  </div>
                  <div className="flex gap-1 mb-2">
                    <input className="w-full text-xs p-1 rounded" placeholder="Desc." value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                    <input className="w-12 text-xs p-1 rounded" placeholder="$$" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                    <button onClick={addExtraItem} className="bg-blue-600 text-white p-1 rounded"><Plus size={12}/></button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveExtras} className="flex-1 bg-green-600 text-white text-xs py-1 rounded">Guardar</button>
                    <button onClick={() => setEditingOrderId(null)} className="flex-1 bg-gray-400 text-white text-xs py-1 rounded">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <ul className="text-xs text-gray-500 list-disc list-inside bg-gray-50 p-2 rounded mb-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <li key={idx}>{item.description}</li>
                    ))}
                    {order.items.length > 3 && <li>...</li>}
                  </ul>
                  <button
                    onClick={() => startEditing(order)}
                    className="text-xs text-blue-600 hover:underline w-full text-left"
                  >
                    + Modificar / Agregar Ítems
                  </button>
                </div>
              )}

              <button
                onClick={() => handleFinish(order.id)}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
              >
                <CheckCircle size={18} />
                Terminar Trabajo
              </button>
            </div>
          ))}
          {inRepair?.length === 0 && (
            <div className="text-gray-400 text-sm italic col-span-full">No hay vehículos en reparación activa.</div>
          )}
        </div>
      </section>
    </div>
  );
}
