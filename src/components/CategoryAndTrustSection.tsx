import { 
  Star, 
  ChevronRight, 
  Laptop, 
  Home as HomeIcon, 
  Shirt, 
  Car, 
  HeartHandshake, 
  CheckCircle2, 
  ArrowRight,
  Briefcase,
  Wrench
} from 'lucide-react';
import { ListingCategory } from '../types';

interface CategoryAndTrustSectionProps {
  onSelectCategory: (category: ListingCategory) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const CategoryAndTrustSection: React.FC<CategoryAndTrustSectionProps> = ({
  onSelectCategory,
  onOpenAuth,
}) => {
  const categories = [
    { name: 'Motors & Vehicles' as ListingCategory, label: 'Motors & Cars', icon: Car },
    { name: 'Property' as ListingCategory, label: 'Property (Rent & Sale)', icon: HomeIcon },
    { name: 'Jobs' as ListingCategory, label: 'Jobs & Careers', icon: Briefcase },
    { name: 'Services' as ListingCategory, label: 'Services & Trades', icon: Wrench },
    { name: 'Electronics' as ListingCategory, label: 'Electronics & Tech', icon: Laptop },
    { name: 'Fashion' as ListingCategory, label: 'Fashion & Clothing', icon: Shirt },
    { name: 'Charity & Community' as ListingCategory, label: 'Charity & Community', icon: HeartHandshake },
  ];

  const trustPoints = [
    'Secure & Trusted Platform',
    '8-Digit Account System',
    'Voice, Video & Chat',
    'VAT Records & HMRC Compliance',
    '£2 per Advertisement',
    'UK Customer Support',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
      
      {/* Left Column: Popular Categories (lg:col-span-3) */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="bg-[#00247D] px-4 py-3 flex items-center gap-2 text-white">
          <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
          <h3 className="font-bold text-base font-display">Popular Categories</h3>
        </div>

        <div className="divide-y divide-slate-100 flex-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left text-slate-700 hover:text-[#00247D] hover:bg-blue-50/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-blue-100/60 flex items-center justify-center text-slate-500 group-hover:text-[#00247D] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-[#00247D]">
                    {cat.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00247D] transition-transform group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle Column: Stronger Together Banner (lg:col-span-6) */}
      <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 flex flex-col justify-end min-h-[280px] bg-gradient-to-r from-[#00247D] via-[#0A2E80] to-[#1E3A8A]">
        {/* Clean Vector Background (NO background photos) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute -right-10 -bottom-10 w-96 h-96 opacity-10" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            <circle cx="50" cy="50" r="30" stroke="#FFFFFF" strokeWidth="1" fill="none" />
            <path d="M0,0 L100,100 M100,0 L0,100" stroke="#CF142B" strokeWidth="2" />
          </svg>
        </div>

        {/* Diagonal Graphic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#00173D] via-[#00247D]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8 text-center sm:text-left space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight drop-shadow-md">
            Stronger Together
          </h2>
          <p className="text-lg sm:text-xl font-bold text-white/90 italic tracking-tight">
            A UK Marketplace for Everyone
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#CF142B] hover:bg-[#B01024] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              <span>Join Fine UK Today</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Why Choose Fine UK? (lg:col-span-3) */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#00247D] font-display">Why Choose Fine UK?</h3>
            {/* Round UK Emblem */}
            <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 shadow-2xs">
              <svg viewBox="0 0 60 30" className="w-full h-full">
                <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
              </svg>
            </div>
          </div>

          <ul className="mt-4 space-y-2.5">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
          Built for Great Britain · Verified accounts only
        </div>
      </div>

    </div>
  );
};
