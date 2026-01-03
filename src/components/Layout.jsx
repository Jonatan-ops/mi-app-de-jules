import React, { useState } from 'react';
import { ClipboardList, Wrench, CheckCircle, DollarSign, LayoutDashboard, History, Calendar } from 'lucide-react';
import clsx from 'clsx';
import MechanicsManager from './MechanicsManager';

export default function Layout({ children, currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Tablero', icon: LayoutDashboard },
    { id: 'recepcion', label: 'Recepción', icon: ClipboardList },
    { id: 'diagnostico', label: 'Diagnóstico', icon: Wrench },
    { id: 'taller', label: 'Taller', icon: CheckCircle },
    { id: 'caja', label: 'Caja', icon: DollarSign },
    { id: 'record', label: 'Historial', icon: History },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 shadow-md flex justify-between items-center print:hidden">
        <h1 className="text-xl font-bold tracking-wider">FD Auto Repair</h1>
        <div className="text-sm opacity-75">Manager v2.1</div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 print:p-0 print:overflow-visible">
        {children}

        {/* Mechanics Manager Footer (Only visible on Dashboard) */}
        {currentTab === 'dashboard' && (
           <div className="max-w-6xl mx-auto print:hidden pb-20">
             <MechanicsManager />
           </div>
        )}
      </main>

      {/* Persistent Bottom Navigation (Mobile Friendly) */}
      <nav className="bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-lg print:hidden overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={clsx(
                "flex flex-col items-center p-2 rounded-lg min-w-[60px] w-full transition-colors duration-200",
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
