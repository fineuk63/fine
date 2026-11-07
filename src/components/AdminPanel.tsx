import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Tag, 
  DollarSign, 
  FileText, 
  Search, 
  Printer, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  RefreshCw,
  Edit2,
  Trash2,
  Landmark,
  Save,
  AlertTriangle,
  Building,
  Calendar,
  X,
  CreditCard,
  Download,
  Eye,
  ShieldAlert,
  AlertOctagon,
  Key,
  Database,
  Terminal,
  Cpu,
  Check
} from 'lucide-react';
import { User, AdminStats, SecurityAlert, PayoutRequest, AdFeeTransaction, FineUkAdminBankDetails, MonthlyTaxStatement, BlockedIpRecord } from '../types';

interface AdminPanelProps {
  currentUser: User | null;
  onClose: () => void;
  onOpenAuth: (mode: 'login') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onClose,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'bank_details' | 'financials' | 'vat' | 'security'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adFees, setAdFees] = useState<AdFeeTransaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [vatTransactions, setVatTransactions] = useState<any[]>([]);

  // Search & Filters
  const [searchAccountQuery, setSearchAccountQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller' | 'charity' | 'admin'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Cyber Shield & IP Firewall state
  const [blockedIps, setBlockedIps] = useState<BlockedIpRecord[]>([]);
  const [manualIpToBlock, setManualIpToBlock] = useState('');
  const [manualBlockReason, setManualBlockReason] = useState('');
  const [isSimulatingAttack, setIsSimulatingAttack] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Admin PIN change state
  const [adminCurrentPin, setAdminCurrentPin] = useState('');
  const [adminNewPin, setAdminNewPin] = useState('');
  const [adminConfirmPin, setAdminConfirmPin] = useState('');
  const [adminPinFeedback, setAdminPinFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);

  // Deep Account Inspection Modal state
  const [inspectingAccount, setInspectingAccount] = useState<any | null>(null);
  const [isLoadingInspection, setIsLoadingInspection] = useState(false);

  // AI Compliance Audit state
  const [aiAuditModalUser, setAiAuditModalUser] = useState<any | null>(null);
  const [aiAuditResult, setAiAuditResult] = useState<any | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // User Edit Modal State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userActionFeedback, setUserActionFeedback] = useState<string | null>(null);

  // Fine UK Official Bank Details for £2 Fees Only
  const [bankDetails, setBankDetails] = useState<FineUkAdminBankDetails>({
    bankName: 'Barclays Bank UK PLC (Corporate Banking)',
    accountHolderName: 'Fine UK Limited (Official Listing Fee Account)',
    sortCode: '20-00-00',
    accountNumber: '89201948',
    iban: 'GB29BARC20000089201948',
    bic: 'BARCGB22',
    referencePrefix: 'FINEUK-AD-',
    feePolicyNotice: 'Official Fine UK Bank Account configured exclusively to collect the £2.00 GBP advertising publication fee. Fine UK operates strictly as an advertising venue. No payments for items, vehicles, property, or trade services are collected, processed, or held on this platform. All commercial transactions are settled directly between buyers, sellers, and charities upon collection or delivery.',
    lastUpdated: new Date().toISOString(),
  });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankFeedback, setBankFeedback] = useState<string | null>(null);

  // Monthly Tax Statement State
  const [selectedStatementMonth, setSelectedStatementMonth] = useState<string>('All');
  const [selectedStatementYear, setSelectedStatementYear] = useState<number>(2026);
  const [selectedStatementSeller, setSelectedStatementSeller] = useState<string>('all');
  const [monthlyStatement, setMonthlyStatement] = useState<MonthlyTaxStatement | null>(null);
  const [statementOrders, setStatementOrders] = useState<any[]>([]);
  const [isLoadingStatement, setIsLoadingStatement] = useState(false);

  // Load Admin Data from Server
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setUsersList(data.users || []);
        setAdFees(data.adFees || []);
        setPayouts(data.payouts || []);
        setSecurityAlerts(data.securityAlerts || []);
        setVatTransactions(data.vatTransactions || []);
      }

      // Load bank details
      const bankRes = await fetch('/api/admin/bank-details');
      const bankData = await bankRes.json();
      if (bankData.success && bankData.bankDetails) {
        setBankDetails(bankData.bankDetails);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Fetch monthly tax statement
  const fetchTaxStatement = async () => {
    setIsLoadingStatement(true);
    try {
      const queryParams = new URLSearchParams({
        accountNumber: selectedStatementSeller,
        month: selectedStatementMonth,
        year: selectedStatementYear.toString(),
      });
      const res = await fetch(`/api/vat/monthly-statement?${queryParams}`);
      const data = await res.json();
      if (data.success) {
        setMonthlyStatement(data.statement);
        setStatementOrders(data.qualifyingOrders || []);
      }
    } catch (err) {
      console.error('Failed to fetch tax statement:', err);
    } finally {
      setIsLoadingStatement(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'vat') {
      fetchTaxStatement();
    }
    if (activeTab === 'security') {
      fetchBlockedIps();
    }
  }, [activeTab, selectedStatementMonth, selectedStatementYear, selectedStatementSeller]);

  // Fetch Blocked IPs
  const fetchBlockedIps = async () => {
    try {
      const res = await fetch('/api/admin/security/blocked-ips');
      const data = await res.json();
      if (data.success) {
        setBlockedIps(data.blockedIps || []);
      }
    } catch (err) {
      console.error('Failed to load blocked IPs:', err);
    }
  };

  // Unblock IP
  const handleUnblockIp = async (ip: string) => {
    try {
      const res = await fetch('/api/admin/security/unblock-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });
      const data = await res.json();
      if (data.success) {
        setUserActionFeedback(`IP ${ip} has been unblocked.`);
        fetchBlockedIps();
        setTimeout(() => setUserActionFeedback(null), 3000);
      }
    } catch {
      alert('Failed to unblock IP');
    }
  };

  // Manual Block IP
  const handleManualBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIpToBlock.trim()) return;
    try {
      const res = await fetch('/api/admin/security/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: manualIpToBlock.trim(), reason: manualBlockReason || 'Manual Admin Quarantine' }),
      });
      const data = await res.json();
      if (data.success) {
        setManualIpToBlock('');
        setManualBlockReason('');
        setUserActionFeedback(`IP ${data.record.ip} has been manually quarantined.`);
        fetchBlockedIps();
        setTimeout(() => setUserActionFeedback(null), 3500);
      }
    } catch {
      alert('Failed to block IP');
    }
  };

  // Simulate Hacker Data Deletion Attack
  const handleSimulateAttack = async () => {
    setIsSimulatingAttack(true);
    setSimulationResult(null);
    try {
      const res = await fetch('/api/admin/security/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: 'DROP TABLE users; DELETE FROM listings WHERE 1=1;',
          vector: 'SQL Injection Data Wipe',
        }),
      });
      const data = await res.json();
      setSimulationResult(data.message || 'Intrusion auto-blocked and IP quarantined.');
      fetchBlockedIps();
      loadAdminData();
    } catch (err: any) {
      setSimulationResult('Intrusion caught: HTTP 403 Forbidden. Attacker IP quarantined.');
      fetchBlockedIps();
      loadAdminData();
    } finally {
      setIsSimulatingAttack(false);
    }
  };

  // Change Admin 4-Digit PIN
  const handleChangeAdminPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPinFeedback(null);
    if (adminNewPin !== adminConfirmPin) {
      setAdminPinFeedback({ type: 'error', message: 'New PIN and Confirm PIN do not match.' });
      return;
    }
    if (!/^\d{4}$/.test(adminNewPin)) {
      setAdminPinFeedback({ type: 'error', message: 'PIN must be exactly 4 digits.' });
      return;
    }
    setIsChangingPin(true);
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: currentUser?.accountNumber || '88888888',
          currentPin: adminCurrentPin,
          newPin: adminNewPin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminPinFeedback({ type: 'success', message: 'Admin 4-digit PIN successfully updated! Use your new PIN for future logins.' });
        setAdminCurrentPin('');
        setAdminNewPin('');
        setAdminConfirmPin('');
      } else {
        setAdminPinFeedback({ type: 'error', message: data.error || 'Failed to update PIN.' });
      }
    } catch (err: any) {
      setAdminPinFeedback({ type: 'error', message: err.message || 'Error updating PIN' });
    } finally {
      setIsChangingPin(false);
    }
  };

  // Open Deep Account Inspection
  const handleOpenInspect = async (accountNumber: string) => {
    setIsLoadingInspection(true);
    setInspectingAccount(null);
    try {
      const res = await fetch(`/api/admin/account-details/${accountNumber}`);
      const data = await res.json();
      if (data.success) {
        setInspectingAccount(data);
      } else {
        alert(data.error || 'Failed to inspect account');
      }
    } catch {
      alert('Error fetching account inspection data');
    } finally {
      setIsLoadingInspection(false);
    }
  };

  // Run AI Compliance Audit
  const handleRunAiAudit = async (accountNumber: string, userObj?: any) => {
    setIsAuditing(true);
    setAiAuditModalUser(userObj || usersList.find(u => u.accountNumber === accountNumber) || { accountNumber });
    setAiAuditResult(null);
    try {
      const res = await fetch('/api/admin/ai/compliance-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAuditResult(data.audit);
      } else {
        alert(data.error || 'Failed to complete AI audit');
      }
    } catch {
      alert('Error executing AI audit');
    } finally {
      setIsAuditing(false);
    }
  };

  // Suspend / Unsuspend user
  const handleToggleUserStatus = async (accountNumber: string) => {
    try {
      const res = await fetch(`/api/admin/users/${accountNumber}/toggle-status`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => u.accountNumber === accountNumber ? { ...u, status: data.status } : u));
        setUserActionFeedback(`Status updated for #${accountNumber}`);
        setTimeout(() => setUserActionFeedback(null), 3000);
      }
    } catch {
      alert('Failed to update user status');
    }
  };

  // Save Edited User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.accountNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => u.accountNumber === editingUser.accountNumber ? data.user : u));
        setUserActionFeedback(`Account #${editingUser.accountNumber} successfully saved.`);
        setEditingUser(null);
        setTimeout(() => setUserActionFeedback(null), 3500);
      } else {
        alert(data.error || 'Failed to save account');
      }
    } catch (err) {
      alert('Error saving user');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.accountNumber}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.filter(u => u.accountNumber !== userToDelete.accountNumber));
        setUserActionFeedback(data.message);
        setUserToDelete(null);
        setTimeout(() => setUserActionFeedback(null), 3500);
      } else {
        alert(data.error || 'Failed to delete account');
      }
    } catch {
      alert('Error deleting account');
    }
  };

  // Save Bank Details
  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
      const res = await fetch('/api/admin/bank-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankDetails),
      });
      const data = await res.json();
      if (data.success) {
        setBankFeedback('Fine UK official £2 ad fee collection bank account successfully saved and recorded.');
        setTimeout(() => setBankFeedback(null), 4000);
      } else {
        alert(data.error || 'Failed to update bank details');
      }
    } catch {
      alert('Error updating bank details');
    } finally {
      setIsSavingBank(false);
    }
  };

  // If user is not admin, show login prompt
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
          <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 font-display">Authorised Administrators Only</h3>
          <p className="text-xs text-slate-600">
            Access to the UK Administration Panel is restricted to verified Fine UK compliance and administrative personnel.
          </p>

          <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 text-left font-mono space-y-1">
            <div className="flex justify-between">
              <span>Admin Username:</span>
              <strong className="text-purple-950 font-bold">admin</strong>
            </div>
            <div className="flex justify-between">
              <span>Or Account ID:</span>
              <strong className="text-purple-950 font-bold">88888888</strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-purple-200">
              <span>Default PIN:</span>
              <strong className="text-purple-950 font-black">0000</strong>
            </div>
            <p className="text-[10px] text-purple-700 font-sans mt-1">
              (PIN can be changed anytime in Admin Panel Security settings)
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth('login');
              }}
              className="flex-1 py-2 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Login as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered users by 8-digit search, name, phone, and role filter
  const filteredUsers = usersList.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const query = searchAccountQuery.trim().toLowerCase();
    const matchesQuery = !query ||
      u.accountNumber.includes(query) ||
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.phone && u.phone.includes(query)) ||
      (u.username && u.username.toLowerCase().includes(query));
    return matchesRole && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-3xl max-w-6xl w-full h-[92vh] shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Admin Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display">Fine UK Administration & Compliance Panel</h2>
                <span className="bg-purple-950 text-purple-300 border border-purple-700/50 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  HM Government Standards
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Authorised Officer: {currentUser.name} (ID: {currentUser.accountNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              title="Refresh central data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Exit Admin
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-6 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'dashboard' ? 'border-[#00247D] text-[#00247D]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'users' ? 'border-[#00247D] text-[#00247D]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Account Management (Edit / Delete)
          </button>
          <button
            onClick={() => setActiveTab('bank_details')}
            className={`py-3 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'bank_details' ? 'border-[#00247D] text-[#00247D]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>UK Bank Details (£2 Fees Only)</span>
          </button>
          <button
            onClick={() => setActiveTab('vat')}
            className={`py-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'vat' ? 'border-[#00247D] text-[#00247D]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly HMRC Tax Statement
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`py-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'financials' ? 'border-[#00247D] text-[#00247D]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            £2 Ad Fees Collected
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'security' ? 'border-[#00247D] text-[#00247D]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            AI Cybersecurity
          </button>
        </div>

        {/* Global Action Feedback Notification */}
        {userActionFeedback && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{userActionFeedback}</span>
          </div>
        )}

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* =================================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* =================================================================== */}
          {activeTab === 'dashboard' && stats && (
            <>
              {/* High-level KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Registered Buyers</span>
                  <div className="text-2xl font-black text-[#00247D] font-display mt-1">{stats.totalBuyers}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Registered Sellers</span>
                  <div className="text-2xl font-black text-emerald-700 font-display mt-1">{stats.totalSellers}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Registered Charities</span>
                  <div className="text-2xl font-black text-[#CF142B] font-display mt-1">{stats.totalCharities}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Total Advertisements</span>
                  <div className="text-2xl font-black text-slate-900 font-display mt-1">{stats.totalAds}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{stats.freeAds} Free · {stats.paidAds} Paid</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Ad Fee Revenue</span>
                  <div className="text-2xl font-black text-[#00247D] font-display mt-1">£{stats.advertisingRevenue.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">£2 listing fee only</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Recorded VAT</span>
                  <div className="text-2xl font-black text-emerald-800 font-display mt-1">£{stats.totalVatRecorded.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Paid direct to HMRC</div>
                </div>
              </div>

              {/* Policy Notice Box */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
                <Landmark className="w-5 h-5 text-[#00247D] shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950 space-y-1">
                  <strong>Fine UK Commercial Transaction & Fee Policy:</strong>
                  <p className="text-blue-900/80 leading-relaxed">
                    Fine UK operates strictly as an online classifieds and communication portal. The platform collects the £2.00 advertisement publication fee only. No item sales payments, service contractor fees, or escrow sums are handled or held by Fine UK. Commercial transactions are settled directly between buyers, sellers, and charities.
                  </p>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 font-display">Orders & Fulfillment Overview</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <span className="text-slate-500 block">Pending</span>
                      <strong className="text-lg text-[#00247D]">{stats.pendingOrders}</strong>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      <span className="text-slate-500 block">Completed</span>
                      <strong className="text-lg text-emerald-700">{stats.completedOrders}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block">Cancelled</span>
                      <strong className="text-lg text-slate-600">{stats.cancelledOrders}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 font-display">Official Bank Account For £2 Fees</h4>
                    <button
                      onClick={() => setActiveTab('bank_details')}
                      className="text-xs font-bold text-[#00247D] hover:underline"
                    >
                      Edit Bank Details →
                    </button>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
                    <div>Bank: <strong>{bankDetails.bankName}</strong></div>
                    <div>Account Name: <strong>{bankDetails.accountHolderName}</strong></div>
                    <div>Sort Code: <strong>{bankDetails.sortCode}</strong> · Account: <strong>{bankDetails.accountNumber}</strong></div>
                    <div className="text-emerald-700 text-[11px] font-sans">Purpose: <strong>Collecting £2.00 GBP ad publication fees only</strong></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =================================================================== */}
          {/* TAB 2: USER MANAGEMENT (EDIT, SAVE, DELETE, AUDIT) */}
          {/* =================================================================== */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-display">Fine UK User Account Directory</h3>
                  <p className="text-xs text-slate-500">Edit, save, suspend, or delete accounts across Great Britain.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                    {(['all', 'buyer', 'seller', 'charity', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className={`px-2.5 py-1 rounded-lg capitalize cursor-pointer transition-colors ${
                          roleFilter === r
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {r === 'all' ? 'All Roles' : `${r}s`}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by 8-digit ID, name, username, or phone..."
                      value={searchAccountQuery}
                      onChange={(e) => setSearchAccountQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-[#00247D]"
                    />
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="py-2.5 px-3 font-bold">8-Digit ID</th>
                      <th className="py-2.5 px-3 font-bold">Full Name</th>
                      <th className="py-2.5 px-3 font-bold">Role</th>
                      <th className="py-2.5 px-3 font-bold">Address</th>
                      <th className="py-2.5 px-3 font-bold">Phone Number</th>
                      <th className="py-2.5 px-3 font-bold">Status</th>
                      <th className="py-2.5 px-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id || u.accountNumber} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-mono font-bold text-[#00247D]">
                          {u.accountNumber}
                          {u.username && (
                            <span className="block text-[10px] text-purple-700 font-sans font-normal">@{u.username}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          {u.charityName && (
                            <div className="text-[10px] text-rose-700 font-medium">Reg: {u.charityRegistrationNumber}</div>
                          )}
                          {u.niNumberEncrypted && (
                            <div className="text-[10px] text-amber-800 font-mono">NI: {u.niNumberEncrypted}</div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'buyer' ? 'bg-blue-100 text-blue-800' :
                            u.role === 'seller' ? 'bg-emerald-100 text-emerald-800' :
                            u.role === 'charity' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-[160px] truncate">
                          {u.address}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono">
                          {u.phone}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Account Deep Profile */}
                            <button
                              onClick={() => handleOpenInspect(u.accountNumber)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#00247D] hover:text-white transition-colors cursor-pointer"
                              title="Access & Deep Inspect Account (Listings, Orders, Messages)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Run AI Compliance Audit */}
                            <button
                              onClick={() => handleRunAiAudit(u.accountNumber, u)}
                              className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-colors cursor-pointer"
                              title="Run Gemini AI Compliance & Security Audit"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setEditingUser({ ...u })}
                              className="p-1.5 rounded-lg bg-blue-50 text-[#00247D] hover:bg-blue-100 transition-colors cursor-pointer"
                              title="Edit and Save Account"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u.accountNumber)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                u.status === 'active'
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={u.status === 'active' ? 'Suspend' : 'Activate'}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            {u.accountNumber !== '88888888' && u.username !== 'admin' && (
                              <button
                                onClick={() => setUserToDelete(u)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Delete Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: UK BANK DETAILS (COLLECTING £2 FEES ONLY) */}
          {/* =================================================================== */}
          {activeTab === 'bank_details' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-[#00247D]" />
                    <h3 className="font-bold text-base text-slate-900 font-display">
                      Fine UK Official Bank Account Details
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Designated corporate bank details used strictly to collect the £2.00 advertisement publication fee.
                  </p>
                </div>

                {/* Important Platform Mandate */}
                <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl space-y-2 text-xs text-amber-950">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Statutory Platform Collection Notice (£2 Only)</span>
                  </div>
                  <p className="leading-relaxed">
                    Fine UK collects <strong>only the £2.00 GBP advertising fee</strong> on 2nd and subsequent listings. <strong>No customer payments for products, property rent, car purchases, or contractor services are processed or collected through Fine UK.</strong> All payments between buyers, sellers, and charities are handled directly off-platform or upon physical collection/delivery.
                  </p>
                </div>

                {bankFeedback && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{bankFeedback}</span>
                  </div>
                )}

                <form onSubmit={handleSaveBankDetails} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Bank Name</label>
                      <input
                        type="text"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                        required
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#00247D]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Account Holder Name</label>
                      <input
                        type="text"
                        value={bankDetails.accountHolderName}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                        required
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#00247D]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">UK Sort Code (XX-XX-XX)</label>
                      <input
                        type="text"
                        value={bankDetails.sortCode}
                        onChange={(e) => setBankDetails({ ...bankDetails, sortCode: e.target.value })}
                        required
                        placeholder="20-00-00"
                        className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#00247D]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">8-Digit Bank Account Number</label>
                      <input
                        type="text"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        required
                        maxLength={8}
                        placeholder="89201948"
                        className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#00247D]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">UK IBAN</label>
                      <input
                        type="text"
                        value={bankDetails.iban}
                        onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                        placeholder="GB29BARC20000089201948"
                        className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#00247D]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Fee Payment Reference Prefix</label>
                      <input
                        type="text"
                        value={bankDetails.referencePrefix}
                        onChange={(e) => setBankDetails({ ...bankDetails, referencePrefix: e.target.value })}
                        placeholder="FINEUK-AD-"
                        className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#00247D]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Official Fee Collection Policy Declaration</label>
                    <textarea
                      rows={3}
                      value={bankDetails.feePolicyNotice}
                      onChange={(e) => setBankDetails({ ...bankDetails, feePolicyNotice: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-[#00247D]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingBank}
                      className="px-6 py-2.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingBank ? 'Saving...' : 'Save Fine UK Bank Details'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 4: MONTHLY HMRC VAT & TAX STATEMENT */}
          {/* =================================================================== */}
          {activeTab === 'vat' && (
            <div className="space-y-6">
              
              {/* Header & Controls */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 font-display">
                      Monthly HMRC VAT & Tax Statements
                    </h3>
                    <p className="text-xs text-slate-500">
                      Generate monthly tax records for items and services. All liabilities must be paid direct to HMRC by the seller only.
                    </p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-[#00247D] hover:bg-[#001B5E] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Monthly HMRC Statement</span>
                  </button>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Month</label>
                    <select
                      value={selectedStatementMonth}
                      onChange={(e) => setSelectedStatementMonth(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    >
                      <option value="All">Full Calendar Year</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Tax Year</label>
                    <select
                      value={selectedStatementYear}
                      onChange={(e) => setSelectedStatementYear(parseInt(e.target.value, 10))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    >
                      <option value={2026}>2026 / 2027</option>
                      <option value={2025}>2025 / 2026</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Seller Account</label>
                    <select
                      value={selectedStatementSeller}
                      onChange={(e) => setSelectedStatementSeller(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    >
                      <option value="all">Consolidated (All UK Sellers)</option>
                      {usersList.filter(u => u.role === 'seller' || u.role === 'charity').map(s => (
                        <option key={s.accountNumber} value={s.accountNumber}>
                          {s.name} (#{s.accountNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Statutory Notice Banner: Seller Pays Direct to HMRC */}
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-950 space-y-1">
                  <strong className="text-rose-900 uppercase tracking-wide">
                    HMRC Direct Remittance Requirement:
                  </strong>
                  <p className="text-rose-900/90 leading-relaxed">
                    Fine UK functions solely as an advertising medium. <strong>Fine UK does NOT deduct, collect, or remit any VAT or taxes to HMRC on behalf of sellers.</strong> All VAT due on standard goods, second-hand margin scheme records, and commercial services must be declared and <strong>paid directly to HM Revenue & Customs (HMRC) by the registered seller only</strong> via Making Tax Digital (MTD) or their Government Gateway account.
                  </p>
                </div>
              </div>

              {/* Monthly Statement Breakdown Cards */}
              {monthlyStatement && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">Statement ID: {monthlyStatement.statementNumber}</span>
                      <h4 className="text-base font-bold text-slate-900 font-display">
                        Statement Period: {monthlyStatement.month} {monthlyStatement.year}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Taxpayer / Seller: {monthlyStatement.taxpayerName} ({monthlyStatement.accountNumber})
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-slate-500">Generated: {new Date(monthlyStatement.generatedAt).toLocaleDateString('en-GB')}</div>
                      <div className="font-mono text-emerald-800 font-bold">VAT No: {monthlyStatement.vatNumber}</div>
                    </div>
                  </div>

                  {/* HMRC Boxes Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block">Gross Turnover</span>
                      <div className="text-lg font-black text-slate-900 font-display mt-0.5">
                        £{monthlyStatement.grossTurnover.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block">Box 6: Total Net Sales</span>
                      <div className="text-lg font-black text-slate-900 font-display mt-0.5">
                        £{monthlyStatement.netSalesTotal.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-800 block">Box 1: VAT Due</span>
                      <div className="text-lg font-black text-emerald-900 font-display mt-0.5">
                        £{monthlyStatement.vatTotalDueBox1.toFixed(2)}
                      </div>
                      <span className="text-[9px] text-emerald-700">Pay direct to HMRC</span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="text-[10px] font-bold text-blue-800 block">Zero-Rated & Charity</span>
                      <div className="text-lg font-black text-blue-900 font-display mt-0.5">
                        £{monthlyStatement.zeroRatedSales.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <span className="text-[10px] font-bold text-purple-800 block">Exempt Sales</span>
                      <div className="text-lg font-black text-purple-900 font-display mt-0.5">
                        £{monthlyStatement.exemptSales.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-800 block">Margin Scheme Goods</span>
                      <div className="text-lg font-black text-amber-900 font-display mt-0.5">
                        £{monthlyStatement.marginSchemeSales.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="space-y-3 pt-2">
                    <h5 className="font-bold text-xs text-slate-900 font-display">
                      Qualifying Invoices & HMRC Records ({statementOrders.length})
                    </h5>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                            <th className="py-2 px-3 font-bold">VAT Invoice #</th>
                            <th className="py-2 px-3 font-bold">Order #</th>
                            <th className="py-2 px-3 font-bold">Date</th>
                            <th className="py-2 px-3 font-bold">Item / Service Title</th>
                            <th className="py-2 px-3 font-bold text-right">Net (£)</th>
                            <th className="py-2 px-3 font-bold text-right">Rate</th>
                            <th className="py-2 px-3 font-bold text-right">VAT (£)</th>
                            <th className="py-2 px-3 font-bold text-right">Total (£)</th>
                            <th className="py-2 px-3 font-bold">HMRC Treatment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {statementOrders.map((o, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-3 font-mono font-bold text-blue-900">{o.vatInvoiceNumber}</td>
                              <td className="py-2 px-3 font-mono">{o.orderNumber}</td>
                              <td className="py-2 px-3 text-slate-500">{new Date(o.date).toLocaleDateString('en-GB')}</td>
                              <td className="py-2 px-3 text-slate-800 max-w-[200px] truncate">{o.title}</td>
                              <td className="py-2 px-3 text-right tabular-nums">£{o.netAmount.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right">{o.vatRatePercent}%</td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-800 tabular-nums">£{o.vatAmount.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-black tabular-nums">£{o.totalAmount.toFixed(2)}</td>
                              <td className="py-2 px-3 text-[11px] text-slate-500">{o.schemeNote}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 5: FINANCIALS (£2 AD FEES COLLECTED) */}
          {/* =================================================================== */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-display">
                      £2 Advertising Publication Fees (Fine UK Revenue)
                    </h3>
                    <p className="text-xs text-slate-500">Official ledger of all £2.00 advertisement fees collected.</p>
                  </div>
                  <span className="text-sm font-black text-[#00247D]">
                    Total Collected: £{stats?.advertisingRevenue.toFixed(2)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="py-2 px-3 font-bold">Receipt #</th>
                        <th className="py-2 px-3 font-bold">Account</th>
                        <th className="py-2 px-3 font-bold">Listing Title</th>
                        <th className="py-2 px-3 font-bold">Fee Amount</th>
                        <th className="py-2 px-3 font-bold">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adFees.map((fee) => (
                        <tr key={fee.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{fee.receiptNumber}</td>
                          <td className="py-2.5 px-3">{fee.userName} (#{fee.accountNumber})</td>
                          <td className="py-2.5 px-3 text-slate-700">{fee.listingTitle}</td>
                          <td className="py-2.5 px-3 font-black text-emerald-700 tabular-nums">£{fee.amount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-slate-500">{new Date(fee.timestamp).toLocaleString('en-GB')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 6: CYBER SHIELD, $0 DATABASE & AUTOMATED HACKER IP BLOCKER */}
          {/* =================================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* Card 1: $0 Cost Architecture Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-blue-900/60 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Zero Cloud Database Cost</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                          $0.00 / MONTH
                        </span>
                      </div>
                      <h3 className="text-lg font-black font-display text-white mt-0.5">
                        Fine UK Edge-Distributed $0 Database Architecture
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        Operating without expensive monthly SQL/NoSQL cloud subscriptions. Authoritative state runs in memory with client-side IndexedDB edge replication and atomic persistent snapshotting. 100% compliant, lightning fast, and $0 overhead.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-mono text-center">
                      <span className="text-[10px] text-slate-400 block uppercase">Server Memory State</span>
                      <strong className="text-emerald-400 font-bold">ACTIVE & SYNCED</strong>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-mono text-center">
                      <span className="text-[10px] text-slate-400 block uppercase">Client Edge DB</span>
                      <strong className="text-blue-300 font-bold">INDEXEDDB ENABLED</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Cyber Shield Automated Hacker IP Blocker */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 font-display">
                        Automated Cyber Shield & Hacker IP Firewall
                      </h4>
                      <p className="text-xs text-slate-500">
                        Automatically detects and blocks malicious IP addresses attempting data deletion, SQL injection, or server wipe attacks.
                      </p>
                    </div>
                  </div>

                  {/* Simulate Attack Test Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSimulateAttack}
                      disabled={isSimulatingAttack}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      title="Simulates a malicious DROP TABLE attack to verify the auto-blocker quarantines the IP"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{isSimulatingAttack ? 'Testing Firewall...' : 'Test Auto-Block Hacker Defense'}</span>
                    </button>
                  </div>
                </div>

                {simulationResult && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-mono flex items-center justify-between">
                    <span>🛡️ <strong>Cyber Shield Result:</strong> {simulationResult}</span>
                    <button onClick={() => setSimulationResult(null)} className="text-rose-500 hover:text-rose-800 text-xs">Dismiss</button>
                  </div>
                )}

                {/* Blocked Hacker IPs Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Currently Quarantined & Blocked Hacker IP Addresses ({blockedIps.length})
                    </span>
                    <button
                      onClick={fetchBlockedIps}
                      className="text-xs text-[#00247D] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh IP Table</span>
                    </button>
                  </div>

                  {blockedIps.length === 0 ? (
                    <div className="p-5 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                      No malicious IPs currently quarantined. The automated firewall is listening on all inbound HTTP ports.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                            <th className="py-2 px-3 font-bold">Attacker IP</th>
                            <th className="py-2 px-3 font-bold">Quarantine Reason</th>
                            <th className="py-2 px-3 font-bold">Attempted Payload</th>
                            <th className="py-2 px-3 font-bold">Severity</th>
                            <th className="py-2 px-3 font-bold">Blocked Timestamp</th>
                            <th className="py-2 px-3 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {blockedIps.map((b) => (
                            <tr key={b.ip} className="bg-rose-50/30 hover:bg-rose-50/70">
                              <td className="py-2.5 px-3 font-bold text-rose-950">{b.ip}</td>
                              <td className="py-2.5 px-3 font-sans text-slate-700">{b.reason}</td>
                              <td className="py-2.5 px-3 text-slate-500 max-w-[220px] truncate">{b.attemptedAction}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans ${
                                  b.severity === 'critical' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                                }`}>
                                  {b.severity}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 font-sans text-[11px]">
                                {new Date(b.blockedAt).toLocaleTimeString('en-GB')} ({new Date(b.blockedAt).toLocaleDateString('en-GB')})
                              </td>
                              <td className="py-2.5 px-3 text-right font-sans">
                                <button
                                  onClick={() => handleUnblockIp(b.ip)}
                                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                                >
                                  Unblock IP
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Manual IP Block Form */}
                <form onSubmit={handleManualBlockIp} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <AlertOctagon className="w-4 h-4 text-slate-600" />
                    <span>Manually Quarantine Suspicious IP</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="IP Address (e.g. 198.51.100.44)"
                      value={manualIpToBlock}
                      onChange={(e) => setManualIpToBlock(e.target.value)}
                      required
                      className="p-2 text-xs font-mono bg-white border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D]"
                    />
                    <input
                      type="text"
                      placeholder="Reason (e.g. Suspicious brute force attempts)"
                      value={manualBlockReason}
                      onChange={(e) => setManualBlockReason(e.target.value)}
                      className="p-2 text-xs bg-white border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      Quarantine IP Address
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 3: Admin Credentials & 4-Digit PIN Security */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 font-display">
                      Fine UK Administrator Credentials & 4-Digit PIN
                    </h4>
                    <p className="text-xs text-slate-500">
                      Manage administrator access credentials. Default PIN is 0000 and can be changed here anytime.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Admin Identity */}
                  <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-3">
                    <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                      Active Administrator Details
                    </span>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between bg-white/70 p-2 rounded-lg">
                        <span className="text-slate-500 font-sans">Username:</span>
                        <strong className="text-purple-950 font-black">admin</strong>
                      </div>
                      <div className="flex justify-between bg-white/70 p-2 rounded-lg">
                        <span className="text-slate-500 font-sans">Account ID:</span>
                        <strong className="text-purple-950 font-black">88888888</strong>
                      </div>
                      <div className="flex justify-between bg-white/70 p-2 rounded-lg">
                        <span className="text-slate-500 font-sans">Authorised Officer:</span>
                        <strong className="text-slate-900 font-sans">{currentUser?.name || 'Admin'}</strong>
                      </div>
                      <div className="flex justify-between bg-white/70 p-2 rounded-lg">
                        <span className="text-slate-500 font-sans">Default Initial PIN:</span>
                        <strong className="text-slate-700">0000</strong>
                      </div>
                    </div>
                  </div>

                  {/* Change PIN Form */}
                  <form onSubmit={handleChangeAdminPin} className="space-y-3">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Update 4-Digit Administrator PIN
                    </span>

                    {adminPinFeedback && (
                      <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                        adminPinFeedback.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {adminPinFeedback.message}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Current Admin PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="Current PIN (e.g. 0000)"
                        value={adminCurrentPin}
                        onChange={(e) => setAdminCurrentPin(e.target.value)}
                        required
                        className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 block">New 4-Digit PIN</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="••••"
                          value={adminNewPin}
                          onChange={(e) => setAdminNewPin(e.target.value)}
                          required
                          className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 block">Confirm PIN</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="••••"
                          value={adminConfirmPin}
                          onChange={(e) => setAdminConfirmPin(e.target.value)}
                          required
                          className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPin}
                      className="w-full py-2 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isChangingPin ? 'Updating PIN...' : 'Change Administrator PIN'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Card 4: Historical Security Alerts */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 font-display">Security Alerts & Intrusion History</h3>
                  <span className="text-xs text-slate-400">Total Logged: {securityAlerts.length}</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className="py-2.5 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            alert.severity === 'high' ? 'bg-rose-100 text-rose-800' :
                            alert.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity} Risk
                          </span>
                          <span className="font-bold text-xs text-slate-900">{alert.type.replace('_', ' ').toUpperCase()}</span>
                          <span className="font-mono text-[10px] text-slate-400">IP: {alert.ipAddress}</span>
                        </div>
                        <p className="text-xs text-slate-600">{alert.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                          {alert.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ======================================================================= */}
      {/* MODAL 1: EDIT ACCOUNT DETAILS */}
      {/* ======================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-base text-slate-900 font-display">
                  Edit Account #{editingUser.accountNumber}
                </h4>
                <p className="text-xs text-slate-500">Fine UK Administrator Account Authority</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name / Trading Name</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Role</label>
                  <select
                    value={editingUser.role || 'buyer'}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="charity">Charity</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Account Status</label>
                  <select
                    value={editingUser.status || 'active'}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending_verification">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">UK Phone Number</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  required
                  className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">UK Address</label>
                <input
                  type="text"
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  required
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {editingUser.role === 'charity' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-rose-800">Charity Registration Number</label>
                  <input
                    type="text"
                    value={editingUser.charityRegistrationNumber || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, charityRegistrationNumber: e.target.value })}
                    className="w-full p-2 text-xs font-mono bg-rose-50 border border-rose-200 rounded-xl"
                  />
                </div>
              )}

              {editingUser.role === 'seller' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-800">National Insurance (Encrypted Note)</label>
                  <input
                    type="text"
                    value={editingUser.niNumberEncrypted || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, niNumberEncrypted: e.target.value })}
                    className="w-full p-2 text-xs font-mono bg-amber-50 border border-amber-200 rounded-xl"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingUser ? 'Saving...' : 'Save Account Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ======================================================================= */}
      {/* MODAL 2: CONFIRM ACCOUNT DELETION */}
      {/* ======================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900 font-display">
                Delete Account #{userToDelete.accountNumber}?
              </h4>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? This will permanently remove their profile, access PIN, and associated marketplace listings.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 3: DEEP ACCOUNT INSPECTION (ACCESS EACH ACCOUNT) */}
      {/* ======================================================================= */}
      {inspectingAccount && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="bg-[#00247D] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base font-display">
                      Account Deep Inspection: #{inspectingAccount.account.accountNumber}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/20">
                      {inspectingAccount.account.role}
                    </span>
                  </div>
                  <p className="text-xs text-white/70">
                    Full Administrative Record, Marketplace Activity & HMRC Compliance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingAccount(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Profile Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Personal & Account Verification</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    inspectingAccount.account.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    Status: {inspectingAccount.account.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">Full Name</span>
                    <strong className="text-slate-900 font-bold">{inspectingAccount.account.name}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">UK Telephone (SMS OTP Verified)</span>
                    <strong className="text-slate-900 font-mono">{inspectingAccount.account.phone}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">UK Residential / Business Address</span>
                    <strong className="text-slate-900">{inspectingAccount.account.address}</strong>
                  </div>

                  {inspectingAccount.account.niNumberEncrypted && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-amber-800 block uppercase font-bold">National Insurance (Encrypted Note)</span>
                      <strong className="text-amber-950 font-mono">{inspectingAccount.account.niNumberEncrypted}</strong>
                    </div>
                  )}

                  {inspectingAccount.account.charityRegistrationNumber && (
                    <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                      <span className="text-[10px] text-rose-800 block uppercase font-bold">Charity Commission Reg Number</span>
                      <strong className="text-rose-950 font-mono">{inspectingAccount.account.charityRegistrationNumber}</strong>
                    </div>
                  )}

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">Advertisements Published</span>
                    <strong className="text-slate-900">{inspectingAccount.account.adCount} ads (1st Ad Free)</strong>
                  </div>
                </div>
              </div>

              {/* Financial & HMRC Tax Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Turnover & VAT Summary</span>
                  <div className="text-lg font-black font-mono text-blue-950">
                    Gross Turnover: £{inspectingAccount.totalTurnover.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Total VAT Recorded for HMRC Reporting: £{inspectingAccount.totalVatRecorded.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-700 block">Direct Remittance Mandate</span>
                  <span className="text-xs font-bold text-slate-800">Paid Direct to HMRC by Seller</span>
                </div>
              </div>

              {/* Active Listings / Ads */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Marketplace Listings / Ads ({inspectingAccount.listings.length})
                  </span>
                </div>
                {inspectingAccount.listings.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-center">
                    No active listings posted.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {inspectingAccount.listings.map((l: any) => (
                      <div key={l.id} className="p-2.5 bg-white flex items-center justify-between hover:bg-slate-50">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">{l.title}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="px-1.5 py-0.2 bg-slate-100 rounded">{l.category}</span>
                            <span>Condition: {l.condition}</span>
                            <span>{l.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black font-mono text-[#00247D]">
                            {l.isFreeForCharity ? 'FREE for Charities' : `£${l.price.toFixed(2)}`}
                          </span>
                          <span className="block text-[10px] text-emerald-700">£2 Fee Verified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Transactions */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Order Transactions ({inspectingAccount.orders.length})
                </span>
                {inspectingAccount.orders.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-center">
                    No orders recorded for this account.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto font-mono">
                    {inspectingAccount.orders.map((o: any) => (
                      <div key={o.id} className="p-2.5 bg-white flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <strong className="text-slate-900">{o.orderNumber}</strong>
                          <span className="block font-sans text-[11px] text-slate-600">{o.productTitle}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">£{o.totalAmount.toFixed(2)}</span>
                          <span className="block font-sans text-[10px] text-emerald-700 uppercase">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick AI Audit Action from within inspection */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    handleRunAiAudit(inspectingAccount.account.accountNumber, inspectingAccount.account);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Gemini AI Compliance Audit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingAccount(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 4: GEMINI AI COMPLIANCE & SAFETY AUDITOR */}
      {/* ======================================================================= */}
      {aiAuditModalUser && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 my-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base font-display flex items-center gap-2">
                    <span>Fine UK AI Compliance Auditor</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-700/60 text-purple-200">
                      Gemini 3.8 Flash
                    </span>
                  </h4>
                  <p className="text-xs text-purple-200/80">
                    Auditing #{aiAuditModalUser.accountNumber} ({aiAuditModalUser.name || 'Account Holder'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setAiAuditModalUser(null); setAiAuditResult(null); }}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {isAuditing ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                  <div className="font-bold text-sm text-slate-800">
                    Running AI Deep Compliance Analysis...
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Analyzing UK telephone verification, National Insurance encryption compliance, VAT treatment, and ad fee history.
                  </p>
                </div>
              ) : aiAuditResult ? (
                <div className="space-y-4">
                  
                  {/* Score Card */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                        AI Safety & Trust Score
                      </span>
                      <div className="text-3xl font-black font-mono text-purple-950 mt-0.5">
                        {aiAuditResult.trustScore} / 100
                      </div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        aiAuditResult.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-800' :
                        aiAuditResult.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        Risk Assessment: {aiAuditResult.riskLevel}
                      </span>
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-white border border-purple-200 shadow-2xs flex items-center justify-center font-black text-2xl font-display text-purple-900">
                      {aiAuditResult.trustScore >= 90 ? 'A+' : aiAuditResult.trustScore >= 80 ? 'A' : 'B'}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                      Executive Summary
                    </span>
                    <p className="text-slate-600 leading-relaxed">{aiAuditResult.summary}</p>
                  </div>

                  {/* Compliance Checklist */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                      Statutory Compliance Checks
                    </span>
                    <div className="space-y-1.5">
                      {aiAuditResult.complianceChecklist?.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-emerald-50/60 border border-emerald-200/60 rounded-lg text-emerald-950 font-medium text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                      Recommended Actions
                    </span>
                    <div className="space-y-1.5">
                      {aiAuditResult.recommendedActions?.map((rec: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50/60 border border-blue-200/60 rounded-lg text-blue-950 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-6 text-center text-slate-500">
                  Ready to audit account #{aiAuditModalUser.accountNumber}.
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => { setAiAuditModalUser(null); setAiAuditResult(null); }}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
