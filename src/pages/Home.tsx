import React, { useState, useEffect } from 'react';
import VideoList from '../components/video/VideoList';
import Player from '../components/video/Player';
import SearchBar from '../components/video/SearchBar';
import CategoryFilter from '../components/video/CategoryFilter';
import { fetchVodList, VodInfo } from '../api/vod';
import { ALL_INITIAL_SOURCES } from '../constants';

const Home: React.FC = () => {
  const [videos, setVideos] = useState<VodInfo[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VodInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>(ALL_INITIAL_SOURCES);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('white_fox_sources');
    if (saved) setSources(JSON.parse(saved));
    loadVideos();
  }, [activeCategory, currentSourceIndex]);

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

  return (
    <div>
      <SearchBar onSearch={(kw) => loadVideos(kw)} />
      <div className="flex items-center gap-4 mb-4 text-white">
        <span className="text-sm text-gray-400">数据源:</span>
        <select
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
          value={currentSourceIndex}
          onChange={(e) => setCurrentSourceIndex(Number(e.target.value))}
        >
          {sources.map((s, i) => (
            <option key={i} value={i}>{s.name}</option>
          ))}
        </select>
      </div>
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <VideoList videos={videos} onSelect={setSelectedVideo} />
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
