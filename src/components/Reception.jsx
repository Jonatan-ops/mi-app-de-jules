import React, { useState } from 'react';
import { useOrders } from '../lib/storage';
import { PlusCircle } from 'lucide-react';

export default function Reception() {
  const { addOrder } = useOrders();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.issue) {
      alert("Por favor complete los campos obligatorios (Nombre, Vehículo, Motivo)");
      return;
    }

    addOrder(
      { name: formData.name, phone: formData.phone, email: formData.email },
      { brand: formData.brand, model: formData.model, year: formData.year, plate: formData.plate },
      formData.issue
    );

    // Reset form
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

    alert("Orden creada exitosamente!");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
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

        {/* Motivo */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Motivo de Visita</h3>
          <textarea
            name="issue"
            placeholder="Describa el problema o solicitud del cliente... *"
            value={formData.issue}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95 transform transition-transform"
        >
          <PlusCircle size={24} />
          Abrir Orden de Servicio
        </button>
      </form>
    </div>
  );
}
