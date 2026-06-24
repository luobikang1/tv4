import React from 'react';

interface VideoCardProps {
  title: string;
  poster: string;
  type: string;
  remark: string;
  onClick: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, poster, type, remark, onClick }) => {
  return (
    <div
      className="group bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-300 shadow-lg"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4]">
        <img
          src={poster || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded">
          {remark}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm truncate text-gray-100">{title}</h3>
        <p className="text-xs text-gray-400 mt-1">{type}</p>
      </div>
    </div>
  );
};

export default VideoCard;
