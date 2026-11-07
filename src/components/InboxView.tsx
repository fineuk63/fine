import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  Video, 
  Mic, 
  Square, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  UserPlus, 
  Search, 
  Volume2, 
  VolumeX, 
  MicOff, 
  PhoneOff, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCheck, 
  Trash2, 
  Edit3, 
  Play, 
  Pause,
  X,
  PhoneCall,
  Download,
  Camera,
  FileSpreadsheet,
  FileCode,
  File
} from 'lucide-react';
import { Message, User, Contact } from '../types';

interface InboxViewProps {
  currentUser: User | null;
  messages: Message[];
  onSendMessage: (msgData: {
    senderAccountNumber: string;
    recipientAccountNumber: string;
    text: string;
    type?: 'text' | 'voice' | 'file' | 'image' | 'call_log' | 'order_notification';
    fileData?: any;
    voiceDuration?: number;
    callInfo?: any;
  }) => Promise<void>;
  onMarkRead: (otherAccountNumber: string) => void;
  targetAccountNumber?: string;
}

export const InboxView: React.FC<InboxViewProps> = ({
  currentUser,
  messages,
  onSendMessage,
  onMarkRead,
  targetAccountNumber,
}) => {
  // Active conversation target account number
  const [activeAccount, setActiveAccount] = useState<string>(targetAccountNumber || '');
  const [dialpadInput, setDialpadInput] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isDialpadOpen, setIsDialpadOpen] = useState<boolean>(!targetAccountNumber);

  // Message inputs
  const [inputText, setInputText] = useState<string>('');
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated Voice Note Player
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Simulated Audio/Video Call Active State
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    accountNumber: string;
    accountName: string;
    status: 'ringing' | 'connected';
    duration: number;
    isMuted: boolean;
    isSpeaker: boolean;
    isVideoEnabled: boolean;
  } | null>(null);

  const callTimerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Contacts List
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'c-1',
      accountNumber: '20002000',
      name: 'Sarah Jenkins (Apex Audio & Tech)',
      alias: 'Apex Tech Seller',
      role: 'seller',
      onlineStatus: true,
      lastSeen: 'Active now',
    },
    {
      id: 'c-2',
      accountNumber: '10001000',
      name: 'James Wright',
      alias: 'James Kensington',
      role: 'buyer',
      onlineStatus: true,
      lastSeen: 'Active now',
    },
    {
      id: 'c-3',
      accountNumber: '30003000',
      name: 'British Heart Foundation',
      alias: 'BHF Charity Hub',
      role: 'charity',
      onlineStatus: false,
      lastSeen: '2 hours ago',
    },
    {
      id: 'c-4',
      accountNumber: '88888888',
      name: 'Fine UK Official Team',
      alias: 'UK Compliance',
      role: 'admin',
      onlineStatus: true,
      lastSeen: 'Official Support',
    }
  ]);

  // Add / Edit contact modal
  const [editingContact, setEditingContact] = useState<{ accountNumber: string; name: string } | null>(null);

  useEffect(() => {
    if (targetAccountNumber) {
      setActiveAccount(targetAccountNumber);
      setIsDialpadOpen(false);
      onMarkRead(targetAccountNumber);
    }
  }, [targetAccountNumber]);

  // Scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeAccount]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimerRef.current);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecordingVoice]);

  // Call duration timer
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      callTimerRef.current = setInterval(() => {
        setActiveCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
      }, 1000);
    } else {
      clearInterval(callTimerRef.current);
    }
    return () => clearInterval(callTimerRef.current);
  }, [activeCall?.status]);

  if (!currentUser) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-900 font-display">Fine UK Private Inbox</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please log in with your 8-digit Account Number and 4-digit PIN to access your secure communications.
        </p>
      </div>
    );
  }

  // Dialpad key press
  const handleDialDigit = (digit: string) => {
    if (dialpadInput.length < 8) {
      const next = dialpadInput + digit;
      setDialpadInput(next);
      if (next.length === 8) {
        performLookup(next);
      }
    }
  };

  const handleBackspace = () => {
    setDialpadInput(prev => prev.slice(0, -1));
    setLookupResult(null);
  };

  const performLookup = async (accNum: string) => {
    try {
      const res = await fetch(`/api/dialpad/lookup/${accNum}`);
      const data = await res.json();
      if (data.success) {
        setLookupResult(data.account);
      } else {
        setLookupResult({ error: `Account #${accNum} not registered on Fine UK.` });
      }
    } catch {
      setLookupResult({ error: 'Failed to look up account number.' });
    }
  };

  // Start chat with account
  const handleSelectAccount = (accNum: string) => {
    setActiveAccount(accNum);
    setIsDialpadOpen(false);
    onMarkRead(accNum);
  };

  // Send text message
  const handleSendTextMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeAccount) return;

    const text = inputText.trim();
    setInputText('');
    await onSendMessage({
      senderAccountNumber: currentUser.accountNumber,
      recipientAccountNumber: activeAccount,
      text,
      type: 'text',
    });
  };

  // Send Voice Note
  const handleStopAndSendVoice = async () => {
    if (!activeAccount) return;
    setIsRecordingVoice(false);
    const duration = Math.max(2, recordingSeconds);
    await onSendMessage({
      senderAccountNumber: currentUser.accountNumber,
      recipientAccountNumber: activeAccount,
      text: `Voice message (${duration}s)`,
      type: 'voice',
      voiceDuration: duration,
    });
  };

  // Handle File Upload from device (PDF, images, documents)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeAccount) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      const isImg = file.type.startsWith('image/');
      
      await onSendMessage({
        senderAccountNumber: currentUser.accountNumber,
        recipientAccountNumber: activeAccount,
        text: isImg ? `Shared an image: ${file.name}` : `Shared a document: ${file.name}`,
        type: isImg ? 'image' : 'file',
        fileData: {
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          type: file.type,
          url: base64Data,
        },
      });

      // Clear input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  // Start Call Simulation
  const handleStartCall = (type: 'audio' | 'video', targetAcc: string, name?: string) => {
    const targetName = name || (targetAcc === '88888888' ? 'Fine UK Compliance Team' : `Account #${targetAcc}`);
    setActiveCall({
      type,
      accountNumber: targetAcc,
      accountName: targetName,
      status: 'ringing',
      duration: 0,
      isMuted: false,
      isSpeaker: true,
      isVideoEnabled: type === 'video',
    });

    // Simulate answer after 2 seconds
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 2000);
  };

  // End Call
  const handleEndCall = async () => {
    if (!activeCall) return;
    const dur = activeCall.duration;
    const target = activeCall.accountNumber;
    const type = activeCall.type;

    setActiveCall(null);

    await onSendMessage({
      senderAccountNumber: currentUser.accountNumber,
      recipientAccountNumber: target,
      text: `${type === 'video' ? 'Video' : 'Audio'} call ended (${dur}s duration)`,
      type: 'call_log',
      callInfo: {
        type,
        duration: dur,
        status: 'completed',
      },
    });
  };

  // Filter messages for active conversation
  const activeConversationMessages = messages.filter(
    m => (m.senderAccountNumber === currentUser.accountNumber && m.recipientAccountNumber === activeAccount) ||
         (m.senderAccountNumber === activeAccount && m.recipientAccountNumber === currentUser.accountNumber)
  );

  // Active contact details
  const activeContact: Contact = contacts.find(c => c.accountNumber === activeAccount) || {
    id: `temp-${activeAccount}`,
    name: activeAccount === '88888888' ? 'Fine UK Compliance Team' : `Account #${activeAccount}`,
    alias: undefined,
    accountNumber: activeAccount,
    role: 'seller',
    onlineStatus: true,
    lastSeen: 'Recently active',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[700px] flex flex-col md:flex-row">
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
        className="hidden"
      />

      {/* ======================================================================= */}
      {/* LEFT COLUMN: DIALPAD & CONTACTS LIST */}
      {/* ======================================================================= */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50">
        
        {/* Top Header / Switcher */}
        <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-display">Fine UK Inbox</h3>
            <p className="text-[11px] text-slate-500 font-mono">My ID: <strong>{currentUser.accountNumber}</strong></p>
          </div>
          <button
            onClick={() => setIsDialpadOpen(!isDialpadOpen)}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDialpadOpen
                ? 'bg-[#00247D] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Dialpad</span>
          </button>
        </div>

        {/* DIALPAD VIEW */}
        {isDialpadOpen ? (
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                8-Digit Account Dialpad
              </span>
              <p className="text-[11px] text-slate-500">
                Enter any 8-digit UK account to call or message
              </p>
            </div>

            {/* Display Screen */}
            <div className="bg-white p-3 rounded-xl border-2 border-slate-200 text-center shadow-inner">
              <div className="text-2xl font-black text-[#00247D] tracking-widest font-mono min-h-[32px]">
                {dialpadInput || '--------'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {dialpadInput.length}/8 digits entered
              </div>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDialDigit(digit)}
                  className="h-12 bg-white hover:bg-blue-50 text-slate-900 text-lg font-bold rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-display"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => {
                  setDialpadInput('');
                  setLookupResult(null);
                }}
                className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => handleDialDigit('0')}
                className="h-12 bg-white hover:bg-blue-50 text-slate-900 text-lg font-bold rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer font-display"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>

            {/* Direct Call Action Bar on Dialpad */}
            <div className="pt-1 flex items-center justify-center gap-2 max-w-[240px] mx-auto">
              <button
                disabled={dialpadInput.length < 8}
                onClick={() => handleStartCall('audio', dialpadInput, lookupResult?.name)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-40"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </button>
              <button
                disabled={dialpadInput.length < 8}
                onClick={() => handleStartCall('video', dialpadInput, lookupResult?.name)}
                className="py-3 px-4 bg-[#CF142B] hover:bg-[#B01024] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                title="Start Video Call"
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
              </button>
            </div>

            {/* Lookup Result Box */}
            {lookupResult && (
              <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-sm space-y-2 animate-in fade-in">
                {lookupResult.error ? (
                  <div className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                    <span>{lookupResult.error}</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#00247D] flex items-center justify-center font-bold text-xs">
                        {lookupResult.accountNumber.slice(-2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{lookupResult.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {lookupResult.accountNumber} · {lookupResult.role}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleSelectAccount(lookupResult.accountNumber)}
                        className="py-1.5 bg-[#00247D] text-white rounded-lg text-[11px] font-bold hover:bg-[#001B5E] cursor-pointer"
                      >
                        Message
                      </button>
                      <button
                        onClick={() => handleStartCall('audio', lookupResult.accountNumber, lookupResult.name)}
                        className="py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </button>
                      <button
                        onClick={() => handleStartCall('video', lookupResult.accountNumber, lookupResult.name)}
                        className="py-1.5 bg-[#CF142B] text-white rounded-lg text-[11px] font-bold hover:bg-[#B01024] cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Video className="w-3 h-3" />
                        <span>Video</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* CONTACTS & CONVERSATIONS LIST */
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            <div className="p-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Saved Contacts & Recent Chats
              </span>
            </div>

            {contacts.map((contact) => {
              const isSelected = activeAccount === contact.accountNumber;
              const unreadInThread = messages.filter(
                m => m.senderAccountNumber === contact.accountNumber && m.recipientAccountNumber === currentUser.accountNumber && !m.read
              ).length;

              return (
                <div
                  key={contact.id}
                  onClick={() => handleSelectAccount(contact.accountNumber)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-white border-l-4 border-[#00247D] shadow-xs' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="relative w-9 h-9 rounded-full bg-[#00247D] text-white font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      {contact.accountNumber.slice(-2)}
                      {contact.onlineStatus && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {contact.alias || contact.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        ID: {contact.accountNumber}
                      </div>
                    </div>
                  </div>

                  {unreadInThread > 0 && (
                    <span className="px-2 py-0.5 bg-[#CF142B] text-white rounded-full text-[10px] font-black shrink-0">
                      {unreadInThread}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* RIGHT COLUMN: ACTIVE CONVERSATION & CALL ACTIONS */}
      {/* ======================================================================= */}
      <div className="flex-1 flex flex-col bg-white">
        
        {activeAccount ? (
          <>
            {/* Conversation Header */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-[#00247D] font-bold flex items-center justify-center text-xs font-mono">
                  {activeAccount.slice(-2)}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    {activeContact.alias || activeContact.name}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2">
                    <span className="font-mono">Account #{activeAccount}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{activeContact.lastSeen}</span>
                  </div>
                </div>
              </div>

              {/* Quick Call & Video Buttons in Header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartCall('audio', activeAccount, activeContact.name)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Make Audio Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Audio Call</span>
                </button>
                <button
                  onClick={() => handleStartCall('video', activeAccount, activeContact.name)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-[#CF142B] hover:bg-rose-100 transition-colors font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Start Video Call"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Call</span>
                </button>
              </div>
            </div>

            {/* Message Thread Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {activeConversationMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <p>No messages yet with Account #{activeAccount}.</p>
                  <p className="mt-1">Send a message, attach documents, or start a call.</p>
                </div>
              ) : (
                activeConversationMessages.map((msg) => {
                  const isMine = msg.senderAccountNumber === currentUser.accountNumber;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-3 shadow-2xs text-xs ${
                          isMine
                            ? 'bg-[#00247D] text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {/* Text Message */}
                        {msg.type === 'text' && (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        )}

                        {/* File / Document Message */}
                        {msg.type === 'file' && msg.fileData && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 border border-white/20">
                              <FileText className="w-6 h-6 shrink-0" />
                              <div className="overflow-hidden">
                                <div className="font-bold truncate">{msg.fileData.name}</div>
                                <div className="text-[10px] opacity-80">{msg.fileData.size}</div>
                              </div>
                            </div>
                            {msg.fileData.url && (
                              <a
                                href={msg.fileData.url}
                                download={msg.fileData.name}
                                className={`inline-flex items-center gap-1 text-[11px] font-bold underline ${isMine ? 'text-white' : 'text-[#00247D]'}`}
                              >
                                <Download className="w-3 h-3" />
                                <span>Download Document</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Image Attachment */}
                        {msg.type === 'image' && msg.fileData && (
                          <div className="space-y-1.5">
                            <img
                              src={msg.fileData.url}
                              alt={msg.fileData.name}
                              className="rounded-xl max-h-48 w-auto object-cover border border-black/10"
                            />
                            <div className="text-[10px] opacity-80 truncate">{msg.fileData.name}</div>
                          </div>
                        )}

                        {/* Voice Note Message */}
                        {msg.type === 'voice' && (
                          <div className="flex items-center gap-2.5 py-1">
                            <button
                              onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${
                                isMine ? 'bg-white text-[#00247D]' : 'bg-[#00247D] text-white'
                              }`}
                            >
                              {playingVoiceId === msg.id ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 ml-0.5" />
                              )}
                            </button>
                            {/* Animated Audio Waveform */}
                            <div className="flex items-center gap-0.5">
                              {[12, 20, 8, 24, 16, 28, 10, 18, 14].map((h, i) => (
                                <span
                                  key={i}
                                  className={`w-1 rounded-full ${
                                    playingVoiceId === msg.id ? 'animate-pulse bg-emerald-400' : isMine ? 'bg-white/60' : 'bg-slate-400'
                                  }`}
                                  style={{ height: `${h}px` }}
                                />
                              ))}
                            </div>
                            <span className="font-mono text-[10px] ml-1">
                              {msg.voiceDuration || 10}s
                            </span>
                          </div>
                        )}

                        {/* Order Notification Message */}
                        {msg.type === 'order_notification' && (
                          <div className="space-y-1.5 p-1">
                            <div className="font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Fine UK Order Update</span>
                            </div>
                            <p>{msg.text}</p>
                            {msg.orderInfo && (
                              <div className={`mt-1.5 p-2 rounded-lg text-[11px] font-mono ${isMine ? 'bg-white/10' : 'bg-slate-100 text-slate-800'}`}>
                                <div>Order: {msg.orderInfo.orderNumber}</div>
                                <div>Status: <strong>{msg.orderInfo.status}</strong></div>
                                <div>Total: £{msg.orderInfo.totalAmount.toFixed(2)}</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Call Log Message */}
                        {msg.type === 'call_log' && (
                          <div className="flex items-center gap-2 py-1 font-mono text-[11px]">
                            {msg.callInfo?.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                            <span>{msg.text}</span>
                          </div>
                        )}

                        {/* Message Timestamp */}
                        <div className={`text-[9px] mt-1 text-right ${isMine ? 'text-white/70' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMine && <CheckCheck className="w-3 h-3 inline ml-1" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200">
              {isRecordingVoice ? (
                /* Voice Recording Live Bar */
                <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-rose-700 animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping"></span>
                    <span>Recording UK Voice Message: {recordingSeconds}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsRecordingVoice(false)}
                      className="px-3 py-1 bg-white border border-rose-300 text-rose-600 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStopAndSendVoice}
                      className="px-4 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send Voice</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Message Input Form */
                <form onSubmit={handleSendTextMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#00247D] hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Attach File or Document"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRecordingVoice(true)}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#00247D] hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Record Voice Note"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message Account #${activeAccount}...`}
                    className="flex-1 py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-[#00247D] text-slate-900 placeholder-slate-400"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 bg-[#00247D] hover:bg-[#001B5E] text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          /* Empty State when no conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#00247D] flex items-center justify-center">
              <PhoneCall className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-display">Fine UK 8-Digit Communication</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Select a contact from the left, or use the Dialpad to enter any registered user's 8-digit Account Number.
            </p>
          </div>
        )}

      </div>

      {/* ======================================================================= */}
      {/* REALISTIC CALL SIMULATION MODAL (AUDIO & VIDEO WITH END CALL BUTTON) */}
      {/* ======================================================================= */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full border border-slate-700 overflow-hidden shadow-2xl p-6 text-center text-white space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Header info */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Fine UK Encrypted {activeCall.type === 'video' ? 'Video' : 'Audio'} Call
              </span>
              <h3 className="text-xl font-bold font-display mt-1">{activeCall.accountName}</h3>
              <p className="text-xs font-mono text-blue-400">Account #{activeCall.accountNumber}</p>
            </div>

            {/* Video or Audio Visualizer */}
            {activeCall.type === 'video' ? (
              <div className="relative aspect-4/3 w-full bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
                {activeCall.status === 'connected' ? (
                  <div className="w-full h-full relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                      alt="Video stream"
                      className="w-full h-full object-cover filter brightness-95"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300">
                      Remote Camera HD · 720p 60fps
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-16 h-16 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center mx-auto animate-pulse">
                      <Video className="w-8 h-8" />
                    </div>
                    <p className="text-xs text-slate-400">Establishing encrypted video link...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500/40 text-white flex items-center justify-center mx-auto text-3xl font-bold font-mono shadow-inner">
                  {activeCall.accountNumber.slice(-2)}
                </div>
                <div className="flex justify-center items-center gap-1">
                  {[12, 24, 16, 32, 20, 36, 18, 28, 14].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full animate-pulse"
                      style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Call Status & Timer */}
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {activeCall.status === 'ringing' ? 'Ringing UK Account...' : 'Call Connected'}
              </div>
              <div className="text-2xl font-mono font-bold tracking-wider">
                {Math.floor(activeCall.duration / 60)}:{(activeCall.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Call Action Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null)}
                className={`p-3.5 rounded-full transition-colors cursor-pointer ${
                  activeCall.isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={activeCall.isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* PROMINENT RED END CALL BUTTON */}
              <button
                onClick={handleEndCall}
                className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-95 cursor-pointer ring-4 ring-rose-600/30"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>

              <button
                onClick={() => setActiveCall(prev => prev ? { ...prev, isSpeaker: !prev.isSpeaker } : null)}
                className={`p-3.5 rounded-full transition-colors cursor-pointer ${
                  activeCall.isSpeaker ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Toggle Speaker Mode"
              >
                {activeCall.isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Contact Alias Modal */}
      {editingContact && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900 font-display">Edit Contact Alias</h4>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium">Contact Name</label>
              <input
                type="text"
                value={editingContact.name}
                onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingContact(null)}
                className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setContacts(prev => prev.map(c => c.accountNumber === editingContact.accountNumber ? { ...c, alias: editingContact.name } : c));
                  setEditingContact(null);
                }}
                className="px-4 py-1.5 text-xs bg-[#00247D] text-white font-bold rounded-lg cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
