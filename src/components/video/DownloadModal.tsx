import React, { useEffect, useRef } from 'react';
import { X, Download, ExternalLink, PlayCircle } from 'lucide-react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

interface DownloadModalProps {
  title: string;
  url: string;
  onClose: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ title, url, onClose }) => {
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!artRef.current) return;
    const proxiedUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
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
    return () => { if (art && art.destroy) art.destroy(); };
  }, [url]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[210] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><PlayCircle size={24}/></div>
             <h3 className="font-black text-lg truncate dark:text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
          <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-100 dark:border-gray-700">
            <div ref={artRef} className="w-full h-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">下载与外放</h4>
              <div className="flex gap-3">
                <a href={url} target="_blank" rel="noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black transition shadow-xl shadow-blue-600/20 active:scale-95"><Download size={20}/> 立即下载</a>
                <a href={`vlc://${url}`} className="bg-orange-500 hover:bg-orange-600 text-white px-5 rounded-2xl flex items-center justify-center transition shadow-xl shadow-orange-500/20 active:scale-95"><ExternalLink size={24}/></a>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                温馨提示：若内置播放器无法播放，请复制直链使用<b>夸克浏览器</b>或<b>迅雷</b>下载观看。
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">视频直链地址</h4>
              <div className="relative group">
                <input readOnly value={url} className="w-full text-[10px] p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none font-mono pr-20" />
                <button onClick={() => { navigator.clipboard.writeText(url); alert('复制成功'); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl text-[10px] font-black shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition">复制</button>
              </div>
              <div className="flex gap-2">
                 {['1080P', '720P', '480P', '360P'].map(r => (
                   <div key={r} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-[10px] font-black text-gray-500 rounded-lg">{r}</div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
