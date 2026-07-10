import React, { useState, useEffect, useCallback } from 'react';
import VideoList from '../components/video/VideoList';
import Player from '../components/video/Player';
import SearchBar from '../components/video/SearchBar';
import CategoryFilter from '../components/video/CategoryFilter';
import DownloadModal from '../components/video/DownloadModal';
import { fetchVodList, VodInfo } from '../api/vod';
import { ALL_INITIAL_SOURCES, ADULT_SOURCES } from '../constants';
import { History, Globe, RefreshCw, AlertCircle } from 'lucide-react';

const Home: React.FC<{ forceFavorites?: boolean; forceSearch?: boolean; isAdultMode?: boolean }> = ({ forceFavorites, forceSearch, isAdultMode }) => {
  const [videos, setVideos] = useState<VodInfo[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VodInfo | null>(null);
  const [downloadVideo, setDownloadVideo] = useState<{name: string, url: string, playlist?: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const [sources, setSources] = useState<any[]>(ALL_INITIAL_SOURCES);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isGlobalSearch, setIsGlobalSearch] = useState(forceSearch || false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [latencies, setLatencies] = useState<Record<string, number>>({});

  const [favorites, setFavorites] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_favorites') || '[]'));
  const [viewHistory, setViewHistory] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_history') || '[]'));
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isAdultMode) {
      const saved = localStorage.getItem('white_fox_sources');
      if (saved) setSources(JSON.parse(saved));
      else setSources(ALL_INITIAL_SOURCES);
    } else {
      setSources(ADULT_SOURCES);
    }
    testLatencies();
  }, [isAdultMode]);

  const testLatencies = async () => {
    const targetSources = isAdultMode ? ADULT_SOURCES : ALL_INITIAL_SOURCES;
    const newLatencies: Record<string, number> = {};
    for (const source of targetSources.slice(0, 10)) {
      const start = Date.now();
      try {
        await fetch(source.url, { method: 'HEAD', mode: 'no-cors' });
        newLatencies[source.name] = Date.now() - start;
      } catch {
        newLatencies[source.name] = 999;
      }
    }
    setLatencies(newLatencies);
  };

  const loadVideos = useCallback(async (keyword?: string) => {
    setLoading(true);
    setVideos([]);
    const query = keyword !== undefined ? keyword : searchKeyword;
    setSearchKeyword(query);
    const activeSources = isAdultMode ? ADULT_SOURCES : sources;
    try {
      if (query || isGlobalSearch) {
        const searchSources = isGlobalSearch ? activeSources.slice(0, 15) : [activeSources[currentSourceIndex]];
        const results = await Promise.allSettled(searchSources.map(s => fetchVodList(s.url, 1, undefined, query, s.name)));
        let merged = results.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled').flatMap(r => r.value.list);
        if (query) {
           const lq = query.toLowerCase();
           merged.sort((a, b) => (a.name.toLowerCase() === lq ? -1 : (b.name.toLowerCase() === lq ? 1 : 0)));
        }
        setVideos(merged.filter((v, i, a) => v.playUrl && a.findIndex(t => t.name === v.name) === i));
      } else {
        const s = activeSources[currentSourceIndex];
        if (!s?.url) return;
        const data = await fetchVodList(s.url, 1, activeCategory || undefined, undefined, s.name);
        setVideos(data.list);
        if (data.class?.length > 0 && categories.length === 0) setCategories(data.class.map((c: any) => ({ id: c.type_id, name: c.type_name })));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [activeCategory, currentSourceIndex, isGlobalSearch, sources, searchKeyword, categories.length, isAdultMode]);

  useEffect(() => { if (!showHistory && !forceFavorites) loadVideos(); }, [activeCategory, currentSourceIndex, showHistory, isGlobalSearch, forceFavorites, loadVideos]);

  const handleSelectVideo = (video: VodInfo) => {
    setSelectedVideo(video);
    const updated = [video, ...viewHistory.filter(v => v.id !== video.id)].slice(0, 50);
    setViewHistory(updated);
    localStorage.setItem('white_fox_history', JSON.stringify(updated));
  };

  const currentList = forceFavorites ? favorites : (showHistory ? viewHistory : videos);

  return (
    <div className="w-full">
      {!forceFavorites && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <SearchBar onSearch={(kw) => { setActiveCategory(null); loadVideos(kw); }} />
              <button onClick={() => setIsGlobalSearch(!isGlobalSearch)} className={`px-4 rounded-xl flex items-center gap-2 border transition ${isGlobalSearch ? 'bg-orange-500 text-white border-orange-400 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 dark:border-gray-700'}`}>
                <Globe size={18} /> <span className="hidden sm:inline font-bold text-sm">全站聚搜</span>
              </button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowHistory(!showHistory)} className={`p-2.5 rounded-xl border transition ${showHistory ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 dark:border-gray-700'}`} title="历史"><History size={20} /></button>
              <button onClick={() => { setSearchKeyword(''); loadVideos(''); }} className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-500 border dark:border-gray-700 hover:text-blue-500 transition-colors"><RefreshCw size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {!showHistory && !isGlobalSearch && !forceFavorites && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-xs font-bold text-gray-400 whitespace-nowrap">当前源:</span>
            <select className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-3 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={currentSourceIndex} onChange={(e) => setCurrentSourceIndex(Number(e.target.value))}>
              {(isAdultMode ? ADULT_SOURCES : sources).map((s, i) => <option key={i} value={i}>{s.name} {latencies[s.name] ? `(${latencies[s.name]}ms)` : ''}</option>)}
            </select>
          </div>
          <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500/20 border-t-blue-500"></div><p className="text-xs text-gray-400 font-black tracking-widest uppercase">Fetching Content</p></div>
      ) : (
        <div className="w-full">
           <VideoList
             videos={currentList}
             onSelect={handleSelectVideo}
             onDownloadSelect={(v) => setDownloadVideo({ name: v.name, url: v.playUrl.split('$')[1] || v.playUrl, playlist: v.playUrl })}
             favorites={favorites}
             latencies={latencies}
             onToggleFavorite={(e, v) => {
               e.stopPropagation();
               const isFav = favorites.some(f => f.id === v.id);
               const updated = isFav ? favorites.filter(f => f.id !== v.id) : [v, ...favorites];
               setFavorites(updated);
               localStorage.setItem('white_fox_favorites', JSON.stringify(updated));
             }}
             onDeleteHistory={showHistory ? (e, v) => {
               e.stopPropagation();
               const updated = viewHistory.filter(h => h.id !== v.id);
               setViewHistory(updated);
               localStorage.setItem('white_fox_history', JSON.stringify(updated));
             } : undefined}
           />
        </div>
      )}

      {selectedVideo && (
        <Player url={selectedVideo.playUrl.split('$')[1] || selectedVideo.playUrl} title={selectedVideo.name} playlist={selectedVideo.playUrl} onBack={() => setSelectedVideo(null)} onOpenDownload={(curUrl) => setDownloadVideo({ name: selectedVideo.name, url: curUrl, playlist: selectedVideo.playUrl })} />
      )}
      {downloadVideo && (
        <DownloadModal title={downloadVideo.name} url={downloadVideo.url} playlist={downloadVideo.playlist} onClose={() => setDownloadVideo(null)} />
      )}
    </div>
  );
};
export default Home;
