import React from 'react';
import VideoCard from './VideoCard';
import { VodInfo } from '../../api/vod';

interface VideoListProps {
  videos: VodInfo[];
  onSelect: (video: VodInfo) => void;
}

const VideoList: React.FC<VideoListProps> = ({ videos, onSelect }) => {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p>暂无影片资源</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          title={video.name}
          poster={video.pic}
          type={video.type}
          remark={video.remarks}
          onClick={() => onSelect(video)}
        />
      ))}
    </div>
  );
};

export default VideoList;
