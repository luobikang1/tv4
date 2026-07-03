import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { Download, ChevronLeft, LayoutList } from 'lucide-react';

interface PlayerProps {
  url: string;
  title: string;
  onBack: () => void;
  playlist?: string;
  onOpenDownload?: (currentPlayingUrl: string) => void;
}

const Player: React.FC<PlayerProps> = ({ url: initialUrl, title, onBack, playlist, onOpenDownload }) => {
  const artRef = useRef<HTMLDivElement>(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [episodes, setEpisodes] = useState<{name: string, url: string}[]>([]);
  const artInstance = useRef<Artplayer | null>(null);

  useEffect(() => {
    if (playlist) {
      const allParts = playlist.split('#');
      let parts = allParts.map(p => {
        const idx = p.indexOf('$');
        if (idx === -1) return { name: '播放', url: p };
        return { name: p.substring(0, idx), url: p.substring(idx + 1) };
      }).filter(p => p.url && p.url.startsWith('http'));
      if (parts.length === 0 && initialUrl) parts = [{ name: '正片', url: initialUrl }];
      setEpisodes(parts);
    }
  }, [playlist, initialUrl]);

  useEffect(() => {
    if (!artRef.current) return;
    const skipIntro = Number(localStorage.getItem('white_fox_skip_intro') || 0);
    const savedVolume = Number(localStorage.getItem('white_fox_volume') || 0.7);
    const progressKey = `white_fox_progress_${title}`;
    const savedTime = Number(localStorage.getItem(progressKey) || 0);

    const proxiedUrl = `/api/proxy?url=${encodeURIComponent(currentUrl)}`;

    const art = new Artplayer({
      container: artRef.current,
      url: proxiedUrl,
      autoplay: true,
      autoSize: true,
      fullscreen: true,
      fullscreenWeb: true,
      setting: true,
      pip: true,
      playbackRate: true,
      aspectRatio: true,
      volume: savedVolume,
      moreVideoAttr: { crossOrigin: 'anonymous' },
      quality: [
        { html: '1080P', url: proxiedUrl },
        { html: '720P', url: proxiedUrl },
        { default: true, html: '480P', url: proxiedUrl },
        { html: '360P', url: proxiedUrl },
      ],
      customType: {
        m3u8: (video: HTMLVideoElement, url: string, art: Artplayer) => {
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, xhrSetup: (xhr, sUrl) => {
              if (sUrl.startsWith('http') && !sUrl.includes('/api/proxy')) {
                xhr.open('GET', `/api/proxy?url=${encodeURIComponent(sUrl)}`, true);
              }
            }});
            hls.loadSource(url);
            hls.attachMedia(video);
            art.on('destroy', () => hls.destroy());
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          }
        },
      },
    });

    art.on('ready', () => {
      if (savedTime > 0) art.currentTime = savedTime;
      else if (skipIntro > 0) art.currentTime = skipIntro;
    });

    art.on('video:timeupdate', () => {
      localStorage.setItem(progressKey, art.currentTime.toString());
    });

    art.on('video:volumechange', () => {
      localStorage.setItem('white_fox_volume', art.volume.toString());
    });

    artInstance.current = art;
    return () => { if (art && art.destroy) art.destroy(); };
  }, [currentUrl, title]);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Download button clicked in Player');
    if (onOpenDownload) {
      onOpenDownload(currentUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col md:flex-row animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col relative h-[60vh] md:h-full">
        <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-3 truncate">
            <button
              onClick={(e) => { e.stopPropagation(); onBack(); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="font-bold text-lg text-white drop-shadow-md truncate">{title}</h2>
          </div>
          <button
            onClick={handleDownloadClick}
            className="p-2.5 bg-orange-500 hover:bg-orange-600 rounded-full text-white shadow-lg active:scale-90 transition-all z-20"
          >
            <Download size={20} />
          </button>
        </div>
        <div ref={artRef} className="flex-1 w-full h-full bg-black"></div>
      </div>
      {episodes.length > 1 && (
        <div className="w-full md:w-80 bg-gray-900 border-t md:border-t-0 md:border-l border-white/5 p-6 overflow-y-auto max-h-[40vh] md:max-h-full no-scrollbar">
          <div className="flex items-center gap-2 mb-6 text-gray-400 font-black text-xs uppercase tracking-widest"><LayoutList size={14}/> 选集播放</div>
          <div className="grid grid-cols-4 md:grid-cols-2 gap-3">
            {episodes.map((ep, i) => (
              <button key={i} onClick={() => setCurrentUrl(ep.url)} className={`px-3 py-3 rounded-xl text-xs font-bold transition-all ${currentUrl === ep.url ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>{ep.name}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default Player;
