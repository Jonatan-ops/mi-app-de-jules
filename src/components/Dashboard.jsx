import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ORDER_STATUS, formatCurrency } from '../lib/constants';
import { Search, LayoutDashboard, Clock, CheckCircle, DollarSign, Archive } from 'lucide-react';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  // Metrics Queries
  const countReception = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.RECEPCION).count());
  const countApproval = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.APROBACION).count());
  const countRepair = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.REPARACION).count());
  const countReady = useLiveQuery(() => db.orders.where('status').equals(ORDER_STATUS.LISTO).count());

  // Search Query
  const searchResults = useLiveQuery(async () => {
    if (!searchTerm) return [];

    // Simple case-insensitive search on multiple fields
    // Dexie specific filtering
    const lowerTerm = searchTerm.toLowerCase();

    return await db.orders.filter(order => {
       const clientName = order.client.name.toLowerCase();
       const plate = order.vehicle.plate.toLowerCase();
       const brand = order.vehicle.brand.toLowerCase();
       // Also allow searching by Status
       const status = order.status.toLowerCase();

       return clientName.includes(lowerTerm) ||
              plate.includes(lowerTerm) ||
              brand.includes(lowerTerm) ||
              status.includes(lowerTerm);
    }).toArray();
  }, [searchTerm]);

  const StatCard = ({ title, count, icon: Icon, colorClass }) => (
    <div className={`bg-white p-4 rounded-xl shadow border-l-4 ${colorClass} flex items-center justify-between`}>
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2 text-slate-800">
        <LayoutDashboard size={32} />
        <h1 className="text-3xl font-bold">Tablero de Control</h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="En Recepción" count={countReception} icon={Clock} colorClass="border-gray-500" />
        <StatCard title="Por Aprobar" count={countApproval} icon={Clock} colorClass="border-amber-500" />
        <StatCard title="En Reparación" count={countRepair} icon={CheckCircle} colorClass="border-blue-500" />
        <StatCard title="Listos para Entrega" count={countReady} icon={DollarSign} colorClass="border-green-500" />
      </div>

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
                <th className="p-3 text-right rounded-tr-lg">Total</th>
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
                </tr>
              ))}
              {searchTerm && searchResults?.length === 0 && (
                 <tr>
                   <td colSpan="5" className="p-8 text-center text-gray-500">
                     No se encontraron resultados para "{searchTerm}"
                   </td>
                 </tr>
              )}
              {!searchTerm && (
                 <tr>
                   <td colSpan="5" className="p-12 text-center text-gray-400">
                     <Archive className="mx-auto mb-2 opacity-50" size={48} />
                     Ingrese un término para buscar en el historial de órdenes.
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
