import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAiSearch: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onOpenAuth,
  onOpenAiSearch,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleAiSearch = () => {
    if (searchInput.trim()) {
      onOpenAiSearch(searchInput.trim());
    } else {
      onOpenAiSearch('Budget friendly laptops in London or refurbished tech');
    }
  };

  return (
    <div className="mb-6">
      {/* Standalone Clean Marketplace Search Bar (Banner Section in Photo Removed) */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative flex-1 w-full flex items-center pl-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products and services across the UK..."
            className="w-full py-2.5 px-3 text-slate-900 text-sm sm:text-base outline-hidden bg-transparent placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Natural Language AI Search Shortcut */}
          <button
            type="button"
            onClick={handleAiSearch}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#00247D] rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-blue-200 shrink-0 cursor-pointer"
            title="Search using natural English prompts"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Smart Search</span>
          </button>

          {/* Red Search Submit Button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-2.5 bg-[#CF142B] hover:bg-[#B01024] text-white font-bold rounded-xl text-sm sm:text-base transition-colors shadow-sm cursor-pointer shrink-0"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};
