import React from 'react';
import { ShoppingBag, Store, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';

interface FeatureCardsProps {
  onSelectCategory: (tab: string) => void;
  onOpenLegal: (topic: string) => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  onSelectCategory,
  onOpenLegal,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Buyers Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <ShoppingBag className="w-8 h-8 text-[#00247D]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display">Buyers</h3>
            <p className="text-xs text-slate-600 leading-snug">
              Find great products and services.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-2">
          <button
            onClick={() => onSelectCategory('buy')}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-[#CF142B] hover:bg-[#B01024] text-white text-xs font-bold rounded-full transition-colors shadow-2xs cursor-pointer"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Sellers Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <Store className="w-8 h-8 text-[#00247D]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display">Sellers</h3>
            <p className="text-xs text-slate-600 leading-snug">
              Advertise and manage your listings.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-2">
          <button
            onClick={() => onSelectCategory('sell')}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-[#CF142B] hover:bg-[#B01024] text-white text-xs font-bold rounded-full transition-colors shadow-2xs cursor-pointer"
          >
            <span>Sell Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Charities Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
            <HeartHandshake className="w-8 h-8 text-[#CF142B]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display">Charities</h3>
            <p className="text-xs text-slate-600 leading-snug">
              Promote your cause and services.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-2">
          <button
            onClick={() => onSelectCategory('charities')}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-[#CF142B] hover:bg-[#B01024] text-white text-xs font-bold rounded-full transition-colors shadow-2xs cursor-pointer"
          >
            <span>Support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. UK Community Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <ShieldCheck className="w-8 h-8 text-[#00247D]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display">UK Community</h3>
            <p className="text-xs text-slate-600 leading-snug">
              A safer, trusted marketplace.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-2">
          <button
            onClick={() => onOpenLegal('safety')}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-[#CF142B] hover:bg-[#B01024] text-white text-xs font-bold rounded-full transition-colors shadow-2xs cursor-pointer"
          >
            <span>Learn More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
