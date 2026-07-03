import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface DownloadModalProps {
  title: string;
  url: string;
  onClose: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ title, url, onClose }) => {
  const resolutions = ['1080P', '720P', '480P', '360P', '240P'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold truncate pr-4">{title} - 下载/外放</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-orange-500 mb-6 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800">
            温馨提示：若页面不能正常播放，请复制下方链接或点击下载，建议使用夸克或迅雷下载观看。
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-2 block">选择分辨率 (模拟):</label>
              <div className="flex flex-wrap gap-2">
                {resolutions.map(res => (
                  <button key={res} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-blue-500 hover:text-white rounded transition">
                    {res}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <label className="text-xs text-gray-500 mb-2 block">视频源地址:</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={url}
                  className="flex-1 text-xs p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition"
              >
                <Download size={18} /> 立即下载
              </a>
              <a
                href={`vlc://${url}`}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-xl flex items-center justify-center transition"
                title="使用外部播放器 (如VLC)"
              >
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
