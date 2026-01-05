import React, { useState } from 'react';
import { useOrders } from '../lib/firestoreService';
import { formatCurrency } from '../lib/constants';
import { Search, Archive, Calendar, User, FileText, Download, Phone, Mail } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

export default function VehicleHistory() {
  const { orders } = useOrders(); // Fetch all
  const [searchTerm, setSearchTerm] = useState('');
  const [viewOrderId, setViewOrderId] = useState(null);

  // Filter locally
  const history = orders.filter(o => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
          o.vehicle.plate.toLowerCase().includes(term) ||
          o.vehicle.brand.toLowerCase().includes(term) ||
          o.vehicle.model.toLowerCase().includes(term) ||
          o.client.name.toLowerCase().includes(term)
      );
  });

  const viewOrder = orders.find(o => o.id === viewOrderId);

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><Archive size={24} /></div>
          <h1 className="text-2xl font-bold text-slate-800">Historial de Vehículos</h1>
       </div>

       {/* Search */}
       <Card>
          <div className="relative">
             <input
               type="text"
               placeholder="Buscar por Placa, Marca, Modelo o Cliente..."
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          </div>
       </Card>

       {/* List */}
       <div className="space-y-4">
          {history?.map(order => (
            <Card key={order.id} className="hover:border-purple-200 transition-colors group">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-slate-800">
                           {order.vehicle.brand} {order.vehicle.model}
                        </h3>
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{order.vehicle.plate}</span>
                        {order.status === 'Cancelado'
                           ? <Badge color="red">Cancelado</Badge>
                           : <Badge color="green">{order.status}</Badge>
                        }
                     </div>
                     <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><User size={14}/> {order.client.name}</span>
                        <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                     </div>
                  </div>

                  <div className="text-right md:w-48">
                     <div className="font-mono font-bold text-lg text-slate-800">{formatCurrency(order.totals?.total || 0)}</div>
                     <div className="mt-2">
                        <Button variant="secondary" className="w-full text-xs py-1.5" onClick={() => setViewOrderId(order.id)}>
                           Ver Detalles
                        </Button>
                     </div>
                  </div>
               </div>

               {/* Mini Summary */}
               <div className="mt-4 pt-4 border-t border-slate-100 grid md:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="bg-slate-50 p-2 rounded-lg">
                     <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Motivo</span>
                     <p className="truncate">{order.issue || "No especificado"}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                     <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Trabajo</span>
                     <p className="truncate">
                        {order.items && order.items.length > 0
                           ? order.items.map(i => i.description).join(', ')
                           : "Sin items registrados"}
                     </p>
                  </div>
               </div>
            </Card>
          ))}

          {history?.length === 0 && (
             <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <Archive size={48} className="mx-auto mb-2 opacity-20"/>
                <p>No se encontraron registros históricos.</p>
             </div>
          )}
       </div>

       {/* DETAIL MODAL */}
       <Modal isOpen={!!viewOrderId} onClose={() => setViewOrderId(null)} title="Detalle Histórico">
         {viewOrder && (
            <div className="space-y-6">

               {/* Contact Info */}
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                     <User size={16}/> Datos de Contacto
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400"/>
                        <span>{viewOrder.client.phone || "N/A"}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400"/>
                        <span className="truncate">{viewOrder.client.email || "N/A"}</span>
                     </div>
                  </div>
               </div>

               {/* Issue Description */}
               <div>
                  <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase">Motivo de Visita</h4>
                  <div className="bg-white border border-slate-200 p-3 rounded-lg text-sm text-slate-600">
                     {viewOrder.issue}
                  </div>
               </div>

               {/* Full Items List (Invoice/Budget) */}
               <div>
                  <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase flex justify-between">
                     <span>Detalle Factura / Presupuesto</span>
                     <span className="text-slate-400 font-normal text-xs">{viewOrder.status}</span>
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                     <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                           <tr>
                              <th className="text-left p-2 font-medium">Desc.</th>
                              <th className="text-right p-2 font-medium">Total</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {viewOrder.items?.map((item, i) => (
                              <tr key={i}>
                                 <td className="p-2">
                                    <span className="font-bold text-xs mr-1">[{item.type === 'labor' ? 'MO' : 'P'}]</span>
                                    {item.description} <span className="text-xs text-gray-400">x{item.quantity}</span>
                                 </td>
                                 <td className="p-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                              </tr>
                           ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold">
                           <tr>
                              <td className="p-2 text-right">Total</td>
                              <td className="p-2 text-right">{formatCurrency(viewOrder.totals?.total || 0)}</td>
                           </tr>
                        </tfoot>
                     </table>
                  </div>
               </div>

               {/* Documents */}
               <div>
                  <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase">Documentos Adjuntos</h4>
                  {viewOrder.documents && viewOrder.documents.length > 0 ? (
                     <div className="grid gap-2">
                        {viewOrder.documents.map((doc, idx) => (
                           <div key={idx} className="flex justify-between items-center p-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                              <span className="truncate flex-1 pr-4">{doc.name}</span>
                              {/* NOTE: With Firestore/Storage, doc.url is the link. */}
                              <a
                                 href={doc.url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-1"
                              >
                                 <Download size={12}/> Abrir
                              </a>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm text-slate-400 italic">No hay documentos adjuntos.</p>
                  )}
               </div>

            </div>
         )}
       </Modal>
    </div>
  );
}
