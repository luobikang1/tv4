import React, { useState } from 'react';
import { Heart, Play, Download, Zap } from 'lucide-react';

interface VideoCardProps {
  title: string;
  poster: string;
  type: string;
  remark: string;
  sourceName?: string;
  latency?: number;
  onClick: () => void;
  onDownloadClick?: (e: React.MouseEvent) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, poster, type, remark, sourceName, latency, onClick, onDownloadClick, isFavorite, onToggleFavorite }) => {
  const [imgSrc, setImgSrc] = useState(poster);
  const proxyUrl = '/api/proxy?url=' + encodeURIComponent(poster);

  const handleImageError = () => {
    if (imgSrc !== proxyUrl) setImgSrc(proxyUrl);
    else setImgSrc('https://via.placeholder.com/300x400?text=No+Image');
  };

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl relative flex flex-col h-full"
      onClick={(e) => { e.preventDefault(); onClick(); }}
    >
      <div className="relative aspect-[3/4.2] overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={imgSrc || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full z-10">{remark}</div>

        <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}
              className={`p-1.5 rounded-full backdrop-blur-md transition ${isFavorite ? 'bg-red-500 text-white' : 'bg-black/40 text-white/70 hover:text-white'}`}
            >
              <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
          {onDownloadClick && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownloadClick(e); }}
              className="p-1.5 rounded-full bg-black/40 text-white/70 hover:bg-orange-500 hover:text-white backdrop-blur-md transition"
              title="下载/外部播放"
            >
              <Download size={14} />
            </button>
          )}
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-blue-600 p-3 rounded-full text-white shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm line-clamp-1 dark:text-gray-100 text-gray-800">{title}</h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{type}</span>
          </div>
        </div>

        {(sourceName || latency !== undefined) && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[9px] font-bold">
            <span className="text-gray-400 truncate max-w-[60%]">{sourceName || '未知源'}</span>
            {latency !== undefined && (
              <span className={`flex items-center gap-0.5 ${latency < 500 ? 'text-green-500' : 'text-orange-500'}`}>
                <Zap size={8} /> {latency}ms
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default VideoCard;
