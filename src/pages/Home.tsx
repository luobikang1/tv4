import React, { useState, useEffect, useCallback, useRef } from 'react';
import VideoList from '../components/video/VideoList';
import Player from '../components/video/Player';
import SearchBar from '../components/video/SearchBar';
import CategoryFilter from '../components/video/CategoryFilter';
import DownloadModal from '../components/video/DownloadModal';
import { fetchVodList, VodInfo } from '../api/vod';
import { ALL_INITIAL_SOURCES } from '../constants';
import { History, Globe, RefreshCw, AlertCircle } from 'lucide-react';

const Home: React.FC<{ forceFavorites?: boolean; forceSearch?: boolean }> = ({ forceFavorites, forceSearch }) => {
  const [videos, setVideos] = useState<VodInfo[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VodInfo | null>(null);
  const [downloadVideo, setDownloadVideo] = useState<VodInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>(ALL_INITIAL_SOURCES);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isGlobalSearch, setIsGlobalSearch] = useState(forceSearch || false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [favorites, setFavorites] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_favorites') || '[]'));
  const [viewHistory, setViewHistory] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_history') || '[]'));
  const [showHistory, setShowHistory] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('white_fox_sources');
    if (saved) setSources(JSON.parse(saved));
  }, []);

  const loadVideos = useCallback(async (keyword?: string) => {
    // Immediate state reset to avoid "display and search mismatch"
    setLoading(true);
    setVideos([]);
    const query = keyword !== undefined ? keyword : searchKeyword;
    setSearchKeyword(query);

    try {
      if (query || isGlobalSearch) {
        const targetSources = isGlobalSearch ? sources.slice(0, 15) : [sources[currentSourceIndex]];
        const results = await Promise.allSettled(
          targetSources.map(source => fetchVodList(source.url, 1, undefined, query))
        );

        let merged = results
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
          .flatMap(r => r.value.list);

        // Intelligent Sorting: Exact match first, then partial match
        if (query) {
           const lowerQuery = query.toLowerCase();
           merged.sort((a, b) => {
             const aMatch = a.name.toLowerCase() === lowerQuery;
             const bMatch = b.name.toLowerCase() === lowerQuery;
             if (aMatch && !bMatch) return -1;
             if (!aMatch && bMatch) return 1;
             return 0;
           });
        }

        // Deduplicate by name and ensure playUrl exists
        const final = merged.filter((v, i, a) =>
          v.playUrl && a.findIndex(t => t.name === v.name) === i
        );

        setVideos(final);
      } else {
        const sourceUrl = sources[currentSourceIndex]?.url;
        if (!sourceUrl) return;
        const data = await fetchVodList(sourceUrl, 1, activeCategory || undefined);
        setVideos(data.list);
        if (data.class?.length > 0 && categories.length === 0) {
          setCategories(data.class.map((c: any) => ({ id: c.type_id, name: c.type_name })));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, currentSourceIndex, isGlobalSearch, sources, searchKeyword, categories.length]);

  useEffect(() => {
    if (!showHistory && !forceFavorites) loadVideos();
  }, [activeCategory, currentSourceIndex, showHistory, isGlobalSearch, forceFavorites, loadVideos]);

  const currentList = forceFavorites ? favorites : (showHistory ? viewHistory : videos);

  return (
    <div className="w-full">
      {!forceFavorites && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <SearchBar onSearch={(kw) => { setActiveCategory(null); loadVideos(kw); }} />
              <button
                onClick={() => setIsGlobalSearch(!isGlobalSearch)}
                className={`px-4 rounded-xl flex items-center gap-2 border transition ${isGlobalSearch ? 'bg-orange-500 text-white border-orange-400' : 'bg-white dark:bg-gray-800 text-gray-500 dark:border-gray-700'}`}
              >
                <Globe size={18} /> <span className="hidden sm:inline font-bold text-sm">全站聚搜</span>
              </button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowHistory(!showHistory)} className={`p-2.5 rounded-xl border transition ${showHistory ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:border-gray-700'}`} title="历史"><History size={20} /></button>
              <button onClick={() => { setSearchKeyword(''); loadVideos(''); }} className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-500 border dark:border-gray-700 hover:text-blue-500 transition-colors"><RefreshCw size={20} /></button>
            </div>
          </div>
          {searchKeyword && (
            <div className="flex items-center gap-2 text-xs text-orange-500 font-medium animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={14}/> 正在为您呈现关键词 “{searchKeyword}” 的最优搜索结果
            </div>
          )}
        </div>
      )}

      {!showHistory && !isGlobalSearch && !forceFavorites && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
           <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500/20 border-t-blue-500"></div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">精准寻影中</p>
        </div>
      ) : (
        <VideoList
          videos={currentList}
          onSelect={(v) => setSelectedVideo(v)}
          favorites={favorites}
          onToggleFavorite={(e, v) => {
            e.stopPropagation();
            const isFav = favorites.some(f => f.id === v.id);
            const updated = isFav ? favorites.filter(f => f.id !== v.id) : [v, ...favorites];
            setFavorites(updated);
            localStorage.setItem('white_fox_favorites', JSON.stringify(updated));
          }}
        />
      )}

      {selectedVideo && (
        <Player
          url={selectedVideo.playUrl.split('$')[1] || selectedVideo.playUrl}
          title={selectedVideo.name}
          playlist={selectedVideo.playUrl}
          onBack={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default Home;
