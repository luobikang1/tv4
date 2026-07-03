import React, { useState, useEffect } from 'react';
import VideoList from '../components/video/VideoList';
import Player from '../components/video/Player';
import SearchBar from '../components/video/SearchBar';
import CategoryFilter from '../components/video/CategoryFilter';
import { fetchVodList, VodInfo } from '../api/vod';
import { ALL_INITIAL_SOURCES } from '../constants';
import { History, Trash2, Globe, Zap } from 'lucide-react';

const Home: React.FC = () => {
  const [videos, setVideos] = useState<VodInfo[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VodInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>(ALL_INITIAL_SOURCES);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [viewHistory, setViewHistory] = useState<VodInfo[]>(() => {
    return JSON.parse(localStorage.getItem('white_fox_history') || '[]');
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('white_fox_sources');
    if (saved) setSources(JSON.parse(saved));
    if (!showHistory && !isGlobalSearch) loadVideos();
  }, [activeCategory, currentSourceIndex, showHistory, isGlobalSearch]);

  const loadVideos = async (keyword?: string) => {
    setLoading(true);
    try {
      if (keyword && (isGlobalSearch || keyword.startsWith('!'))) {
        // One-click Global Search logic
        const realKeyword = keyword.startsWith('!') ? keyword.substring(1) : keyword;
        const results = await Promise.all(
          sources.slice(0, 15).map(async (source) => {
            try {
              const data = await fetchVodList(source.url, 1, undefined, realKeyword);
              return data.list;
            } catch { return []; }
          })
        );
        const merged = results.flat().filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        setVideos(merged);
      } else {
        const sourceUrl = sources[currentSourceIndex]?.url;
        if (!sourceUrl) return;
        const data = await fetchVodList(sourceUrl, 1, activeCategory || undefined, keyword);
        setVideos(data.list);
        if (data.class.length > 0 && categories.length === 0) {
          setCategories(data.class.map((c: any) => ({ id: c.type_id, name: c.type_name })));
        }
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <SearchBar onSearch={(kw) => loadVideos(kw)} />
          </div>
          <button
            onClick={() => setIsGlobalSearch(!isGlobalSearch)}
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition ${isGlobalSearch ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <Globe size={18} />
            <span className="font-medium whitespace-nowrap">{isGlobalSearch ? '全站聚搜中' : '全站聚搜'}</span>
          </button>
        </div>
        <div className="flex items-center gap-3 self-end">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <History size={18} /> {showHistory ? '返回首页' : '播放历史'}
          </button>
        </div>
      </div>

      {!showHistory && !isGlobalSearch && (
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">当前线路:</span>
          <select
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            value={currentSourceIndex}
            onChange={(e) => setCurrentSourceIndex(Number(e.target.value))}
          >
            {sources.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
          </select>
          <div className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
            <Zap size={12} /> 自动代理已开启
          </div>
        </div>
      )}

      {isGlobalSearch && !loading && videos.length > 0 && (
        <div className="mb-4 text-sm text-orange-500 font-medium">
          已为您从全站聚合搜索到 {videos.length} 条资源
        </div>
      )}

      {!showHistory && !isGlobalSearch && <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-500">{isGlobalSearch ? '正在聚合全网资源，请稍候...' : '加载中...'}</p>
        </div>
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
