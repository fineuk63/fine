export type UserRole = 'buyer' | 'seller' | 'charity' | 'admin';

export interface User {
  id: string;
  accountNumber: string; // 8-digit unique number, e.g. "24819203"
  username?: string; // Optional username e.g. "admin"
  pin: string; // 4-digit PIN (hashed in audit/stored)
  role: UserRole;
  name: string;
  phone: string; // UK phone number e.g. "+44 7700 900123"
  address: string; // Residential or business address in the UK
  avatar?: string;
  // Specific to Seller
  niNumberEncrypted?: string; // Stored securely, masked as "QQ •• •• •• A", strictly hidden from other users
  sellerVatRegistered?: boolean;
  vatNumber?: string;
  // Specific to Charity
  charityName?: string;
  charityRegistrationNumber?: string; // UK Charity Commission No. e.g. "1198421"
  // Advertising
  adCount: number; // 0 = first ad free, >0 = £2 fee applies
  // Banking for Payouts
  bankDetails?: {
    accountHolder: string;
    bankName: string;
    sortCode: string; // e.g. "20-45-78"
    accountNumber: string; // 8 digits
    isVerified: boolean;
  };
  balance?: number; // Available seller balance from sales
  status: 'active' | 'suspended' | 'pending_verification';
  createdAt: string;
}

export type ListingCategory = 
  | 'Motors & Vehicles'
  | 'Property'
  | 'Jobs'
  | 'Services'
  | 'Electronics'
  | 'Home & Garden'
  | 'Fashion'
  | 'Health & Beauty'
  | 'Sports & Leisure'
  | 'Collectables & Art'
  | 'Baby & Children'
  | 'Charity & Community'
  | 'Cars & Services'; // Backwards compatibility

export type ProductCondition = 
  | 'New'
  | 'Used - Like New'
  | 'Used - Good'
  | 'Used - Fair'
  | 'Service / Professional'
  | 'Not Applicable';

export interface PropertyDetails {
  propertyType: 'For Sale' | 'To Rent' | 'Commercial' | 'Room to Rent' | 'Land';
  bedrooms?: number;
  bathrooms?: number;
  furnished?: 'Furnished' | 'Unfurnished' | 'Part-Furnished';
  epcRating?: 'A' | 'B' | 'C' | 'D' | 'E';
  councilTaxBand?: string;
  deposit?: number;
  availableFrom?: string;
}

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  engineSize?: string;
  bodyType?: string;
  motExpiry?: string;
  previousOwners?: number;
}

export interface JobDetails {
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Apprenticeship';
  salaryType: 'Per Annum' | 'Per Hour' | 'Per Day';
  salaryMin?: number;
  salaryMax?: number;
  workArrangement: 'On-site' | 'Hybrid' | 'Remote';
  companyName: string;
  experienceLevel?: string;
  closingDate?: string;
}

export interface ServiceDetails {
  serviceType: string;
  pricingModel: 'Fixed Price' | 'Hourly Rate' | 'Free Consultation / Quote';
  gasSafeRegistered?: boolean;
  insured?: boolean;
  serviceRadius?: string;
}

export interface DeliveryOptions {
  royalMail: boolean;
  royalMailCost: number;
  courier: boolean;
  courierCost: number;
  collection: boolean; // Buyer responsible for collecting
  cashOnDelivery: boolean; // Seller responsible for COD
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  price: number; // in GBP £ (or monthly rent / salary)
  priceType?: 'fixed' | 'per_month' | 'per_week' | 'per_hour' | 'per_year';
  condition: ProductCondition;
  stock: number;
  location: string; // UK City/Town e.g. "London", "Manchester", "Birmingham", "Edinburgh"
  postcode: string;
  images: string[];
  sellerId: string;
  sellerAccountNumber: string;
  sellerName: string;
  sellerRole: UserRole;
  sellerVatRegistered: boolean;
  // Specific category metadata
  propertyDetails?: PropertyDetails;
  vehicleDetails?: VehicleDetails;
  jobDetails?: JobDetails;
  serviceDetails?: ServiceDetails;
  // VAT rules according to UK HMRC
  isVatTaxable: boolean; // true for new taxable goods; false or special margin for used goods
  vatRate: number; // 0.20 for standard 20%, 0.05, or 0
  vatAmount: number; // calculated VAT in GBP
  vatSchemeNote?: string; // e.g. "Second-hand goods margin scheme applies - no VAT added to retail price"
  deliveryOptions: DeliveryOptions;
  isFeatured?: boolean;
  adFeePaid: number; // 0 for 1st ad, 2 for 2nd+
  adReceiptNumber?: string;
  status: 'active' | 'sold' | 'paused';
  views: number;
  createdAt: string;
}

export type OrderStatus = 
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Processing'
  | 'Dispatched'
  | 'Ready for Collection'
  | 'Delivered'
  | 'Collected'
  | 'Cancelled'
  | 'Disputed';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
  updatedBy: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "UK-ORD-2026-84920"
  listingId: string;
  listingTitle: string;
  listingImage: string;
  category: ListingCategory;
  buyerId: string;
  buyerAccountNumber: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  sellerId: string;
  sellerAccountNumber: string;
  sellerName: string;
  quantity: number;
  itemPrice: number;
  deliveryMethod: 'Royal Mail' | 'Courier' | 'Collection' | 'Cash on Delivery';
  deliveryCost: number;
  vatAmount: number;
  vatBreakdown: {
    netAmount: number;
    vatRatePercent: number;
    vatAmount: number;
    schemeNote: string;
    sellerVatNumber?: string;
  };
  totalAmount: number;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  paymentMethod: 'Card' | 'Cash on Delivery' | 'Fine UK Escrow';
  paymentStatus: 'Paid' | 'Pending COD' | 'Refunded';
  vatInvoiceNumber: string; // e.g. "VAT-INV-2026-1049"
  isCharityClaim?: boolean;
  charityLogisticsPaidByCharity?: boolean;
  createdAt: string;
}

export type MessageType = 
  | 'text'
  | 'voice'
  | 'image'
  | 'file'
  | 'call_log'
  | 'order_notification';

export interface Message {
  id: string;
  conversationId: string; // sorted pair of account numbers e.g. "10001000_20002000"
  senderAccountNumber: string;
  senderName: string;
  recipientAccountNumber: string;
  text: string;
  type: MessageType;
  fileData?: {
    name: string;
    size: string;
    type: string;
    url?: string;
  };
  voiceDuration?: number; // in seconds
  callInfo?: {
    type: 'audio' | 'video';
    duration: number; // in seconds
    status: 'completed' | 'missed' | 'declined';
  };
  orderInfo?: {
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
  };
  read: boolean;
  timestamp: string;
}

export interface Contact {
  id: string;
  accountNumber: string;
  name: string;
  alias?: string;
  role: UserRole;
  avatar?: string;
  onlineStatus: boolean;
  lastSeen: string;
  unreadCount?: number;
}

export interface AdFeeTransaction {
  id: string;
  accountNumber: string;
  userName: string;
  listingId: string;
  listingTitle: string;
  amount: number; // £2.00
  receiptNumber: string; // e.g. "RCP-2026-9281"
  timestamp: string;
  paymentMethod: string;
}

export interface PayoutRequest {
  id: string;
  sellerAccountNumber: string;
  sellerName: string;
  amount: number;
  bankDetails: {
    accountHolder: string;
    bankName: string;
    sortCode: string;
    accountNumber: string;
  };
  status: 'Pending' | 'Approved' | 'Processed';
  requestedAt: string;
  processedAt?: string;
}

export interface SecurityAlert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  type: 'suspicious_login' | 'bot_registration' | 'fraud_ad' | 'unusual_messaging' | 'suspicious_payment' | 'malicious_file';
  description: string;
  accountNumber?: string;
  ipAddress: string;
  timestamp: string;
  status: 'open' | 'investigated' | 'resolved';
}

export interface AdminStats {
  totalBuyers: number;
  totalSellers: number;
  totalCharities: number;
  totalAds: number;
  freeAds: number;
  paidAds: number;
  advertisingRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalVatRecorded: number;
}

export interface FineUkAdminBankDetails {
  bankName: string;
  accountHolderName: string;
  sortCode: string;
  accountNumber: string;
  iban: string;
  bic: string;
  referencePrefix: string;
  feePolicyNotice: string;
  lastUpdated: string;
}

export interface MonthlyTaxStatement {
  id: string;
  statementNumber: string;
  month: string;
  year: number;
  generatedAt: string;
  accountNumber: string;
  taxpayerName: string;
  isVatRegistered: boolean;
  vatNumber?: string;
  grossTurnover: number;
  netSalesTotal: number;
  vatTotalDueBox1: number;
  zeroRatedSales: number;
  exemptSales: number;
  marginSchemeSales: number;
  transactionsCount: number;
  hmrcDirectPaymentNotice: string;
}

export interface BlockedIpRecord {
  ip: string;
  blockedAt: string;
  reason: string;
  attemptedAction: string;
  severity: 'high' | 'critical';
  autoBlocked: boolean;
}
