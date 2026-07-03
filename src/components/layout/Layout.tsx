import React from 'react';
import Navbar from './Navbar';
import { Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, theme, toggleTheme, onLogout }) => {
  const titles: Record<string, string> = {
    home: '精选推荐',
    favorites: '我的收藏',
    search: '全网搜索',
    settings: '系统设置'
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      <main className="flex-1 pb-20 md:pb-0 h-screen overflow-y-auto">
        <header className="p-4 md:px-8 md:py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-40">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold md:text-2xl">白狐影视</h1>
            <span className="text-[10px] text-orange-500">若无法播放，请进入下载页面观看</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block mr-4">
              <span className="text-gray-400 text-sm">当前: </span>
              <span className="font-medium text-blue-500">{titles[activeTab] || '白狐'}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:scale-105 transition-all"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
