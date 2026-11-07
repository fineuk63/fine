import React, { useState } from 'react';
import { X, ShieldCheck, Scale, FileText, HelpCircle, Mail, Phone, Lock, HeartHandshake } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  initialTopic: string;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTopic,
  onClose,
}) => {
  const [topic, setTopic] = useState(initialTopic);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#00247D] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base font-display">Fine UK Legal & Statutory Information</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Selector Tabs */}
        <div className="bg-slate-100 px-6 py-2 flex items-center gap-2 text-xs font-bold overflow-x-auto border-b border-slate-200 shrink-0">
          {[
            { id: 'about', label: 'About Fine UK' },
            { id: 'terms', label: 'Terms & Conditions' },
            { id: 'privacy', label: 'UK GDPR & Privacy' },
            { id: 'vat', label: 'HMRC VAT Info' },
            { id: 'safety', label: 'Safety & Security' },
            { id: 'help', label: 'Help Centre' },
            { id: 'contact', label: 'Contact Us' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTopic(item.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                topic === item.id
                  ? 'bg-[#00247D] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
          
          {/* ABOUT FINE UK */}
          {topic === 'about' && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900 font-display">About Fine UK</h4>
              <p>
                <strong>Fine UK</strong> is a dedicated British online marketplace and communications network established to connect individual buyers, independent sellers, craftspeople, and registered charities across England, Scotland, Wales, and Northern Ireland.
              </p>
              <p>
                By combining the trust and transparency of modern e-commerce with our unique 8-digit account dialpad, private voice and video calling, and automated HMRC VAT compliance, Fine UK provides a safe British alternative to overseas auction sites.
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-[#00247D]">Our Marketplace Principle:</span>
                <p>Every registered user receives their first advertisement completely free of charge. Additional advertisements are charged at a transparent £2.00 fee to maintain community safety and quality.</p>
              </div>
            </div>
          )}

          {/* TERMS AND CONDITIONS */}
          {topic === 'terms' && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900 font-display">Terms and Conditions (Section 13)</h4>
              <p>
                Please review these Terms carefully before using the Fine UK platform. Fine UK operates under the laws of England and Wales, incorporating the <strong>Consumer Rights Act 2015</strong>, <strong>Consumer Contracts Regulations 2013</strong>, and the <strong>Online Safety Act 2023</strong>.
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
                <span className="font-bold">Marketplace Intermediary Disclaimer:</span>
                <p>
                  Fine UK provides a platform connecting buyers, sellers and charities. Users are responsible for their listings, communications, transactions, delivery arrangements, and the accuracy of the information they provide.
                </p>
                <p>
                  Fine UK is not automatically responsible for damage, theft, fraud, non-delivery or disputes arising between users, subject to applicable UK law. This disclaimer does not attempt to exclude legal responsibilities that cannot lawfully be excluded under UK statute.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Cash on Delivery (COD):</strong> The seller is solely responsible for arranging, securing, and collecting payment on delivery.</li>
                <li><strong>Collection:</strong> The buyer is responsible for inspecting and collecting items in person.</li>
                <li><strong>Accounts:</strong> Users are identified by their unique 8-digit Account Number and secured with their 4-digit PIN. One active account is permitted per verified UK phone number.</li>
              </ul>
            </div>
          )}

          {/* PRIVACY POLICY (UK GDPR) */}
          {topic === 'privacy' && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900 font-display">Privacy Policy & UK GDPR (Data Protection Act 2018)</h4>
              <p>
                Fine UK is committed to safeguarding your personal data in strict compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900">Information We Collect:</span>
                  <p>Full name, UK residential address, verified UK phone number, profile photograph, and transaction history.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900">National Insurance (NI) Numbers (Sellers Only):</span>
                  <p>In accordance with statutory HMRC reporting standards, sellers must submit their NI number. <strong>NI numbers are encrypted at rest and in transit.</strong> They are strictly inaccessible to buyers or other sellers, and accessible solely to authorised compliance officers for legal audit.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900">Local Device Caching (Section 10):</span>
                  <p>Non-sensitive public listings and authorized profiles may be cached in browser IndexedDB to improve performance. Passwords, PINs, NI numbers, and credit cards are NEVER cached on your local device.</p>
                </div>
              </div>
            </div>
          )}

          {/* VAT INFORMATION (HMRC) */}
          {topic === 'vat' && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900 font-display">HMRC VAT Information & Treatment (Section 6)</h4>
              <p>
                Fine UK calculates and records VAT in accordance with UK HM Revenue & Customs (HMRC) legislation.
              </p>
              <ul className="space-y-2 text-xs">
                <li className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong>New Taxable Goods:</strong> Subject to standard UK 20% VAT when sold by VAT-registered business sellers. Full Tax Invoices are generated.
                </li>
                <li className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong>Used Goods & Second-Hand Margin Scheme:</strong> We do not automatically apply 20% VAT to second-hand goods. Sales under the HMRC second-hand margin scheme or from unregistered private sellers do not show separate VAT charges to the buyer.
                </li>
                <li className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong>Charities:</strong> Sales of donated goods by UK registered charities are zero-rated for VAT.
                </li>
                <li className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong>Statutory Notice:</strong> Generating a PDF statement or transaction invoice does not constitute an HMRC VAT submission. Sellers must submit their own returns through Making Tax Digital (MTD) compliant software.
                </li>
              </ul>
            </div>
          )}

          {/* SAFETY AND SECURITY */}
          {topic === 'safety' && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900 font-display">Safety, Security & Cyber Protection (Section 11)</h4>
              <p>
                Fine UK deploys multi-layered cybersecurity, AI fraud detection, and rate limiting to protect the British public.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#00247D]">8-Digit Verification:</span>
                  <p>Always verify the other party's 8-digit Account Number inside the Fine UK Inbox before concluding an arrangement.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#00247D]">Never Pay Off-Platform:</span>
                  <p>Never agree to pay via non-traceable wire transfers, gift cards, or external payment links sent via chat.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#00247D]">AI Fraud Monitoring:</span>
                  <p>Our automated systems monitor for bot signups, duplicate advertisements, and phishing attempts 24 hours a day.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#00247D]">Encrypted PINs:</span>
                  <p>Your 4-digit PIN is stored securely using one-way cryptographic hashing and is never accessible in plain text.</p>
                </div>
              </div>
            </div>
          )}

          {/* HELP CENTRE */}
          {topic === 'help' && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900 font-display">Fine UK Help Centre</h4>
              <div className="space-y-2 text-xs">
                <details className="p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                  <summary className="font-bold text-slate-900">How do I start communicating with a seller?</summary>
                  <p className="mt-2 text-slate-600">You can use the 8-Digit Dialpad in your Fine UK Inbox. Enter the seller's 8-digit Account Number (e.g. 20002000) to start a chat, audio call, or video call.</p>
                </details>
                <details className="p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                  <summary className="font-bold text-slate-900">How does the £2 advertising fee work?</summary>
                  <p className="mt-2 text-slate-600">Your first advertisement is 100% free. Every additional advertisement costs £2.00, collected securely with a VAT receipt recorded in the admin panel.</p>
                </details>
                <details className="p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                  <summary className="font-bold text-slate-900">How do I recover my 8-digit Account Number or reset my PIN?</summary>
                  <p className="mt-2 text-slate-600">Click Login, then select "Forgot Account or PIN?". Enter your verified UK phone number to receive an instant SMS One-Time Password (OTP) and reset your PIN.</p>
                </details>
              </div>
            </div>
          )}

          {/* CONTACT US */}
          {topic === 'contact' && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900 font-display">Contact Fine UK Customer Support</h4>
              <p>Our UK-based customer care team is available Monday to Saturday, 8:00 AM – 7:00 PM GMT.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <span className="font-bold text-[#00247D] flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#00247D]" />
                    Email Support
                  </span>
                  <div className="font-mono text-slate-800">support@fineuk.co.uk</div>
                  <div className="text-[11px] text-slate-500">Response within 2 hours</div>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-800" />
                    UK Telephone Helpline
                  </span>
                  <div className="font-mono text-slate-800">+44 (0) 20 7946 0192</div>
                  <div className="text-[11px] text-slate-500">Freephone UK landlines & mobiles</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
