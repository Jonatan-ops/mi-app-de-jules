import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Users, Plus, Trash2 } from 'lucide-react';

export default function MechanicsManager() {
  const mechanics = useLiveQuery(() => db.mechanics.toArray());
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async () => {
    if (!newName || !newCode) return;
    await db.mechanics.add({ name: newName, code: newCode });
    setNewName('');
    setNewCode('');
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar mecánico?')) {
      await db.mechanics.delete(id);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-slate-700 font-bold mb-4"
      >
        <Users size={20} /> Gestión de Mecánicos
      </button>

      {isOpen && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2">
            <input
              className="border p-2 rounded flex-1"
              placeholder="Nombre del Mecánico"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <input
              className="border p-2 rounded w-32"
              placeholder="Código"
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
            />
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              <Plus />
            </button>
          </div>

          <div className="divide-y">
            {mechanics?.map(mec => (
              <div key={mec.id} className="flex justify-between items-center py-2">
                <div>
                  <div className="font-medium">{mec.name}</div>
                  <div className="text-xs text-gray-500">Código: {mec.code}</div>
                </div>
                <button
                  onClick={() => handleDelete(mec.id)}
                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
