import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ORDER_STATUS, formatCurrency } from '../lib/constants';
import { CheckCircle, Wrench, Clock, Plus, Trash2, Eye, X } from 'lucide-react';

export default function Workshop() {
  const pendingApproval = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.APROBACION).toArray());
  const inRepair = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.REPARACION).toArray());

  // Edit Mode state
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [extraItems, setExtraItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', type: 'part', price: '', quantity: 1 });

  // View Details Modal State
  const [viewOrderId, setViewOrderId] = useState(null);
  const viewOrder = useLiveQuery(
    () => viewOrderId ? db.orders.get(viewOrderId) : null,
    [viewOrderId]
  );

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
    <div className="max-w-6xl mx-auto space-y-8 relative">

      {/* Detail Modal */}
      {viewOrderId && viewOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
               <h3 className="text-xl font-bold">Detalle de Orden #{viewOrder.id}</h3>
               <button onClick={() => setViewOrderId(null)} className="p-1 hover:bg-gray-100 rounded-full"><X/></button>
             </div>
             <div className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <p className="font-bold text-gray-500">Cliente</p>
                   <p>{viewOrder.client.name}</p>
                   <p>{viewOrder.client.phone}</p>
                 </div>
                 <div>
                   <p className="font-bold text-gray-500">Vehículo</p>
                   <p>{viewOrder.vehicle.brand} {viewOrder.vehicle.model}</p>
                   <p>{viewOrder.vehicle.plate}</p>
                 </div>
               </div>

               <div className="bg-gray-50 p-3 rounded">
                 <p className="font-bold text-gray-500 mb-1">Diagnóstico</p>
                 <p className="text-sm">{viewOrder.diagnosis}</p>
               </div>

               <div>
                 <p className="font-bold text-gray-500 mb-2">Items Presupuestados</p>
                 <table className="w-full text-sm">
                   <thead className="bg-gray-100">
                     <tr>
                       <th className="text-left p-2">Desc.</th>
                       <th className="text-center p-2">Cant.</th>
                       <th className="text-right p-2">Total</th>
                     </tr>
                   </thead>
                   <tbody>
                     {viewOrder.items.map((item, idx) => (
                       <tr key={idx} className="border-b">
                         <td className="p-2">{item.description}</td>
                         <td className="p-2 text-center">{item.quantity}</td>
                         <td className="p-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               <div className="text-right font-bold text-lg pt-2">
                 Total: {formatCurrency(viewOrder.totals.total)}
               </div>

               {viewOrder.commitmentDate && (
                 <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                   Compromiso de Entrega: {new Date(viewOrder.commitmentDate).toLocaleDateString()}
                 </div>
               )}
             </div>
             <div className="p-4 border-t bg-gray-50 flex justify-end">
               <button onClick={() => setViewOrderId(null)} className="bg-gray-800 text-white px-4 py-2 rounded-lg">Cerrar</button>
             </div>
          </div>
        </div>
      )}

      {/* Pendientes de Aprobación */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-600">
          <Clock /> Pendientes de Aprobación
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingApproval?.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-amber-500 flex flex-col h-full">
              <div className="font-bold text-lg mb-1">{order.vehicle.brand} {order.vehicle.model}</div>
              <div className="text-sm text-gray-600 mb-2">Cliente: {order.client.name}</div>
              <div className="bg-gray-100 p-2 rounded text-sm mb-3">
                <div className="font-semibold text-gray-700">Presupuesto:</div>
                <div className="text-right font-mono font-bold">{formatCurrency(order.totals.total)}</div>
              </div>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => setViewOrderId(order.id)}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded hover:bg-gray-300 transition-colors flex justify-center items-center gap-1 text-sm"
                >
                  <Eye size={16}/> Ver
                </button>
                <button
                  onClick={() => handleApprove(order.id)}
                  className="flex-1 bg-amber-500 text-white font-bold py-2 rounded hover:bg-amber-600 transition-colors text-sm"
                >
                  Aprobar
                </button>
              </div>
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
            <div key={order.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500 relative flex flex-col h-full">
              <div className="font-bold text-lg mb-1 flex justify-between">
                 <span>{order.vehicle.brand} {order.vehicle.model}</span>
                 <button onClick={() => setViewOrderId(order.id)} className="text-gray-400 hover:text-blue-600"><Eye size={20}/></button>
              </div>
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
                className="w-full mt-auto bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
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
