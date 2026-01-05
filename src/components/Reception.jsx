import React, { useState } from 'react';
import { createOrder } from '../lib/firestoreService';
import { ORDER_STATUS } from '../lib/constants';
import { PlusCircle, Camera, X } from 'lucide-react';

export default function Reception() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    brand: '',
    model: '',
    year: '',
    plate: '',
    issue: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.issue) {
      alert("Por favor complete los campos obligatorios (Nombre, Vehículo, Motivo)");
      return;
    }
    setLoading(true);

    try {
      const orderData = {
        status: ORDER_STATUS.RECEPCION,
        client: { name: formData.name, phone: formData.phone, email: formData.email },
        vehicle: { brand: formData.brand, model: formData.model, year: formData.year, plate: formData.plate },
        issue: formData.issue,
        diagnosis: '',
        mechanicId: null,
        items: [],
        totals: { subtotal: 0, tax: 0, total: 0 }
      };

      await createOrder(orderData, files);

      // Reset
      setFormData({
        name: '',
        phone: '',
        email: '',
        brand: '',
        model: '',
        year: '',
        plate: '',
        issue: ''
      });
      setFiles([]);
      alert("Orden creada exitosamente!");
    } catch (error) {
      console.error(error);
      alert("Error al guardar la orden: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-2">Nueva Recepción</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Datos del Cliente</h3>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Nombre Completo *"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Vehículo */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Datos del Vehículo</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="brand"
              placeholder="Marca *"
              value={formData.brand}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="text"
              name="model"
              placeholder="Modelo"
              value={formData.model}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="number"
              name="year"
              placeholder="Año"
              value={formData.year}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              name="plate"
              placeholder="Placa/Matrícula"
              value={formData.plate}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Motivo & Documentos */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Motivo de Visita & Documentos</h3>
          <textarea
            name="issue"
            placeholder="Describa el problema o solicitud del cliente... *"
            value={formData.issue}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 mb-4"
            required
          />

          <div className="flex flex-col gap-3">
             <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition w-fit">
                <Camera className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Adjuntar Fotos/Docs</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
             </label>

             {files.length > 0 && (
               <div className="flex flex-wrap gap-2">
                 {files.map((file, idx) => (
                   <div key={idx} className="relative group">
                     <div className="text-xs bg-gray-200 px-2 py-1 rounded max-w-[150px] truncate">
                       {file.name}
                     </div>
                     <button
                       type="button"
                       onClick={() => removeFile(idx)}
                       className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                     >
                       <X size={12} />
                     </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95 transform transition-transform ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Subiendo...' : (
             <>
               <PlusCircle size={24} />
               Abrir Orden de Servicio
             </>
          )}
        </button>
      </form>
    </div>
  );
}
