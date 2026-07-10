import React, { useState, useEffect, useCallback } from 'react';
import VideoList from '../components/video/VideoList';
import Player from '../components/video/Player';
import SearchBar from '../components/video/SearchBar';
import CategoryFilter from '../components/video/CategoryFilter';
import DownloadModal from '../components/video/DownloadModal';
import { fetchVodList, VodInfo } from '../api/vod';
import { ALL_INITIAL_SOURCES, ADULT_INITIAL_SOURCES, ADULT_DIRECT_LINKS } from '../constants';
import { History, Globe, RefreshCw, AlertCircle, ExternalLink, Sparkles, MonitorPlay, Settings as SettingsIcon, Plus, Trash2 } from 'lucide-react';

const Home: React.FC<{ forceFavorites?: boolean; forceSearch?: boolean; isAdultMode?: boolean }> = ({ forceFavorites, forceSearch, isAdultMode }) => {
  const [videos, setVideos] = useState<VodInfo[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VodInfo | null>(null);
  const [downloadVideo, setDownloadVideo] = useState<{name: string, url: string, playlist?: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const [sources, setSources] = useState<any[]>(ALL_INITIAL_SOURCES);
  const [adultSources, setAdultSources] = useState<any[]>(() => {
    const saved = localStorage.getItem('white_fox_adult_sources');
    return saved ? JSON.parse(saved) : ADULT_INITIAL_SOURCES;
  });

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isGlobalSearch, setIsGlobalSearch] = useState(forceSearch || false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [shuffledLinks, setShuffledLinks] = useState([...ADULT_DIRECT_LINKS]);
  const [showAdultApiConfig, setShowAdultApiConfig] = useState(false);

  const [favorites, setFavorites] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_favorites') || '[]'));
  const [viewHistory, setViewHistory] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_history') || '[]'));
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isAdultMode) {
      const saved = localStorage.getItem('white_fox_sources');
      if (saved) setSources(JSON.parse(saved));
    } else {
      setShuffledLinks([...ADULT_DIRECT_LINKS].sort(() => 0.5 - Math.random()).slice(0, 18));
    }
  }, [isAdultMode]);

  const saveAdultSources = (updated: any[]) => {
    setAdultSources(updated);
    localStorage.setItem('white_fox_adult_sources', JSON.stringify(updated));
  };

  const loadVideos = useCallback(async (keyword?: string) => {
    setLoading(true);
    setVideos([]);
    const query = keyword !== undefined ? keyword : searchKeyword;
    setSearchKeyword(query);
    const activeSources = isAdultMode ? adultSources : sources;

    try {
      if (query || isGlobalSearch) {
        const targetSources = isGlobalSearch ? activeSources.slice(0, 15) : [activeSources[currentSourceIndex]];
        const results = await Promise.allSettled(targetSources.map(s => fetchVodList(s.url, 1, undefined, query)));
        let merged = results.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled').flatMap(r => r.value.list);
        if (query) {
           const lq = query.toLowerCase();
           merged.sort((a, b) => (a.name.toLowerCase() === lq ? -1 : (b.name.toLowerCase() === lq ? 1 : 0)));
        }
        setVideos(merged.filter((v, i, a) => v.playUrl && a.findIndex(t => t.name === v.name) === i));
      } else {
        const url = activeSources[currentSourceIndex]?.url;
        if (!url) return;
        const data = await fetchVodList(url, 1, activeCategory || undefined);
        setVideos(data.list);
        if (data.class?.length > 0 && categories.length === 0) setCategories(data.class.map((c: any) => ({ id: c.type_id, name: c.type_name })));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [activeCategory, currentSourceIndex, isGlobalSearch, sources, adultSources, searchKeyword, categories.length, isAdultMode]);

  useEffect(() => { if (!showHistory && !forceFavorites) loadVideos(); }, [activeCategory, currentSourceIndex, showHistory, isGlobalSearch, forceFavorites, loadVideos]);

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
              {isAdultMode && (
                <button onClick={() => setShowAdultApiConfig(!showAdultApiConfig)} className={`p-2.5 rounded-xl border transition ${showAdultApiConfig ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 border-orange-200'}`} title="API管理"><SettingsIcon size={20} /></button>
              )}
              <button onClick={() => setShowHistory(!showHistory)} className={`p-2.5 rounded-xl border transition ${showHistory ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 dark:border-gray-700'}`} title="历史"><History size={20} /></button>
              <button onClick={() => { setSearchKeyword(''); loadVideos(''); }} className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-500 border dark:border-gray-700 hover:text-blue-500 transition-colors"><RefreshCw size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {isAdultMode && showAdultApiConfig && (
        <div className="mb-8 p-6 bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800 rounded-[2rem] animate-in zoom-in-95 duration-300">
           <h3 className="text-lg font-black text-orange-600 mb-4 flex items-center gap-2">成人专栏 API 配置</h3>
           <div className="space-y-3 mb-6">
              {adultSources.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                   <div className="overflow-hidden"><p className="font-bold text-sm truncate">{s.name}</p></div>
                   <button onClick={() => saveAdultSources(adultSources.filter((_, idx) => idx !== i))} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                </div>
              ))}
           </div>
           <button onClick={() => {
              const name = prompt('源名称:'); const url = prompt('API地址:');
              if(name && url) saveAdultSources([...adultSources, {name, url}]);
           }} className="w-full bg-orange-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2"><Plus size={18}/> 手动添加源</button>
        </div>
      )}

      {isAdultMode && !showHistory && !searchKeyword && (
        <div className="mb-8 space-y-8">
           <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-2 flex items-center gap-4">成人专栏 <Sparkles fill="white" size={32}/></h2>
                <p className="text-orange-50 font-bold opacity-90 text-lg">支持 10+ 自动抓取 API 与 主流站点直达。</p>
              </div>
              <MonitorPlay size={150} className="absolute -right-8 -bottom-8 opacity-10 rotate-12"/>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {shuffledLinks.map(site => (
                <a key={site.name} href={site.url} target="_blank" rel="noreferrer" className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:scale-105 transition-all shadow-sm group">
                  <span className="font-bold text-xs group-hover:text-orange-500">{site.name}</span>
                </a>
              ))}
           </div>
        </div>
      )}

      {!showHistory && !isGlobalSearch && !forceFavorites && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-xs font-bold text-gray-400 whitespace-nowrap">路线选择:</span>
            <select className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-3 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={currentSourceIndex} onChange={(e) => setCurrentSourceIndex(Number(e.target.value))}>
              {(isAdultMode ? adultSources : sources).map((s, i) => <option key={i} value={i}>{s.name}</option>)}
            </select>
          </div>
          <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500/20 border-t-blue-500"></div><p className="text-xs text-gray-400 font-black tracking-widest uppercase">Fetching...</p></div>
      ) : (
        <div className="w-full">
           {(!isAdultMode || searchKeyword || videos.length > 0) && (
             <VideoList videos={currentList} onSelect={handleSelectVideo} onDownloadSelect={(v) => setDownloadVideo({ name: v.name, url: v.playUrl.split('$')[1] || v.playUrl, playlist: v.playUrl })} favorites={favorites} onToggleFavorite={(e, v) => {
               e.stopPropagation();
               const isFav = favorites.some(f => f.id === v.id);
               const updated = isFav ? favorites.filter(f => f.id !== v.id) : [v, ...favorites];
               setFavorites(updated);
               localStorage.setItem('white_fox_favorites', JSON.stringify(updated));
             }}/>
           )}
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
