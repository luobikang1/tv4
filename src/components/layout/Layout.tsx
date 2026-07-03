import React from 'react';
import Navbar from './Navbar';
import { Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, theme, toggleTheme }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 pb-20 md:pb-0 h-screen overflow-y-auto">
        <header className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-40">
          <div className="flex flex-col"><h1 className="text-xl font-bold md:hidden">白狐影视</h1><span className="text-[10px] text-orange-500 md:hidden">若无法播放，请尝试下载/外部播放</span></div>
          <div className="hidden md:block">
            <span className="text-gray-500 dark:text-gray-400">当前频道: </span>
            <span className="font-medium text-blue-500 capitalize">
              {activeTab === 'home' ? '推荐首页' : activeTab === 'search' ? '全网搜索' : '系统设置'}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
