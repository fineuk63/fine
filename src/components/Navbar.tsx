import React, { useState } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Tag, 
  Heart, 
  Wrench, 
  HelpCircle, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  Lock, 
  UserPlus, 
  PhoneCall, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenDialpad: () => void;
  onOpenAdmin: () => void;
  unreadCount: number;
  onSelectDemoUser: (accountNumber: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenDialpad,
  onOpenAdmin,
  unreadCount,
  onSelectDemoUser,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Fine UK Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            {/* UK Flag Badge */}
            <div className="relative w-10 h-7 rounded shadow-xs overflow-hidden border border-slate-200">
              <svg viewBox="0 0 60 30" className="w-full h-full">
                <clipPath id="s">
                  <path d="M0,0 v30 h60 v-30 z"/>
                </clipPath>
                <clipPath id="t">
                  <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
                </clipPath>
                <g clipPath="url(#s)">
                  <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                  <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                  <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
                  <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                  <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </g>
              </svg>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight text-[#00247D] font-display">Fine</span>
                <span className="text-2xl font-black tracking-tight text-[#CF142B] font-display">UK</span>
                <span className="text-slate-300 font-light mx-1">|</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 -mt-1">
                Buy • Sell • Support
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'home'
                  ? 'bg-blue-50 text-[#00247D] font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4 text-blue-800" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('buy')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'buy'
                  ? 'bg-blue-50 text-[#00247D] font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-blue-800" />
              <span>Buy Items</span>
            </button>

            <button
              onClick={() => setActiveTab('sell')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'sell'
                  ? 'bg-blue-50 text-[#00247D] font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Tag className="w-4 h-4 text-[#CF142B]" />
              <span>Sell Items</span>
            </button>

            <button
              onClick={() => setActiveTab('charities')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'charities'
                  ? 'bg-blue-50 text-[#00247D] font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Charities</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'services'
                  ? 'bg-blue-50 text-[#00247D] font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Services</span>
            </button>

            <button
              onClick={() => setActiveTab('help')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'help'
                  ? 'bg-blue-50 text-[#00247D] font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Help</span>
            </button>
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* 8-Digit Dialpad & Inbox Quick Button */}
            <button
              onClick={onOpenDialpad}
              className="relative p-2 rounded-lg text-slate-700 hover:text-blue-900 hover:bg-blue-50 border border-slate-200 transition-colors"
              title="8-Digit Account Dialpad & Inbox"
            >
              <PhoneCall className="w-4 h-4 text-blue-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#CF142B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {currentUser ? (
              /* Logged In User Dropdown */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white shadow-2xs transition-all"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Acc: {currentUser.accountNumber}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-sm"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="font-semibold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs font-mono text-blue-800 font-medium">8-Digit ID: {currentUser.accountNumber}</p>
                    </div>

                    <button
                      onClick={() => { setActiveTab('orders'); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      <span>My Orders & Purchases</span>
                    </button>

                    {(currentUser.role === 'seller' || currentUser.role === 'charity') && (
                      <button
                        onClick={() => { setActiveTab('seller-dashboard'); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Tag className="w-4 h-4 text-slate-400" />
                        <span>Seller Dashboard & Payouts</span>
                      </button>
                    )}

                    <button
                      onClick={() => { setActiveTab('inbox'); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span>Fine UK Inbox</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-[#CF142B] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { onOpenAdmin(); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2 text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-medium"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-600" />
                        <span>UK Admin Panel</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => { onLogout(); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged Out CTAs - Matches Screenshot Exactly */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#CF142B] hover:bg-[#B01024] text-white font-semibold text-sm shadow-xs transition-colors shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00247D] hover:bg-[#001B5E] text-white font-semibold text-sm shadow-xs transition-colors shrink-0"
                >
                  <Lock className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
