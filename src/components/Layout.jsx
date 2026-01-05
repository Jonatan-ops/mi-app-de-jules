import React, { useState } from 'react';
import { ClipboardList, Wrench, CheckCircle, DollarSign, LayoutDashboard, History, Menu, X, LogOut } from 'lucide-react';
import clsx from 'clsx';
import MechanicsManager from './MechanicsManager';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children, currentTab, setCurrentTab }) {
  const { userRole, logout, currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Tablero', icon: LayoutDashboard },
    { id: 'recepcion', label: 'Recepción', icon: ClipboardList },
    { id: 'diagnostico', label: 'Diagnóstico', icon: Wrench },
    { id: 'taller', label: 'Taller', icon: CheckCircle },
    { id: 'caja', label: 'Caja', icon: DollarSign },
    { id: 'record', label: 'Historial', icon: History },
  ];

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
          <h1 className="text-xl font-bold tracking-wider flex items-center gap-2">
            <Wrench className="text-blue-500" />
            FD Auto
          </h1>
          <div className="text-xs text-slate-500 mt-1 pl-8">Manager v2.2</div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map(tab => <NavItem key={tab.id} tab={tab} />)}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button
             onClick={handleLogout}
             className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 w-full text-left transition-colors"
           >
             <LogOut size={20} />
             <span className="font-medium">Cerrar Sesión</span>
           </button>
           <div className="text-center text-xs text-slate-600 mt-4">
             &copy; 2024 FD Auto Repair
           </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl animate-fade-in-right">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center">
               <span className="font-bold text-lg">Menú</span>
               <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
             </div>
             <nav className="flex-1 p-4 space-y-2">
               {tabs.map(tab => <NavItem key={tab.id} tab={tab} mobile={true} />)}

               <div className="pt-4 border-t border-slate-800 mt-4">
                 <button
                   onClick={handleLogout}
                   className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 w-full text-left"
                 >
                   <LogOut size={20} />
                   <span className="font-medium">Cerrar Sesión</span>
                 </button>
               </div>
             </nav>
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
          <div className="font-bold flex items-center gap-2">
            <Wrench className="text-blue-500" size={20} />
            FD Auto
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 rounded hover:bg-slate-800">
            <Menu size={24} />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible scroll-smooth">
          {/* Header for Desktop */}
          <div className="hidden md:flex justify-between items-center mb-6 print:hidden">
             <h2 className="text-2xl font-bold text-slate-800">
               {tabs.find(t => t.id === currentTab)?.label}
             </h2>
             <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${userRole === 'admin' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                Usuario: <strong>{currentUser?.email} ({userRole === 'admin' ? 'Admin' : 'Encargado'})</strong>
             </div>
          </div>

          {children}

          {/* Mechanics Manager Footer (Only visible on Dashboard and ONLY ADMIN) */}
          {currentTab === 'dashboard' && userRole === 'admin' && (
             <div className="max-w-6xl mx-auto print:hidden pb-20 mt-8">
               <MechanicsManager />
             </div>
          )}
        </main>
      </div>
    </div>
  );
}
