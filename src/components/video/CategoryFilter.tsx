import React from 'react';
interface Category { id: number; name: string; }
interface CategoryFilterProps { categories: Category[]; activeCategory: number | null; onSelect: (id: number | null) => void; }
const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, activeCategory, onSelect }) => (
  <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
    <button onClick={() => onSelect(null)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${activeCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>全部</button>
    {categories.map((cat) => (<button key={cat.id} onClick={() => onSelect(cat.id)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{cat.name}</button>))}
  </div>
);
export default CategoryFilter;
