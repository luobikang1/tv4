import React, { useState } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface DownloadModalProps {
  title: string;
  url: string;
  onClose: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ title, url, onClose }) => {
  const resolutions = ['1080P', '720P', '480P', '360P', '240P'];

  const handleDownload = () => {
    // Attempt multiple ways to trigger download
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.m3u8`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-bold truncate pr-4 text-gray-800 dark:text-white">{title} - 下载/外部播放</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
            <p className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed font-medium">
              温馨提示：.m3u8 链接建议使用手机端<b>夸克浏览器</b>或电脑端<b>IDM</b>下载。点击下方按钮将直接尝试打开/保存。
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">分辩率选择 (模拟)</label>
            <div className="flex flex-wrap gap-2">
              {resolutions.map(res => (
                <button key={res} className="px-3 py-1.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white rounded-lg transition-all font-bold">
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition shadow-lg shadow-blue-500/30 active:scale-95"
            >
              <Download size={22} /> 立即下载视频
            </button>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <a
                href={`vlc://${url}`}
                className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <ExternalLink size={18} /> VLC播放
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(url); alert('链接已复制，请粘贴到浏览器或下载器'); }}
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition active:scale-95"
              >
                复制直链
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
