import React from 'react';
import { useOrders } from '../lib/storage';
import { CheckCircle, Wrench, Clock } from 'lucide-react';

export default function Workshop() {
  const { orders, updateOrder, ORDER_STATUS } = useOrders();

  const pendingApproval = orders.filter(o => o.status === ORDER_STATUS.APROBACION);
  const inRepair = orders.filter(o => o.status === ORDER_STATUS.REPARACION);

  const handleApprove = (orderId) => {
    if (confirm('¿Confirmar que el cliente aprobó el presupuesto?')) {
      updateOrder(orderId, { status: ORDER_STATUS.REPARACION });
    }
  };

  const handleFinish = (orderId) => {
    if (confirm('¿Marcar trabajo como completado y listo para entrega?')) {
      updateOrder(orderId, { status: ORDER_STATUS.LISTO });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Pendientes de Aprobación */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-600">
          <Clock /> Pendientes de Aprobación
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingApproval.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-amber-500">
              <div className="font-bold text-lg mb-1">{order.vehicle.brand} {order.vehicle.model}</div>
              <div className="text-sm text-gray-600 mb-2">Cliente: {order.client.name}</div>
              <div className="bg-gray-100 p-2 rounded text-sm mb-3">
                <div className="font-semibold text-gray-700">Presupuesto:</div>
                <div className="text-right font-mono font-bold">${order.totals.total.toFixed(2)}</div>
              </div>
              <button
                onClick={() => handleApprove(order.id)}
                className="w-full bg-amber-500 text-white font-bold py-2 rounded hover:bg-amber-600 transition-colors"
              >
                Cliente Aprobó
              </button>
            </div>
          ))}
          {pendingApproval.length === 0 && (
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
          {inRepair.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
              <div className="font-bold text-lg mb-1">{order.vehicle.brand} {order.vehicle.model}</div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Diagnóstico:</span> {order.diagnosis.substring(0, 50)}...
              </div>
              <ul className="text-xs text-gray-500 mb-4 list-disc list-inside bg-gray-50 p-2 rounded">
                {order.items.slice(0, 3).map((item, idx) => (
                  <li key={idx}>{item.description}</li>
                ))}
                {order.items.length > 3 && <li>...</li>}
              </ul>
              <button
                onClick={() => handleFinish(order.id)}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
              >
                <CheckCircle size={18} />
                Terminar Trabajo
              </button>
            </div>
          ))}
          {inRepair.length === 0 && (
            <div className="text-gray-400 text-sm italic col-span-full">No hay vehículos en reparación activa.</div>
          )}
        </div>
      </section>
    </div>
  );
}
