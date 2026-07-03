import React, { useState, useEffect, useCallback } from 'react';
import VideoList from '../components/video/VideoList';
import Player from '../components/video/Player';
import SearchBar from '../components/video/SearchBar';
import CategoryFilter from '../components/video/CategoryFilter';
import DownloadModal from '../components/video/DownloadModal';
import { fetchVodList, VodInfo } from '../api/vod';
import { ALL_INITIAL_SOURCES } from '../constants';
import { History, Globe, Flame, LayoutGrid, Download, RefreshCw } from 'lucide-react';

interface HomeProps {
  forceFavorites?: boolean;
  forceSearch?: boolean;
}

const Home: React.FC<HomeProps> = ({ forceFavorites, forceSearch }) => {
  const [videos, setVideos] = useState<VodInfo[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VodInfo | null>(null);
  const [downloadVideo, setDownloadVideo] = useState<VodInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>(ALL_INITIAL_SOURCES);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isGlobalSearch, setIsGlobalSearch] = useState(forceSearch || false);
  const [lastKeyword, setLastKeyword] = useState('');

  const [viewHistory, setViewHistory] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_history') || '[]'));
  const [favorites, setFavorites] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_favorites') || '[]'));
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('white_fox_sources');
    if (saved) setSources(JSON.parse(saved));
  }, []);

  const loadVideos = useCallback(async (keyword?: string) => {
    setLoading(true);
    const query = keyword !== undefined ? keyword : lastKeyword;
    setLastKeyword(query);

    try {
      if (query || isGlobalSearch) {
        // When searching, we query more sources or the selected one
        const targetSources = isGlobalSearch ? sources.slice(0, 12) : [sources[currentSourceIndex]];

        const results = await Promise.allSettled(
          targetSources.map(source => fetchVodList(source.url, 1, undefined, query))
        );

        const merged = results
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
          .flatMap(r => r.value.list)
          .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);

        setVideos(merged);
      } else {
        const sourceUrl = sources[currentSourceIndex]?.url;
        if (!sourceUrl) return;
        const data = await fetchVodList(sourceUrl, 1, activeCategory || undefined);
        setVideos(data.list);
        if (data.class && data.class.length > 0 && categories.length === 0) {
          setCategories(data.class.map((c: any) => ({ id: c.type_id, name: c.type_name })));
        }
      }
    } catch (error) {
      console.error('Load videos error:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, currentSourceIndex, isGlobalSearch, sources, lastKeyword]);

  useEffect(() => {
    if (!showHistory && !forceFavorites) {
      loadVideos();
    }
  }, [activeCategory, currentSourceIndex, showHistory, isGlobalSearch, forceFavorites, loadVideos]);

  const handleSelectVideo = (video: VodInfo) => {
    setSelectedVideo(video);
    const updatedHistory = [video, ...viewHistory.filter(v => v.id !== video.id)].slice(0, 50);
    setViewHistory(updatedHistory);
    localStorage.setItem('white_fox_history', JSON.stringify(updatedHistory));
  };

  const toggleFavorite = (e: React.MouseEvent, video: VodInfo) => {
    e.stopPropagation();
    const isFav = favorites.some(v => v.id === video.id);
    const updated = isFav ? favorites.filter(v => v.id !== video.id) : [video, ...favorites];
    setFavorites(updated);
    localStorage.setItem('white_fox_favorites', JSON.stringify(updated));
  };

  const currentList = forceFavorites ? favorites : (showHistory ? viewHistory : videos);

  return (
    <div className="w-full">
      {!forceFavorites && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <SearchBar onSearch={(kw) => loadVideos(kw)} />
            </div>
            <button
              onClick={() => setIsGlobalSearch(!isGlobalSearch)}
              className={`px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition ${isGlobalSearch ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}
            >
              <Globe size={18} />
              <span className="font-bold text-sm whitespace-nowrap">{isGlobalSearch ? '聚合搜索中' : '全站聚搜'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2.5 rounded-xl transition ${showHistory ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}
              title="历史记录"
            >
              <History size={20} />
            </button>
            <button
              onClick={() => loadVideos()}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700 hover:text-blue-500 transition-all active:rotate-180"
              title="刷新"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      )}

      {!showHistory && !isGlobalSearch && !forceFavorites && (
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
           <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mr-2 whitespace-nowrap"><LayoutGrid size={14}/> 分类:</div>
           <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-bold animate-pulse">正在为您搜索最快资源...</p>
        </div>
      ) : (
        <div className="w-full">
          {currentList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
               <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                  <Globe size={48} className="opacity-20"/>
               </div>
               <p className="font-bold">未找到相关资源，请尝试切换全站搜索或更换关键词</p>
            </div>
          )}
          <VideoList
            videos={currentList}
            onSelect={handleSelectVideo}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      )}

      {selectedVideo && (
        <div className="relative">
          <Player
            url={selectedVideo.playUrl.split('$')[1] || selectedVideo.playUrl}
            title={selectedVideo.name}
            playlist={selectedVideo.playUrl}
            onBack={() => setSelectedVideo(null)}
          />
          <button
            onClick={() => setDownloadVideo(selectedVideo)}
            className="fixed bottom-10 right-10 z-[110] bg-orange-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition active:scale-90"
          >
            <Download size={26}/>
          </button>
        </div>
      )}
      {downloadVideo && <DownloadModal title={downloadVideo.name} url={downloadVideo.playUrl.split('$')[1] || downloadVideo.playUrl} onClose={() => setDownloadVideo(null)} />}
    </div>
  );
};

export default Home;
