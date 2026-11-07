import React from 'react';
import { ShieldCheck, Settings } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (topic: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenAdmin }) => {
  return (
    <footer className="bg-[#001B44] text-white border-t-4 border-[#CF142B] mt-16">
      {/* Top Footer Banner / Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-700/60">
          
          {/* Logo Lockup */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-white font-display">Fine</span>
                <span className="text-2xl font-black tracking-tight text-[#CF142B] font-display">UK</span>
                {/* UK Flag Emblem */}
                <div className="inline-block w-6 h-4 rounded overflow-hidden shadow-xs border border-white/20 align-middle">
                  <svg viewBox="0 0 60 30" className="w-full h-full">
                    <clipPath id="sf">
                      <path d="M0,0 v30 h60 v-30 z"/>
                    </clipPath>
                    <clipPath id="tf">
                      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
                    </clipPath>
                    <g clipPath="url(#sf)">
                      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#tf)" stroke="#C8102E" strokeWidth="4"/>
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                    </g>
                  </svg>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-300 tracking-wider">
                Buy • Sell • Support
              </span>
            </div>
          </div>

          {/* Quick Legal / Info Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-300">
            <button 
              onClick={() => onOpenLegal('about')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              About Fine UK
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => onOpenLegal('contact')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact Us
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => onOpenLegal('terms')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms and Conditions
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => onOpenLegal('privacy')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => onOpenLegal('cookies')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => onOpenLegal('vat')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              VAT Information
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => onOpenLegal('safety')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Safety and Security
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => onOpenLegal('help')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Help Centre
            </button>
          </div>

          {/* Badges & Admin Link */}
          <div className="flex items-center gap-3">
            {/* United Kingdom Marker */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-md text-xs font-medium text-white border border-white/10">
              <span className="w-4 h-3 overflow-hidden rounded-xs inline-block">
                <svg viewBox="0 0 60 30" className="w-full h-full">
                  <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                  <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                  <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                  <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </svg>
              </span>
              <span>United Kingdom</span>
            </div>

            {/* VAT/GP Verified Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-md text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>VAT/GP ✓</span>
            </div>

            {/* Admin Panel Link */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#CF142B] hover:bg-[#B01024] text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Authorised Administrators Only"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>UK Admin</span>
            </button>
          </div>
        </div>

        {/* Regulatory & Disclaimer Subtext */}
        <div className="pt-5 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[11px] gap-3">
          <p>
            © {new Date().getFullYear()} Fine UK Ltd. Registered in England & Wales. Compliant with UK GDPR, Data Protection Act 2018, and HMRC Recordkeeping.
          </p>
          <p className="text-slate-400">
            Fine UK provides a secure platform connecting buyers, sellers and registered charities across the United Kingdom.
          </p>
        </div>
      </div>
    </footer>
  );
};
