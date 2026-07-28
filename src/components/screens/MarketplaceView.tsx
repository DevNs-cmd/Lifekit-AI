import React, { useState } from 'react';
import { Search, Star, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { MarketplaceItem } from '../../types';

interface MarketplaceViewProps {
  items: MarketplaceItem[];
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ items }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Career', 'Finance', 'Health', 'Travel', 'Business', 'Education'];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 space-y-4 pb-20 text-slate-900 select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          Execution Marketplace
          <Sparkles className="w-4 h-4 text-[#7C3AED]" />
        </h1>
        <p className="text-xs text-slate-500">Hire verified human experts & automated execution services</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3.5 text-[#7C3AED]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search experts, strategies, pitch reviews..."
          className="w-full bg-white text-slate-900 text-xs pl-9 pr-3 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] shadow-sm placeholder:text-slate-400"
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-violet-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Service Cards List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#7C3AED] transition-all space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-violet-100 border border-violet-300 flex items-center justify-center font-bold text-xs text-[#7C3AED]">
                  {item.providerAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500 font-medium">{item.providerName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 leading-snug">{item.title}</h3>
                </div>
              </div>
              <span className="bg-violet-100 text-[#7C3AED] text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                {item.badgeText}
              </span>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-900">{item.rating}</span>
                <span className="text-slate-400">({item.reviewsCount})</span>
              </div>

              <span className="font-extrabold text-sm text-slate-900">{item.price}</span>

              <button
                onClick={() => alert(`Connecting with ${item.providerName} for "${item.title}"!`)}
                className="bg-[#7C3AED] hover:bg-[#4C0FBD] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
