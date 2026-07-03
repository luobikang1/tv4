import React, { useState } from 'react';
import { X, Download, ExternalLink, Play } from 'lucide-react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

interface DownloadModalProps {
  title: string;
  url: string;
  onClose: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ title, url, onClose }) => {
  const [showPreview, setShowPreview] = useState(false);
  const artRef = React.useRef<HTMLDivElement>(null);

  const resolutions = ['1080P', '720P', '480P', '360P', '240P'];

  React.useEffect(() => {
    if (showPreview && artRef.current) {
      const art = new Artplayer({
        container: artRef.current,
        url: url,
        autoplay: true,
        autoSize: true,
        setting: true,
        pip: true,
        playbackRate: true,
        aspectRatio: true,
        customType: {
          m3u8: (video: HTMLVideoElement, url: string) => {
            if (Hls.isSupported()) {
              const hls = new Hls();
              hls.loadSource(url);
              hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = url;
            }
          },
        },
      });
      return () => { if (art && art.destroy) art.destroy(); };
    }
  }, [showPreview, url]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl transition-colors flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-bold truncate pr-4 text-gray-800 dark:text-gray-100">{title} - 下载与预览</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showPreview ? (
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative">
              <div ref={artRef} className="w-full h-full"></div>
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md text-white transition"
              >
                关闭预览
              </button>
            </div>
          ) : (
            <div
              className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-2xl flex flex-col items-center justify-center cursor-pointer group hover:bg-gray-200 dark:hover:bg-gray-850 transition-colors"
              onClick={() => setShowPreview(true)}
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                <Play size={32} fill="currentColor" className="ml-1" />
              </div>
              <p className="mt-4 text-sm font-bold text-gray-500">点击在此预览视频</p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-sm text-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 leading-relaxed font-medium text-center">
              ⚠️ 提示：若页面播放卡顿，请使用下载功能。推荐使用 IDM、比特彗星或手机端夸克浏览器。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                 <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">快捷操作</label>
                 <div className="flex gap-2">
                    <a href={url} target="_blank" rel="noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition shadow-lg shadow-blue-500/30"><Download size={18}/> 立即下载</a>
                    <a href={`vlc://${url}`} className="bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-xl flex items-center justify-center transition shadow-lg shadow-orange-500/30" title="外部播放器"><ExternalLink size={20}/></a>
                 </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                 <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">分辩率切换</label>
                 <div className="flex flex-wrap gap-2">
                    {resolutions.map(res => (
                      <button key={res} className="px-3 py-1.5 text-[10px] font-bold bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-500 rounded-lg transition-all">{res}</button>
                    ))}
                 </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">源链接地址</label>
              <div className="flex gap-2">
                <input readOnly value={url} className="flex-1 text-[10px] p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none font-mono" />
                <button
                  onClick={() => { navigator.clipboard.writeText(url); alert('链接已复制'); }}
                  className="bg-gray-200 dark:bg-gray-700 px-4 rounded-xl text-xs font-bold transition active:scale-95"
                >复制</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
