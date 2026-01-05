import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Reception from './components/Reception';
import Diagnosis from './components/Diagnosis';
import Workshop from './components/Workshop';
import Cashier from './components/Cashier';
import Dashboard from './components/Dashboard';
import VehicleHistory from './components/VehicleHistory';
import MaintenanceControl from './components/MaintenanceControl';

function AppContent() {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'recepcion':
        return <Reception />;
      case 'diagnostico':
        return <Diagnosis />;
      case 'taller':
        return <Workshop />;
      case 'caja':
        return <Cashier />;
      case 'record':
        return <VehicleHistory />;
      case 'mantenimiento':
        return <MaintenanceControl />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
