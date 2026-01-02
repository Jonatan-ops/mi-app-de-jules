import React, { useState } from 'react';
import { ClipboardList, Wrench, CheckCircle, DollarSign, Menu } from 'lucide-react';
import clsx from 'clsx';

export default function Layout({ children, currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'recepcion', label: 'Recepción', icon: ClipboardList },
    { id: 'diagnostico', label: 'Diagnóstico', icon: Wrench },
    { id: 'taller', label: 'Taller', icon: CheckCircle },
    { id: 'caja', label: 'Caja', icon: DollarSign },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider">FD Auto Repair</h1>
        <div className="text-sm opacity-75">Manager v1.0</div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>

      {/* Persistent Bottom Navigation (Mobile Friendly) */}
      <nav className="bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={clsx(
                "flex flex-col items-center p-2 rounded-lg w-full transition-colors duration-200",
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
