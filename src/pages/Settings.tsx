import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import { DEFAULT_SOURCES } from '../constants';

interface Source {
  name: string;
  url: string;
}

const Settings: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  useEffect(() => {
    const savedSources = localStorage.getItem('white_fox_sources');
    if (savedSources) {
      setSources(JSON.parse(savedSources));
    } else {
      setSources(DEFAULT_SOURCES);
    }
  }, []);

  const saveSources = (updatedSources: Source[]) => {
    setSources(updatedSources);
    localStorage.setItem('white_fox_sources', JSON.stringify(updatedSources));
  };

  const addSource = () => {
    if (newSourceName && newSourceUrl) {
      const updated = [...sources, { name: newSourceName, url: newSourceUrl }];
      saveSources(updated);
      setNewSourceName('');
      setNewSourceUrl('');
    }
  };

  const deleteSource = (index: number) => {
    const updated = sources.filter((_, i) => i !== index);
    saveSources(updated);
  };

  const resetSources = () => {
    if (window.confirm('确定要重置所有资源接口吗？')) {
      saveSources(DEFAULT_SOURCES);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-900 dark:text-white">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8 transition-colors">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus size={20} /> 添加资源接口
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="接口名称 (如: 卧龙资源)"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="text"
            placeholder="API URL (JSON格式)"
            value={newSourceUrl}
            onChange={(e) => setNewSourceUrl(e.target.value)}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          onClick={addSource}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition flex items-center gap-2"
        >
          <Save size={18} /> 保存接口
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">已添加的接口</h2>
          <button
            onClick={resetSources}
            className="text-gray-500 hover:text-red-500 flex items-center gap-1 text-sm transition-colors"
          >
            <RotateCcw size={16} /> 恢复默认
          </button>
        </div>
        <div className="space-y-3">
          {sources.map((source, index) => (
            <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded shadow-sm transition-colors">
              <div className="overflow-hidden">
                <p className="font-medium">{source.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{source.url}</p>
              </div>
              <button
                onClick={() => deleteSource(index)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
