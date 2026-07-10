import React from 'react';
import VideoCard from './VideoCard';
import { VodInfo } from '../../api/vod';
import { X } from 'lucide-react';

interface VideoListProps {
  videos: VodInfo[];
  onSelect: (video: VodInfo) => void;
  onDownloadSelect?: (video: VodInfo) => void;
  favorites?: VodInfo[];
  onToggleFavorite?: (e: React.MouseEvent, video: VodInfo) => void;
  onDeleteHistory?: (e: React.MouseEvent, video: VodInfo) => void;
  latencies?: Record<string, number>;
}

const VideoList: React.FC<VideoListProps> = ({ videos, onSelect, onDownloadSelect, favorites = [], onToggleFavorite, onDeleteHistory, latencies = {} }) => {
  if (videos.length === 0) return <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-bold w-full"><p>暂无影片资源</p></div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 w-full">
      {videos.map((video) => (
        <div key={video.id + (video.sourceName || '')} className="relative group/list h-full">
          <VideoCard
            title={video.name}
            poster={video.pic}
            type={video.type}
            remark={video.remarks}
            sourceName={video.sourceName}
            latency={video.sourceName ? latencies[video.sourceName] : undefined}
            onClick={() => onSelect(video)}
            onDownloadClick={onDownloadSelect ? (e) => { e.stopPropagation(); onDownloadSelect(video); } : undefined}
            isFavorite={favorites.some(f => f.id === video.id)}
            onToggleFavorite={onToggleFavorite ? (e) => onToggleFavorite(e, video) : undefined}
          />
          {onDeleteHistory && (
            <button
              onClick={(e) => onDeleteHistory(e, video)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover/list:opacity-100 transition-opacity z-20"
              title="删除记录"
            >
              <X size={12} strokeWidth={3} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
export default VideoList;
