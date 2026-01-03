import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { formatCurrency } from '../lib/constants';
import { Search, Archive, Calendar, User } from 'lucide-react';

export default function VehicleHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  // Advanced query logic
  const history = useLiveQuery(async () => {
    // Start with all orders, reverse chronological
    let collection = db.orders.orderBy('createdAt').reverse();

    // If search term exists, filter manually (Dexie basic search)
    if (searchTerm) {
       const term = searchTerm.toLowerCase();
       // Since Dexie doesn't do complex OR queries easily on multiple fields without plugins,
       // we fetch all and filter in JS for search (acceptable for < 1000 records, optimized later if needed)
       const all = await collection.toArray();
       return all.filter(o =>
          o.vehicle.plate.toLowerCase().includes(term) ||
          o.vehicle.brand.toLowerCase().includes(term) ||
          o.vehicle.model.toLowerCase().includes(term) ||
          o.client.name.toLowerCase().includes(term)
       );
    }

    return await collection.toArray();
  }, [searchTerm]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       <div className="flex items-center gap-2 mb-6">
          <Archive size={32} className="text-slate-700"/>
          <h1 className="text-2xl font-bold text-slate-800">Historial de Vehículos (Record)</h1>
       </div>

       <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="relative mb-6">
             <input
               type="text"
               placeholder="Buscar por Placa, Marca, Modelo o Cliente..."
               className="w-full p-4 pl-12 border rounded-xl bg-gray-50 text-lg focus:ring-2 focus:ring-blue-500 outline-none"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search className="absolute left-4 top-4 text-gray-400" size={24} />
          </div>

          <div className="space-y-4">
             {history?.map(order => (
               <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <div className="font-bold text-lg text-blue-900">
                           {order.vehicle.brand} {order.vehicle.model} <span className="text-sm bg-gray-200 px-2 rounded ml-2">{order.vehicle.plate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                           <User size={14}/> {order.client.name}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="font-mono font-bold">{formatCurrency(order.totals?.total || 0)}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                           <Calendar size={12}/> {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold border ${
                           order.status === 'Pagado' ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-300 text-gray-600'
                        }`}>
                           {order.status}
                        </span>
                     </div>
                  </div>

                  {/* Summary of work */}
                  <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
                     <p className="font-semibold mb-1">Trabajo Realizado:</p>
                     <ul className="list-disc list-inside text-xs">
                        {order.items?.map((item, idx) => (
                           <li key={idx}>{item.description}</li>
                        ))}
                     </ul>
                     {order.diagnosis && (
                        <p className="mt-2 text-xs italic border-t border-gray-300 pt-1">
                           Diag: {order.diagnosis.substring(0, 100)}...
                        </p>
                     )}
                  </div>
               </div>
             ))}

             {history?.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                   No se encontraron registros.
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
