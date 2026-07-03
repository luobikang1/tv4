import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

interface PlayerProps {
  url: string;
  title: string;
  onBack: () => void;
  playlist?: string; // Standard CMS play_url format: "EP1$url#EP2$url"
}

const Player: React.FC<PlayerProps> = ({ url: initialUrl, title, onBack, playlist }) => {
  const artRef = useRef<HTMLDivElement>(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [episodes, setEpisodes] = useState<{name: string, url: string}[]>([]);
  const artInstance = useRef<Artplayer | null>(null);

  useEffect(() => {
    if (playlist) {
      const parts = playlist.split('#').map(p => {
        const [name, url] = p.split('$');
        return { name, url };
      }).filter(p => p.url);
      setEpisodes(parts);
    }
  }, [playlist]);

  useEffect(() => {
    if (!artRef.current) return;
    const skipIntro = Number(localStorage.getItem('white_fox_skip_intro') || 0);

    const art = new Artplayer({
      container: artRef.current,
      url: currentUrl,
      autoplay: true,
      autoSize: true,
      fullscreen: true,
      fullscreenWeb: true,
      setting: true,
      pip: true,
      playbackRate: true,
      aspectRatio: true,
      moreVideoAttr: { crossOrigin: 'anonymous' },
      quality: [
        { html: '1080P', url: currentUrl },
        { html: '720P', url: currentUrl },
        { default: true, html: '480P', url: currentUrl },
        { html: '360P', url: currentUrl },
        { html: '240P', url: currentUrl },
      ],
      customType: {
        m3u8: function (video: HTMLVideoElement, url: string, art: Artplayer) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            art.on('destroy', () => hls.destroy());
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (skipIntro > 0) video.currentTime = skipIntro;
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => { if (skipIntro > 0) video.currentTime = skipIntro; });
          }
        },
      },
    });

    artInstance.current = art;
    return () => { if (art && art.destroy) art.destroy(); };
  }, [currentUrl]);

  const switchEpisode = (url: string) => {
    setCurrentUrl(url);
    if (artInstance.current) {
      artInstance.current.switchUrl(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col relative h-2/3 md:h-full">
        <div className="p-4 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="font-bold text-lg truncate text-white">{title}</h2>
        </div>
        <div ref={artRef} className="flex-1 w-full h-full bg-black"></div>
      </div>

      {episodes.length > 0 && (
        <div className="w-full md:w-80 bg-gray-900 border-t md:border-t-0 md:border-l border-gray-800 p-4 overflow-y-auto max-h-[40vh] md:max-h-full scrollbar-hide">
          <h3 className="text-gray-400 text-sm font-bold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            选集播放 ({episodes.length})
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
            {episodes.map((ep, i) => (
              <button
                key={i}
                onClick={() => switchEpisode(ep.url)}
                className={`px-2 py-2 rounded text-xs truncate transition ${currentUrl === ep.url ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {ep.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
