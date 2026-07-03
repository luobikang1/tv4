import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { Download } from 'lucide-react';

interface PlayerProps {
  url: string;
  title: string;
  onBack: () => void;
  playlist?: string;
  onOpenDownload?: () => void;
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
      }).filter(p => p.url && (p.url.includes('http') || p.url.includes('.m3u8')));
      if (parts.length === 0 && initialUrl) parts = [{ name: '正片', url: initialUrl }];
      setEpisodes(parts);
    }
  }, [playlist, initialUrl]);

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
        m3u8: (video: HTMLVideoElement, url: string, art: Artplayer) => {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            art.on('destroy', () => hls.destroy());
            hls.on(Hls.Events.MANIFEST_PARSED, () => { if (skipIntro > 0) video.currentTime = skipIntro; });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          }
        },
      },
    });

    artInstance.current = art;
    return () => { if (art && art.destroy) art.destroy(); };
  }, [currentUrl]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
      <div className="flex-1 flex flex-col relative h-[60vh] md:h-full">
        <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-4 flex-1 truncate">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBack();
              }}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white active:scale-90"
              title="返回首页"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="font-bold text-lg truncate text-white drop-shadow-md">{title}</h2>
          </div>
          {onOpenDownload && (
            <button
              onClick={onOpenDownload}
              className="p-2.5 bg-orange-500 hover:bg-orange-600 rounded-full text-white shadow-lg transition-all active:scale-90 ml-2"
              title="下载/外部播放"
            >
              <Download size={20} />
            </button>
          )}
        </div>
        <div ref={artRef} className="flex-1 w-full h-full bg-black"></div>
      </div>

      {episodes.length > 1 && (
        <div className="w-full md:w-80 bg-gray-950 border-t md:border-t-0 md:border-l border-white/5 p-5 overflow-y-auto max-h-[40vh] md:max-h-full">
          <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Episodes • 选集列表</h3>
          <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
            {episodes.map((ep, i) => (
              <button key={i} onClick={() => setCurrentUrl(ep.url)} className={`px-2 py-3 rounded-xl text-xs truncate transition-all duration-300 ${currentUrl === ep.url ? 'bg-blue-600 text-white font-bold ring-4 ring-blue-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
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
