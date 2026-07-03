import React, { useState, useEffect } from 'react';
import VideoList from '../components/video/VideoList';
import Player from '../components/video/Player';
import SearchBar from '../components/video/SearchBar';
import CategoryFilter from '../components/video/CategoryFilter';
import DownloadModal from '../components/video/DownloadModal';
import { fetchVodList, VodInfo } from '../api/vod';
import { ALL_INITIAL_SOURCES } from '../constants';
import { History, Trash2, Globe, Zap, Download, Flame, LayoutGrid } from 'lucide-react';

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
  const [viewHistory, setViewHistory] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_history') || '[]'));
  const [favorites, setFavorites] = useState<VodInfo[]>(() => JSON.parse(localStorage.getItem('white_fox_favorites') || '[]'));
  const [showHistory, setShowHistory] = useState(false);
  const [showPopular, setShowPopular] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('white_fox_sources');
    if (saved) setSources(JSON.parse(saved));
    if (!showHistory && !forceFavorites) loadVideos();
  }, [activeCategory, currentSourceIndex, showHistory, isGlobalSearch, forceFavorites]);

  const loadVideos = async (keyword?: string) => {
    setLoading(true);
    try {
      if (keyword || isGlobalSearch) {
        const query = keyword || '';
        const searchResults = await Promise.all(
          (isGlobalSearch ? sources.slice(0, 15) : [sources[currentSourceIndex]]).map(async (source) => {
            try { return (await fetchVodList(source.url, 1, undefined, query)).list; } catch { return []; }
          })
        );
        const merged = searchResults.flat().filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        setVideos(merged);
        setShowPopular(false);
      } else {
        const sourceUrl = sources[currentSourceIndex]?.url;
        if (!sourceUrl) return;
        const data = await fetchVodList(sourceUrl, 1, activeCategory || undefined);
        setVideos(data.list);
        if (data.class.length > 0 && categories.length === 0) {
          setCategories(data.class.map((c: any) => ({ id: c.type_id, name: c.type_name })));
        }
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

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
    <div>
      {!forceFavorites && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="flex-1"><SearchBar onSearch={(kw) => loadVideos(kw)} /></div>
            <button
              onClick={() => setIsGlobalSearch(!isGlobalSearch)}
              className={`px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition ${isGlobalSearch ? 'bg-orange-500 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 shadow-sm hover:bg-gray-50'}`}
            >
              <Globe size={18} /> <span className="font-bold text-sm whitespace-nowrap">{isGlobalSearch ? '聚搜中' : '全站聚搜'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(!showHistory)} className={`p-2.5 rounded-xl transition ${showHistory ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 shadow-sm'}`} title="历史记录"><History size={20} /></button>
            <button onClick={() => {setShowPopular(!showPopular); if(!showPopular) loadVideos();}} className={`p-2.5 rounded-xl transition ${showPopular ? 'bg-red-500 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 shadow-sm'}`} title="热门推荐"><Flame size={20} /></button>
          </div>
        </div>
      )}

      {!showHistory && !isGlobalSearch && !forceFavorites && (
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
           <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mr-2 whitespace-nowrap"><LayoutGrid size={14}/> 分类:</div>
           <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div><p className="text-xs text-gray-500 font-bold">正在极速加载中...</p></div>
      ) : (
        <div>
          {forceFavorites && currentList.length === 0 && <div className="text-center py-20 text-gray-400 font-bold">暂无收藏影片，快去发现好片吧</div>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {currentList.map(video => (
              <VideoList.Card
                key={video.id}
                video={video}
                onSelect={() => handleSelectVideo(video)}
                isFavorite={favorites.some(v => v.id === video.id)}
                onToggleFavorite={(e) => toggleFavorite(e, video)}
              />
            ))}
          </div>
        </div>
      )}

      {selectedVideo && (
        <div className="relative">
          <Player url={selectedVideo.playUrl.split('$')[1] || selectedVideo.playUrl} title={selectedVideo.name} playlist={selectedVideo.playUrl} onBack={() => setSelectedVideo(null)} />
          <button onClick={() => setDownloadVideo(selectedVideo)} className="fixed bottom-10 right-10 z-[110] bg-orange-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition active:scale-90"><Download size={26}/></button>
        </div>
      )}
      {downloadVideo && <DownloadModal title={downloadVideo.name} url={downloadVideo.playUrl.split('$')[1] || downloadVideo.playUrl} onClose={() => setDownloadVideo(null)} />}
    </div>
  );
};

export default Home;
