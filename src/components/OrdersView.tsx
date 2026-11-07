import React, { useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Printer, 
  AlertTriangle, 
  MessageSquare, 
  FileText, 
  Building, 
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { Order, OrderStatus, User } from '../types';

interface OrdersViewProps {
  orders: Order[];
  currentUser: User | null;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  onStartMessageWithUser: (accountNumber: string, initialText?: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  currentUser,
  onUpdateStatus,
  onStartMessageWithUser,
}) => {
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-900 font-display">My Orders & Sales</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please log in to track your orders, view order confirmations, and access official HMRC VAT invoices.
        </p>
      </div>
    );
  }

  // Filter orders relevant to current user (as buyer or seller)
  const myOrders = orders.filter(
    o => o.buyerAccountNumber === currentUser.accountNumber || o.sellerAccountNumber === currentUser.accountNumber
  );

  const filteredOrders = myOrders.filter((o) => {
    if (statusFilter === 'All') return true;
    return o.status === statusFilter;
  });

  const handleAdvanceStatus = async (order: Order, nextStatus: OrderStatus) => {
    setIsUpdating(order.id);
    try {
      await onUpdateStatus(order.id, nextStatus, `Updated to ${nextStatus} by ${currentUser.name}`);
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case 'Order Placed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Order Confirmed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Processing': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dispatched': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Ready for Collection': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Delivered':
      case 'Collected': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Disputed': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Order Tracking & VAT Records
          </h2>
          <p className="text-xs text-slate-500">
            Account #{currentUser.accountNumber} · Complete UK fulfillment records and HMRC-compliant statements
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
          >
            <option value="All">All Statuses ({myOrders.length})</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Order Confirmed">Order Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Collected">Collected</option>
            <option value="Disputed">Disputed</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No orders found</h4>
          <p className="text-xs text-slate-500">When orders are placed or received, they will appear here with full tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isBuyer = order.buyerAccountNumber === currentUser.accountNumber;
            const otherPartyAcc = isBuyer ? order.sellerAccountNumber : order.buyerAccountNumber;
            const otherPartyName = isBuyer ? order.sellerName : order.buyerName;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">
                      VAT Invoice: {order.vatInvoiceNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-5 flex flex-col md:flex-row gap-5">
                  <img
                    src={order.listingImage}
                    alt={order.listingTitle}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {order.listingTitle}
                      </h3>
                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-[#00247D] tabular-nums font-display">
                          £{order.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Qty: {order.quantity} · {order.paymentMethod}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Counterparty:</span>
                        <span className="font-semibold text-slate-800">{otherPartyName}</span>
                        <span className="font-mono text-slate-500 text-[11px] block">Acc #{otherPartyAcc}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Fulfillment:</span>
                        <span className="font-semibold text-slate-800">{order.deliveryMethod}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Delivery: £{order.deliveryCost.toFixed(2)} · VAT: £{order.vatAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Status History preview */}
                    <div className="text-[11px] text-slate-500 pt-1">
                      <strong>Latest Update:</strong> {order.statusHistory[order.statusHistory.length - 1]?.note} ({new Date(order.statusHistory[order.statusHistory.length - 1]?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </div>
                  </div>
                </div>

                {/* Order Action Buttons */}
                <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* View / Print VAT Invoice */}
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#00247D]" />
                      <span>HMRC VAT Invoice & Receipt</span>
                    </button>

                    {/* Message Party */}
                    <button
                      onClick={() => onStartMessageWithUser(otherPartyAcc, `Inquiry regarding Order #${order.orderNumber}`)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                      <span>Message {isBuyer ? 'Seller' : 'Buyer'}</span>
                    </button>
                  </div>

                  {/* Status Advancer according to role */}
                  <div className="flex items-center gap-2">
                    {!isBuyer && order.status === 'Order Placed' && (
                      <button
                        disabled={isUpdating === order.id}
                        onClick={() => handleAdvanceStatus(order, 'Order Confirmed')}
                        className="px-3 py-1.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Confirm Order
                      </button>
                    )}

                    {!isBuyer && order.status === 'Order Confirmed' && (
                      <button
                        disabled={isUpdating === order.id}
                        onClick={() => handleAdvanceStatus(order, 'Processing')}
                        className="px-3 py-1.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Mark as Processing
                      </button>
                    )}

                    {!isBuyer && order.status === 'Processing' && (
                      <button
                        disabled={isUpdating === order.id}
                        onClick={() => handleAdvanceStatus(order, order.deliveryMethod === 'Collection' ? 'Ready for Collection' : 'Dispatched')}
                        className="px-3 py-1.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        {order.deliveryMethod === 'Collection' ? 'Ready for Collection' : 'Dispatch via Courier/Post'}
                      </button>
                    )}

                    {isBuyer && (order.status === 'Dispatched' || order.status === 'Ready for Collection') && (
                      <button
                        disabled={isUpdating === order.id}
                        onClick={() => handleAdvanceStatus(order, order.deliveryMethod === 'Collection' ? 'Collected' : 'Delivered')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Confirm Received / Delivered
                      </button>
                    )}

                    {order.status !== 'Delivered' && order.status !== 'Collected' && order.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleAdvanceStatus(order, 'Disputed')}
                        className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Report Issue / Dispute
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================================= */}
      {/* OFFICIAL HMRC VAT INVOICE & RECEIPT MODAL */}
      {/* ======================================================================= */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            
            {/* Modal Actions Header */}
            <div className="px-6 py-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#00247D]" />
                Official HMRC-Compliant UK VAT Statement
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="p-8 space-y-6 text-slate-900 bg-white">
              
              {/* Header Lockup */}
              <div className="flex items-start justify-between border-b-2 border-[#00247D] pb-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#00247D] font-display">Fine</span>
                    <span className="text-3xl font-black text-[#CF142B] font-display">UK</span>
                  </div>
                  <p className="text-xs font-bold text-slate-600">United Kingdom Online Marketplace</p>
                  <p className="text-[11px] text-slate-500">Fine UK Ltd · Westminster, London SW1A 2AA</p>
                </div>

                <div className="text-right space-y-1">
                  <h3 className="text-lg font-black text-slate-900 font-display">TAX INVOICE / RECEIPT</h3>
                  <div className="text-xs font-mono">Invoice #: <strong>{selectedOrderForInvoice.vatInvoiceNumber}</strong></div>
                  <div className="text-xs font-mono">Order #: <strong>{selectedOrderForInvoice.orderNumber}</strong></div>
                  <div className="text-xs text-slate-500">Date: {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Seller Information</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedOrderForInvoice.sellerName}</div>
                  <div className="text-slate-600">8-Digit Account ID: {selectedOrderForInvoice.sellerAccountNumber}</div>
                  {selectedOrderForInvoice.vatBreakdown.sellerVatNumber ? (
                    <div className="text-emerald-800 font-semibold font-mono">
                      VAT Reg No: {selectedOrderForInvoice.vatBreakdown.sellerVatNumber}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">Unregistered / Margin Scheme</div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Buyer Information</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedOrderForInvoice.buyerName}</div>
                  <div className="text-slate-600">{selectedOrderForInvoice.buyerAddress}</div>
                  <div className="text-slate-600">Phone: {selectedOrderForInvoice.buyerPhone}</div>
                  <div className="text-slate-600">8-Digit Account ID: {selectedOrderForInvoice.buyerAccountNumber}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-700">
                    <th className="py-2 px-3 font-bold">Description</th>
                    <th className="py-2 px-3 font-bold text-center">Qty</th>
                    <th className="py-2 px-3 font-bold text-right">Unit Net (£)</th>
                    <th className="py-2 px-3 font-bold text-right">VAT Rate</th>
                    <th className="py-2 px-3 font-bold text-right">VAT (£)</th>
                    <th className="py-2 px-3 font-bold text-right">Total (£)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{selectedOrderForInvoice.listingTitle}</div>
                      <div className="text-[10px] text-slate-500">{selectedOrderForInvoice.vatBreakdown.schemeNote}</div>
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums">{selectedOrderForInvoice.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      £{(selectedOrderForInvoice.itemPrice - (selectedOrderForInvoice.vatAmount / selectedOrderForInvoice.quantity)).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {selectedOrderForInvoice.vatBreakdown.vatRatePercent > 0 ? `${selectedOrderForInvoice.vatBreakdown.vatRatePercent}%` : '0%'}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      £{selectedOrderForInvoice.vatAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums">
                      £{(selectedOrderForInvoice.itemPrice * selectedOrderForInvoice.quantity).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-600">Delivery: {selectedOrderForInvoice.deliveryMethod}</td>
                    <td className="py-2 px-3 text-center">1</td>
                    <td className="py-2 px-3 text-right tabular-nums">£{selectedOrderForInvoice.deliveryCost.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">Exempt</td>
                    <td className="py-2 px-3 text-right">£0.00</td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums">£{selectedOrderForInvoice.deliveryCost.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Net Subtotal:</span>
                    <span className="tabular-nums font-semibold">
                      £{(selectedOrderForInvoice.totalAmount - selectedOrderForInvoice.vatAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total UK VAT:</span>
                    <span className="tabular-nums font-semibold text-emerald-800">
                      £{selectedOrderForInvoice.vatAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t-2 border-slate-900">
                    <span>Total Amount Paid:</span>
                    <span className="tabular-nums text-[#00247D] font-display text-base">
                      £{selectedOrderForInvoice.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statutory Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 space-y-1">
                <p>
                  <strong>UK HMRC Compliance Notice:</strong> This transaction record is generated pursuant to UK VAT regulations and maintained for mandatory statutory recordkeeping. Generating a PDF record does not constitute an HMRC VAT return submission.
                </p>
                <p>Fine UK facilitates platform connectivity between registered buyers and independent sellers.</p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
