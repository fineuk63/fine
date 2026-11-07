import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Tag, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  CreditCard, 
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Image as ImageIcon,
  Camera,
  Upload,
  Trash2,
  Car,
  Home as HomeIcon,
  Briefcase,
  Wrench,
  Laptop,
  Shirt,
  HeartHandshake,
  RefreshCw,
  Star
} from 'lucide-react';
import { 
  User, 
  ListingCategory, 
  ProductCondition,
  PropertyDetails,
  VehicleDetails,
  JobDetails,
  ServiceDetails
} from '../types';

interface CreateListingModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onListingCreated: () => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onListingCreated,
}) => {
  // Core Listing Fields
  const [title, setTitle] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Electronics');
  const [condition, setCondition] = useState<ProductCondition>('New');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'per_month' | 'per_week' | 'per_hour' | 'per_year'>('fixed');
  const [stock, setStock] = useState('1');
  const [location, setLocation] = useState('London');
  const [postcode, setPostcode] = useState('SW1A 1AA');

  // Photo System: Multiple Photos from Device + Camera
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'
  ]);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Category-Specific Dynamic Fields
  // 1. Vehicle Details (Motors & Vehicles)
  const [vehMake, setVehMake] = useState('MINI');
  const [vehModel, setVehModel] = useState('Cooper S');
  const [vehYear, setVehYear] = useState('2022');
  const [vehMileage, setVehMileage] = useState('14800');
  const [vehFuel, setVehFuel] = useState<'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'>('Petrol');
  const [vehTransmission, setVehTransmission] = useState<'Manual' | 'Automatic'>('Automatic');
  const [vehMotExpiry, setVehMotExpiry] = useState('October 2027');

  // 2. Property Details (Property)
  const [propType, setPropType] = useState<'For Sale' | 'To Rent' | 'Commercial' | 'Room to Rent' | 'Land'>('To Rent');
  const [propBedrooms, setPropBedrooms] = useState('2');
  const [propBathrooms, setPropBathrooms] = useState('1');
  const [propFurnished, setPropFurnished] = useState<'Furnished' | 'Unfurnished' | 'Part-Furnished'>('Furnished');
  const [propEpc, setPropEpc] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('B');
  const [propCouncilTax, setPropCouncilTax] = useState('Band D');
  const [propDeposit, setPropDeposit] = useState('2000');

  // 3. Job Details (Jobs)
  const [jobType, setJobType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Apprenticeship'>('Full-time');
  const [jobSalaryType, setJobSalaryType] = useState<'Per Annum' | 'Per Hour' | 'Per Day'>('Per Annum');
  const [jobSalaryMin, setJobSalaryMin] = useState('45000');
  const [jobSalaryMax, setJobSalaryMax] = useState('55000');
  const [jobWorkArrangement, setJobWorkArrangement] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid');
  const [jobCompany, setJobCompany] = useState('UK Enterprise Ltd');

  // 4. Service Details (Services)
  const [servicePricingModel, setServicePricingModel] = useState<'Fixed Price' | 'Hourly Rate' | 'Free Consultation / Quote'>('Hourly Rate');
  const [serviceGasSafe, setServiceGasSafe] = useState(false);
  const [serviceInsured, setServiceInsured] = useState(true);

  // Delivery options
  const [royalMail, setRoyalMail] = useState(true);
  const [royalMailCost, setRoyalMailCost] = useState('4.95');
  const [courier, setCourier] = useState(false);
  const [courierCost, setCourierCost] = useState('8.50');
  const [collection, setCollection] = useState(true);
  const [cashOnDelivery, setCashOnDelivery] = useState(false);

  // VAT settings (Section 6)
  const [isVatTaxable, setIsVatTaxable] = useState(false);

  // AI Assistant state
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiVatAdvice, setAiVatAdvice] = useState('');

  // Fee state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feeReceipt, setFeeReceipt] = useState<any | null>(null);

  // Manage Camera Stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive) {
      setCameraError('');
      navigator.mediaDevices?.getUserMedia({
        video: { facingMode: cameraFacing }
      })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      })
      .catch((err) => {
        console.warn('Camera access denied or unavailable:', err);
        setCameraError('Camera access unavailable. You can upload photos directly from your device storage.');
        setIsCameraActive(false);
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, cameraFacing]);

  if (!isOpen || !currentUser) return null;

  const isFirstAd = currentUser.adCount === 0;
  const feeRequired = !isFirstAd;

  // Handle Device File Upload
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so same files can be chosen again if needed
    e.target.value = '';
  };

  // Capture Snapshot from Camera
  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const snapshotUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImages(prev => [...prev, snapshotUrl]);
      setIsCameraActive(false);
    }
  };

  // Remove Photo
  const handleRemovePhoto = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Set Primary Photo
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  };

  // Auto-set default pricing type when category changes
  const handleCategoryChange = (newCat: ListingCategory) => {
    setCategory(newCat);
    if (newCat === 'Property') {
      setPriceType(propType === 'For Sale' ? 'fixed' : 'per_month');
      setCondition('Not Applicable');
      setRoyalMail(false);
      setCourier(false);
      setCollection(true);
      setCashOnDelivery(false);
    } else if (newCat === 'Jobs') {
      setPriceType('per_year');
      setCondition('Not Applicable');
      setRoyalMail(false);
      setCourier(false);
      setCollection(false);
      setCashOnDelivery(false);
    } else if (newCat === 'Motors & Vehicles') {
      setPriceType('fixed');
      setCondition('Used - Like New');
      setRoyalMail(false);
      setCourier(true);
      setCollection(true);
      setCashOnDelivery(true);
    } else if (newCat === 'Services') {
      setPriceType('per_hour');
      setCondition('Service / Professional');
      setRoyalMail(false);
      setCourier(false);
      setCollection(false);
      setCashOnDelivery(true);
    } else {
      setPriceType('fixed');
      setCondition('New');
      setRoyalMail(true);
      setCourier(false);
      setCollection(true);
      setCashOnDelivery(false);
    }
  };

  // AI Assistant Call
  const handleAiEnhance = async () => {
    if (!title.trim() && !rawNotes.trim()) {
      alert('Please enter a draft title or some bullet notes first.');
      return;
    }

    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          rawNotes,
          category,
          condition,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        if (data.result.improvedTitle) setTitle(data.result.improvedTitle);
        if (data.result.description) setDescription(data.result.description);
        if (data.result.suggestedCategory) handleCategoryChange(data.result.suggestedCategory);
        if (data.result.vatAdvice) setAiVatAdvice(data.result.vatAdvice);
      }
    } catch (err) {
      console.error('AI assistant failed:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price) {
      alert('Please fill in title, description, and price.');
      return;
    }

    if (images.length === 0) {
      alert('Please add at least one photo from your device or camera.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build category-specific payloads
      let propertyDetailsPayload: PropertyDetails | undefined = undefined;
      let vehicleDetailsPayload: VehicleDetails | undefined = undefined;
      let jobDetailsPayload: JobDetails | undefined = undefined;
      let serviceDetailsPayload: ServiceDetails | undefined = undefined;

      if (category === 'Property') {
        propertyDetailsPayload = {
          propertyType: propType,
          bedrooms: parseInt(propBedrooms, 10) || 1,
          bathrooms: parseInt(propBathrooms, 10) || 1,
          furnished: propFurnished,
          epcRating: propEpc,
          councilTaxBand: propCouncilTax,
          deposit: parseFloat(propDeposit) || 0,
          availableFrom: 'Immediately',
        };
      } else if (category === 'Motors & Vehicles') {
        vehicleDetailsPayload = {
          make: vehMake,
          model: vehModel,
          year: parseInt(vehYear, 10) || 2022,
          mileage: parseInt(vehMileage, 10) || 10000,
          fuelType: vehFuel,
          transmission: vehTransmission,
          motExpiry: vehMotExpiry,
        };
      } else if (category === 'Jobs') {
        jobDetailsPayload = {
          jobType,
          salaryType: jobSalaryType,
          salaryMin: parseFloat(jobSalaryMin) || 0,
          salaryMax: parseFloat(jobSalaryMax) || 0,
          workArrangement: jobWorkArrangement,
          companyName: jobCompany,
        };
      } else if (category === 'Services') {
        serviceDetailsPayload = {
          serviceType: title,
          pricingModel: servicePricingModel,
          gasSafeRegistered: serviceGasSafe,
          insured: serviceInsured,
        };
      }

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerAccountNumber: currentUser.accountNumber,
          title,
          description,
          category,
          price: parseFloat(price),
          priceType,
          condition,
          stock: parseInt(stock, 10) || 1,
          location,
          postcode,
          images,
          deliveryOptions: {
            royalMail,
            royalMailCost: parseFloat(royalMailCost) || 0,
            courier,
            courierCost: parseFloat(courierCost) || 0,
            collection,
            cashOnDelivery,
          },
          isVatTaxable,
          propertyDetails: propertyDetailsPayload,
          vehicleDetails: vehicleDetailsPayload,
          jobDetails: jobDetailsPayload,
          serviceDetails: serviceDetailsPayload,
          payFee: feeRequired,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create advertisement');

      setFeeReceipt(data);
      onListingCreated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#00247D] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base font-display">Post UK Advertisement</h3>
            <span className="text-white/70 text-xs hidden sm:inline">· Items, Property, Motors, Jobs & Services</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success / Receipt Screen */}
        {feeReceipt ? (
          <div className="p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-3" />
            </div>

            <h3 className="text-xl font-black text-slate-900 font-display">
              Advertisement Published Successfully!
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Official Receipt #:</span>
                <span className="font-mono font-bold text-blue-900">{feeReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-800">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Advertisement Fee Charged:</span>
                <span className="font-black text-slate-900">
                  {feeReceipt.adFeeCharged === 0 ? '£0.00 (First Free Ad)' : '£2.00 (Standard Ad Fee)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Listing Status:</span>
                <span className="text-emerald-700 font-bold">Active in UK Marketplace</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded in Fine UK Admin:</span>
                <span className="text-slate-700 font-mono">Yes · Audited</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Buyers and clients can now discover your advertisement and communicate with your 8-digit Account #{currentUser.accountNumber}.
            </p>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#00247D] hover:bg-[#001B5E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Done & Return to Marketplace
            </button>
          </div>
        ) : (
          /* Create Listing Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* Advertising Fee Notice Banner (Section 3) */}
            <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              isFirstAd
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${isFirstAd ? 'text-emerald-600' : 'text-blue-600'}`} />
              <div className="space-y-0.5">
                <div className="font-bold text-sm">
                  {isFirstAd ? 'First Advertisement FREE' : 'Standard Marketplace Fee: £2.00'}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isFirstAd
                    ? 'Every registered buyer, seller, and charity receives their first advertisement completely free of charge.'
                    : 'Your first advertisement has been used. The £2.00 fee is collected by Fine UK Admin upon publishing, with transaction receipt provided.'}
                </p>
              </div>
            </div>

            {/* =============================================================== */}
            {/* 1. PHOTO UPLOAD & CAMERA SYSTEM BY DEVICE */}
            {/* =============================================================== */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 font-display flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#00247D]" />
                    <span>Photos & Images from Device ({images.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add photos of your item, property, car, or service directly from your device files or live camera.
                  </p>
                </div>

                {/* Upload Buttons */}
                <div className="flex items-center gap-2">
                  {/* Device File Input (Hidden) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDeviceFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00247D]" />
                    <span>Upload from Device</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className="px-3 py-1.5 bg-[#00247D] hover:bg-[#001B5E] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isCameraActive ? 'Close Camera' : 'Take Photo (Camera)'}</span>
                  </button>
                </div>
              </div>

              {/* Camera Error Notice if any */}
              {cameraError && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Live Device Camera Viewfinder */}
              {isCameraActive && (
                <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Device Live Camera Viewfinder
                    </span>
                    <button
                      type="button"
                      onClick={() => setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment')}
                      className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Flip Camera</span>
                    </button>
                  </div>

                  <div className="relative aspect-16/9 w-full bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleTakeSnapshot}
                      className="px-6 py-2 bg-[#CF142B] hover:bg-[#B01024] text-white font-bold rounded-full text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture & Add Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Photos Gallery Thumbnails */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 group bg-white shadow-2xs ${
                        index === 0 ? 'border-[#00247D] ring-2 ring-blue-100' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-[#00247D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          Primary
                        </div>
                      )}
                      
                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(index)}
                            className="p-1 bg-white/90 text-slate-800 rounded hover:bg-white text-[10px] font-bold"
                            title="Set as primary photo"
                          >
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* =============================================================== */}
            {/* 2. CATEGORY SELECTION (All British Categories: Cars, Property, Jobs, Items, Services) */}
            {/* =============================================================== */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Marketplace Sector & Category
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Motors & Vehicles' as ListingCategory, name: 'Motors & Vehicles', icon: Car, hint: 'Cars, vans, motorbikes' },
                  { id: 'Property' as ListingCategory, name: 'Property', icon: HomeIcon, hint: 'Homes for sale & to rent' },
                  { id: 'Jobs' as ListingCategory, name: 'Jobs & Careers', icon: Briefcase, hint: 'Full-time, part-time' },
                  { id: 'Services' as ListingCategory, name: 'Services & Trades', icon: Wrench, hint: 'Boiler, builders, tutoring' },
                  { id: 'Electronics' as ListingCategory, name: 'Electronics & Tech', icon: Laptop, hint: 'Phones, laptops, audio' },
                  { id: 'Home & Garden' as ListingCategory, name: 'Home & Garden', icon: HomeIcon, hint: 'Furniture, decor, tools' },
                  { id: 'Fashion' as ListingCategory, name: 'Fashion & Clothes', icon: Shirt, hint: 'Menswear, womenswear' },
                  { id: 'Charity & Community' as ListingCategory, name: 'Charity & Causes', icon: HeartHandshake, hint: 'Appeals, donations' },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#00247D] bg-blue-50/80 text-[#00247D] shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-[#00247D]' : 'text-slate-500'}`} />
                      <div>
                        <div className="font-bold text-xs">{cat.name}</div>
                        <div className="text-[10px] text-slate-500">{cat.hint}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Assistant Tool Bar */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900">
                    AI Listing Assistant (Gemini 3.8 Flash)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={isAiGenerating}
                  className="px-3 py-1.5 bg-[#00247D] hover:bg-[#001B5E] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAiGenerating ? 'Enhancing...' : 'Auto-Generate Description & Title'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600">
                Enter your draft title or rough bullet points below, then click to generate a professional British marketplace listing with correct HMRC VAT advice.
              </p>
              {aiVatAdvice && (
                <div className="mt-2 p-2.5 bg-white/80 rounded-lg text-[11px] text-slate-700 border border-blue-100">
                  <strong>HMRC VAT Advice:</strong> {aiVatAdvice}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Listing Title
              </label>
              <input
                type="text"
                required
                placeholder={
                  category === 'Motors & Vehicles' ? 'e.g. 2022 MINI Cooper S 2.0 Sport Hatchback Auto' :
                  category === 'Property' ? 'e.g. 2 Bed Victorian Garden Apartment - Kensington, London' :
                  category === 'Jobs' ? 'e.g. Senior Full-Stack Software Engineer (TypeScript & Node.js)' :
                  category === 'Services' ? 'e.g. Gas Safe Certified Boiler Installation & Annual Inspection' :
                  'e.g. Sony WH-1000XM5 Wireless Headphones (Midnight Blue)'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D] focus:bg-white text-slate-900 font-medium"
              />
            </div>

            {/* Price & Pricing Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {category === 'Jobs' ? 'Salary / Wage (£)' : category === 'Property' ? 'Rent or Price (£)' : 'Price (£)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm font-bold text-slate-500">£</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D] focus:bg-white text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price Frequency
                </label>
                <select
                  value={priceType}
                  onChange={(e: any) => setPriceType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-hidden text-slate-900 cursor-pointer"
                >
                  <option value="fixed">Fixed Total Amount</option>
                  <option value="per_month">Per Month (pcm)</option>
                  <option value="per_week">Per Week (pw)</option>
                  <option value="per_year">Per Year (Salary)</option>
                  <option value="per_hour">Per Hour</option>
                </select>
              </div>
            </div>

            {/* =============================================================== */}
            {/* 3. DYNAMIC CATEGORY-SPECIFIC ATTRIBUTES */}
            {/* =============================================================== */}
            
            {/* MOTORS & VEHICLES ATTRIBUTES */}
            {category === 'Motors & Vehicles' && (
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00247D]">
                  <Car className="w-4 h-4" />
                  <span>Vehicle Specifications (UK Registration & V5C)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1">Make</label>
                    <input
                      type="text"
                      value={vehMake}
                      onChange={(e) => setVehMake(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. MINI, Ford, BMW"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Model</label>
                    <input
                      type="text"
                      value={vehModel}
                      onChange={(e) => setVehModel(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. Cooper S, Focus"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Year</label>
                    <input
                      type="number"
                      value={vehYear}
                      onChange={(e) => setVehYear(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Mileage</label>
                    <input
                      type="number"
                      value={vehMileage}
                      onChange={(e) => setVehMileage(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. 14800"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Fuel Type</label>
                    <select
                      value={vehFuel}
                      onChange={(e: any) => setVehFuel(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Transmission</label>
                    <select
                      value={vehTransmission}
                      onChange={(e: any) => setVehTransmission(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PROPERTY ATTRIBUTES */}
            {category === 'Property' && (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <HomeIcon className="w-4 h-4" />
                  <span>UK Property & Tenancy Details</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1">Tenancy Type</label>
                    <select
                      value={propType}
                      onChange={(e: any) => {
                        setPropType(e.target.value);
                        setPriceType(e.target.value === 'For Sale' ? 'fixed' : 'per_month');
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="To Rent">To Rent (Monthly)</option>
                      <option value="For Sale">For Sale (Freehold/Leasehold)</option>
                      <option value="Room to Rent">Room in Flatshare</option>
                      <option value="Commercial">Commercial / Office</option>
                      <option value="Land">Land / Plot</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={propBedrooms}
                      onChange={(e) => setPropBedrooms(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Bathrooms</label>
                    <input
                      type="number"
                      value={propBathrooms}
                      onChange={(e) => setPropBathrooms(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Furnishing</label>
                    <select
                      value={propFurnished}
                      onChange={(e: any) => setPropFurnished(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="Furnished">Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                      <option value="Part-Furnished">Part-Furnished</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">EPC Rating</label>
                    <select
                      value={propEpc}
                      onChange={(e: any) => setPropEpc(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg cursor-pointer font-bold"
                    >
                      <option value="A">A (Most Efficient)</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Council Tax Band</label>
                    <input
                      type="text"
                      value={propCouncilTax}
                      onChange={(e) => setPropCouncilTax(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. Band D"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* JOBS ATTRIBUTES */}
            {category === 'Jobs' && (
              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                  <Briefcase className="w-4 h-4" />
                  <span>Job Role & Employment Specifications</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1">Contract Type</label>
                    <select
                      value={jobType}
                      onChange={(e: any) => setJobType(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="Full-time">Full-time Permanent</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Fixed-term Contract</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Apprenticeship">UK Apprenticeship</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Work Arrangement</label>
                    <select
                      value={jobWorkArrangement}
                      onChange={(e: any) => setJobWorkArrangement(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site UK</option>
                      <option value="Remote">100% Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Hiring Company</label>
                    <input
                      type="text"
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. Apex Tech UK"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Description & Information
              </label>
              <textarea
                required
                rows={4}
                placeholder="Full details, specifications, history, dimensions, tenancy or employment requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#00247D] focus:bg-white text-slate-900"
              />
            </div>

            {/* Location & Postcode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location (UK City/Town)
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-hidden text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  UK Postcode
                </label>
                <input
                  type="text"
                  required
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-hidden text-slate-900 font-mono"
                />
              </div>
            </div>

            {/* VAT Compliance Checkbox (Section 6) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVatTaxable}
                  onChange={(e) => setIsVatTaxable(e.target.checked)}
                  className="accent-[#00247D] w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-900">
                  Standard UK 20% VAT applicable (New taxable goods or commercial services)
                </span>
              </label>
              <p className="text-[10px] text-slate-500 pl-6">
                Under UK HMRC rules, used goods sold under the second-hand margin scheme, residential property, and private sales do not carry separate VAT to buyers.
              </p>
            </div>

            {/* Delivery & Collection Options (for physical goods) */}
            {category !== 'Property' && category !== 'Jobs' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Delivery & Collection Options Offered
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer hover:bg-slate-50 border-slate-200">
                    <input
                      type="checkbox"
                      checked={royalMail}
                      onChange={(e) => setRoyalMail(e.target.checked)}
                      className="accent-[#00247D]"
                    />
                    <span>Royal Mail Delivery (£{royalMailCost})</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer hover:bg-slate-50 border-slate-200">
                    <input
                      type="checkbox"
                      checked={courier}
                      onChange={(e) => setCourier(e.target.checked)}
                      className="accent-[#00247D]"
                    />
                    <span>Signed Courier (£{courierCost})</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer hover:bg-slate-50 border-slate-200">
                    <input
                      type="checkbox"
                      checked={collection}
                      onChange={(e) => setCollection(e.target.checked)}
                      className="accent-[#00247D]"
                    />
                    <span>Collection (Buyer responsibility)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer hover:bg-slate-50 border-slate-200">
                    <input
                      type="checkbox"
                      checked={cashOnDelivery}
                      onChange={(e) => setCashOnDelivery(e.target.checked)}
                      className="accent-[#00247D]"
                    />
                    <span>Cash on Delivery (Seller responsibility)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-500">Fee for this ad: </span>
                <strong className={isFirstAd ? 'text-emerald-700 font-bold' : 'text-[#CF142B] font-bold'}>
                  {isFirstAd ? 'FREE (£0.00)' : '£2.00 (Admin Collection)'}
                </strong>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#CF142B] hover:bg-[#B01024] text-white rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : isFirstAd ? 'Publish Free Ad' : 'Pay £2 & Publish Ad'}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
