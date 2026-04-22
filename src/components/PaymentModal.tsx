import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Check, Loader2, Timer, CreditCard, Mail, ShieldCheck, AlertCircle, WifiOff, RefreshCcw, FileCheck, ChevronDown, ArrowRight, BookOpen, CheckCircle2, Download, MessageSquare } from 'lucide-react';
import { trackMetaEvent } from '../utils/meta-tracking';
import { Course } from '../types';
import { COURSES } from '../constants';

// --- CONFIGURATION ---
const STRIPE_PUBLISHABLE_KEY = "pk_live_51PRJCsGGsoQTkhyv6OrT4zvnaaB5Y0MSSkTXi0ytj33oygsfW3dcu6aOFa9q3dr2mXYTCJErnFQJcOcyuDAsQd4B00lIAdclbB";

// --- BACKEND CONNECTION SETTINGS ---
// Determine Backend URL based on Environment Variables
// If VITE_BACKEND_URL is set (e.g. in Vercel), use it.
// Otherwise, default to relative path (for local proxy or monolithic deploy).
const ENV_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const BACKEND_URL = "https://dhufnozehayzjlsmnvdl.supabase.co/functions/v1/create-intent-pay";

const PAYPAL_BUSINESS_EMAIL = "design@avada.in";
const PAYPAL_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg";

declare global {
    interface Window {
        Stripe?: (key: string) => any;
    }
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialCourse?: Course | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
    // --- STATE ---
    const [viewState, setViewState] = useState<'LOADING' | 'ADDING_BOOKS' | 'FORM' | 'PROCESSING' | 'SUCCESS' | 'CONNECTION_ERROR'>('LOADING');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isStripeLoaded, setIsStripeLoaded] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ h: 2, m: 14, s: 30 });
    const [addedBooksCount, setAddedBooksCount] = useState(0);
    const [showBundleDetails, setShowBundleDetails] = useState(false);
    const [hidePayPalButton, setHidePayPalButton] = useState(false);
    const [hasAddedPaymentInfo, setHasAddedPaymentInfo] = useState(false);

    const stripeRef = useRef<any>(null);
    const elementsRef = useRef<any>(null);

    // --- LIFECYCLE ---
    useEffect(() => {
        if (isOpen) {
            resetModal();
        }
    }, [isOpen]);

    const resetModal = () => {
        setViewState('LOADING');
        setPaymentMethod('card');
        setEmail('');
        setErrorMessage(null);
        setIsStripeLoaded(false);

        // Clear refs to ensure clean re-initialization
        stripeRef.current = null;
        elementsRef.current = null;

        setAddedBooksCount(0);

        // Start with a brief loading spin, then move to adding books animation
        setTimeout(() => {
            setViewState('ADDING_BOOKS');
        }, 600);
    };

    // Timer countdown
    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 };
                if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    // Init Stripe UI when in FORM view (without Payment Intent)
    useEffect(() => {
        if (viewState === 'FORM' && !stripeRef.current && paymentMethod === 'card') {
            initializeStripeUI();
        }
    }, [viewState, paymentMethod]);

    // Animation for Adding Books
    useEffect(() => {
        if (viewState === 'ADDING_BOOKS') {
            const totalBooks = COURSES.length;
            const intervalTime = 150; // Faster animation

            const interval = setInterval(() => {
                setAddedBooksCount(prev => {
                    if (prev < totalBooks) {
                        return prev + 1;
                    } else {
                        clearInterval(interval);
                        setTimeout(() => {
                            setViewState('FORM');
                            // Meta InitiateCheckout
                            trackMetaEvent({
                                eventName: 'InitiateCheckout',
                                value: 49.00,
                                currency: 'USD',
                                content_name: 'Interior Design System - 6 Book Collection',
                                content_ids: ['interior-design-system-6-books'],
                                content_type: 'product'
                            });
                        }, 500);
                        return prev;
                    }
                });
            }, intervalTime);

            return () => clearInterval(interval);
        }
    }, [viewState]);

    const initializeStripeUI = async (retry = 0) => {
        try {
            if (!window.Stripe) {
                if (retry < 3) setTimeout(() => initializeStripeUI(retry + 1), 500);
                return;
            }
            if (stripeRef.current) return;

            // Just initialize Stripe instance and Elements without Payment Intent
            stripeRef.current = window.Stripe(STRIPE_PUBLISHABLE_KEY);

            elementsRef.current = stripeRef.current.elements({
                mode: 'payment',
                amount: 4900,
                currency: 'usd',
                automatic_payment_methods: { enabled: true },
                appearance: {
                    theme: 'flat',
                    labels: 'floating',
                    variables: {
                        fontFamily: '"Outfit", sans-serif',
                        borderRadius: '10px',
                        colorPrimary: '#0f172a',
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                        colorDanger: '#ef4444',
                        spacingUnit: '4px',
                        fontSizeBase: '15px',
                        fontWeightNormal: '500',
                    },
                    rules: {
                        '.Input': {
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            paddingTop: '12px',
                            paddingBottom: '12px',
                            paddingLeft: '12px',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease',
                        },
                        '.Input:hover': {
                            borderColor: '#cbd5e1',
                        },
                        '.Input:focus': {
                            border: '1px solid #0A2540',
                            boxShadow: '0 0 0 4px rgba(10, 37, 64, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        },
                        '.Label': {
                            fontWeight: '500',
                            color: '#64748b',
                            fontSize: '13px',
                            marginBottom: '4px'
                        },
                        '.Tab': {
                            display: 'none',
                        }
                    }
                }
            });

            const paymentElement = elementsRef.current.create("payment", {
                layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                },
                fields: {
                    billingDetails: {
                        email: 'never',
                        address: 'never'
                    }
                },
                paymentMethodOrder: ['card'],
                wallets: { applePay: 'never', googlePay: 'never' }
            });

            const mountPoint = document.getElementById("stripe-element-mount");
            if (mountPoint) {
                paymentElement.mount("#stripe-element-mount");
                setIsStripeLoaded(true);
            }

            // Hide PayPal button when user starts entering card digits
            paymentElement.on('change', (event: any) => {
                // Only hide PayPal when user has actually started typing (not empty is true when input has content)
                if (!event.empty) {
                    setHidePayPalButton(true);
                    
                    // Meta AddPaymentInfo (fire only once)
                    if (!hasAddedPaymentInfo) {
                        trackMetaEvent({
                            eventName: 'AddPaymentInfo',
                            content_name: 'Interior Design System - 6 Book Collection',
                            content_ids: ['interior-design-system-6-books'],
                            content_type: 'product',
                            value: 49.00,
                            currency: 'USD'
                        });
                        setHasAddedPaymentInfo(true);
                    }
                }
            });

        } catch (err: any) {
            console.error("Stripe UI Init Failed:", err);
            setErrorMessage("Card gateway unavailable. Please try PayPal.");
            setIsStripeLoaded(false);
            setPaymentMethod('paypal');
        }
    };

    const handlePaypalSubmit = (e: React.FormEvent) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            e.preventDefault();
            setEmailError(true);
            setErrorMessage("Please enter a valid email address first.");
            return;
        }
        setViewState('PROCESSING');

        // Meta AddPaymentInfo for PayPal
        if (!hasAddedPaymentInfo) {
            trackMetaEvent({
                eventName: 'AddPaymentInfo',
                content_name: 'Interior Design System - 6 Book Collection',
                content_ids: ['interior-design-system-6-books'],
                content_type: 'product',
                value: 49.00,
                currency: 'USD',
                payment_type: 'paypal'
            });
            setHasAddedPaymentInfo(true);
        }
    };

    const handleCardPay = async () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError(true);
            return;
        }

        if (!stripeRef.current || !elementsRef.current) {
            setErrorMessage("Gateway not ready.");
            return;
        }

        // Submit the Elements form first (REQUIRED for deferred payments)
        const { error: submitError } = await elementsRef.current.submit();
        if (submitError) {
            setErrorMessage(submitError.message || "Payment validation failed");
            return;
        }

        setViewState('PROCESSING');

        try {
            console.log(`Creating Payment Intent at: ${BACKEND_URL}`);

            // Create Payment Intent NOW (after form validation)
            const res = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [{ id: 'lifetime-bundle' }],
                    email: email
                })
            });

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("Backend not found. Please use PayPal.");
                }
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Server error: ${res.status}`);
            }

            const data = await res.json();
            const clientSecret = data.clientSecret;

            const result = await stripeRef.current.confirmPayment({
                elements: elementsRef.current,
                confirmParams: {
                    return_url: `${window.location.origin}/success?email=${email}&method=stripe`,
                    receipt_email: email,
                    payment_method_data: {
                        billing_details: {
                            address: {
                                country: 'US',
                                state: 'CA',
                                city: 'Los Angeles',
                                line1: '123 Main St',
                                line2: '',
                                postal_code: '90001',
                            },
                        },
                    },
                },
                clientSecret: clientSecret,
                redirect: 'if_required'
            });

            if (result.error) {
                setErrorMessage(result.error.message || "Payment Failed");
                setViewState('FORM');
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                setViewState('SUCCESS');

                // Track Purchase with Meta
                trackMetaEvent({
                    eventName: 'Purchase',
                    email: email,
                    value: 49.00,
                    currency: 'USD',
                    content_name: 'Interior Design System - 6 Book Collection',
                    content_ids: ['interior-design-system-6-books'],
                    content_type: 'product',
                    order_id: result.paymentIntent.id
                });

                // Trigger Resend Email via Edge Function
                fetch("https://dhufnozehayzjlsmnvdl.supabase.co/functions/v1/send-book-order-email", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, orderId: result.paymentIntent.id })
                }).catch(err => console.error("Email trigger failed:", err));

                setTimeout(() => { window.location.href = "https://drive.google.com/file/d/1FmP4WCWZ3RdHNvPlDK_X99TMcxrB0GPF/view?usp=drive_link"; }, 2000);
            }
        } catch (err: any) {
            setErrorMessage(err.message || "An unexpected error occurred.");
            setViewState('FORM');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

            <div className="relative w-full max-w-[950px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[650px] animate-[popScale_0.3s_cubic-bezier(0.16,1,0.3,1)]">

                {/* SIDEBAR (Desktop) */}
                <div className="hidden md:flex w-[40%] bg-gray-50 text-gray-900 p-10 flex-col justify-between relative overflow-hidden border-r border-gray-100">
                    {/* Ambient Background */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                            <ShieldCheck size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Verified Merchant</span>
                        </div>
                        <h2 className="text-3xl font-display font-black leading-none mb-3 tracking-tight">Design <br />Collection</h2>
                        <div className="text-sm font-medium text-gray-500 mb-8">Lifetime Access • Premium Bundle</div>

                        <div className="flex items-baseline gap-3 mb-10">
                            <span className="text-6xl font-black text-gray-900 tracking-tighter">$49</span>
                            <span className="text-xl text-gray-600 line-through font-medium">$199</span>
                        </div>

                        <div className="space-y-4">
                            {['Instant PDF Download', 'Lifetime Updates Included', 'High-Res Diagrams', 'Mobile Optimized'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                    <div className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-primary shadow-sm"><Check size={12} strokeWidth={4} /></div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">JD</div>
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-[10px] font-bold">AS</div>
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">+2k</div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-900">Join 23,000+ Designers</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Community</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 bg-white flex flex-col relative h-full">

                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 z-20 bg-white">
                        <div className="flex flex-col">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Checkout</h3>
                            <div className="flex items-center gap-2 text-xs text-brand-primary font-bold mt-0.5">
                                <Timer size={12} className="animate-pulse" /> Offer expires in {timeLeft.m}:{timeLeft.s.toString().padStart(2, '0')}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"><X size={20} /></button>
                    </div>

                    {/* Scrollable Form Area */}
                    <div className="flex-1 px-6 py-6 overflow-y-auto custom-scrollbar">

                        {viewState === 'LOADING' && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl animate-pulse"></div>
                                    <Loader2 className="relative animate-spin text-brand-primary" size={48} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Preparing Collection...</h4>
                                    <p className="text-sm text-gray-400 mt-2 font-medium">Securing connection</p>
                                </div>
                            </div>
                        )}

                        {/* ADDING BOOKS ANIMATION */}
                        {viewState === 'ADDING_BOOKS' && (
                            <div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto w-full">
                                <div className="mb-8 text-center">
                                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                                        <FileCheck className="text-white animate-pulse" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Unlocking Bundle</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Adding items to cart</p>
                                </div>

                                <div className="w-full space-y-2">
                                    {COURSES.map((course, idx) => {
                                        const isAdded = idx < addedBooksCount;
                                        return (
                                            <div
                                                key={course.id}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ease-out transform ${isAdded
                                                    ? 'bg-white border-gray-100 shadow-sm opacity-100 translate-y-0 scale-100'
                                                    : 'bg-transparent border-transparent opacity-0 translate-y-4 scale-95'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isAdded ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-300'}`}>
                                                        <BookOpen size={12} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700">{course.title}</span>
                                                </div>
                                                <CheckCircle2 size={16} className={`transition-all duration-500 ${isAdded ? 'text-emerald-500 scale-100' : 'text-transparent scale-0'}`} />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {viewState === 'CONNECTION_ERROR' && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2"><WifiOff size={28} /></div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">Connection Failed</h4>
                                    <p className="text-sm text-gray-500 mt-2">Cannot reach payment gateway</p>
                                </div>
                                <button onClick={() => { setViewState('LOADING'); resetModal(); }} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center gap-2">
                                    <RefreshCcw size={16} /> Retry
                                </button>
                            </div>
                        )}

                        {(viewState === 'FORM' || viewState === 'PROCESSING') && (
                            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">

                                {/* MOBILE ONLY: Premium Value Header */}
                                <div className="md:hidden space-y-4 mb-4">
                                    {/* Product Summary Card */}
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-start gap-4 shadow-sm">
                                        <div className="w-14 h-16 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden shrink-0">
                                            <img src="https://i.pinimg.com/originals/d0/59/9a/d0599ab57ea81b6bb6746ea1bd697233.jpg" className="w-full h-full object-cover" alt="Bundle" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">6 Design Books</h4>
                                            <div className="flex items-center gap-2 text-xs mb-1.5">
                                                <span className="text-gray-600 line-through decoration-1">$199.00</span>
                                                <span className="text-brand-primary font-black bg-red-50 px-1.5 py-0.5 rounded border border-red-100">$49</span>
                                            </div>
                                            {/* High End Trust Badge */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1.5">
                                                    <div className="w-4 h-4 rounded-full border border-white bg-gray-200"></div>
                                                    <div className="w-4 h-4 rounded-full border border-white bg-gray-300"></div>
                                                    <div className="w-4 h-4 rounded-full border border-white bg-gray-800 flex items-center justify-center text-[6px] text-white font-bold">23k</div>
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-500">Trusted by 23,000+ Designers</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Payment Method Toggle (Global) */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod('card')}
                                        className={`relative flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all duration-200 whitespace-nowrap ${paymentMethod === 'card' ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <CreditCard size={18} />
                                        <span className="text-sm font-bold">Card</span>
                                        {paymentMethod === 'card' && (
                                            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                        )}
                                    </button>

                                    {!hidePayPalButton && (
                                    <button
                                        onClick={() => setPaymentMethod('paypal')}
                                        className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all duration-200 whitespace-nowrap ${paymentMethod === 'paypal' ? 'bg-[#0070ba]/5 border-[#0070ba] text-[#0070ba] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <img src={PAYPAL_LOGO_URL} alt="PayPal" className="h-5 object-contain" />
                                    </button>
                                    )}
                                </div>

                                {/* Bundle Contents List - Condensed */}
                                <div className="mb-2">
                                    <button
                                        onClick={() => setShowBundleDetails(!showBundleDetails)}
                                        className="w-full flex items-center justify-between mb-2 group"
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-800 transition-colors">Your Order</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                                                <CheckCircle2 size={10} strokeWidth={2.5} /> 6 Items
                                            </span>
                                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showBundleDetails ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showBundleDetails ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                                            {COURSES.map((course) => (
                                                <div key={course.id} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gray-900 transition-colors shrink-0"></div>
                                                        <span className="text-[11px] font-bold text-gray-600 truncate group-hover:text-gray-900 transition-colors">{course.title}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Email Input - STRIPE LINK STYLE with Glow */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 ml-1">Where to deliver books?</label>
                                    <div className="relative group transition-all duration-300">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className={`h-4 w-4 transition-colors ${emailError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand-primary'}`} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setEmailError(false); }}
                                            placeholder="name@example.com"
                                            className={`
                                        block w-full pl-10 pr-3 py-3 
                                        bg-white border text-sm font-medium rounded-xl shadow-sm 
                                        placeholder:text-gray-400 text-gray-900
                                        transition-all duration-200 ease-in-out
                                        focus:outline-none
                                        ${emailError
                                                    ? 'border-red-300 bg-red-50/50 focus:ring-red-100'
                                                    : 'border-gray-200 hover:border-gray-300 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10'
                                                }
                                    `}
                                        />
                                    </div>
                                </div>

                                {/* Verified Merchant Header */}
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                                        <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
                                            <ShieldCheck size={11} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[13px]">Verified Merchant</span>
                                    </div>
                                    <div className="w-5 h-5 flex items-center justify-center">
                                        <CheckCircle2 size={14} className="text-blue-500" />
                                    </div>
                                </div>

                                {/* Stripe Element */}
                                <div className={`${paymentMethod === 'card' ? 'block' : 'hidden'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className="min-h-[160px]">
                                        <div id="stripe-element-mount"></div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider opacity-60">
                                        <Lock size={9} /> 256-Bit SSL Encrypted Connection
                                    </div>
                                </div>

                                {/* PayPal View */}
                                <div className={`${paymentMethod === 'paypal' ? 'block' : 'hidden'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className="bg-[#0070ba]/5 border border-[#0070ba]/10 rounded-xl p-6 text-center">
                                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mx-auto mb-4 p-3 border border-gray-100">
                                            <img src={PAYPAL_LOGO_URL} alt="PayPal" className="w-full h-full object-contain" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">Pay with PayPal</h4>
                                        <p className="text-xs text-gray-500 mb-6 max-w-[200px] mx-auto leading-relaxed">Secure, fast checkout using your PayPal account.</p>

                                        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" onSubmit={handlePaypalSubmit}>
                                            <input type="hidden" name="cmd" value="_xclick" />
                                            <input type="hidden" name="business" value={PAYPAL_BUSINESS_EMAIL} />
                                            <input type="hidden" name="item_name" value="Avada Design Bundle" />
                                            <input type="hidden" name="amount" value="49" />
                                            <input type="hidden" name="currency_code" value="USD" />
                                            <input type="hidden" name="return" value={`${window.location.origin}/success?email=${email}&method=paypal`} />
                                            <input type="hidden" name="email" value={email} />
                                            <button type="submit" className="w-full py-3.5 bg-[#0070ba] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#005ea6] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 group text-xs">
                                                Proceed to PayPal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in border border-red-100">
                                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                            <AlertCircle size={14} />
                                        </div>
                                        {errorMessage}
                                    </div>
                                )}
                            </div>
                        )}

                        {viewState === 'SUCCESS' && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-8">
                                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20 animate-[popScale_0.5s]">
                                    <Check size={48} className="text-white" strokeWidth={4} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-display font-black text-gray-900 mb-2">Payment Successful</h3>
                                    <p className="text-gray-500 font-medium">Your books are ready for download.</p>
                                </div>

                                <button
                                    onClick={() => window.location.href = "https://drive.google.com/file/d/1FmP4WCWZ3RdHNvPlDK_X99TMcxrB0GPF/view?usp=drive_link"}
                                    className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black text-lg uppercase tracking-wider shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 premium-stroke"
                                >
                                    Download Books Now <Download size={22} strokeWidth={3} />
                                </button>

                                <div className="pt-2">
                                    <a
                                        href="https://wa.me/919198747810"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackMetaEvent({ eventName: 'Contact' })}
                                        className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 text-sm"
                                    >
                                        <MessageSquare size={16} fill="currentColor" stroke="none" />
                                        WhatsApp Support
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Button: Fixed at bottom */}
                    {(viewState === 'FORM' || viewState === 'PROCESSING') && paymentMethod === 'card' && (
                        <div className="p-5 md:p-6 border-t border-gray-100 bg-white shrink-0 z-20 pb-6 md:pb-6">
                            <button
                                onClick={handleCardPay}
                                disabled={viewState === 'PROCESSING'}
                                className="w-full py-4 bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#059669] text-white rounded-xl font-black text-lg uppercase tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] border border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out z-0"></div>
                                {viewState === 'PROCESSING' ? <Loader2 className="animate-spin relative z-10" /> : <><span className="relative z-10">Download Books</span> <Download size={20} className="relative z-10" strokeWidth={3} /></>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
