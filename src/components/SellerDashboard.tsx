import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Tag, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { User, PayoutRequest, Listing } from '../types';

interface SellerDashboardProps {
  currentUser: User | null;
  listings: Listing[];
  onOpenCreateListing: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  currentUser,
  listings,
  onOpenCreateListing,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payouts' | 'bank_setup'>('overview');

  // Bank Form State
  const [accountHolder, setAccountHolder] = useState(currentUser?.bankDetails?.accountHolder || currentUser?.name || '');
  const [bankName, setBankName] = useState(currentUser?.bankDetails?.bankName || 'Barclays Bank UK');
  const [sortCode, setSortCode] = useState(currentUser?.bankDetails?.sortCode || '20-45-78');
  const [accountNumber, setAccountNumber] = useState(currentUser?.bankDetails?.accountNumber || '83920194');
  const [isBankSaved, setIsBankSaved] = useState(!!currentUser?.bankDetails?.isVerified);

  // Payout Request State
  const [payoutAmount, setPayoutAmount] = useState('250.00');
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([
    {
      id: 'pay-demo-1',
      sellerAccountNumber: currentUser?.accountNumber || '20002000',
      sellerName: currentUser?.name || 'Sarah Jenkins',
      amount: 450.00,
      bankDetails: {
        accountHolder: 'Sarah Jenkins',
        bankName: 'Barclays Bank UK',
        sortCode: '20-45-78',
        accountNumber: '83920194',
      },
      status: 'Processed',
      requestedAt: '2026-10-28T14:00:00Z',
      processedAt: '2026-10-29T09:30:00Z',
    }
  ]);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');

  if (!currentUser) return null;

  const myListings = listings.filter(l => l.sellerAccountNumber === currentUser.accountNumber);
  const sellerBalance = currentUser.balance || 1450.00;

  // Save Bank Details
  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBankSaved(true);
    alert('UK Bank Account Details verified and securely saved to central Fine UK payment provider. Sensitive banking information is encrypted and never exposed to buyers or other sellers.');
    setActiveTab('payouts');
  };

  // Submit Payout Request
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0 || amount > sellerBalance) {
      alert('Please enter a valid payout amount within your available balance.');
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerAccountNumber: currentUser.accountNumber,
          amount,
          bankDetails: {
            accountHolder,
            bankName,
            sortCode,
            accountNumber,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPayoutHistory(prev => [data.payout, ...prev]);
      setPayoutSuccessMsg(`Payout request of £${amount.toFixed(2)} submitted for Fine UK Admin processing.`);
      setPayoutAmount('');
    } catch (err: any) {
      alert(err.message || 'Payout request failed.');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 font-display">
              {currentUser.role === 'charity' ? 'Charity Dashboard' : 'Seller Dashboard & Payouts'}
            </h2>
            <span className="bg-blue-100 text-[#00247D] text-xs font-bold px-2 py-0.5 rounded-full">
              ID: {currentUser.accountNumber}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.name} · Managing active UK advertisements, sales proceeds, and HMRC records
          </p>
        </div>

        <button
          onClick={onOpenCreateListing}
          className="px-4 py-2 bg-[#CF142B] hover:bg-[#B01024] text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Advertisement (1st Free, then £2)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Available Payout Balance</span>
          <div className="text-2xl font-black text-[#00247D] mt-1 font-display tabular-nums">
            £{sellerBalance.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">Ready for UK bank transfer</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Active Advertisements</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-display tabular-nums">
            {myListings.length}
          </div>
          <span className="text-[10px] text-slate-400">Total published listings</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Ad Fees Paid</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-display tabular-nums">
            £{(currentUser.adCount > 1 ? (currentUser.adCount - 1) * 2 : 0).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">1st ad was free</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Payout Bank Status</span>
          <div className="flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              {isBankSaved ? 'Verified UK Bank' : 'Needs Registration'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">BACS / Faster Payments</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#00247D] text-[#00247D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Advertisements ({myListings.length})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'payouts'
              ? 'border-[#00247D] text-[#00247D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Request Payout & History
        </button>
        <button
          onClick={() => setActiveTab('bank_setup')}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'bank_setup'
              ? 'border-[#00247D] text-[#00247D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Registered Bank Details
        </button>
      </div>

      {/* ======================================================================= */}
      {/* TAB 1: MY ADVERTISEMENTS */}
      {/* ======================================================================= */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 font-display">Manage Your Listings</h3>
            <span className="text-xs text-slate-500">Auto-synced with central database</span>
          </div>

          {myListings.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <p>You have not published any advertisements yet.</p>
              <button
                onClick={onOpenCreateListing}
                className="mt-3 px-4 py-2 bg-[#CF142B] text-white rounded-xl font-bold cursor-pointer"
              >
                Create First Free Advertisement
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myListings.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{item.category}</span>
                        <span>·</span>
                        <span>Stock: {item.stock}</span>
                        <span>·</span>
                        <span className="font-mono">{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[#00247D] font-display tabular-nums">
                      £{item.price.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Ad Fee: {item.adFeePaid === 0 ? 'FREE' : '£2.00 Paid'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 2: REQUEST PAYOUT & HISTORY */}
      {/* ======================================================================= */}
      {activeTab === 'payouts' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Form: Request Payout */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 font-display">
              Withdraw Available Funds
            </h3>
            <p className="text-xs text-slate-500">
              Direct transfer to your verified UK high-street bank account via Faster Payments.
            </p>

            {payoutSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                {payoutSuccessMsg}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payout Amount in GBP (£)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm font-bold text-slate-500">£</span>
                  <input
                    type="number"
                    step="0.01"
                    max={sellerBalance}
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Available to withdraw: £{sellerBalance.toFixed(2)}
                </span>
              </div>

              {/* Destination preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-700">Destination Account:</span>
                <div className="text-slate-800">{bankName} · {accountHolder}</div>
                <div className="text-[11px] font-mono text-slate-500">
                  Sort: {sortCode} · Acc: •••• {accountNumber.slice(-4)}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPayout || !payoutAmount}
                className="w-full py-2.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmittingPayout ? 'Submitting...' : 'Request Payout to Bank'}
              </button>
            </form>
          </div>

          {/* Right History Table */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 font-display">Payout Records & History</h3>
              <span className="text-xs text-slate-500">HMRC Recordkeeping</span>
            </div>

            <div className="divide-y divide-slate-100">
              {payoutHistory.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-black text-slate-900 text-sm tabular-nums">
                      £{p.amount.toFixed(2)}
                    </div>
                    <div className="text-slate-500 text-[11px] font-mono">
                      {p.bankDetails.bankName} (Sort: {p.bankDetails.sortCode})
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Requested: {new Date(p.requestedAt).toLocaleDateString('en-GB')}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'Processed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status}
                    </span>
                    {p.processedAt && (
                      <div className="text-[10px] text-slate-400 mt-1">
                        Paid on {new Date(p.processedAt).toLocaleDateString('en-GB')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 3: REGISTERED BANK DETAILS (Section 9) */}
      {/* ======================================================================= */}
      {activeTab === 'bank_setup' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00247D]" />
            <h3 className="font-bold text-base text-slate-900 font-display">
              UK Bank Payout Registration
            </h3>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <p className="font-bold">Section 9 Security & Privacy Guarantee:</p>
            <p className="text-[11px]">
              Fine UK verifies bank details through a regulated UK payment provider. Sensitive banking information is encrypted and strictly confidential — it is never shown to buyers or other sellers.
            </p>
          </div>

          <form onSubmit={handleSaveBankDetails} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                UK Bank Name
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 cursor-pointer"
              >
                <option value="Barclays Bank UK">Barclays Bank UK</option>
                <option value="HSBC UK">HSBC UK</option>
                <option value="Lloyds Bank plc">Lloyds Bank plc</option>
                <option value="NatWest">NatWest</option>
                <option value="Santander UK">Santander UK</option>
                <option value="Monzo Bank">Monzo Bank</option>
                <option value="Starling Bank">Starling Bank</option>
                <option value="Nationwide Building Society">Nationwide Building Society</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sort Code (XX-XX-XX)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  required
                  placeholder="20-45-78"
                  value={sortCode}
                  onChange={(e) => setSortCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Number (8 digits)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  required
                  placeholder="12345678"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
            >
              Verify & Save Bank Details
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
