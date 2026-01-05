import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Wrench, AlertCircle } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Temporary for sign up
import { auth } from '../lib/firebase'; // Direct access for signup

export default function Login() {
  const { login } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        // AuthContext will handle the rest (creating firestore doc)
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error(err);
      // Show specific error for debugging
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-xl inline-block mb-4 shadow-lg shadow-blue-600/30">
            <Wrench size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">FD Auto Repair</h1>
          <p className="text-slate-500">Sistema de Gestión de Taller</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@taller.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg"
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isRegistering ? 'Registrar Cuenta' : 'Iniciar Sesión')}
          </Button>
        </form>

        <div className="mt-6 text-center">
           <button
             onClick={() => setIsRegistering(!isRegistering)}
             className="text-sm text-blue-600 hover:underline"
           >
             {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
           </button>
        </div>
      </div>
    </div>
  );
}
