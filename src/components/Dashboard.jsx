import React, { useState } from 'react';
import { useOrders } from '../lib/firestoreService';
import { ORDER_STATUS, formatCurrency } from '../lib/constants';
import {
  ClipboardCheck,
  Clock,
  Wrench,
  CheckCircle,
  Search,
  Car,
  MoreVertical,
  Sliders
} from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import MechanicsManager from './MechanicsManager'; // Ensure this is imported if not already but in original it was in Layout or here?
// Original code had MechanicsManager in Layout or Dashboard?
// Ah, previous step I saw MechanicsManager in Layout.jsx but user asked to restore sidebar.
// In the Sidebar Layout, MechanicsManager was in the Main Content at the bottom if tab===dashboard.
// But here Dashboard.jsx didn't export it.
// Let's check where it should be. The user said "Only Admin can create/delete mechanics".
// It is better placed inside Dashboard as a widget or section visible only to Admin.

export default function Dashboard({ setCurrentTab }) {
  const { userRole } = useAuth();
  const { orders } = useOrders(); // Real-time fetch

  const [searchTerm, setSearchTerm] = useState('');
  const [viewOrderId, setViewOrderId] = useState(null);

  // Metrics Calculation
  const countReception = orders.filter(o => o.status === ORDER_STATUS.RECEPCION).length;
  const countApproval = orders.filter(o => o.status === ORDER_STATUS.APROBACION).length;
  const countRepair = orders.filter(o => o.status === ORDER_STATUS.REPARACION).length;
  const countReady = orders.filter(o => o.status === ORDER_STATUS.LISTO).length;

  // Search Filter
  const searchResults = orders.filter(order => {
       if (!searchTerm) return true;
       const lowerTerm = searchTerm.toLowerCase();
       const clientName = order.client.name.toLowerCase();
       const plate = order.vehicle.plate.toLowerCase();
       const brand = order.vehicle.brand.toLowerCase();
       const status = order.status.toLowerCase();

       return clientName.includes(lowerTerm) ||
              plate.includes(lowerTerm) ||
              brand.includes(lowerTerm) ||
              status.includes(lowerTerm);
  }).slice(0, 10); // Limit to 10 for display

  const viewOrder = orders.find(o => o.id === viewOrderId);

  const StatCard = ({ title, count, icon: Icon, colorClass, onClick, badge }) => (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl transition-colors ${colorClass}`}>
          <Icon size={24} />
        </div>
        {badge && <span className={`text-xs font-bold px-2 py-1 rounded-full ${badge.className}`}>{badge.text}</span>}
      </div>
      <h3 className="text-3xl font-bold text-slate-800">{count || 0}</h3>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Detail Modal */}
      <Modal isOpen={!!viewOrderId} onClose={() => setViewOrderId(null)} title={`Orden #${viewOrderId}`}>
        {viewOrder && (
          <div className="space-y-4">
             <div className="text-center mb-4">
               <Badge color="blue">Estado: {viewOrder.status}</Badge>
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

             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
               <p className="font-bold text-gray-500 mb-1 text-xs uppercase">Diagnóstico</p>
               <p className="text-sm">{viewOrder.diagnosis || "Pendiente..."}</p>
             </div>

             <div>
               <p className="font-bold text-gray-500 mb-2 text-xs uppercase">Items</p>
               <div className="border border-slate-100 rounded-xl overflow-hidden">
                 <table className="w-full text-sm">
                   <thead className="bg-slate-50">
                     <tr>
                       <th className="text-left p-3 font-semibold text-slate-500">Desc.</th>
                       <th className="text-right p-3 font-semibold text-slate-500">Total</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {viewOrder.items?.map((item, idx) => (
                       <tr key={idx}>
                         <td className="p-3">{item.description} <span className="text-xs text-gray-400">x{item.quantity}</span></td>
                         <td className="p-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>

             <div className="text-right font-bold text-lg pt-2 text-slate-800">
               Total: {formatCurrency(viewOrder.totals?.total || 0)}
             </div>
          </div>
        )}
      </Modal>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="En Recepción"
          count={countReception}
          icon={ClipboardCheck}
          colorClass="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
          badge={{text: 'Activos', className: 'bg-blue-100 text-blue-700'}}
          onClick={() => setCurrentTab('recepcion')}
        />
        <StatCard
          title="Por Aprobar"
          count={countApproval}
          icon={Clock}
          colorClass="bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white"
          badge={{text: 'Acción', className: 'bg-orange-100 text-orange-700'}}
          onClick={() => setCurrentTab('taller')}
        />
        <StatCard
          title="En Reparación"
          count={countRepair}
          icon={Wrench}
          colorClass="bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
          onClick={() => setCurrentTab('taller')}
        />
        <StatCard
          title="Listos para Entrega"
          count={countReady}
          icon={CheckCircle}
          colorClass="bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white"
          onClick={() => setCurrentTab('caja')}
        />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Órdenes Recientes</h3>

              {/* Search in Header */}
              <div className="relative group hidden sm:block">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all w-48"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                      <tr>
                          <th className="px-6 py-4">Vehículo / Placa</th>
                          <th className="px-6 py-4 hidden sm:table-cell">Cliente</th>
                          <th className="px-6 py-4">Estado</th>
                          <th className="px-6 py-4 text-right">Total</th>
                          <th className="px-6 py-4 text-center">Acción</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {searchResults?.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Car size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{order.vehicle.brand} {order.vehicle.model}</p>
                                        <p className="text-xs text-slate-500 font-mono bg-slate-100 px-1 rounded inline-block mt-0.5">{order.vehicle.plate}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">{order.client.name}</td>
                            <td className="px-6 py-4">
                                {order.status === ORDER_STATUS.RECEPCION && <Badge color="blue">En Recepción</Badge>}
                                {order.status === ORDER_STATUS.APROBACION && <Badge color="orange">Por Aprobar</Badge>}
                                {order.status === ORDER_STATUS.REPARACION && <Badge color="purple">En Taller</Badge>}
                                {order.status === ORDER_STATUS.LISTO && <Badge color="green">Listo</Badge>}
                                {order.status === ORDER_STATUS.PAGADO && <Badge color="gray">Pagado</Badge>}
                                {order.status === ORDER_STATUS.CANCELADO && <Badge color="red">Cancelado</Badge>}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-800">
                              {order.totals?.total > 0 ? formatCurrency(order.totals.total) : '--'}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => setViewOrderId(order.id)}
                                  className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition"
                                >
                                  <MoreVertical size={18} />
                                </button>
                            </td>
                        </tr>
                      ))}
                      {searchResults?.length === 0 && (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-gray-400 italic">No hay órdenes recientes</td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
