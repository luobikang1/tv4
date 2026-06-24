import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 pb-20 md:pb-0 h-screen overflow-y-auto">
        <header className="p-4 md:p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur sticky top-0 z-40">
          <h1 className="text-xl font-bold md:hidden">白狐影视</h1>
          <div className="hidden md:block">
            <span className="text-gray-400">当前频道: </span>
            <span className="font-medium text-blue-400 capitalize">
              {activeTab === 'home' ? '推荐首页' : activeTab === 'search' ? '全网搜索' : '系统设置'}
            </span>
          </div>
          <div className="flex items-center gap-4">
             {/* Profile/Other icons */}
          </div>
        </header>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
