import React, { useState } from 'react';
import { useOrders } from '../lib/storage';
import { ClipboardCheck, Plus, Trash2, FileText } from 'lucide-react';

export default function Diagnosis() {
  const { orders, updateOrder, ORDER_STATUS } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Local state for the form being edited
  const [diagnosis, setDiagnosis] = useState('');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', type: 'labor', price: '', quantity: 1 });

  const pendingOrders = orders.filter(o => o.status === ORDER_STATUS.RECEPCION);
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleSelectOrder = (order) => {
    setSelectedOrderId(order.id);
    setDiagnosis(order.diagnosis || '');
    setItems(order.items || []);
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.price) return;
    setItems([...items, { ...newItem, id: Date.now() }]);
    setNewItem({ description: '', type: 'labor', price: '', quantity: 1 });
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.18; // Assuming 18% ITBIS/Tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = () => {
    const totals = calculateTotals();
    updateOrder(selectedOrderId, {
      diagnosis,
      items,
      totals,
      status: ORDER_STATUS.APROBACION
    });
    setSelectedOrderId(null);
    setDiagnosis('');
    setItems([]);
    alert("Presupuesto generado y enviado a aprobación.");
  };

  if (!selectedOrder) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Vehículos en Espera de Diagnóstico</h2>
        {pendingOrders.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow text-gray-500">
            No hay vehículos pendientes en recepción.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingOrders.map(order => (
              <div
                key={order.id}
                onClick={() => handleSelectOrder(order)}
                className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:border-blue-500 border border-transparent transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{order.vehicle.brand} {order.vehicle.model}</h3>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{order.vehicle.plate}</span>
                </div>
                <p className="text-gray-600 mb-2">{order.issue}</p>
                <div className="text-sm text-gray-500">Cliente: {order.client.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <button
        onClick={() => setSelectedOrderId(null)}
        className="text-sm text-blue-600 mb-4 hover:underline"
      >
        &larr; Volver a la lista
      </button>

      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Diagnóstico y Cotización</h2>
        <div className="text-gray-600 mt-1">
          {selectedOrder.vehicle.brand} {selectedOrder.vehicle.model} - {selectedOrder.client.name}
        </div>
      </div>

      <div className="space-y-6">
        {/* Diagnóstico Técnico */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Diagnóstico Técnico</label>
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
            placeholder="Detalle los hallazgos técnicos..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>

        {/* Items */}
        <div className="bg-slate-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <ClipboardCheck size={18} />
            Ítems de Presupuesto
          </h3>

          {/* Add Item Form */}
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input
              className="flex-grow p-2 border rounded"
              placeholder="Descripción (Repuesto o Mano de Obra)"
              value={newItem.description}
              onChange={e => setNewItem({...newItem, description: e.target.value})}
            />
            <select
              className="p-2 border rounded"
              value={newItem.type}
              onChange={e => setNewItem({...newItem, type: e.target.value})}
            >
              <option value="labor">Mano de Obra</option>
              <option value="part">Repuesto</option>
            </select>
            <input
              className="w-20 p-2 border rounded"
              type="number"
              placeholder="Cant."
              value={newItem.quantity}
              onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
            />
            <input
              className="w-28 p-2 border rounded"
              type="number"
              placeholder="Precio"
              value={newItem.price}
              onChange={e => setNewItem({...newItem, price: e.target.value})}
            />
            <button
              onClick={handleAddItem}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                <div className="flex-1">
                  <div className="font-medium">{item.description}</div>
                  <div className="text-xs text-gray-500 capitalize">{item.type === 'labor' ? 'Mano de Obra' : 'Repuesto'} - x{item.quantity}</div>
                </div>
                <div className="font-bold text-slate-700 mr-4">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {items.length === 0 && <div className="text-center text-gray-400 text-sm py-2">No hay ítems agregados</div>}
          </div>

          {/* Totals */}
          <div className="border-t pt-3 space-y-1 text-right">
            <div className="text-sm text-gray-600">Subtotal: <span className="font-medium">${subtotal.toFixed(2)}</span></div>
            <div className="text-sm text-gray-600">ITBIS/Imp (18%): <span className="font-medium">${tax.toFixed(2)}</span></div>
            <div className="text-xl font-bold text-slate-800">Total: ${total.toFixed(2)}</div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={items.length === 0}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FileText size={24} />
          Generar Presupuesto
        </button>
      </div>
    </div>
  );
}
