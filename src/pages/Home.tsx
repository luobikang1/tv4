import React, { useState, useEffect } from 'react';
import VideoList from '../components/video/VideoList';
import Player from '../components/video/Player';
import SearchBar from '../components/video/SearchBar';
import CategoryFilter from '../components/video/CategoryFilter';
import DownloadModal from '../components/video/DownloadModal';
import { fetchVodList, VodInfo } from '../api/vod';
import { ALL_INITIAL_SOURCES } from '../constants';
import { History, Trash2, Globe, Zap, Download } from 'lucide-react';

const Home: React.FC = () => {
  const [videos, setVideos] = useState<VodInfo[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VodInfo | null>(null);
  const [downloadVideo, setDownloadVideo] = useState<VodInfo | null>(null);
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
      if (keyword) {
        const searchResults = await Promise.all(
          (isGlobalSearch ? sources.slice(0, 15) : [sources[currentSourceIndex]]).map(async (source) => {
            try {
              const data = await fetchVodList(source.url, 1, undefined, keyword);
              return data.list;
            } catch { return []; }
          })
        );
        const merged = searchResults.flat().filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
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
      <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 p-2 rounded-lg mb-6 text-center text-xs text-orange-600 dark:text-orange-400">
        📢 页面不能正常播放，请进入下载页面观看。
      </div>

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
            <span className="font-medium whitespace-nowrap">{isGlobalSearch ? '聚合搜索中' : '全站聚搜'}</span>
          </button>
        </div>
        <div className="flex items-center gap-3 self-end">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <History size={18} /> {showHistory ? '返回' : '历史'}
          </button>
        </div>
      </div>

      {!showHistory && !isGlobalSearch && (
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">路线:</span>
          <select
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            value={currentSourceIndex}
            onChange={(e) => setCurrentSourceIndex(Number(e.target.value))}
          >
            {sources.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
          </select>
        </div>
      )}

      {!showHistory && !isGlobalSearch && <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-500">聚合搜索中...</p>
        </div>
      ) : (
        <div className="relative">
           <VideoList videos={showHistory ? viewHistory : videos} onSelect={handleSelectVideo} />
           {/* We can add a download icon overlay or just handle it in the player modal.
               The user asked for a download page/modal. Let's add it to the player or separate button. */}
        </div>
      )}

      {selectedVideo && (
        <div className="relative">
           <Player
             url={selectedVideo.playUrl.split('$')[1] || selectedVideo.playUrl}
             title={selectedVideo.name}
             onBack={() => setSelectedVideo(null)}
           />
           <button
             onClick={() => setDownloadVideo(selectedVideo)}
             className="fixed bottom-6 right-6 z-[110] bg-orange-500 text-white p-4 rounded-full shadow-xl hover:scale-110 transition active:scale-95"
             title="进入下载页面"
           >
             <Download size={24} />
           </button>
        </div>
      )}

      {downloadVideo && (
        <DownloadModal
          title={downloadVideo.name}
          url={downloadVideo.playUrl.split('$')[1] || downloadVideo.playUrl}
          onClose={() => setDownloadVideo(null)}
        />
      )}
    </div>
  );
};

export default Home;
