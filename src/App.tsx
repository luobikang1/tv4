import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('white_fox_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const savedPassword = localStorage.getItem('white_fox_password');
    if (savedPassword) setIsAuthenticated(true);
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('white_fox_theme', newTheme);
  };

  const handleLogin = (pass: string) => {
    localStorage.setItem('white_fox_password', pass);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className={theme}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme}>
        {activeTab === 'home' && <Home />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'search' && <Home />}
      </Layout>
    </div>
  );
};

export default App;
