import React, { useState, useEffect } from 'react';
import VideoList from '../components/video/VideoList';
import Player from '../components/video/Player';
import SearchBar from '../components/video/SearchBar';
import CategoryFilter from '../components/video/CategoryFilter';
import { fetchVodList, VodInfo } from '../api/vod';
import { ALL_INITIAL_SOURCES } from '../constants';
import { History, Trash2 } from 'lucide-react';

const Home: React.FC = () => {
  const [videos, setVideos] = useState<VodInfo[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VodInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>(ALL_INITIAL_SOURCES);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [viewHistory, setViewHistory] = useState<VodInfo[]>(() => {
    return JSON.parse(localStorage.getItem('white_fox_history') || '[]');
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('white_fox_sources');
    if (saved) setSources(JSON.parse(saved));
    if (!showHistory) loadVideos();
  }, [activeCategory, currentSourceIndex, showHistory]);

  const loadVideos = async (keyword?: string) => {
    setLoading(true);
    try {
      const sourceUrl = sources[currentSourceIndex]?.url;
      if (!sourceUrl) return;
      const data = await fetchVodList(sourceUrl, 1, activeCategory || undefined, keyword);
      setVideos(data.list);
      if (data.class.length > 0 && categories.length === 0) {
        setCategories(data.class.map((c: any) => ({ id: c.type_id, name: c.type_name })));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVideo = (video: VodInfo) => {
    setSelectedVideo(video);
    const updatedHistory = [video, ...viewHistory.filter(v => v.id !== video.id)].slice(0, 50);
    setViewHistory(updatedHistory);
    localStorage.setItem('white_fox_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (window.confirm('确定要清空观看历史吗？')) {
      setViewHistory([]);
      localStorage.removeItem('white_fox_history');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <SearchBar onSearch={(kw) => loadVideos(kw)} />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <History size={18} /> {showHistory ? '返回首页' : '播放历史'}
          </button>
          {showHistory && viewHistory.length > 0 && (
            <button onClick={clearHistory} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {!showHistory && (
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">数据源:</span>
          <select
            className="bg-gray-100 dark:bg-gray-800 border-none rounded px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={currentSourceIndex}
            onChange={(e) => setCurrentSourceIndex(Number(e.target.value))}
          >
            {sources.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
          </select>
        </div>
      )}

      {!showHistory && <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
      ) : (
        <VideoList videos={showHistory ? viewHistory : videos} onSelect={handleSelectVideo} />
      )}

      {selectedVideo && (
        <Player
          url={selectedVideo.playUrl.split('$')[1] || selectedVideo.playUrl}
          title={selectedVideo.name}
          onBack={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default Home;
