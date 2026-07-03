import React from 'react';
import { Home, Search, Settings, LogOut, Heart } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const tabs = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'favorites', icon: Heart, label: '收藏' },
    { id: 'search', icon: Search, label: '搜索' },
    { id: 'settings', icon: Settings, label: '设置' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 md:relative md:border-t-0 md:border-r md:w-20 md:h-screen flex md:flex-col items-center justify-around md:justify-start md:pt-8 z-50 transition-colors">
      <div className="hidden md:block mb-10">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">狐</div>
      </div>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col md:mb-8 items-center ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
          <tab.icon size={22} />
          <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
        </button>
      ))}
      <button
        onClick={onLogout}
        className="flex flex-col md:mt-auto md:mb-8 items-center text-gray-400 hover:text-red-500 transition-colors"
      >
        <LogOut size={22} />
        <span className="text-[10px] mt-1 font-medium">退出</span>
      </button>
    </nav>
  );
};

export default Navbar;
