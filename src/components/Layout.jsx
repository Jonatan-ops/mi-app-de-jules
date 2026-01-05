import React, { useState } from 'react';
import { ClipboardList, Wrench, CheckCircle, DollarSign, LayoutDashboard, History, Menu, X, LogOut, Users, Search, Bell, Plus, Car } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children, currentTab, setCurrentTab, searchTerm, setSearchTerm }) {
  const { userRole, logout, currentUser, company } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Tablero de Control', icon: LayoutDashboard },
    { id: 'recepcion', label: 'Recepción', icon: ClipboardList },
    { id: 'diagnostico', label: 'Diagnóstico', icon: Wrench },
    { id: 'taller', label: 'Taller', icon: CheckCircle },
    { id: 'caja', label: 'Caja', icon: DollarSign },
    { id: 'record', label: 'Historial', icon: History },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Car },
  ];

  if (userRole === 'admin') {
      tabs.push({ id: 'usuarios', label: 'Gestión Usuarios', icon: Users });
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const NavItem = ({ tab, mobile = false }) => {
    const Icon = tab.icon;
    const isActive = currentTab === tab.id;
    return (
      <button
        onClick={() => {
          setCurrentTab(tab.id);
          if (mobile) setIsMobileMenuOpen(false);
        }}
        className={clsx(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left",
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        )}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="font-medium">{tab.label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white border-r border-slate-800 shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
                <Wrench className="text-white" size={24} />
             </div>
             <div className="overflow-hidden">
                 <h1 className="text-lg font-bold tracking-wide leading-tight text-white truncate" title={company?.name}>
                     {company?.name || "Mi Taller"}
                 </h1>
                 <div className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase mt-1">Repair Manager</div>
             </div>
          </div>
        </div>

        <div className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
           Principal
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {tabs.map(tab => (
              <React.Fragment key={tab.id}>
                  {tab.id === 'taller' && <div className="mt-4 mb-2 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Gestión</div>}
                  <NavItem tab={tab} />
              </React.Fragment>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-slate-600">
                   {currentUser?.email?.substring(0,2).toUpperCase()}
               </div>
               <div className="overflow-hidden flex-1">
                   <div className="text-sm font-bold text-white truncate">{currentUser?.email?.split('@')[0]}</div>
                   <div className="text-xs text-slate-400 capitalize flex items-center gap-1">
                       <div className={`w-1.5 h-1.5 rounded-full ${userRole === 'admin' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                       {userRole === 'admin' ? 'Gerente General' : userRole}
                   </div>
               </div>
               <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition" title="Cerrar Sesión">
                   <LogOut size={18} />
               </button>
           </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-72 bg-slate-900 text-white flex flex-col h-full shadow-2xl animate-fade-in-right">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center">
               <span className="font-bold text-lg">{company?.name || "FD Auto"}</span>
               <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
             </div>
             <nav className="flex-1 p-4 space-y-2">
               {tabs.map(tab => <NavItem key={tab.id} tab={tab} mobile={true} />)}
             </nav>
             <div className="p-4 border-t border-slate-800">
                 <button onClick={handleLogout} className="flex items-center gap-2 text-red-400">
                    <LogOut size={20}/> Cerrar Sesión
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
          <div className="font-bold flex items-center gap-2">
            <Wrench className="text-blue-500" size={20} />
            {company?.name || "FD Auto"}
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 rounded hover:bg-slate-800">
            <Menu size={24} />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible scroll-smooth relative">

          {/* Top Bar (Desktop) */}
          <div className="hidden md:flex justify-between items-center mb-8 sticky top-0 bg-gray-100 z-10 py-2">
             <h2 className="text-2xl font-bold text-slate-800">
               {tabs.find(t => t.id === currentTab)?.label}
             </h2>

             <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-slate-200 px-4">
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                    <input
                        className="pl-10 pr-4 py-1.5 bg-slate-50 border-none rounded-full text-sm w-64 focus:ring-0 focus:bg-white transition-all outline-none"
                        placeholder="Buscar orden, placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                    />
                 </div>

                 <div className="h-6 w-px bg-slate-200 mx-2"></div>

                 <button className="text-slate-400 hover:text-blue-600 relative p-1 transition">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                 </button>

                 <button
                   onClick={() => setCurrentTab('recepcion')}
                   className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
                 >
                    <Plus size={18} /> Nueva Orden
                 </button>
             </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
