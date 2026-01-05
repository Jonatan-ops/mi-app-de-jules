import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ORDER_STATUS, formatCurrency } from '../lib/constants';
import { DollarSign, Printer, X, Check } from 'lucide-react';

export default function Cashier() {
  const orders = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.LISTO).toArray());
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [printMode, setPrintMode] = useState(false);
  const [warranty, setWarranty] = useState('');

  const selectedOrder = useLiveQuery(
    () => selectedOrderId ? db.orders.get(selectedOrderId) : null,
    [selectedOrderId]
  );

  const handlePayment = async (method) => {
    if (!selectedOrder) return;
    if (confirm(`¿Confirmar pago de ${formatCurrency(selectedOrder.totals.total)} vía ${method}?`)) {
      await db.orders.update(selectedOrder.id, {
        status: ORDER_STATUS.PAGADO,
        paymentMethod: method,
        paidAt: new Date().toISOString(),
        warranty: warranty // Save warranty info
      });
      setSelectedOrderId(null);
      setPrintMode(false);
      setWarranty('');
      alert("Pago registrado y orden cerrada exitosamente.");
    }
  };

  // --- PRINT INVOICE VIEW ---
  if (selectedOrder && printMode) {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto min-h-screen text-black">
        <div className="text-center border-b-2 border-black pb-4 mb-8">
           <h1 className="text-3xl font-bold uppercase tracking-widest">Factura</h1>
           <p className="text-lg font-semibold mt-2">FD Auto Repair</p>
           <p className="text-sm">RNC: 000-000000-0</p>
           <p className="text-sm">Santo Domingo, Rep. Dom.</p>
        </div>

        <div className="flex justify-between mb-8">
           <div>
             <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
             <p><strong>Factura #:</strong> {selectedOrder.id}</p>
             {selectedOrder.isMaintenance && <p className="mt-2 font-bold uppercase border border-black inline-block px-2">Mantenimiento Preventivo</p>}
           </div>
           <div className="text-right">
             <p><strong>Cliente:</strong> {selectedOrder.client.name}</p>
             <p><strong>Vehículo:</strong> {selectedOrder.vehicle.brand} {selectedOrder.vehicle.plate}</p>
           </div>
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
             {selectedOrder.items.map((item, i) => (
               <tr key={i} className="border-b border-gray-100">
                 <td className="py-2">{item.description}</td>
                 <td className="py-2 text-center">{item.quantity}</td>
                 <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                 <td className="py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
               </tr>
             ))}
           </tbody>
        </table>

        <div className="flex justify-end">
           <div className="w-64 space-y-2 text-right">
              <div className="flex justify-between"><span>Subtotal:</span> <span>{formatCurrency(selectedOrder.totals.subtotal)}</span></div>
              <div className="flex justify-between"><span>ITBIS (18%):</span> <span>{formatCurrency(selectedOrder.totals.tax)}</span></div>
              <div className="flex justify-between font-bold text-xl border-t-2 border-black pt-2"><span>Total Pagar:</span> <span>{formatCurrency(selectedOrder.totals.total)}</span></div>
           </div>
        </div>

        <div className="mt-16 pt-8 border-t text-sm">
           <div className="grid grid-cols-2 gap-8">
             <div>
                <p><strong>Garantía:</strong> {warranty || 'Según ley'}</p>
                {selectedOrder.commitmentDate && <p><strong>Fecha Promesa:</strong> {new Date(selectedOrder.commitmentDate).toLocaleDateString()}</p>}
             </div>
             <div className="text-right">
                <p>¡Gracias por preferirnos!</p>
             </div>
           </div>
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
  if (selectedOrder) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setSelectedOrderId(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Volver a la lista
          </button>
          <button
            onClick={() => setPrintMode(true)}
            className="text-gray-600 hover:bg-gray-100 p-2 rounded flex items-center gap-1"
          >
            <Printer size={18} /> Imprimir
          </button>
        </div>

        <div className="text-center mb-8 border-b pb-4">
          <h2 className="text-3xl font-bold text-slate-800">Caja</h2>
          <div className="text-gray-500 text-sm">Orden #{selectedOrder.id}</div>
          <div className="text-green-600 font-bold mt-2 text-xl">LISTO PARA ENTREGA</div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-lg">
            <span>Total a Pagar:</span>
            <span className="font-bold text-2xl">{formatCurrency(selectedOrder.totals.total)}</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tiempo de Garantía</label>
            <input
               type="text"
               placeholder="Ej: 3 Meses en mano de obra"
               className="w-full p-2 border rounded"
               value={warranty}
               onChange={(e) => setWarranty(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <h3 className="font-semibold text-center text-gray-600 mb-2">Registrar Cobro</h3>
          <button onClick={() => handlePayment('Efectivo')} className="bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
            Pago en Efectivo
          </button>
          <button onClick={() => handlePayment('Tarjeta')} className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
            Tarjeta de Crédito / Débito
          </button>
          <button onClick={() => handlePayment('Transferencia')} className="bg-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-700">
            Transferencia Bancaria
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <DollarSign className="text-green-600" /> Caja - Vehículos Listos
      </h2>

      {(!orders || orders.length === 0) ? (
        <div className="text-center p-10 bg-white rounded-xl shadow text-gray-500">
          No hay vehículos listos para cobrar.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg">{order.vehicle.brand} {order.vehicle.model}</h3>
                <div className="text-gray-600">{order.client.name}</div>
                <div className="text-green-700 font-bold mt-1 text-xl">{formatCurrency(order.totals.total)}</div>
              </div>
              <button
                onClick={() => setSelectedOrderId(order.id)}
                className="bg-green-100 text-green-700 p-3 rounded-full hover:bg-green-200 transition-colors"
              >
                <DollarSign size={24} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
