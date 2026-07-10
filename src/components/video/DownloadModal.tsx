import React, { useEffect, useRef, useState } from 'react';
import { X, Download, ExternalLink, PlayCircle, ListOrdered, Zap } from 'lucide-react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

interface DownloadModalProps {
  title: string;
  url: string;
  onClose: () => void;
  playlist?: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ title, url: initialUrl, onClose, playlist }) => {
  const artRef = useRef<HTMLDivElement>(null);
  const artInstance = useRef<Artplayer | null>(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [episodes, setEpisodes] = useState<{name: string, url: string}[]>([]);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    if (playlist) {
      const allParts = playlist.split('#');
      const parts = allParts.map(p => {
        const idx = p.indexOf('$');
        if (idx === -1) return { name: '播放', url: p };
        return { name: p.substring(0, idx), url: p.substring(idx + 1) };
      }).filter(p => p.url && p.url.startsWith('http'));
      setEpisodes(parts);
    }
  }, [playlist]);

  useEffect(() => {
    const testLatency = async () => {
      const start = Date.now();
      try {
        await fetch(currentUrl, { method: 'HEAD', mode: 'no-cors' });
        setLatency(Date.now() - start);
      } catch { setLatency(999); }
    };
    testLatency();

    if (!artRef.current) return;
    const proxiedUrl = `/api/proxy?url=${encodeURIComponent(currentUrl)}`;
    const art = new Artplayer({
      container: artRef.current,
      url: proxiedUrl,
      autoplay: true,
      autoSize: true,
      setting: true,
      moreVideoAttr: { crossOrigin: 'anonymous' },
      customType: {
        m3u8: (video: HTMLVideoElement, url: string) => {
          if (Hls.isSupported()) {
            const hls = new Hls({ xhrSetup: (xhr, sUrl) => {
               if (sUrl.startsWith('http') && !sUrl.includes('/api/proxy')) {
                 xhr.open('GET', `/api/proxy?url=${encodeURIComponent(sUrl)}`, true);
               }
            }});
            hls.loadSource(url);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) { video.src = url; }
        },
      },
    });
    artInstance.current = art;
    return () => { if (art && art.destroy) art.destroy(); };
  }, [currentUrl]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[210] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><PlayCircle size={24}/></div>
             <div className="flex flex-col">
               <h3 className="font-black text-lg truncate dark:text-white max-w-[200px] sm:max-w-md">{title}</h3>
               {latency !== null && (
                 <span className={`text-[10px] font-bold flex items-center gap-1 ${latency < 500 ? 'text-green-500' : 'text-red-500'}`}>
                    <Zap size={10}/> 线路延迟: {latency}ms
                 </span>
               )}
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-100 dark:border-gray-700">
                <div ref={artRef} className="w-full h-full"></div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">下载地址 (自动代理已开启)</h4>
                <div className="relative group">
                  <input readOnly value={currentUrl} className="w-full text-[10px] p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl outline-none font-mono pr-20" />
                  <button onClick={() => { navigator.clipboard.writeText(currentUrl); alert('复制成功'); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl text-[10px] font-black shadow-sm active:scale-95 transition">复制</button>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => window.open(currentUrl, '_blank')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black transition shadow-xl shadow-blue-600/20 active:scale-95"><Download size={20}/> 立即下载</button>
                  <a href={`vlc://${currentUrl}`} className="bg-orange-500 hover:bg-orange-600 text-white px-5 rounded-2xl flex items-center justify-center transition shadow-xl shadow-orange-500/20 active:scale-95"><ExternalLink size={24}/></a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
               {episodes.length > 1 ? (
                 <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><ListOrdered size={16}/> 选集列表</h4>
                    <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[500px] no-scrollbar pr-1 flex-1">
                      {episodes.map((ep, i) => (
                        <button key={i} onClick={() => setCurrentUrl(ep.url)} className={`px-3 py-3 rounded-xl text-xs font-bold transition-all truncate ${currentUrl === ep.url ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}>{ep.name}</button>
                      ))}
                    </div>
                 </div>
               ) : (
                 <div className="h-full flex items-center justify-center text-gray-400 font-black text-xs uppercase tracking-widest italic bg-gray-50/50 dark:bg-gray-900/30 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">Single Episode</div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
