import React, { useState } from 'react';
import { useOrders } from '../hooks/useFirestoreData';
import { updateOrder } from '../lib/firestoreService';
import { ORDER_STATUS, formatCurrency } from '../lib/constants';
import { CheckCircle, Wrench, Clock, Plus, Trash2, Eye, X, Archive, AlertOctagon } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { useAuth } from '../contexts/AuthContext';

export default function Workshop() {
  const { userRole } = useAuth();
  const { orders } = useOrders(); // Fetch all and filter locally for simplicity and speed

  const pendingApproval = orders.filter(o => o.status === ORDER_STATUS.APROBACION);
  const inRepair = orders.filter(o => o.status === ORDER_STATUS.REPARACION);

  // Edit Mode state
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [extraItems, setExtraItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', type: 'part', price: '', quantity: 1 });

  // View Details Modal State
  const [viewOrderId, setViewOrderId] = useState(null);

  // Find viewOrder from orders list
  const viewOrder = orders.find(o => o.id === viewOrderId);

  const handleApprove = async (orderId) => {
    if (confirm('¿Confirmar que el cliente aprobó el presupuesto?')) {
      await updateOrder(orderId, { status: ORDER_STATUS.REPARACION });
    }
  };

  const handleDiscard = async (orderId) => {
    if (confirm('¿Está seguro de DESCARTAR este presupuesto? El cliente no aprobó.')) {
      await updateOrder(orderId, { status: ORDER_STATUS.CANCELADO });
    }
  };

  const handleFinish = async (orderId) => {
    if (confirm('¿Marcar trabajo como completado y listo para entrega?')) {
      await updateOrder(orderId, { status: ORDER_STATUS.LISTO });
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

    await updateOrder(editingOrderId, {
      items: extraItems,
      totals: { subtotal, tax, total }
    });
    setEditingOrderId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Detail Modal */}
      <Modal isOpen={!!viewOrderId} onClose={() => setViewOrderId(null)} title={`Orden #${viewOrderId}`}>
        {viewOrder && (
          <div className="space-y-4">
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

             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
               <p className="font-bold text-gray-500 mb-1 text-xs uppercase">Diagnóstico</p>
               <p className="text-sm">{viewOrder.diagnosis}</p>
             </div>

             <div>
               <p className="font-bold text-gray-500 mb-2 text-xs uppercase">Items</p>
               <div className="border border-slate-100 rounded-xl overflow-hidden">
                 <table className="w-full text-sm">
                   <thead className="bg-slate-50">
                     <tr>
                       <th className="text-left p-3 font-semibold text-slate-500">Desc.</th>
                       <th className="text-center p-3 font-semibold text-slate-500">Cant.</th>
                       <th className="text-right p-3 font-semibold text-slate-500">Total</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {viewOrder.items.map((item, idx) => (
                       <tr key={idx}>
                         <td className="p-3">{item.description}</td>
                         <td className="p-3 text-center">{item.quantity}</td>
                         <td className="p-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>

             <div className="text-right font-bold text-lg pt-2 text-slate-800">
               Total: {formatCurrency(viewOrder.totals.total)}
             </div>

             {viewOrder.commitmentDate && (
                 <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100">
                   Compromiso de Entrega: <strong>{new Date(viewOrder.commitmentDate).toLocaleDateString()}</strong>
                 </div>
             )}
          </div>
        )}
      </Modal>

      {/* Pendientes de Aprobación */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
          <div className="bg-orange-100 text-orange-600 p-2 rounded-lg"><Clock size={20} /></div>
          Pendientes de Aprobación
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingApproval?.map(order => (
            <Card key={order.id} className="flex flex-col h-full hover:shadow-lg transition-all border-l-4 border-l-orange-500">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-lg text-slate-800">{order.vehicle.brand} {order.vehicle.model}</div>
                <Badge color="orange">Pendiente</Badge>
              </div>
              <div className="text-sm text-gray-500 mb-4">{order.client.name}</div>

              <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                <div className="text-xs text-gray-500 uppercase font-bold">Presupuesto</div>
                <div className="text-right font-mono font-bold text-lg text-slate-800">{formatCurrency(order.totals.total)}</div>
              </div>

              <div className="mt-auto flex gap-2">
                <Button variant="secondary" onClick={() => setViewOrderId(order.id)} className="flex-1 px-2" title="Ver Detalle">
                  <Eye size={16}/>
                </Button>
                <Button variant="primary" onClick={() => handleApprove(order.id)} className="flex-1 bg-orange-500 hover:bg-orange-600 shadow-orange-500/30">
                  Aprobar
                </Button>
                {/* Only Admin can discard */}
                {userRole === 'admin' && (
                  <Button variant="danger" onClick={() => handleDiscard(order.id)} className="flex-none px-3" title="Descartar Presupuesto">
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {pendingApproval?.length === 0 && (
            <div className="text-gray-400 text-sm italic col-span-full py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              No hay órdenes esperando aprobación.
            </div>
          )}
        </div>
      </section>

      {/* En Reparación */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Wrench size={20} /></div>
          En Reparación
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inRepair?.map(order => (
            <Card key={order.id} className="relative flex flex-col h-full hover:shadow-lg transition-all border-l-4 border-l-blue-500">
              <div className="font-bold text-lg mb-1 flex justify-between items-center text-slate-800">
                 <span>{order.vehicle.brand} {order.vehicle.model}</span>
                 <button onClick={() => setViewOrderId(order.id)} className="text-slate-400 hover:text-blue-600"><Eye size={18}/></button>
              </div>
              <div className="text-sm text-gray-600 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                "{order.diagnosis.substring(0, 50)}..."
              </div>

              {/* Items List (Editable or View) */}
              {editingOrderId === order.id ? (
                <div className="bg-blue-50 p-3 rounded-xl mb-4 border border-blue-100">
                  <div className="text-xs font-bold text-blue-800 mb-2 uppercase">Agregando Ítems</div>
                  <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    {extraItems.map(item => (
                       <div key={item.id} className="flex justify-between text-xs bg-white p-2 rounded-lg shadow-sm">
                         <div>
                            <span className="font-bold mr-1">[{item.type === 'labor' ? 'MO' : 'P'}]</span>
                            {item.description} ({item.quantity})
                         </div>
                         <button onClick={() => removeExtraItem(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={12}/></button>
                       </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Input className="flex-1" placeholder="Desc." value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                    <Select className="w-20" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}>
                        <option value="part">P</option>
                        <option value="labor">MO</option>
                    </Select>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Input className="flex-1" placeholder="$$" type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                    <Button onClick={addExtraItem} variant="primary" className="px-3"><Plus size={16}/></Button>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveExtras} variant="success" className="flex-1 py-1 text-xs">Guardar</Button>
                    <Button onClick={() => setEditingOrderId(null)} variant="secondary" className="flex-1 py-1 text-xs">Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">{item.description}</span>
                    ))}
                    {order.items.length > 3 && <span className="text-xs text-slate-400 px-1">...</span>}
                  </div>
                  <button
                    onClick={() => startEditing(order)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline w-full text-left flex items-center gap-1"
                  >
                    <Plus size={12}/> Modificar / Agregar Ítems
                  </button>
                </div>
              )}

              <Button
                onClick={() => handleFinish(order.id)}
                variant="primary"
                className="w-full mt-auto"
              >
                <CheckCircle size={18} />
                Terminar Trabajo
              </Button>
            </Card>
          ))}
          {inRepair?.length === 0 && (
            <div className="text-gray-400 text-sm italic col-span-full py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              No hay vehículos en reparación activa.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
