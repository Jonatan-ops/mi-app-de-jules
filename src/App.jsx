import React, { useState } from 'react';
import Layout from './components/Layout';
import Reception from './components/Reception';
import Diagnosis from './components/Diagnosis';
import Workshop from './components/Workshop';
import Cashier from './components/Cashier';
import Dashboard from './components/Dashboard';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'recepcion':
        return <Reception />;
      case 'diagnostico':
        return <Diagnosis />;
      case 'taller':
        return <Workshop />;
      case 'caja':
        return <Cashier />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
