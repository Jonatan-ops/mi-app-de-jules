import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseConfig, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Trash2 } from 'lucide-react';

export default function UserManager() {
  const { userRole, companyId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'mecanico' });

  // Load Users
  React.useEffect(() => {
    if (!companyId) return;
    const fetchUsers = async () => {
       try {
           const q = query(collection(db, 'users'), where('companyId', '==', companyId));
           const snapshot = await getDocs(q);
           setUsers(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
       } catch (error) {
           console.error("Error fetching users:", error);
       }
    };
    fetchUsers();
  }, [companyId]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Initialize secondary app
    // Note: We use a unique name for the secondary app to avoid conflicts if called multiple times
    const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp-" + Date.now());
    const secondaryAuth = getAuth(secondaryApp);

    try {
       // Create User in Auth
       const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password);
       const uid = userCredential.user.uid;

       // Create User in Firestore (Using MAIN app db)
       await setDoc(doc(db, 'users', uid), {
          email: newUser.email,
          role: newUser.role,
          companyId: companyId,
          name: newUser.name || '',
          createdAt: serverTimestamp()
       });

       // Sign out the secondary user so it doesn't interfere
       await signOut(secondaryAuth);

       // Refresh list locally
       setUsers([...users, { id: uid, email: newUser.email, role: newUser.role, name: newUser.name }]);
       setNewUser({ email: '', password: '', name: '', role: 'mecanico' });
       alert("Usuario creado exitosamente");

    } catch (error) {
       console.error(error);
       alert("Error al crear usuario: " + error.message);
    } finally {
       setLoading(false);
       // Ideally we would delete the app instance but firebase web sdk doesn't make it easy/necessary for this scope
    }
  };

  if (userRole !== 'admin') {
      return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado: Solo administradores.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
       <div className="flex items-center gap-2 mb-4">
          <div className="bg-slate-100 text-slate-600 p-2 rounded-lg"><Users size={24} /></div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
       </div>

       {/* Create User Form */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-lg mb-4 text-slate-700">Registrar Nuevo Empleado</h2>
          <form onSubmit={handleCreateUser} className="grid md:grid-cols-2 gap-4">
             <input
               type="text" placeholder="Nombre"
               className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
               value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
             />
             <input
               type="email" placeholder="Email" required
               className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
               value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
             />
             <input
               type="password" placeholder="Contraseña" required
               className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
               value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
             />
             <select
               className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
               value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
             >
                <option value="encargado">Encargado</option>
                <option value="mecanico">Mecánico</option>
                <option value="admin">Administrador</option>
             </select>
             <button disabled={loading} className="col-span-2 bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                {loading ? 'Creando...' : 'Crear Usuario'}
             </button>
          </form>
       </div>

       {/* User List */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 border-b">
                <tr>
                   <th className="p-4 font-semibold text-slate-600">Nombre</th>
                   <th className="p-4 font-semibold text-slate-600">Email</th>
                   <th className="p-4 font-semibold text-slate-600">Rol</th>
                   <th className="p-4 text-right font-semibold text-slate-600">Acciones</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                   <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 text-slate-800 font-medium">{u.name || '-'}</td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4 capitalize text-slate-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              u.role === 'encargado' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role}
                          </span>
                      </td>
                      <td className="p-4 text-right">
                         <button className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"><Trash2 size={18}/></button>
                      </td>
                   </tr>
                ))}
                {users.length === 0 && (
                    <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-400">No hay otros usuarios registrados.</td>
                    </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
