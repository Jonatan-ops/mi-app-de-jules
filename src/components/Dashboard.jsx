import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ORDER_STATUS, formatCurrency } from '../lib/constants';
import { Search, LayoutDashboard, Clock, CheckCircle, DollarSign, Archive, Wrench, Eye, X, AlertCircle } from 'lucide-react';

export default function Dashboard({ setCurrentTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewOrderId, setViewOrderId] = useState(null);

  // Metrics Queries
  const countReception = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.RECEPCION).count());
  const countApproval = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.APROBACION).count());
  const countRepair = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.REPARACION).count());
  const countReady = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.LISTO).count());

  // Maintenance Alert Query (Simple count for badge)
  const maintenancePendingCount = useLiveQuery(async () => {
     const all = await db.orders.toArray();
     const maint = all.filter(o => o.isMaintenance);
     // simplified logic just to show if there's work (optimization: reuse logic from Control)
     const now = new Date();
     const fiveMonthsMs = 5 * 30 * 24 * 60 * 60 * 1000;
     const map = {};
     maint.forEach(o => {
        const d = new Date(o.createdAt);
        if(!map[o.vehicle.plate] || d > map[o.vehicle.plate]) map[o.vehicle.plate] = d;
     });
     let count = 0;
     Object.values(map).forEach(d => {
        if(now - d > fiveMonthsMs) count++;
     });
     return count;
  });

  // Search Query - Default shows ALL by Date Descending
  const searchResults = useLiveQuery(async () => {
    let collection = db.orders.orderBy('createdAt').reverse();
    const all = await collection.toArray();

    if (!searchTerm) return all.slice(0, 50); // Limit default view for perf

    const lowerTerm = searchTerm.toLowerCase();
    return all.filter(order => {
       const clientName = order.client.name.toLowerCase();
       const plate = order.vehicle.plate.toLowerCase();
       const brand = order.vehicle.brand.toLowerCase();
       const status = order.status.toLowerCase();

       return clientName.includes(lowerTerm) ||
              plate.includes(lowerTerm) ||
              brand.includes(lowerTerm) ||
              status.includes(lowerTerm);
    });
  }, [searchTerm]);

  const viewOrder = useLiveQuery(
    () => viewOrderId ? db.orders.get(viewOrderId) : null,
    [viewOrderId]
  );

  const StatCard = ({ title, count, icon: Icon, colorClass, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white p-4 rounded-xl shadow border-l-4 ${colorClass} flex items-center justify-between cursor-pointer hover:bg-gray-50 transition`}
    >
      <div>
        <div className="text-gray-500 text-sm font-medium">{title}</div>
        <div className="text-3xl font-bold text-slate-800">{count || 0}</div>
      </div>
      <div className={`p-3 rounded-full opacity-20 ${colorClass.replace('border-', 'bg-')}`}>
        <Icon size={32} className={colorClass.replace('border-', 'text-')} />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
       {/* Detail Modal */}
      {viewOrderId && viewOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
               <h3 className="text-xl font-bold">Orden #{viewOrder.id}</h3>
               <button onClick={() => setViewOrderId(null)} className="p-1 hover:bg-gray-100 rounded-full"><X/></button>
             </div>
             <div className="p-6 space-y-4">
               {/* Status Badge */}
               <div className="text-center mb-4">
                 <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm border border-blue-200">
                    Estado: {viewOrder.status}
                 </span>
               </div>

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
                 <p className="text-sm">{viewOrder.diagnosis || "Pendiente..."}</p>
               </div>

               <div>
                 <p className="font-bold text-gray-500 mb-2">Items</p>
                 <table className="w-full text-sm">
                   <thead className="bg-gray-100">
                     <tr>
                       <th className="text-left p-2">Desc.</th>
                       <th className="text-center p-2">Cant.</th>
                       <th className="text-right p-2">Total</th>
                     </tr>
                   </thead>
                   <tbody>
                     {viewOrder.items?.map((item, idx) => (
                       <tr key={idx} className="border-b">
                         <td className="p-2">{item.description}</td>
                         <td className="p-2 text-center">{item.quantity}</td>
                         <td className="p-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {(!viewOrder.items || viewOrder.items.length === 0) && <p className="text-sm italic text-gray-400 p-2">Sin items asignados.</p>}
               </div>

               <div className="text-right font-bold text-lg pt-2">
                 Total: {formatCurrency(viewOrder.totals?.total || 0)}
               </div>
             </div>
             <div className="p-4 border-t bg-gray-50 flex justify-end">
               {/* Could add a 'Go to Action' button here depending on status if needed */}
               <button onClick={() => setViewOrderId(null)} className="bg-gray-800 text-white px-4 py-2 rounded-lg">Cerrar</button>
             </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 text-slate-800">
        <LayoutDashboard size={32} />
        <h1 className="text-3xl font-bold">Tablero de Control</h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="En Recepción" count={countReception} icon={Clock} colorClass="border-gray-500" onClick={() => setCurrentTab('recepcion')} />
        <StatCard title="Por Aprobar" count={countApproval} icon={Clock} colorClass="border-amber-500" onClick={() => setCurrentTab('taller')} />
        <StatCard title="En Reparación" count={countRepair} icon={CheckCircle} colorClass="border-blue-500" onClick={() => setCurrentTab('taller')} />
        <StatCard title="Listos para Entrega" count={countReady} icon={DollarSign} colorClass="border-green-500" onClick={() => setCurrentTab('caja')} />
      </div>

      {/* Maintenance Alert */}
      {(maintenancePendingCount > 0) && (
        <div
           onClick={() => setCurrentTab('mantenimiento')}
           className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100 transition"
        >
           <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-white p-2 rounded-full"><AlertCircle size={24}/></div>
              <div>
                 <h3 className="font-bold text-amber-800">Mantenimientos Pendientes</h3>
                 <p className="text-sm text-amber-700">Hay <strong>{maintenancePendingCount}</strong> clientes que requieren contacto para mantenimiento.</p>
              </div>
           </div>
           <button className="text-amber-700 font-bold text-sm hover:underline">Ver Lista &rarr;</button>
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-md min-h-[400px]">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Search /> Búsqueda Global e Historial
        </h2>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Buscar por cliente, placa, marca o estado..."
            className="w-full p-4 pl-12 border rounded-xl bg-gray-50 text-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-gray-400" size={24} />
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3 rounded-tl-lg">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Vehículo</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center rounded-tr-lg">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {searchResults?.map(order => (
                <tr key={order.id} className="hover:bg-blue-50 transition-colors">
                  <td className="p-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">{order.client.name}</td>
                  <td className="p-3">{order.vehicle.brand} {order.vehicle.model} <span className="text-xs bg-gray-200 px-1 rounded">{order.vehicle.plate}</span></td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold
                      ${order.status === ORDER_STATUS.PAGADO ? 'bg-green-100 text-green-700' :
                        order.status === ORDER_STATUS.REPARACION ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">{formatCurrency(order.totals?.total || 0)}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setViewOrderId(order.id)}
                      className="text-blue-600 hover:bg-blue-100 p-2 rounded-full"
                      title="Ver Detalles / Factura"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {searchTerm && searchResults?.length === 0 && (
                 <tr>
                   <td colSpan="6" className="p-8 text-center text-gray-500">
                     No se encontraron resultados para "{searchTerm}"
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
