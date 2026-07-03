import React from 'react';
import { Heart } from 'lucide-react';

interface VideoCardProps {
  title: string;
  poster: string;
  type: string;
  remark: string;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, poster, type, remark, onClick, isFavorite, onToggleFavorite }) => (
  <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl relative" onClick={onClick}>
    <div className="relative aspect-[3/4.2]">
      <img src={poster || 'https://via.placeholder.com/300x400?text=No+Image'} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full">{remark}</div>
      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md transition ${isFavorite ? 'bg-red-500 text-white' : 'bg-black/40 text-white/70 hover:text-white'}`}
        >
          <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
         <p className="text-white text-[10px] line-clamp-2 leading-relaxed opacity-90 mb-1">精选高清资源 • 极速播放</p>
      </div>
    </div>
    <div className="p-3">
      <h3 className="font-bold text-sm truncate dark:text-gray-100 text-gray-800">{title}</h3>
      <div className="flex justify-between items-center mt-1">
        <span className="text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{type}</span>
        <span className="text-[10px] text-gray-400">时长: 约45-120分</span>
      </div>
    </div>
  </div>
);
export default VideoCard;
