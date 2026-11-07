import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Lock, 
  Phone, 
  Home, 
  ShieldCheck, 
  Camera, 
  Upload, 
  HeartHandshake, 
  Store, 
  KeyRound, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register' | 'recovery';
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onSelectDemoUser: (accountNumber: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onLoginSuccess,
  onSelectDemoUser,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>(initialMode);
  const [regRole, setRegRole] = useState<UserRole>('buyer');

  // Login form state
  const [loginAccount, setLoginAccount] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+44 7');
  const [regAddress, setRegAddress] = useState('');
  const [regNiNumber, setRegNiNumber] = useState('');
  const [regCharityName, setRegCharityName] = useState('');
  const [regCharityNumber, setRegCharityNumber] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  // Registration Success details (8-digit account & 4-digit PIN)
  const [registeredCredentials, setRegisteredCredentials] = useState<{
    accountNumber: string;
    pin: string;
    name: string;
    role: string;
  } | null>(null);

  // Recovery state
  const [recoveryPhone, setRecoveryPhone] = useState('+44 7');
  const [recoveryOtpSent, setRecoveryOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState('');
  const [recoveredAccountNumber, setRecoveredAccountNumber] = useState('');
  const [recoveredName, setRecoveredName] = useState('');
  const [recoveredRole, setRecoveredRole] = useState('');

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber: loginAccount, pin: loginPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setLoginError(err.message || 'Login error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: regRole,
          name: regName,
          phone: regPhone,
          address: regAddress,
          avatar: avatarPreview,
          niNumber: regRole === 'seller' ? regNiNumber : undefined,
          charityName: regRole === 'charity' ? regCharityName : undefined,
          charityRegistrationNumber: regRole === 'charity' ? regCharityNumber : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }
      setRegisteredCredentials({
        accountNumber: data.user.accountNumber,
        pin: data.user.pin,
        name: data.user.name,
        role: data.user.role,
      });
    } catch (err: any) {
      setLoginError(err.message || 'Registration error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Request SMS OTP for Recovery
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/recover-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: recoveryPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
      setRecoveryOtpSent(true);
      setSimulatedOtp(data.simulatedOtp);
      setRecoveredAccountNumber(data.accountNumber);
      setRecoveredName(data.name || '');
      setRecoveredRole(data.role || '');
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset PIN
  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: recoveryPhone,
          otp: enteredOtp,
          newPin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed.');
      setRecoverySuccessMsg(`Your 4-Digit PIN has been successfully reset! Your 8-digit Account Number is: ${data.accountNumber}`);
      if (data.user) {
        setLoginAccount(data.user.accountNumber);
        setLoginPin(newPin);
      }
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-[#00247D] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl font-display">Fine</span>
            <span className="font-black text-xl text-[#CF142B] font-display">UK</span>
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wider ml-1">
              · {mode === 'login' ? 'Account Login' : mode === 'register' ? 'UK Registration' : 'Account Recovery'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================================================================== */}
        {/* VIEW 1: REGISTRATION SUCCESS CREDENTIALS DISPLAY */}
        {/* ===================================================================== */}
        {registeredCredentials ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-3" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 font-display">
                Registration Successful!
              </h3>
              <p className="text-xs text-slate-500">
                Welcome to Fine UK, {registeredCredentials.name}. Please store your credentials safely.
              </p>
            </div>

            {/* Generated 8-digit Account Number and 4-digit PIN card */}
            <div className="bg-slate-50 border-2 border-dashed border-[#00247D]/40 rounded-2xl p-5 text-left space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Your Unique 8-Digit Account Number
                </span>
                <div className="text-2xl font-black text-[#00247D] font-mono tracking-widest mt-0.5">
                  {registeredCredentials.accountNumber}
                </div>
                <p className="text-[10px] text-slate-400">Used for messaging, dialpad lookup, and secure login.</p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Your Secure 4-Digit PIN
                </span>
                <div className="text-xl font-black text-[#CF142B] font-mono tracking-widest mt-0.5">
                  {registeredCredentials.pin}
                </div>
                <p className="text-[10px] text-slate-400">Keep this PIN confidential. Never share your PIN with anyone.</p>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-900 p-3 rounded-xl text-xs flex items-center gap-2 text-left">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span><strong>First Advertisement FREE!</strong> You can now advertise products or services at no cost.</span>
            </div>

            <button
              onClick={() => {
                setLoginAccount(registeredCredentials.accountNumber);
                setLoginPin(registeredCredentials.pin);
                setRegisteredCredentials(null);
                setMode('login');
              }}
              className="w-full py-2.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Proceed to Login
            </button>
          </div>
        ) : (
          /* =================================================================== */
          /* FORM BODY (LOGIN / REGISTER / RECOVERY) */
          /* =================================================================== */
          <div className="p-6">
            
            {/* Error Message if any */}
            {loginError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            {mode !== 'recovery' && (
              <div className="flex border-b border-slate-200 mb-5">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setLoginError(''); }}
                  className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                    mode === 'login'
                      ? 'border-[#00247D] text-[#00247D]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Login (Account & PIN)
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setLoginError(''); }}
                  className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                    mode === 'register'
                      ? 'border-[#CF142B] text-[#CF142B]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Create New Account
                </button>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* 1. LOGIN FORM */}
            {/* --------------------------------------------------------------- */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Account ID or Username
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="e.g. 10001000 or admin"
                      value={loginAccount}
                      onChange={(e) => setLoginAccount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D] focus:bg-white text-slate-900 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      4-Digit PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('recovery'); setLoginError(''); }}
                      className="text-[11px] text-[#00247D] hover:underline cursor-pointer font-bold"
                    >
                      Forgot Account # or PIN?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D] focus:bg-white text-slate-900 font-semibold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying...' : 'Sign In to Fine UK'}
                </button>

                {/* Demo Quick-Fill Buttons for easy evaluation */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                    Quick-Fill Credentials:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => { setLoginAccount('admin'); setLoginPin('0000'); }}
                      className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-left border border-purple-300 cursor-pointer col-span-2 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold">Admin Officer</span>
                        <span className="ml-1 text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-bold">Username: admin</span>
                      </div>
                      <span className="font-mono text-xs font-black text-purple-900">PIN: 0000</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginAccount('10001000'); setLoginPin('1234'); }}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-left border border-blue-200 cursor-pointer"
                    >
                      <div className="font-bold">James (Buyer)</div>
                      <div className="font-mono text-[10px] text-slate-500">10001000 / PIN: 1234</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginAccount('20002000'); setLoginPin('1234'); }}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-left border border-emerald-200 cursor-pointer"
                    >
                      <div className="font-bold">Sarah (Seller)</div>
                      <div className="font-mono text-[10px] text-slate-500">20002000 / PIN: 1234</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginAccount('30003000'); setLoginPin('1234'); }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-lg text-left border border-rose-200 cursor-pointer col-span-2"
                    >
                      <div className="font-bold">BHF (British Heart Foundation Charity)</div>
                      <div className="font-mono text-[10px] text-slate-500">30003000 / PIN: 1234</div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* --------------------------------------------------------------- */}
            {/* 2. REGISTRATION FORM (3 Categories: Buyer, Seller, Charity) */}
            {/* --------------------------------------------------------------- */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Category Radio Cards */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Registration Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('buyer')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        regRole === 'buyer'
                          ? 'border-[#00247D] bg-blue-50 text-[#00247D] font-bold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UserIcon className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">Buyer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('seller')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        regRole === 'seller'
                          ? 'border-[#00247D] bg-blue-50 text-[#00247D] font-bold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">Seller</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('charity')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        regRole === 'charity'
                          ? 'border-[#CF142B] bg-rose-50 text-[#CF142B] font-bold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <HeartHandshake className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">Charity</span>
                    </button>
                  </div>
                </div>

                {/* Common Full Name / Contact */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {regRole === 'charity' ? 'Authorised Representative Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D] focus:bg-white text-slate-900"
                  />
                </div>

                {/* Charity specific fields */}
                {regRole === 'charity' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Registered Charity Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. British Heart Foundation Support"
                        value={regCharityName}
                        onChange={(e) => setRegCharityName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D] focus:bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        UK Charity Registration Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 225971"
                        value={regCharityNumber}
                        onChange={(e) => setRegCharityNumber(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D] focus:bg-white text-slate-900 font-mono"
                      />
                    </div>
                  </>
                )}

                {/* UK Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    UK Phone Number (One Account Per Phone)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="+44 7700 900123"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D] focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {regRole === 'seller' ? 'Residential / Business Address' : 'Residential Address'}
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 24 Piccadilly, Manchester M1 1AF"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D] focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Seller NI Number with Encryption Note */}
                {regRole === 'seller' && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>National Insurance (NI) Number</span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. QQ 12 34 56 A"
                      value={regNiNumber}
                      onChange={(e) => setRegNiNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-amber-300 rounded-lg outline-hidden focus:border-[#00247D] text-slate-900 font-semibold uppercase"
                    />
                    <p className="text-[10px] text-amber-800 leading-tight">
                      <strong>Section 2 Compliance:</strong> NI numbers are encrypted server-side and strictly protected. They are never visible to buyers or other sellers.
                    </p>
                  </div>
                )}

                {/* Profile Photo Mock upload / camera */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Profile Photograph
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAvatarPreview('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80')}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarPreview('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80')}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#CF142B] hover:bg-[#B01024] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering Account...' : 'Complete Registration (First Ad Free)'}
                </button>
              </form>
            )}

            {/* --------------------------------------------------------------- */}
            {/* 3. ACCOUNT RECOVERY (SMS OTP) FOR BUYERS, SELLERS & CHARITIES */}
            {/* --------------------------------------------------------------- */}
            {mode === 'recovery' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 font-display">Retrieve Account # & Reset 4-Digit PIN</h4>
                  <p className="text-xs text-slate-500">
                    Buyers, Sellers and Registered Charities can retrieve their 8-digit Account Number and reset their 4-digit PIN via registered UK phone.
                  </p>
                </div>

                {recoverySuccessMsg ? (
                  <div className="p-5 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-2xl text-center space-y-3">
                    <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div>
                      <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Account Recovered Successfully</div>
                      <div className="text-xl font-mono font-black text-[#00247D] mt-1">{recoveredAccountNumber}</div>
                    </div>
                    <p className="text-xs font-semibold text-emerald-700">{recoverySuccessMsg}</p>
                    <button
                      onClick={() => {
                        setMode('login');
                        setLoginAccount(recoveredAccountNumber);
                        setLoginPin(newPin);
                        setRecoverySuccessMsg('');
                        setRecoveryOtpSent(false);
                      }}
                      className="w-full py-2.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                    >
                      Sign In Now with New Credentials
                    </button>
                  </div>
                ) : !recoveryOtpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Registered UK Phone Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="+44 7... or 07..."
                        value={recoveryPhone}
                        onChange={(e) => setRecoveryPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D]"
                      />
                    </div>

                    {/* Quick phone selection for testing */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Test Registered UK Numbers:
                      </div>
                      <div className="flex flex-col gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setRecoveryPhone('+44 7700 900512')}
                          className="text-left text-blue-700 hover:underline flex justify-between cursor-pointer"
                        >
                          <span>James Wright (Buyer)</span>
                          <span className="font-mono text-slate-500">+44 7700 900512</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecoveryPhone('+44 7700 900244')}
                          className="text-left text-emerald-700 hover:underline flex justify-between cursor-pointer"
                        >
                          <span>Sarah Jenkins (Seller)</span>
                          <span className="font-mono text-slate-500">+44 7700 900244</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecoveryPhone('+44 20 7554 0000')}
                          className="text-left text-rose-700 hover:underline flex justify-between cursor-pointer"
                        >
                          <span>British Heart Foundation (Charity)</span>
                          <span className="font-mono text-slate-500">+44 20 7554 0000</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-[#00247D] text-white text-xs font-bold rounded-xl hover:bg-[#001B5E] cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? 'Locating Account...' : 'Retrieve Account # & Send SMS OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPin} className="space-y-4">
                    {/* Account Retrieved Card */}
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Account Found</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 uppercase">
                          {recoveredRole || 'Verified User'}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-700 font-semibold">{recoveredName}</span>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Unique 8-Digit Account #:</span>
                          <span className="text-base font-black font-mono text-[#00247D] tracking-wider">
                            {recoveredAccountNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                      <span>Simulated SMS OTP Code:</span>
                      <strong className="font-mono text-base text-[#CF142B] font-black tracking-widest">{simulatedOtp}</strong>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Enter 6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="e.g. 648102"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl font-bold tracking-widest"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Set New 4-Digit PIN
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="••••"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl font-bold tracking-widest"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Enter any 4-digit number of your choice (e.g. 4321, 0000, 5678).</p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-[#CF142B] text-white text-xs font-bold rounded-xl hover:bg-[#B01024] cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? 'Updating PIN...' : 'Verify OTP & Save New PIN'}
                    </button>
                  </form>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setRecoveryOtpSent(false);
                      setLoginError('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer underline"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
