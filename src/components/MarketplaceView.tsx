import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Truck, 
  ShoppingBag, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertCircle,
  X,
  CreditCard,
  Building,
  HeartHandshake,
  Car,
  Home as HomeIcon,
  Briefcase
} from 'lucide-react';
import { Listing, ListingCategory, ProductCondition, User } from '../types';

interface MarketplaceViewProps {
  listings: Listing[];
  currentUser: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onStartMessageWithUser: (accountNumber: string, initialText?: string) => void;
  onCreateOrder: (orderData: {
    listingId: string;
    buyerAccountNumber: string;
    quantity: number;
    deliveryMethod: 'Royal Mail' | 'Courier' | 'Collection' | 'Cash on Delivery';
    paymentMethod: 'Card' | 'Cash on Delivery' | 'Fine UK Escrow';
    isCharityClaim?: boolean;
  }) => Promise<any>;
  initialCategory?: string;
  initialSearchQuery?: string;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  listings,
  currentUser,
  onOpenAuth,
  onStartMessageWithUser,
  onCreateOrder,
  initialCategory = 'All',
  initialSearchQuery = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedSellerRole, setSelectedSellerRole] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  // Selected Listing for Product Detail Page (PDP)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activePdpImageIndex, setActivePdpImageIndex] = useState<number>(0);

  // Checkout Modal State
  const [checkoutListing, setCheckoutListing] = useState<Listing | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'Royal Mail' | 'Courier' | 'Collection' | 'Cash on Delivery'>('Royal Mail');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash on Delivery' | 'Fine UK Escrow'>('Card');
  const [isCharityClaim, setIsCharityClaim] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<any | null>(null);

  // AI Smart Search modal
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResultText, setAiResultText] = useState('');

  // Filter listings
  const filteredListings = listings.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedCondition !== 'All' && item.condition !== selectedCondition) return false;
    if (selectedLocation !== 'All' && !item.location.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
    if (selectedSellerRole !== 'All' && item.sellerRole !== selectedSellerRole) return false;
    if (item.price > maxPrice) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchSeller = item.sellerName.toLowerCase().includes(q) || item.sellerAccountNumber.includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchSeller) return false;
    }

    return true;
  });

  const handleRunAiSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiResultText('');
    try {
      const res = await fetch('/api/gemini/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiPrompt }),
      });
      const data = await res.json();
      if (data.filter) {
        if (data.filter.keywords) setSearchQuery(data.filter.keywords);
        if (data.filter.category && data.filter.category !== 'All') setSelectedCategory(data.filter.category);
        if (data.filter.maxPrice) setMaxPrice(data.filter.maxPrice);
        if (data.filter.location) setSelectedLocation(data.filter.location);
        setAiResultText(data.filter.explanation || 'Smart search applied!');
      }
    } catch {
      setSearchQuery(aiPrompt);
      setAiResultText('Applied standard search for query.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleProceedToCheckout = (listing: Listing, charityFreeClaim: boolean = false) => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    setCheckoutListing(listing);
    setOrderQuantity(1);
    setIsCharityClaim(charityFreeClaim || currentUser.role === 'charity');
    // Pick default available delivery method
    if (listing.deliveryOptions.royalMail) setDeliveryMethod('Royal Mail');
    else if (listing.deliveryOptions.courier) setDeliveryMethod('Courier');
    else if (listing.deliveryOptions.collection) setDeliveryMethod('Collection');
    else setDeliveryMethod('Cash on Delivery');
  };

  const handleConfirmOrder = async () => {
    if (!checkoutListing || !currentUser) return;
    setIsSubmittingOrder(true);
    try {
      const result = await onCreateOrder({
        listingId: checkoutListing.id,
        buyerAccountNumber: currentUser.accountNumber,
        quantity: orderQuantity,
        deliveryMethod,
        paymentMethod: isCharityClaim ? 'Card' : paymentMethod,
        isCharityClaim,
      });
      setOrderSuccessMessage(result);
      setCheckoutListing(null);
      setSelectedListing(null);
    } catch (err: any) {
      alert(err.message || 'Failed to place order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Category Sector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'All', label: 'All Listings' },
          { id: 'Motors & Vehicles', label: 'Motors & Cars' },
          { id: 'Property', label: 'Property' },
          { id: 'Jobs', label: 'Jobs & Careers' },
          { id: 'Services', label: 'Services & Trades' },
          { id: 'Electronics', label: 'Electronics' },
          { id: 'Home & Garden', label: 'Home & Garden' },
          { id: 'Fashion', label: 'Fashion' },
          { id: 'Charity & Community', label: 'Charity & Community' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === tab.id
                ? 'bg-[#00247D] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Main Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search products, cars, property, jobs, services, or 8-digit ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#00247D] outline-hidden text-slate-900 placeholder-slate-400 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* AI Smart Search Button */}
          <button
            onClick={() => setIsAiSearchOpen(true)}
            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-[#00247D] border border-blue-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Natural Language Search</span>
          </button>

        </div>

        {/* Filter Pills Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </span>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-medium outline-hidden cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Motors & Vehicles">Motors & Vehicles (Cars & Vans)</option>
            <option value="Property">Property (Sales & Lettings)</option>
            <option value="Jobs">Jobs & Careers</option>
            <option value="Services">Services & Trades</option>
            <option value="Electronics">Electronics</option>
            <option value="Home & Garden">Home & Garden</option>
            <option value="Fashion">Fashion</option>
            <option value="Health & Beauty">Health & Beauty</option>
            <option value="Sports & Leisure">Sports & Leisure</option>
            <option value="Collectables & Art">Collectables & Art</option>
            <option value="Charity & Community">Charity & Community</option>
          </select>

          {/* Condition Dropdown */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-medium outline-hidden cursor-pointer"
          >
            <option value="All">All Conditions</option>
            <option value="New">Brand New</option>
            <option value="Used - Like New">Used - Like New</option>
            <option value="Used - Good">Used - Good</option>
            <option value="Service / Professional">Service</option>
          </select>

          {/* Location Dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-medium outline-hidden cursor-pointer"
          >
            <option value="All">All UK Regions</option>
            <option value="London">London & South East</option>
            <option value="Manchester">Manchester & North West</option>
            <option value="Birmingham">Birmingham & Midlands</option>
            <option value="Leeds">Leeds & Yorkshire</option>
            <option value="Edinburgh">Edinburgh & Scotland</option>
            <option value="Cardiff">Cardiff & Wales</option>
            <option value="Belfast">Belfast & N. Ireland</option>
          </select>

          {/* Seller Type Dropdown */}
          <select
            value={selectedSellerRole}
            onChange={(e) => setSelectedSellerRole(e.target.value)}
            className="bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-medium outline-hidden cursor-pointer"
          >
            <option value="All">All Sellers</option>
            <option value="seller">Independent Sellers</option>
            <option value="charity">Registered Charities</option>
          </select>

          {/* Reset Filters */}
          {(selectedCategory !== 'All' || selectedCondition !== 'All' || selectedLocation !== 'All' || selectedSellerRole !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCondition('All');
                setSelectedLocation('All');
                setSelectedSellerRole('All');
                setSearchQuery('');
              }}
              className="text-xs text-[#CF142B] font-semibold hover:underline ml-auto cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* AI Explanation Notice if active */}
      {aiResultText && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong>AI Search:</strong> {aiResultText}</span>
          </div>
          <button 
            onClick={() => setAiResultText('')}
            className="text-blue-600 hover:text-blue-800 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-bold text-slate-900">{filteredListings.length}</span> advertisements across the UK
        </div>
        <div className="flex items-center gap-2">
          <span>Max Price: £{maxPrice}</span>
          <input
            type="range"
            min="20"
            max="3000"
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
            className="w-24 accent-[#00247D]"
          />
        </div>
      </div>

      {/* Product Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No advertisements found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms, price limit, or category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedListing(item)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Product Image */}
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category Pill Tag */}
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {item.category}
                  </div>
                  {/* Condition Tag */}
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                    {item.condition}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location}
                    </span>
                    <span className="font-mono text-slate-400">
                      ID: {item.sellerAccountNumber}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-[#00247D] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Category Specific Snippet Badge */}
                  {item.vehicleDetails && (
                    <div className="text-[11px] font-semibold text-blue-900 bg-blue-50/70 px-2 py-1 rounded-lg">
                      {item.vehicleDetails.year} · {item.vehicleDetails.mileage.toLocaleString()} mi · {item.vehicleDetails.fuelType} · {item.vehicleDetails.transmission}
                    </div>
                  )}

                  {item.propertyDetails && (
                    <div className="text-[11px] font-semibold text-emerald-900 bg-emerald-50/70 px-2 py-1 rounded-lg">
                      {item.propertyDetails.bedrooms} Bed · {item.propertyDetails.bathrooms} Bath · {item.propertyDetails.propertyType} · {item.propertyDetails.furnished}
                    </div>
                  )}

                  {item.jobDetails && (
                    <div className="text-[11px] font-semibold text-purple-900 bg-purple-50/70 px-2 py-1 rounded-lg">
                      {item.jobDetails.companyName} · {item.jobDetails.jobType} · {item.jobDetails.workArrangement}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                <div>
                  <div className="text-lg font-black text-[#00247D] font-display tabular-nums">
                    £{item.price.toFixed(2)}
                    {item.priceType === 'per_month' && <span className="text-xs font-normal text-slate-500"> /pcm</span>}
                    {item.priceType === 'per_week' && <span className="text-xs font-normal text-slate-500"> /pw</span>}
                    {item.priceType === 'per_year' && <span className="text-xs font-normal text-slate-500"> /yr</span>}
                    {item.priceType === 'per_hour' && <span className="text-xs font-normal text-slate-500"> /hr</span>}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {item.category === 'Property' ? (
                      <span>Exempt from UK VAT</span>
                    ) : item.category === 'Jobs' ? (
                      <span>No VAT applicable</span>
                    ) : item.vatAmount > 0 ? (
                      <span className="text-emerald-700 font-medium">Includes 20% UK VAT</span>
                    ) : (
                      <span>HMRC Margin / Zero-rated</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProceedToCheckout(item);
                  }}
                  className="px-3.5 py-1.5 bg-[#CF142B] hover:bg-[#B01024] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  {item.category === 'Jobs' ? 'Apply Now' : item.category === 'Property' ? 'Book Viewing' : 'Buy Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCT DETAIL MODAL (PDP) */}
      {/* ========================================================================= */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {selectedListing.category}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-[#00247D]">
                  Listed by {selectedListing.sellerName}
                </span>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Product Image & Multi-Photo Device Gallery */}
              <div className="space-y-2">
                <div className="aspect-16/9 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={selectedListing.images[activePdpImageIndex] || selectedListing.images[0]}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {selectedListing.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedListing.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePdpImageIndex(idx)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                          activePdpImageIndex === idx ? 'border-[#00247D] ring-2 ring-blue-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Price Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">
                    {selectedListing.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedListing.location} ({selectedListing.postcode})
                    </span>
                    <span>·</span>
                    <span className="font-medium text-slate-700">Condition: {selectedListing.condition}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold">Stock: {selectedListing.stock} available</span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-3xl font-black text-[#00247D] font-display tabular-nums">
                    £{selectedListing.price.toFixed(2)}
                    {selectedListing.priceType === 'per_month' && <span className="text-sm font-normal text-slate-500"> /pcm</span>}
                    {selectedListing.priceType === 'per_year' && <span className="text-sm font-normal text-slate-500"> /yr</span>}
                    {selectedListing.priceType === 'per_hour' && <span className="text-sm font-normal text-slate-500"> /hr</span>}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedListing.vatAmount > 0 ? (
                      <span className="text-emerald-700 font-medium">Includes £{selectedListing.vatAmount.toFixed(2)} UK VAT</span>
                    ) : (
                      <span>HMRC Second-hand / Zero-rated</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Specialized Vehicle Specifications */}
              {selectedListing.vehicleDetails && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-2.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#00247D] flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-blue-700" />
                    <span>Official UK Vehicle Specifications (DVLA & V5C)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-blue-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Make & Model</span>
                      <strong className="text-slate-900">{selectedListing.vehicleDetails.make} {selectedListing.vehicleDetails.model}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-blue-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Year</span>
                      <strong className="text-slate-900">{selectedListing.vehicleDetails.year}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-blue-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Mileage</span>
                      <strong className="text-slate-900">{selectedListing.vehicleDetails.mileage.toLocaleString()} miles</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-blue-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Fuel & Gearbox</span>
                      <strong className="text-slate-900">{selectedListing.vehicleDetails.fuelType} · {selectedListing.vehicleDetails.transmission}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Specialized Property Specifications */}
              {selectedListing.propertyDetails && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <HomeIcon className="w-4 h-4 text-emerald-700" />
                    <span>UK Property & Tenancy Specifications</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Tenure / Type</span>
                      <strong className="text-slate-900">{selectedListing.propertyDetails.propertyType} ({selectedListing.propertyDetails.furnished})</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Bedrooms & Bathrooms</span>
                      <strong className="text-slate-900">{selectedListing.propertyDetails.bedrooms} Bed · {selectedListing.propertyDetails.bathrooms} Bath</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">EPC & Council Tax</span>
                      <strong className="text-slate-900">EPC {selectedListing.propertyDetails.epcRating} · {selectedListing.propertyDetails.councilTaxBand}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Specialized Job Role Specifications */}
              {selectedListing.jobDetails && (
                <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-2.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-purple-700" />
                    <span>Employment & Role Specifications</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-purple-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Employer</span>
                      <strong className="text-slate-900">{selectedListing.jobDetails.companyName}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-purple-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Contract & Model</span>
                      <strong className="text-slate-900">{selectedListing.jobDetails.jobType} ({selectedListing.jobDetails.workArrangement})</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-purple-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Remuneration</span>
                      <strong className="text-slate-900">£{selectedListing.price.toLocaleString()} p.a.</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedListing.description}
                </p>
              </div>

              {/* Delivery & Collection Responsibilities (Section 6) */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs space-y-2">
                <h4 className="font-bold text-[#00247D] flex items-center gap-1.5 text-sm">
                  <Truck className="w-4 h-4 text-blue-700" />
                  Delivery & Collection Terms (UK Statutory Notice)
                </h4>
                <ul className="space-y-1.5 text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Collection:</strong> Buyer is responsible for collecting the item from {selectedListing.location}.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Cash on Delivery (COD):</strong> Seller is responsible for arranging and managing COD.</span>
                  </li>
                  {selectedListing.deliveryOptions.royalMail && (
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span><strong>Royal Mail Delivery:</strong> £{selectedListing.deliveryOptions.royalMailCost?.toFixed(2)} (Tracked delivery with receipt).</span>
                    </li>
                  )}
                  {selectedListing.deliveryOptions.courier && (
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span><strong>UK Courier Delivery:</strong> £{selectedListing.deliveryOptions.courierCost?.toFixed(2)} (Signed courier with tracking).</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* UK HMRC VAT Treatment (Section 6) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">HMRC VAT Compliance Record:</span>
                  <span className="text-emerald-700 font-semibold font-mono text-[11px]">HMRC REF: 2026/UK</span>
                </div>
                <p className="text-slate-600">
                  {selectedListing.vatSchemeNote}
                </p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Net Price: £{(selectedListing.price - selectedListing.vatAmount).toFixed(2)}</span>
                  <span>Applicable VAT: £{selectedListing.vatAmount.toFixed(2)}</span>
                  <span className="font-bold text-slate-900">Gross Total: £{selectedListing.price.toFixed(2)}</span>
                </div>
              </div>

              {/* Seller Verification Card */}
              <div className="flex items-center justify-between p-3.5 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00247D] text-white flex items-center justify-center font-bold font-mono text-sm">
                    {selectedListing.sellerAccountNumber.slice(-2)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {selectedListing.sellerName}
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      8-Digit Account ID: {selectedListing.sellerAccountNumber}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onStartMessageWithUser(
                      selectedListing.sellerAccountNumber,
                      `Hello, I am inquiring about "${selectedListing.title}" (Ad ID: ${selectedListing.id}).`
                    );
                    setSelectedListing(null);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-[#00247D] border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message Seller</span>
                </button>
              </div>

            </div>

            {/* Modal Footer CTAs */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-wrap">
              <button
                onClick={() => setSelectedListing(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-semibold cursor-pointer"
              >
                Close
              </button>

              {currentUser?.role === 'charity' && (
                <button
                  onClick={() => {
                    const item = selectedListing;
                    setSelectedListing(null);
                    handleProceedToCheckout(item, true);
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Claim Free as Registered Charity (£0.00)</span>
                </button>
              )}

              <button
                onClick={() => {
                  const item = selectedListing;
                  setSelectedListing(null);
                  handleProceedToCheckout(item, false);
                }}
                className="px-6 py-2 bg-[#CF142B] hover:bg-[#B01024] text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Proceed to Order (£{selectedListing.price.toFixed(2)})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER CHECKOUT MODAL (Section 6 & 7) */}
      {/* ========================================================================= */}
      {checkoutListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in duration-200">
            
            <div className="px-6 py-4 bg-[#00247D] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-display">Confirm Your Order</h3>
                <p className="text-xs text-blue-200">Official Fine UK Order & VAT Process</p>
              </div>
              <button
                onClick={() => setCheckoutListing(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Item Snapshot */}
              <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={checkoutListing.images[0]}
                  alt={checkoutListing.title}
                  className="w-16 h-16 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{checkoutListing.title}</h4>
                  <div className="text-xs text-slate-500">Seller: {checkoutListing.sellerName} (Acc #{checkoutListing.sellerAccountNumber})</div>
                  <div className="text-sm font-black text-[#00247D] mt-1 tabular-nums">
                    £{checkoutListing.price.toFixed(2)} each
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={checkoutListing.stock}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold outline-hidden focus:border-[#00247D]"
                  />
                  <span className="text-xs text-slate-500">Max stock: {checkoutListing.stock}</span>
                </div>
              </div>

              {/* Delivery Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Delivery / Collection Method
                </label>
                <div className="space-y-2">
                  {checkoutListing.deliveryOptions.royalMail && (
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === 'Royal Mail'}
                          onChange={() => setDeliveryMethod('Royal Mail')}
                          className="accent-[#00247D]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Royal Mail Tracked Delivery</div>
                          <div className="text-[11px] text-slate-500">Official Royal Mail dispatch with tracking</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        £{checkoutListing.deliveryOptions.royalMailCost.toFixed(2)}
                      </span>
                    </label>
                  )}

                  {checkoutListing.deliveryOptions.courier && (
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === 'Courier'}
                          onChange={() => setDeliveryMethod('Courier')}
                          className="accent-[#00247D]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Signed UK Courier</div>
                          <div className="text-[11px] text-slate-500">DPD / Evri / Parcelforce UK</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        £{checkoutListing.deliveryOptions.courierCost.toFixed(2)}
                      </span>
                    </label>
                  )}

                  {checkoutListing.deliveryOptions.collection && (
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === 'Collection'}
                          onChange={() => setDeliveryMethod('Collection')}
                          className="accent-[#00247D]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Buyer In-Person Collection</div>
                          <div className="text-[11px] text-slate-500">Collect in {checkoutListing.location} (Buyer responsibility)</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">FREE</span>
                    </label>
                  )}

                  {checkoutListing.deliveryOptions.cashOnDelivery && (
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === 'Cash on Delivery'}
                          onChange={() => setDeliveryMethod('Cash on Delivery')}
                          className="accent-[#00247D]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</div>
                          <div className="text-[11px] text-slate-500">Seller is responsible for arranging & collecting payment</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">FREE</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'Card'
                        ? 'border-[#00247D] bg-blue-50 text-[#00247D]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>UK Debit / Credit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-[#00247D] bg-blue-50 text-[#00247D]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Cash on Delivery</span>
                  </button>
                </div>
              </div>

              {/* Registered Charity Free Claim Banner */}
              {currentUser?.role === 'charity' && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                      <HeartHandshake className="w-4 h-4 text-[#CF142B]" />
                      <span>Registered UK Charity Free Benefit</span>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-rose-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCharityClaim}
                        onChange={(e) => setIsCharityClaim(e.target.checked)}
                        className="accent-[#CF142B] w-4 h-4"
                      />
                      <span>Claim Free (£0.00 Goods)</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Under Fine UK Charity Policy, registered charities receive marketplace items <strong>free of charge (£0.00)</strong>. Transportation / courier delivery or local seller collection costs are paid directly by the charity.
                  </p>
                </div>
              )}

              {/* Order Total Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Items Total ({orderQuantity}x)</span>
                  <span className="font-semibold tabular-nums">
                    {isCharityClaim ? (
                      <span className="text-emerald-700 font-bold">£0.00 (Charity Free)</span>
                    ) : (
                      `£${(checkoutListing.price * orderQuantity).toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Transportation / Delivery ({deliveryMethod})</span>
                  <span className="font-semibold tabular-nums">
                    {deliveryMethod === 'Royal Mail'
                      ? `£${(checkoutListing.deliveryOptions.royalMailCost || 0).toFixed(2)}`
                      : deliveryMethod === 'Courier'
                      ? `£${(checkoutListing.deliveryOptions.courierCost || 0).toFixed(2)}`
                      : '£0.00 (Self-Collection)'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                  <span>HMRC VAT Component</span>
                  <span className="tabular-nums">
                    {isCharityClaim ? '£0.00 (Zero-Rated)' : `£${(checkoutListing.vatAmount * orderQuantity).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-300">
                  <span>Total Payable:</span>
                  <span className="text-[#00247D] font-display text-base tabular-nums">
                    £{(
                      (isCharityClaim ? 0 : checkoutListing.price * orderQuantity) +
                      (deliveryMethod === 'Royal Mail'
                        ? checkoutListing.deliveryOptions.royalMailCost || 0
                        : deliveryMethod === 'Courier'
                        ? checkoutListing.deliveryOptions.courierCost || 0
                        : 0)
                    ).toFixed(2)}
                  </span>
                </div>
                {isCharityClaim && (
                  <div className="text-[10px] text-rose-800 font-medium pt-1">
                    * Item cost is £0.00. Total payable covers logistics / courier dispatch paid by the charity.
                  </div>
                )}
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCheckoutListing(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingOrder}
                onClick={handleConfirmOrder}
                className={`px-6 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                  isCharityClaim ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-[#CF142B] hover:bg-[#B01024]'
                }`}
              >
                {isSubmittingOrder ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {isCharityClaim
                        ? 'Confirm Charity Free Claim'
                        : 'Place Order & Generate VAT Invoice'}
                    </span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER SUCCESS NOTIFICATION MODAL */}
      {/* ========================================================================= */}
      {orderSuccessMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-3" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 font-display">Order Confirmed!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Your order has been recorded in the central Fine UK database.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-mono font-bold text-blue-900">{orderSuccessMessage.order?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VAT Invoice #:</span>
                <span className="font-mono font-semibold text-slate-800">{orderSuccessMessage.order?.vatInvoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-slate-900">£{orderSuccessMessage.order?.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inbox Notification:</span>
                <span className="text-emerald-700 font-semibold">Sent to Buyer & Seller</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              You can track this order status or communicate with the seller through your Fine UK Inbox.
            </p>

            <button
              onClick={() => setOrderSuccessMessage(null)}
              className="w-full py-2.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI SMART SEARCH MODAL */}
      {/* ========================================================================= */}
      {isAiSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#00247D] to-[#1E3A8A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base font-display">AI Natural Language Search</h3>
              </div>
              <button
                onClick={() => setIsAiSearchOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunAiSmartSearch} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Describe what you are looking for in everyday British English (e.g. <em>"A refurbished laptop in Manchester under £300 for university work"</em> or <em>"Handcrafted oak furniture with collection"</em>).
              </p>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Type your request here..."
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-hidden focus:border-[#00247D] bg-slate-50 focus:bg-white text-slate-900"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAiSearchOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="px-5 py-2 bg-[#CF142B] hover:bg-[#B01024] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <span>Analyzing...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Search Marketplace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
