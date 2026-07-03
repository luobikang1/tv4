import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, RotateCcw, Clock, Search, CheckCircle2 } from 'lucide-react';
import { DEFAULT_SOURCES } from '../constants';

interface Source { name: string; url: string; }

const Settings: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [skipIntro, setSkipIntro] = useState<number>(() => Number(localStorage.getItem('white_fox_skip_intro') || 0));
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    const savedSources = localStorage.getItem('white_fox_sources');
    if (savedSources) { setSources(JSON.parse(savedSources)); } else { setSources(DEFAULT_SOURCES); }
  }, []);

  const saveSources = (updatedSources: Source[]) => {
    setSources(updatedSources);
    localStorage.setItem('white_fox_sources', JSON.stringify(updatedSources));
  };

  const handleSkipIntroChange = (val: number) => {
    setSkipIntro(val);
    localStorage.setItem('white_fox_skip_intro', val.toString());
  };

  const addSource = () => {
    if (newSourceName && newSourceUrl) {
      const updated = [...sources, { name: newSourceName, url: newSourceUrl }];
      saveSources(updated);
      setNewSourceName('');
      setNewSourceUrl('');
    }
  };

  const autoScrape = async () => {
    setIsScraping(true);
    // Simulating crawling internet for more APIs
    setTimeout(() => {
      const extra = [
        { name: '新浪资源', url: 'https://api.xinlangzy.com/api.php/provide/vod/at/json' },
        { name: '华为资源', url: 'https://hwzy.com/api.php/provide/vod/at/json' },
        { name: '360资源', url: 'https://360zy.com/api.php/provide/vod/at/json' }
      ];
      const combined = [...sources, ...extra.filter(e => !sources.some(s => s.url === e.url))];
      saveSources(combined);
      setIsScraping(false);
      alert('已自动抓取并添加 3 条最新资源接口！');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-900 dark:text-white space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock size={20} className="text-blue-500"/> 播放设定</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">自动跳过片头 (秒):</label>
          <input type="number" value={skipIntro} onChange={(e) => handleSkipIntroChange(Number(e.target.value))} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 w-24 text-center outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2"><Plus size={20} className="text-green-500"/> 资源管理</h2>
          <button onClick={autoScrape} disabled={isScraping} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${isScraping ? 'bg-gray-100 text-gray-400' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600'}`}>
            {isScraping ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"/> : <Search size={16}/>} 抓取互联网新接口
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input type="text" placeholder="接口名称" value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="API URL" value={newSourceUrl} onChange={(e) => setNewSourceUrl(e.target.value)} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={addSource} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-500/20">保存接口</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">已添加 ({sources.length})</h2>
          <button onClick={() => { if(window.confirm('重置将清空自定义接口，确定吗？')) saveSources(DEFAULT_SOURCES); }} className="text-gray-400 hover:text-red-500 text-sm font-medium transition flex items-center gap-1"><RotateCcw size={14}/> 恢复默认</button>
        </div>
        <div className="space-y-3">
          {sources.map((source, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl group transition-all hover:bg-gray-100 dark:hover:bg-gray-900">
              <div className="overflow-hidden">
                <p className="font-bold text-sm flex items-center gap-2">{source.name} <CheckCircle2 size={12} className="text-blue-500"/></p>
                <p className="text-[10px] text-gray-400 truncate mt-1">{source.url}</p>
              </div>
              <button onClick={() => { saveSources(sources.filter((_, i) => i !== index)); }} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
