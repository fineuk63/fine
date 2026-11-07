import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { FeatureCards } from './components/FeatureCards';
import { CategoryAndTrustSection } from './components/CategoryAndTrustSection';
import { MarketplaceView } from './components/MarketplaceView';
import { InboxView } from './components/InboxView';
import { AuthModal } from './components/AuthModal';
import { CreateListingModal } from './components/CreateListingModal';
import { OrdersView } from './components/OrdersView';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminPanel } from './components/AdminPanel';
import { LegalModal } from './components/LegalModal';
import { User, Listing, Order, Message, ListingCategory, OrderStatus } from './types';
import { INITIAL_USERS, INITIAL_LISTINGS, INITIAL_ORDERS, INITIAL_MESSAGES } from './data/initialData';
import { cacheListingsLocally, getCachedListingsLocally, clearLocalSensitiveCache } from './utils/indexedDbCache';
import { 
  saveUserToDevice, 
  syncMessagesToDevice, 
  getDeviceMessages, 
  syncOrdersToDevice, 
  getDeviceOrders, 
  getDeviceStorageInfo, 
  wipeDeviceUserData 
} from './utils/localDeviceDb';
import { Tag, Sparkles, Plus, ArrowRight, ShieldCheck, HeartHandshake, HardDrive, Smartphone, Laptop } from 'lucide-react';

export default function App() {
  // Current logged in user (Default to Demo Buyer James Wright so reviewer immediately experiences full system)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fine_uk_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS[2]; // James Wright
      }
    }
    return INITIAL_USERS[2]; // James Wright
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');

  // Data Store
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  // Device Storage Diagnostics
  const [deviceStorageState, setDeviceStorageState] = useState<{
    deviceType: string;
    storageQuota: string;
    isSupported: boolean;
    totalCachedRecords: number;
  }>({
    deviceType: 'Local Device',
    storageQuota: 'Checking storage...',
    isSupported: true,
    totalCachedRecords: 0,
  });

  // Modals & Panels
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [legalModalTopic, setLegalModalTopic] = useState<string | null>(null);
  const [inboxTargetAccount, setInboxTargetAccount] = useState<string | undefined>(undefined);

  // Update device storage info
  const updateDeviceDbDiagnostics = async () => {
    const info = await getDeviceStorageInfo();
    setDeviceStorageState(info);
  };

  // Synchronize with Central Server Database & Local Device Database
  const refreshData = async () => {
    try {
      // 1. Fetch listings
      const listRes = await fetch('/api/listings');
      const listData = await listRes.json();
      if (listData.success && listData.listings) {
        setListings(listData.listings);
        cacheListingsLocally(listData.listings);
      }

      // 2. Fetch orders
      if (currentUser) {
        const ordRes = await fetch(`/api/orders?accountNumber=${currentUser.accountNumber}`);
        const ordData = await ordRes.json();
        if (ordData.success && ordData.orders) {
          setOrders(ordData.orders);
          syncOrdersToDevice(ordData.orders, currentUser.accountNumber);
        }

        // 3. Fetch messages
        const msgRes = await fetch(`/api/messages?accountNumber=${currentUser.accountNumber}`);
        const msgData = await msgRes.json();
        if (msgData.success && msgData.messages) {
          setMessages(msgData.messages);
          syncMessagesToDevice(msgData.messages, currentUser.accountNumber);
        }
      }
      updateDeviceDbDiagnostics();
    } catch (err) {
      console.warn('[Fine UK] Working in resilient offline/device mode:', err);
      // Fallback to Local Device Database
      const cached = await getCachedListingsLocally();
      if (cached && cached.length) {
        setListings(cached);
      }
      if (currentUser) {
        const localMsgs = await getDeviceMessages(currentUser.accountNumber);
        if (localMsgs.length) setMessages(localMsgs);
        const localOrds = await getDeviceOrders(currentUser.accountNumber);
        if (localOrds.length) setOrders(localOrds);
      }
      updateDeviceDbDiagnostics();
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser?.accountNumber]);

  // Save current user to localStorage & Device IndexedDB
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fine_uk_auth_user', JSON.stringify(currentUser));
      saveUserToDevice(currentUser);
    } else {
      localStorage.removeItem('fine_uk_auth_user');
    }
    updateDeviceDbDiagnostics();
  }, [currentUser]);

  // Calculate unread count
  const unreadCount = currentUser
    ? messages.filter(m => m.recipientAccountNumber === currentUser.accountNumber && !m.read).length
    : 0;

  // Handle Logout (Section 10: Clear local authenticated session and sensitive device data)
  const handleLogout = async () => {
    await clearLocalSensitiveCache();
    await wipeDeviceUserData();
    setCurrentUser(null);
    setActiveTab('home');
    updateDeviceDbDiagnostics();
  };

  // Switch Demo User
  const handleSelectDemoUser = (accountNumber: string) => {
    const found = INITIAL_USERS.find(u => u.accountNumber === accountNumber);
    if (found) {
      setCurrentUser(found);
      refreshData();
    }
  };

  // Start Messaging with User
  const handleStartMessageWithUser = (accountNumber: string, initialText?: string) => {
    setInboxTargetAccount(accountNumber);
    setActiveTab('inbox');
    if (initialText && currentUser) {
      handleSendMessage({
        senderAccountNumber: currentUser.accountNumber,
        recipientAccountNumber: accountNumber,
        text: initialText,
      });
    }
  };

  // Send Message handler
  const handleSendMessage = async (msgData: {
    senderAccountNumber: string;
    recipientAccountNumber: string;
    text: string;
    type?: any;
    fileData?: any;
    voiceDuration?: number;
    callInfo?: any;
  }) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Mark Messages as Read
  const handleMarkRead = async (otherAccountNumber: string) => {
    if (!currentUser) return;
    try {
      await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myAccountNumber: currentUser.accountNumber,
          otherAccountNumber,
        }),
      });
      setMessages(prev => prev.map(m => 
        m.recipientAccountNumber === currentUser.accountNumber && m.senderAccountNumber === otherAccountNumber
          ? { ...m, read: true }
          : m
      ));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Create Order handler
  const handleCreateOrder = async (orderData: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Order creation failed');
    if (data.success && data.order) {
      setOrders(prev => [data.order, ...prev]);
      refreshData();
    }
    return data;
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        note,
        updatedByAccountNumber: currentUser?.accountNumber,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    if (data.success && data.order) {
      setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      refreshData();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Header Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(m) => setAuthModalMode(m)}
        onLogout={handleLogout}
        onOpenDialpad={() => {
          setActiveTab('inbox');
          setInboxTargetAccount(undefined);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        unreadCount={unreadCount}
        onSelectDemoUser={handleSelectDemoUser}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* =================================================================== */}
        {/* HOME TAB (Matches uploaded design screenshot) */}
        {/* =================================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Hero Section Banner */}
            <HeroSection
              onSearch={(q) => {
                setActiveSearchQuery(q);
                setActiveTab('buy');
              }}
              onOpenAuth={(m) => setAuthModalMode(m)}
              onOpenAiSearch={(prompt) => {
                setActiveSearchQuery(prompt);
                setActiveTab('buy');
              }}
            />

            {/* 4 Feature Cards (Buyers, Sellers, Charities, UK Community) */}
            <FeatureCards
              onSelectCategory={(tab) => {
                if (tab === 'sell') {
                  if (currentUser) setIsCreateListingOpen(true);
                  else setAuthModalMode('login');
                } else {
                  setActiveTab(tab);
                }
              }}
              onOpenLegal={(topic) => setLegalModalTopic(topic)}
            />

            {/* 3-Column Middle Section (Popular Categories, Stronger Together, Why Choose Fine UK) */}
            <CategoryAndTrustSection
              onSelectCategory={(cat: ListingCategory) => {
                setSelectedCategoryFilter(cat);
                setActiveTab('buy');
              }}
              onOpenAuth={(m) => setAuthModalMode(m)}
            />

            {/* Featured Marketplace Items Preview */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display">
                    Featured UK Advertisements
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified British sellers, refurbished tech, local services, and charity drives
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('buy')}
                  className="text-xs font-bold text-[#00247D] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View all items</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sample Showcase Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedCategoryFilter(item.category);
                      setActiveTab('buy');
                    }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        {item.condition && (
                          <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                            {item.condition}
                          </span>
                        )}
                        {item.images.length > 1 && (
                          <span className="absolute bottom-2.5 right-2.5 bg-slate-900/70 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
                            📷 {item.images.length} photos
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-1.5">
                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span>{item.location}</span>
                          <span className="font-mono text-slate-400">ID: {item.sellerAccountNumber}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#00247D]">
                          {item.title}
                        </h4>

                        {/* Category quick attributes */}
                        {item.vehicleDetails && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <span>{item.vehicleDetails.year}</span>
                            <span>•</span>
                            <span>{item.vehicleDetails.mileage.toLocaleString()} mi</span>
                            <span>•</span>
                            <span>{item.vehicleDetails.fuelType}</span>
                          </div>
                        )}
                        {item.propertyDetails && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <span>{item.propertyDetails.bedrooms} Bed</span>
                            <span>•</span>
                            <span>{item.propertyDetails.propertyType}</span>
                            <span>•</span>
                            <span>{item.propertyDetails.furnished}</span>
                          </div>
                        )}
                        {item.jobDetails && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <span>{item.jobDetails.jobType}</span>
                            <span>•</span>
                            <span>{item.jobDetails.workArrangement}</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                      <div className="text-base font-black text-[#00247D] font-display tabular-nums">
                        £{item.price.toLocaleString('en-GB', { minimumFractionDigits: item.price % 1 === 0 ? 0 : 2 })}
                        <span className="text-xs font-normal text-slate-500 ml-1">
                          {item.priceType === 'per_month' && '/ month'}
                          {item.priceType === 'per_week' && '/ week'}
                          {item.priceType === 'per_year' && '/ year'}
                          {item.priceType === 'per_hour' && '/ hr'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#CF142B] group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* BUY ITEMS TAB / MARKETPLACE VIEW */}
        {/* =================================================================== */}
        {activeTab === 'buy' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">
                  UK Marketplace – Browse & Buy
                </h2>
                <p className="text-xs text-slate-500">
                  Search across verified UK independent sellers and registered charities with HMRC-compliant VAT records.
                </p>
              </div>

              {currentUser && (
                <button
                  onClick={() => setIsCreateListingOpen(true)}
                  className="px-4 py-2 bg-[#CF142B] hover:bg-[#B01024] text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Listing (£0 first, £2 after)</span>
                </button>
              )}
            </div>

            <MarketplaceView
              listings={listings}
              currentUser={currentUser}
              onOpenAuth={(m) => setAuthModalMode(m)}
              onStartMessageWithUser={handleStartMessageWithUser}
              onCreateOrder={handleCreateOrder}
              initialCategory={selectedCategoryFilter}
              initialSearchQuery={activeSearchQuery}
            />
          </div>
        )}

        {/* =================================================================== */}
        {/* SELL ITEMS TAB */}
        {/* =================================================================== */}
        {activeTab === 'sell' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-[#00247D] to-[#1E3A8A] rounded-3xl p-8 text-white space-y-4 shadow-lg border border-slate-200">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Fine UK Advertising Platform</span>
              </div>
              <h2 className="text-3xl font-black font-display tracking-tight">
                Sell Smarter Throughout the United Kingdom
              </h2>
              <p className="text-sm text-slate-200 max-w-xl">
                Every registered buyer, seller or charity receives their <strong>first advertisement completely FREE</strong>. Additional advertisements are only £2.00, collected securely with HMRC-compliant records.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (currentUser) setIsCreateListingOpen(true);
                    else setAuthModalMode('login');
                  }}
                  className="px-6 py-3 bg-[#CF142B] hover:bg-[#B01024] text-white font-bold rounded-full shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer text-sm"
                >
                  {currentUser ? 'Create Advertisement Now' : 'Sign In to Post Advertisement'}
                </button>
              </div>
            </div>

            {/* Seller Features Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00247D] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 font-display">AI Listing Assistant</h4>
                <p className="text-xs text-slate-600">
                  Generate professional descriptions, polish listing titles, and receive automatic HMRC VAT advice powered by Gemini 3.8 Flash.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00247D] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 font-display">8-Digit Private Dialpad</h4>
                <p className="text-xs text-slate-600">
                  Buyers contact your unique 8-digit Account Number directly via private messages, audio calls, and video calls without revealing private emails.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00247D] flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 font-display">Transparent £2 Pricing</h4>
                <p className="text-xs text-slate-600">
                  No hefty percentage commission taken from your sales margin. Only £2 per additional advertisement.
                </p>
              </div>
            </div>

            {/* If seller logged in, show seller dashboard link */}
            {currentUser && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                <h3 className="font-bold text-base text-slate-900 font-display">Already advertising?</h3>
                <p className="text-xs text-slate-500">
                  Track your existing advertisements, sales payouts, and registered bank details in your Seller Dashboard.
                </p>
                <button
                  onClick={() => setActiveTab('seller-dashboard')}
                  className="px-5 py-2 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Open Seller Dashboard & Payouts
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* CHARITIES TAB */}
        {/* =================================================================== */}
        {activeTab === 'charities' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-900 via-[#CF142B] to-rose-800 rounded-3xl p-8 text-white space-y-3 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs">
                <HeartHandshake className="w-3.5 h-3.5 text-white" />
                <span>UK Registered Charities</span>
              </div>
              <h2 className="text-3xl font-black font-display tracking-tight">
                Support Causes Close to British Hearts
              </h2>
              <p className="text-sm text-rose-100 max-w-xl">
                Fine UK provides registered charities across the United Kingdom with free and low-cost advertising to raise critical funds, promote community services, and sell donated goods zero-rated for VAT.
              </p>
            </div>

            {/* Charities listings filter */}
            <MarketplaceView
              listings={listings.filter(l => l.sellerRole === 'charity' || l.category === 'Charity & Community')}
              currentUser={currentUser}
              onOpenAuth={(m) => setAuthModalMode(m)}
              onStartMessageWithUser={handleStartMessageWithUser}
              onCreateOrder={handleCreateOrder}
              initialCategory="Charity & Community"
            />
          </div>
        )}

        {/* =================================================================== */}
        {/* SERVICES TAB */}
        {/* =================================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-black text-slate-900 font-display">
                UK Professional Services & Trades
              </h2>
              <p className="text-xs text-slate-500">
                Certified Gas Safe engineers, master joiners, legal consultants, and UK tradespeople.
              </p>
            </div>

            <MarketplaceView
              listings={listings.filter(l => l.category === 'Services')}
              currentUser={currentUser}
              onOpenAuth={(m) => setAuthModalMode(m)}
              onStartMessageWithUser={handleStartMessageWithUser}
              onCreateOrder={handleCreateOrder}
              initialCategory="Services"
            />
          </div>
        )}

        {/* =================================================================== */}
        {/* HELP TAB */}
        {/* =================================================================== */}
        {activeTab === 'help' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-2xl font-black text-slate-900 font-display">
                Fine UK Help & Knowledge Base
              </h2>
              <p className="text-xs text-slate-600">
                Find answers to common questions about our 8-digit dialpad, UK VAT requirements, advertisement fees, and order fulfillment.
              </p>

              <div className="space-y-3 pt-2">
                <details className="p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
                  <summary className="font-bold text-sm text-slate-900">What is the 8-Digit Account Number?</summary>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Every registered buyer, seller, and charity on Fine UK receives a unique 8-digit Account Number (e.g. 10001000). You can enter any user's 8-digit number into the Dialpad in your Fine UK Inbox to look up their verified profile, send private messages, or initiate secure audio and video calls.
                  </p>
                </details>

                <details className="p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
                  <summary className="font-bold text-sm text-slate-900">How do UK HMRC VAT rules apply on Fine UK?</summary>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Under UK tax law, standard 20% VAT applies to new goods and commercial services sold by VAT-registered businesses. Second-hand goods sold under the HMRC second-hand margin scheme or by private sellers do not have separate VAT charged to the buyer. Printable VAT tax invoices and monthly audit statements are automatically generated.
                  </p>
                </details>

                <details className="p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
                  <summary className="font-bold text-sm text-slate-900">How does the £2 advertisement fee work?</summary>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Your first advertisement on Fine UK is 100% free of charge. Every subsequent advertisement costs £2.00, collected by Fine UK Admin. Payment receipts are recorded in the central database and visible in your dashboard.
                  </p>
                </details>

                <details className="p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
                  <summary className="font-bold text-sm text-slate-900">Are National Insurance (NI) numbers kept private?</summary>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Yes. Under Section 2 statutory requirements, seller NI numbers are encrypted server-side and never exposed to buyers or other sellers. Only authorised compliance personnel can access them for lawful HMRC checks.
                  </p>
                </details>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">Still need help?</span>
                <button
                  onClick={() => setLegalModalTopic('contact')}
                  className="px-4 py-2 bg-[#00247D] text-white rounded-xl text-xs font-bold hover:bg-[#001B5E] cursor-pointer"
                >
                  Contact UK Support
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* INBOX TAB (Fine UK Inbox & Dialpad) */}
        {/* =================================================================== */}
        {activeTab === 'inbox' && (
          <InboxView
            currentUser={currentUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            onMarkRead={handleMarkRead}
            targetAccountNumber={inboxTargetAccount}
          />
        )}

        {/* =================================================================== */}
        {/* MY ORDERS TAB */}
        {/* =================================================================== */}
        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateOrderStatus}
            onStartMessageWithUser={handleStartMessageWithUser}
          />
        )}

        {/* =================================================================== */}
        {/* SELLER DASHBOARD TAB */}
        {/* =================================================================== */}
        {activeTab === 'seller-dashboard' && (
          <SellerDashboard
            currentUser={currentUser}
            listings={listings}
            onOpenCreateListing={() => setIsCreateListingOpen(true)}
          />
        )}

      </main>

      {/* 3. Footer */}
      <Footer
        onOpenLegal={(topic) => setLegalModalTopic(topic)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* ===================================================================== */}
      {/* GLOBAL MODALS */}
      {/* ===================================================================== */}

      {/* Auth Modal (Login, Registration, SMS OTP Recovery) */}
      <AuthModal
        isOpen={authModalMode !== null}
        initialMode={authModalMode || 'login'}
        onClose={() => setAuthModalMode(null)}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setAuthModalMode(null);
          refreshData();
        }}
        onSelectDemoUser={handleSelectDemoUser}
      />

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateListingOpen}
        currentUser={currentUser}
        onClose={() => setIsCreateListingOpen(false)}
        onListingCreated={() => {
          refreshData();
          setIsCreateListingOpen(false);
          setActiveTab('buy');
        }}
      />

      {/* Admin Panel */}
      {isAdminOpen && (
        <AdminPanel
          currentUser={currentUser}
          onClose={() => setIsAdminOpen(false)}
          onOpenAuth={(m) => setAuthModalMode(m)}
        />
      )}

      {/* Legal & Compliance Modal */}
      <LegalModal
        isOpen={legalModalTopic !== null}
        initialTopic={legalModalTopic || 'about'}
        onClose={() => setLegalModalTopic(null)}
      />

    </div>
  );
}
