import React, { useMemo } from 'react';
import { useOrders } from '../lib/firestoreService';
import { Calendar, AlertCircle, Phone, Car, CheckCircle } from 'lucide-react';

export default function MaintenanceControl() {
  const { orders } = useOrders(); // Fetch all

  const maintenanceData = useMemo(() => {
     // Filter manually
     const maintOrders = orders.filter(o => o.isMaintenance);

     // Group by Plate to find LAST maintenance date
     const map = {};
     maintOrders.forEach(order => {
        const plate = order.vehicle.plate;
        const date = new Date(order.createdAt); // Firestore orders are ISO strings or Date objects handled in service

        if (!map[plate] || date > map[plate].date) {
           map[plate] = {
              date: date,
              order: order
           };
        }
     });

     // Calculate if due (> 5 months)
     const dueList = [];
     const now = new Date();
     const fiveMonthsMs = 5 * 30 * 24 * 60 * 60 * 1000; // Approx

     Object.values(map).forEach(entry => {
        const diff = now - entry.date;
        if (diff > fiveMonthsMs) {
           dueList.push(entry);
        }
     });

     return dueList.sort((a,b) => a.date - b.date); // Oldest due first
  }, [orders]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
       <div className="flex items-center gap-2 mb-6 text-amber-600">
          <AlertCircle size={32}/>
          <h1 className="text-2xl font-bold">Control de Mantenimientos Pendientes</h1>
       </div>

       <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="mb-6 text-gray-600">
             Vehículos que realizaron su último mantenimiento hace más de 5 meses.
          </p>

          <div className="grid gap-4">
             {maintenanceData?.map(({order, date}) => (
                <div key={order.id} className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded shadow-sm flex justify-between items-center">
                   <div>
                      <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
                         <Car size={20}/>
                         {order.vehicle.brand} {order.vehicle.model}
                         <span className="bg-white px-2 py-0.5 border rounded text-sm">{order.vehicle.plate}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                         <div className="flex items-center gap-2">
                            <Calendar size={14}/> Último servicio: <strong>{date.toLocaleDateString()}</strong>
                         </div>
                         <div className="flex items-center gap-2">
                            <Phone size={14}/> {order.client.name} - <strong>{order.client.phone}</strong>
                         </div>
                      </div>
                   </div>

                   <div>
                      <a href={`tel:${order.client.phone}`} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow hover:bg-green-700 transition">
                         Llamar Cliente
                      </a>
                   </div>
                </div>
             ))}

             {maintenanceData?.length === 0 && (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                   <CheckCircle className="mx-auto mb-2 text-green-500" size={32}/>
                   ¡Todo al día! No hay mantenimientos pendientes por más de 5 meses.
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
