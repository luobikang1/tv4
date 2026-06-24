import React, { useState } from 'react';
import { Search } from 'lucide-react';
interface SearchBarProps { onSearch: (keyword: string) => void; }
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSearch(keyword); };
  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-8 text-white">
      <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索影片名称..." className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 px-12 focus:outline-none focus:border-blue-500 transition-all text-white" />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm transition-colors">搜索</button>
    </form>
  );
};
export default SearchBar;
