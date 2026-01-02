import React, { useState } from 'react';
import { useOrders } from '../lib/storage';
import { DollarSign, Printer, Check } from 'lucide-react';

export default function Cashier() {
  const { orders, updateOrder, ORDER_STATUS } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const readyOrders = orders.filter(o => o.status === ORDER_STATUS.LISTO);

  const handlePayment = (method) => {
    if (!selectedOrder) return;
    if (confirm(`¿Confirmar pago de $${selectedOrder.totals.total.toFixed(2)} vía ${method}?`)) {
      updateOrder(selectedOrder.id, {
        status: ORDER_STATUS.PAGADO,
        paymentMethod: method,
        paidAt: new Date().toISOString()
      });
      setSelectedOrder(null);
      alert("Pago registrado y orden cerrada exitosamente.");
    }
  };

  if (selectedOrder) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <button
          onClick={() => setSelectedOrder(null)}
          className="text-sm text-blue-600 mb-4 hover:underline"
        >
          &larr; Volver a la lista
        </button>

        <div className="text-center mb-8 border-b pb-4">
          <h2 className="text-3xl font-bold text-slate-800">Factura</h2>
          <div className="text-gray-500 text-sm">Orden #{selectedOrder.id.slice(-6)}</div>
          <div className="text-green-600 font-bold mt-2 text-xl">LISTO PARA ENTREGA</div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Cliente:</span>
            <span>{selectedOrder.client.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Vehículo:</span>
            <span>{selectedOrder.vehicle.brand} {selectedOrder.vehicle.model} ({selectedOrder.vehicle.plate})</span>
          </div>

          <div className="border-t border-b py-4 my-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2">Descripción</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1">{item.description} <span className="text-xs text-gray-400">x{item.quantity}</span></td>
                    <td className="py-1 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span>${selectedOrder.totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Impuestos:</span>
            <span>${selectedOrder.totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-slate-800 mt-2">
            <span>Total a Pagar:</span>
            <span>${selectedOrder.totals.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <h3 className="font-semibold text-center text-gray-600 mb-2">Seleccionar Método de Pago</h3>
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

      {readyOrders.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-xl shadow text-gray-500">
          No hay vehículos listos para cobrar.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {readyOrders.map(order => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg">{order.vehicle.brand} {order.vehicle.model}</h3>
                <div className="text-gray-600">{order.client.name}</div>
                <div className="text-green-700 font-bold mt-1 text-xl">${order.totals.total.toFixed(2)}</div>
              </div>
              <button
                onClick={() => setSelectedOrder(order)}
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
