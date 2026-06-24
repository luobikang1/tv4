import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const savedPassword = localStorage.getItem('white_fox_password');
    if (savedPassword) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (pass: string) => {
    localStorage.setItem('white_fox_password', pass);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && <Home />}
      {activeTab === 'settings' && <Settings />}
      {activeTab === 'search' && <Home />}
    </Layout>
  );
};

export default App;
