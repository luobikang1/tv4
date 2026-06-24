import React, { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

interface PlayerProps {
  url: string;
  title: string;
  onBack: () => void;
}

const Player: React.FC<PlayerProps> = ({ url, title, onBack }) => {
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!artRef.current) return;

    const art = new Artplayer({
      container: artRef.current,
      url: url,
      autoplay: true,
      fullscreen: true,
      fullscreenWeb: true,
      setting: true,
      pip: true,
      playbackRate: true,
      aspectRatio: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      quality: [
        { default: true, html: '自动', url: url },
        { html: '1080P', url: url },
        { html: '720P', url: url },
        { html: '480P', url: url },
        { html: '360P', url: url },
      ],
      customType: {
        m3u8: function (video: HTMLVideoElement, url: string, art: Artplayer) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            art.on('destroy', () => hls.destroy());

            // Try to extract qualities from HLS manifest
            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
              if (data.levels.length > 1) {
                const levels = data.levels.map((level, index) => ({
                  html: `${level.height}P`,
                  url: url,
                  level: index
                })).reverse();

                // Add an "Auto" option
                levels.push({ html: '自动', url: url, level: -1 });

                // Update the quality menu (ArtPlayer quality update is tricky once initialized,
                // but we can at least log or provide manual selection if the library supports it)
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          }
        },
      },
    });

    return () => {
      if (art && art.destroy) {
        art.destroy();
      }
    };
  }, [url, title]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="p-4 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-bold text-lg truncate text-white">{title}</h2>
      </div>
      <div ref={artRef} className="flex-1 w-full h-full"></div>
    </div>
  );
};

export default Player;
