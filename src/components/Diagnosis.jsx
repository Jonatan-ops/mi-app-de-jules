import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ORDER_STATUS, formatCurrency } from '../lib/constants';
import { ClipboardCheck, Plus, Trash2, FileText, Printer, X } from 'lucide-react';

export default function Diagnosis() {
  const orders = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.RECEPCION).toArray());
  const mechanics = useLiveQuery(() => db.mechanics.toArray());

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Local state for the form being edited
  const [diagnosis, setDiagnosis] = useState('');
  const [mechanicId, setMechanicId] = useState('');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', type: 'labor', price: '', quantity: 1 });
  const [printMode, setPrintMode] = useState(false);

  const selectedOrder = useLiveQuery(
    () => selectedOrderId ? db.orders.get(selectedOrderId) : null,
    [selectedOrderId]
  );

  // Also fetch assigned mechanic for print view
  const assignedMechanic = useLiveQuery(
    () => mechanicId ? db.mechanics.get(parseInt(mechanicId)) : null,
    [mechanicId]
  );

  const handleSelectOrder = (order) => {
    setSelectedOrderId(order.id);
    setDiagnosis(order.diagnosis || '');
    setMechanicId(order.mechanicId || '');
    setItems(order.items || []);
    setPrintMode(false);
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
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async () => {
    if (!mechanicId) {
      alert("Debe asignar un mecánico responsable.");
      return;
    }
    const totals = calculateTotals();
    await db.orders.update(selectedOrderId, {
      diagnosis,
      mechanicId: parseInt(mechanicId),
      items,
      totals,
      status: ORDER_STATUS.APROBACION
    });
    setSelectedOrderId(null);
    setDiagnosis('');
    setItems([]);
    alert("Presupuesto generado y enviado a aprobación.");
  };

  // --- PRINT VIEW ---
  if (selectedOrder && printMode) {
    const { subtotal, tax, total } = calculateTotals();
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto min-h-screen text-black">
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div>
             <h1 className="text-3xl font-bold uppercase tracking-widest">Presupuesto</h1>
             <p className="text-sm mt-1">FD Auto Repair</p>
             <p className="text-sm">Fecha: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
             <h2 className="text-xl font-bold">Orden #{selectedOrder.id}</h2>
             <p className="text-sm">Mecánico: {assignedMechanic ? assignedMechanic.code : 'N/A'}</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-8">
           <div>
             <h3 className="font-bold border-b border-gray-300 mb-2">Cliente</h3>
             <p>{selectedOrder.client.name}</p>
             <p>{selectedOrder.client.phone}</p>
           </div>
           <div>
             <h3 className="font-bold border-b border-gray-300 mb-2">Vehículo</h3>
             <p>{selectedOrder.vehicle.brand} {selectedOrder.vehicle.model} {selectedOrder.vehicle.year}</p>
             <p>Placa: {selectedOrder.vehicle.plate}</p>
           </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold border-b border-gray-300 mb-2">Diagnóstico Técnico</h3>
          <p className="whitespace-pre-wrap text-sm">{diagnosis || 'Sin diagnóstico registrado.'}</p>
        </div>

        <table className="w-full text-sm mb-8">
           <thead>
             <tr className="border-b-2 border-black text-left">
               <th className="py-2">Descripción</th>
               <th className="py-2 text-center">Cant.</th>
               <th className="py-2 text-right">Precio</th>
               <th className="py-2 text-right">Total</th>
             </tr>
           </thead>
           <tbody>
             {items.map((item, i) => (
               <tr key={i} className="border-b border-gray-100">
                 <td className="py-2">{item.description} <span className="text-xs text-gray-500">({item.type === 'part' ? 'Repuesto' : 'MO'})</span></td>
                 <td className="py-2 text-center">{item.quantity}</td>
                 <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                 <td className="py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
               </tr>
             ))}
           </tbody>
        </table>

        <div className="flex justify-end">
           <div className="w-64 space-y-2 text-right">
              <div className="flex justify-between"><span>Subtotal:</span> <span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>ITBIS (18%):</span> <span>{formatCurrency(tax)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t border-black pt-2"><span>Total:</span> <span>{formatCurrency(total)}</span></div>
           </div>
        </div>

        <div className="mt-16 text-center text-xs text-gray-500 border-t pt-4">
           <p>Este documento es un presupuesto válido por 15 días.</p>
        </div>

        {/* No-Print Controls */}
        <div className="fixed top-4 right-4 print:hidden flex gap-2">
           <button onClick={() => window.print()} className="bg-blue-600 text-white p-3 rounded-full shadow-lg"><Printer/></button>
           <button onClick={() => setPrintMode(false)} className="bg-gray-500 text-white p-3 rounded-full shadow-lg"><X/></button>
        </div>
      </div>
    );
  }

  // --- REGULAR VIEW ---
  if (!selectedOrder) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Vehículos en Espera de Diagnóstico</h2>
        {(!orders || orders.length === 0) ? (
          <div className="text-center p-10 bg-white rounded-xl shadow text-gray-500">
            No hay vehículos pendientes en recepción.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {orders.map(order => (
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

      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Diagnóstico y Cotización</h2>
          <div className="text-gray-600 mt-1">
            {selectedOrder.vehicle.brand} {selectedOrder.vehicle.model} - {selectedOrder.client.name}
          </div>
        </div>
        <button
          onClick={() => setPrintMode(true)}
          className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-gray-600 flex items-center gap-1"
          title="Vista de Impresión"
        >
          <Printer size={18} /> <span className="text-sm">Imprimir</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Asignar Mecánico */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Asignar Mecánico Responsable</label>
          <select
            value={mechanicId}
            onChange={(e) => setMechanicId(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Seleccionar --</option>
            {mechanics?.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
            ))}
          </select>
        </div>

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
              placeholder="Descripción"
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
                  {formatCurrency(item.price * item.quantity)}
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
            <div className="text-sm text-gray-600">Subtotal: <span className="font-medium">{formatCurrency(subtotal)}</span></div>
            <div className="text-sm text-gray-600">ITBIS/Imp (18%): <span className="font-medium">{formatCurrency(tax)}</span></div>
            <div className="text-xl font-bold text-slate-800">Total: {formatCurrency(total)}</div>
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
