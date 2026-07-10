import React, { useState, useEffect, useCallback } from 'react';
import VideoList from '../components/video/VideoList';
import Player from '../components/video/Player';
import SearchBar from '../components/video/SearchBar';
import CategoryFilter from '../components/video/CategoryFilter';
import DownloadModal from '../components/video/DownloadModal';
import { fetchVodList, VodInfo } from '../api/vod';
import { ALL_INITIAL_SOURCES, ADULT_SOURCES, ADULT_DIRECT_LINKS } from '../constants';
import { History, Globe, RefreshCw, AlertCircle, ExternalLink, Sparkles, MonitorPlay, Image as ImageIcon } from 'lucide-react';

const Home: React.FC<{ forceFavorites?: boolean; forceSearch?: boolean; isAdultMode?: boolean }> = ({ forceFavorites, forceSearch, isAdultMode }) => {
  const [videos, setVideos] = useState<VodInfo[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VodInfo | null>(null);
  const [downloadVideo, setDownloadVideo] = useState<{name: string, url: string, playlist?: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>(isAdultMode ? ADULT_SOURCES : ALL_INITIAL_SOURCES);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isGlobalSearch, setIsGlobalSearch] = useState(forceSearch || false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [favorites, setFavorites] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_favorites') || '[]'));
  const [viewHistory, setViewHistory] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_history') || '[]'));
  const [showHistory, setShowHistory] = useState(false);

  const [shuffledLinks, setShuffledLinks] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdultMode) {
      const saved = localStorage.getItem('white_fox_sources');
      if (saved) setSources(JSON.parse(saved));
    } else {
      const pool = [...ADULT_DIRECT_LINKS].sort(() => 0.5 - Math.random()).slice(0, 24);
      setShuffledLinks(pool);
    }
  }, [isAdultMode]);

  const loadVideos = useCallback(async (keyword?: string) => {
    setLoading(true);
    setVideos([]);
    const query = keyword !== undefined ? keyword : searchKeyword;
    setSearchKeyword(query);
    try {
      if (query || isGlobalSearch) {
        const targetSources = isGlobalSearch ? (isAdultMode ? ADULT_SOURCES : sources.slice(0, 15)) : [sources[currentSourceIndex]];
        const results = await Promise.allSettled(targetSources.map(s => fetchVodList(s.url, 1, undefined, query)));
        let merged = results.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled').flatMap(r => r.value.list);
        if (query) {
           const lq = query.toLowerCase();
           merged.sort((a, b) => (a.name.toLowerCase() === lq ? -1 : (b.name.toLowerCase() === lq ? 1 : 0)));
        }
        setVideos(merged.filter((v, i, a) => v.playUrl && a.findIndex(t => t.name === v.name) === i));
      } else if (!isAdultMode) {
        const url = sources[currentSourceIndex]?.url;
        if (!url) return;
        const data = await fetchVodList(url, 1, activeCategory || undefined);
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

      {isAdultMode && !showHistory && !searchKeyword && (
        <div className="mb-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-3 flex items-center gap-4">成人专栏 <Sparkles fill="white" size={32}/></h2>
                <p className="text-orange-50 font-bold opacity-90 text-lg">精选 20+ 全球主流资源，一键极速抵达。支持搜索功能。</p>
              </div>
              <MonitorPlay size={150} className="absolute -right-8 -bottom-8 opacity-10 rotate-12"/>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {shuffledLinks.map(site => (
                <a key={site.name} href={site.url} target="_blank" rel="noreferrer" className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:border-orange-500 hover:scale-105 transition-all shadow-sm hover:shadow-xl group">
                  <div className={`w-14 h-14 ${site.type === 'video' ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'} rounded-2xl flex items-center justify-center transition-colors group-hover:bg-orange-500 group-hover:text-white`}>
                     {site.type === 'video' ? <MonitorPlay size={28} className="text-orange-500 group-hover:text-white"/> : <ImageIcon size={28} className="text-blue-500 group-hover:text-white"/>}
                  </div>
                  <span className="font-black text-xs text-center group-hover:text-orange-500">{site.name}</span>
                </a>
              ))}
           </div>
        </div>
      )}

      {!showHistory && !isGlobalSearch && !forceFavorites && !isAdultMode && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-xs font-bold text-gray-400 whitespace-nowrap">路线选择:</span>
            <select className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-3 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={currentSourceIndex} onChange={(e) => setCurrentSourceIndex(Number(e.target.value))}>
              {sources.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
            </select>
          </div>
          <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500/20 border-t-blue-500"></div><p className="text-xs text-gray-400 font-black tracking-widest uppercase">Content Discovery</p></div>
      ) : (
        <div className="w-full">
           {(!isAdultMode || searchKeyword) && (
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
