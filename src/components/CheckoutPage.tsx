import React, { useState, useEffect, useRef } from 'react';
import {
    Lock, Check, Loader2, Timer, CreditCard, Mail, ShieldCheck, AlertCircle,
    ArrowLeft, BookOpen, CheckCircle2, Download, Star, Shield, Clock,
    MessageSquare
} from 'lucide-react';
import { trackMetaEvent } from '../utils/meta-tracking';
import { BOOK_IMAGES } from '../AppHelpers';

// --- CONFIGURATION ---
const STRIPE_PUBLISHABLE_KEY = "pk_live_51PRJCsGGsoQTkhyv6OrT4zvnaaB5Y0MSSkTXi0ytj33oygsfW3dcu6aOFa9q3dr2mXYTCJErnFQJcOcyuDAsQd4B00lIAdclbB";
const BACKEND_URL = "https://dhufnozehayzjlsmnvdl.supabase.co/functions/v1/create-intent-pay";
const PAYPAL_BUSINESS_EMAIL = "design@avada.in";
const PAYPAL_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg";

declare global {
    interface Window {
        Stripe?: (key: string) => any;
    }
}

// Book labels for the order summary
const BOOK_LABELS = [
    { key: 'living', label: 'Living Room Design' },
    { key: 'kitchen', label: 'Kitchen Design' },
    { key: 'bedroom', label: 'Bedroom Design' },
    { key: 'washroom', label: 'Washroom Design' },
    { key: 'study', label: 'Study Design' },
    { key: 'elevations', label: 'Elevations Design' },
];

/**
 * REFINED CHECKOUT COMPONENT
 * Implements Stripe Link, Unified Payment Element, 8px grid, and monochrome design.
 */
export const CheckoutPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Meta InitiateCheckout
    useEffect(() => {
        trackMetaEvent({
            eventName: 'InitiateCheckout',
            value: 9.00,
            currency: 'USD',
            content_name: 'Kitchen Design Book',
            content_ids: ['kitchen-design-book'],
            content_type: 'product'
        });
    }, []);

    // --- STATE ---
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isStripeLoaded, setIsStripeLoaded] = useState(false);
    const [viewState, setViewState] = useState<'FORM' | 'PROCESSING' | 'SUCCESS'>('FORM');
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [hidePayPal, setHidePayPal] = useState(false);
    const [hasAddedPaymentInfo, setHasAddedPaymentInfo] = useState(false);

    const stripeRef = useRef<any>(null);
    const elementsRef = useRef<any>(null);

    // --- ENTRANCE ANIMATION ---
    useEffect(() => { requestAnimationFrame(() => setIsVisible(true)); }, []);

    // --- TIMER (synced with landing page via shared localStorage key) ---
    useEffect(() => {
        const INITIAL_SECONDS = (4 * 3600) + (36 * 60) + 27;
        const getTarget = () => {
            const stored = localStorage.getItem('timer_target');
            const now = Date.now();
            if (stored) {
                const target = parseInt(stored, 10);
                if (target > now) return target;
            }
            const newTarget = now + (INITIAL_SECONDS * 1000);
            localStorage.setItem('timer_target', newTarget.toString());
            return newTarget;
        };
        const target = getTarget();
        const calc = () => {
            const diff = Math.max(0, target - Date.now());
            setTimeLeft({ h: Math.floor(diff / (1000 * 60 * 60)), m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), s: Math.floor((diff % (1000 * 60)) / 1000) });
        };
        const t = setInterval(calc, 1000); calc();
        return () => clearInterval(t);
    }, []);

    // --- STRIPE INIT ---
    useEffect(() => {
        if (!stripeRef.current) initializeStripeUI();
    }, []);

    const initializeStripeUI = async (retry = 0) => {
        try {
            if (!window.Stripe) {
                if (retry < 5) setTimeout(() => initializeStripeUI(retry + 1), 500);
                return;
            }
            if (stripeRef.current) return;

            stripeRef.current = window.Stripe(STRIPE_PUBLISHABLE_KEY);
            elementsRef.current = stripeRef.current.elements({
                mode: 'payment',
                amount: 900,
                currency: 'usd',
                automatic_payment_methods: { enabled: true },

                appearance: {
                    theme: 'stripe',
                    variables: {
                        fontFamily: '"Inter", -apple-system, sans-serif',
                        fontSizeBase: '15px',
                        colorPrimary: '#0570DE',
                        colorText: '#0B0F19',
                        colorTextPlaceholder: '#4B5563',
                        colorTextSecondary: '#111827',
                        borderRadius: '8px',
                        fontWeightNormal: '500',
                        fontWeightMedium: '600',
                    },
                    rules: {
                        '.Input': {
                            fontSize: '15px',
                            color: '#0B0F19',
                            fontWeight: '500',
                        },
                        '.Input::placeholder': {
                            color: '#4B5563',
                            fontWeight: '500',
                        },
                        '.Label': {
                            fontSize: '14px',
                            color: '#0B0F19',
                            fontWeight: '600',
                        },
                        '.Tab': {
                            color: '#111827',
                            fontWeight: '600',
                        },
                        '.TabLabel': {
                            fontWeight: '600',
                        },
                    },
                },
            });

            // Payment Element — handles cards, Link, Google Pay, etc.
            const paymentElement = elementsRef.current.create('payment', {
                layout: 'tabs',
                fields: {
                    billingDetails: {
                        address: 'never',
                    },
                },
            });
            const peMount = document.getElementById('stripe-payment-element');
            if (peMount) paymentElement.mount('#stripe-payment-element');

            // Hide PayPal when user starts entering card digits
            paymentElement.on('change', (event: any) => {
                // Only hide PayPal when user has actually started typing (not empty is true when input has content)
                if (!event.empty) {
                    setHidePayPal(true);
                    
                    // Meta AddPaymentInfo (fire only once)
                    if (!hasAddedPaymentInfo) {
                        trackMetaEvent({
                            eventName: 'AddPaymentInfo',
                            content_name: 'Kitchen Design Book',
                            content_ids: ['kitchen-design-book'],
                            content_type: 'product',
                            value: 9.00,
                            currency: 'USD'
                        });
                        setHasAddedPaymentInfo(true);
                    }
                }
            });

            // Link authentication element — captures email and enables Link autofill
            const linkAuth = elementsRef.current.create('linkAuthentication', {});
            const linkMount = document.getElementById('stripe-link-auth');
            if (linkMount) linkAuth.mount('#stripe-link-auth');
            linkAuth.on('change', (event: any) => {
                if (event.value?.email) {
                    setEmail(event.value.email);
                    setEmailError(false);
                    setErrorMessage(null);
                }
            });

            setIsStripeLoaded(true);
        } catch (err: any) {
            console.error("Stripe Init Failed:", err);
            setErrorMessage("Card gateway unavailable. Please try PayPal.");
            setIsStripeLoaded(false);
        }
    };

    const handlePaypalSubmit = (e: React.FormEvent) => {
        let hasError = false;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError(true); hasError = true; }
        if (hasError) {
            e.preventDefault();
            setErrorMessage("Please fill in your email to continue.");
            return;
        }

        // Meta AddPaymentInfo for PayPal
        if (!hasAddedPaymentInfo) {
            trackMetaEvent({
                eventName: 'AddPaymentInfo',
                content_name: 'Kitchen Design Book',
                content_ids: ['kitchen-design-book'],
                content_type: 'product',
                value: 9.00,
                currency: 'USD',
                payment_type: 'paypal'
            });
            setHasAddedPaymentInfo(true);
        }

        setViewState('PROCESSING');
    };

    const handleCardPay = async () => {
        if (!stripeRef.current || !elementsRef.current) {
            setErrorMessage("Payment gateway loading. Please wait a moment.");
            return;
        }
        setViewState('PROCESSING');
        setErrorMessage(null);

        try {
            // 1. Submit elements (validates card + Link)
            const { error: submitError } = await elementsRef.current.submit();
            if (submitError) {
                setErrorMessage(submitError.message || "Please check your payment details.");
                setViewState('FORM');
                return;
            }

            // 2. Create PaymentIntent on server
            const res = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [{ id: 'lifetime-bundle' }], email, name: name || (email ? email.split('@')[0].replace(/[._-]+/g, ' ').trim() : 'Customer') })
            });
            if (!res.ok) {
                if (res.status === 404) throw new Error("Payment server unavailable. Please try PayPal.");
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Server error: ${res.status}`);
            }
            const { clientSecret } = await res.json();

            // 3. Confirm payment with elements
            const result = await stripeRef.current.confirmPayment({
                elements: elementsRef.current,
                clientSecret,
                confirmParams: {
                    // If Stripe needs to redirect for 3D Secure, come back directly to the upsell page
                    // so the user is not shown an extra checkout success screen.
                    return_url: window.location.origin + '/onetime?success=true&email=' + encodeURIComponent(email) + '&method=stripe',
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
                redirect: 'if_required',
            });

            if (result.error) {
                setErrorMessage(result.error.message || "Payment failed.");
                setViewState('FORM');
            } else if (result.paymentIntent?.status === 'succeeded') {
                trackMetaEvent({
                    eventName: 'Purchase',
                    email,
                    value: 9.00,
                    currency: 'USD',
                    content_name: 'Kitchen Design Book',
                    content_ids: ['kitchen-design-book'],
                    content_type: 'product',
                    order_id: result.paymentIntent.id
                });
                fetch("https://dhufnozehayzjlsmnvdl.supabase.co/functions/v1/send-book-order-email", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, name, orderId: result.paymentIntent.id })
                }).catch(err => console.error("Email trigger failed:", err));

                // Persist payment info so the upsell page can skip re-entry of card details.
                // Stripe Link already auto-remembers the card for the same email; this extra store
                // lets us attempt a true one-click upsell when the backend supports saved PMs.
                try {
                    sessionStorage.setItem('checkoutPayment', JSON.stringify({
                        email,
                        name: name || null,
                        paymentMethodId: result.paymentIntent.payment_method || null,
                        customerId: (result.paymentIntent as any).customer || null,
                        paymentIntentId: result.paymentIntent.id,
                        timestamp: Date.now(),
                    }));
                } catch { /* storage unavailable — fine, falls back to Link */ }

                // Immediately redirect to upsell page; no intermediate checkout success/download screen.
                window.location.href = '/onetime?email=' + encodeURIComponent(email) + '&method=stripe';
            }
        } catch (err: any) {
            setErrorMessage(err.message || "An unexpected error occurred.");
            setViewState('FORM');
        }
    };

    const goBack = () => { window.location.href = '/'; };
    const pad = (n: number) => n.toString().padStart(2, '0');

    // --- RENDER ---
    return (
        <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                .checkout-container * { font-family: 'Inter', -apple-system, sans-serif; }
                .stripe-input-wrapper { min-height: 20px; }
                .book-scroll { display: flex; gap: 6px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 4px; }
                .book-scroll::-webkit-scrollbar { display: none; }
                .book-scroll > div { scroll-snap-align: start; flex: 1 1 0; min-width: 0; }
                @media (min-width: 640px) { .book-scroll { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; overflow: visible; } }
            `}</style>

            {/* === HEADER === */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <button onClick={goBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center">
                            <BookOpen size={14} className="text-white" />
                        </div>
                        <span className="font-semibold text-sm text-gray-900">Interior Design Books</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <Lock size={12} />
                        <span className="hidden sm:inline">Secure Checkout</span>
                    </div>
                </div>
            </header>

            {/* === TIMER === */}
            <div className="flex items-center justify-center gap-1.5 py-1.5 text-gray-600">
                <Timer size={11} />
                <span className="text-[11px] font-semibold tracking-wide">Offer ends in</span>
                <span className="font-mono text-[11px] font-bold text-gray-900">{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}</span>
            </div>

            {/* === MAIN CONTENT === */}
            <div className="checkout-container max-w-5xl mx-auto px-4 sm:px-6 py-4 lg:py-6">

                {/* SUCCESS VIEW */}
                {viewState === 'SUCCESS' && (
                    <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-200 shadow-lg p-10 text-center space-y-6">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                                <Check size={40} className="text-white" strokeWidth={3} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Payment Successful!</h3>
                            <p className="text-gray-600 text-sm mt-2">Your interior design collection is ready.</p>
                        </div>
                        <button
                            onClick={() => window.location.href = "https://drive.google.com/file/d/1FmP4WCWZ3RdHNvPlDK_X99TMcxrB0GPF/view?usp=drive_link"}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-base shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            Download Now <Download size={18} />
                        </button>
                        <a href="https://wa.me/919198747810" target="_blank" rel="noopener noreferrer"
                            onClick={() => trackMetaEvent({ eventName: 'Contact' })}
                            className="inline-flex items-center gap-2 text-gray-600 text-xs font-semibold hover:text-gray-900 transition-colors">
                            <MessageSquare size={14} /> Need help? WhatsApp us
                        </a>
                    </div>
                )}

                {/* FORM VIEW */}
                {(viewState === 'FORM' || viewState === 'PROCESSING') && (
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">

                        {/* ========== LEFT COLUMN: ORDER SUMMARY ========== */}
                        <div className="flex-1 lg:max-w-[50%]">
                            <div className="lg:sticky lg:top-4">

                                {/* ========== PROFESSIONAL ORDER SUMMARY ========== */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                                    {/* Header */}
                                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Order Summary</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">1 item</span>
                                    </div>

                                    {/* Line item with book-cover thumbnail */}
                                    <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-4">
                                        <div className="w-16 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0 bg-gray-50">
                                            <img
                                                src="https://drive.google.com/thumbnail?id=1AlxdHun9I2AO639g4Q0YJv_BOzb9sbZe&sz=w1600"
                                                alt="Kitchen Design Book"
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 text-sm leading-tight mb-0.5">Kitchen Design Book</p>
                                            <p className="text-xs text-gray-500 leading-snug mb-2">150 pages · Digital PDF · Instant Download</p>
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="text-xs text-gray-400 line-through">$29.00</span>
                                                <span className="text-lg font-black text-gray-900">$9.00</span>
                                                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100">Save 69%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview image */}
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                            <img
                                                src="https://public-files.gumroad.com/jdsybp7nttskx7194egkk6jb9gbp"
                                                alt="Kitchen Design Book — Preview"
                                                className="w-full h-auto block"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>

                                    {/* What's included */}
                                    <div className="px-5 py-4 space-y-2.5 bg-gray-50/40">
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <Download size={14} className="text-emerald-600 shrink-0" />
                                            <span className="text-gray-700 font-medium">Instant PDF Download</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <BookOpen size={14} className="text-emerald-600 shrink-0" />
                                            <span className="text-gray-700 font-medium">Lifetime Updates · No extra charge</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                                            <span className="text-gray-700 font-medium">30-Day Money-Back Guarantee</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* ========== RIGHT COLUMN: PAYMENT FORM ========== */}
                        <div className="flex-1 lg:max-w-[50%]">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                                {/* Billing Information */}
                                <div className="px-5 pt-5 space-y-5">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-950 mb-2.5 tracking-tight">Billing Information</h3>
                                        <div className="space-y-2">
                                            {/* Stripe Link Authentication */}
                                            <div id="stripe-link-auth" className={emailError ? 'ring-2 ring-red-400 rounded-lg' : ''} />
                                        </div>
                                    </div>

                                    {/* Payment method — Stripe Payment Element */}
                                    <div>
                                        <h3 className="text-base font-bold text-gray-950 mb-2.5 tracking-tight">Payment Method</h3>
                                        <div id="stripe-payment-element" />
                                    </div>

                                    {/* Error */}
                                    {errorMessage && (
                                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2 border border-red-100">
                                            <AlertCircle size={14} className="shrink-0" />
                                            {errorMessage}
                                        </div>
                                    )}
                                </div>

                                {/* Download button + PayPal */}
                                <div className="px-5 pb-5 pt-3 space-y-2">
                                    <button
                                        onClick={handleCardPay}
                                        disabled={viewState === 'PROCESSING'}
                                        className="w-full py-3.5 bg-[#0570DE] hover:bg-[#0462c7] text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
                                    >
                                        {viewState === 'PROCESSING' ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <><Download size={18} /><span>Download Book</span></>
                                        )}
                                    </button>

                                    {/* OR divider */}
                                    {!hidePayPal && (
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-px bg-gray-200" />
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase">OR</span>
                                            <div className="flex-1 h-px bg-gray-200" />
                                        </div>
                                    )}

                                    {/* PayPal button */}
                                    {!hidePayPal && (
                                    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" onSubmit={handlePaypalSubmit}>
                                        <input type="hidden" name="cmd" value="_xclick" />
                                        <input type="hidden" name="business" value={PAYPAL_BUSINESS_EMAIL} />
                                        <input type="hidden" name="item_name" value="Kitchen Design Book" />
                                        <input type="hidden" name="amount" value="9" />
                                        <input type="hidden" name="currency_code" value="USD" />
                                        <input type="hidden" name="return" value={`${window.location.origin}/onetime?email=${email}&method=paypal`} />
                                        <input type="hidden" name="email" value={email} />
                                        <button
                                            type="submit"
                                            className="w-full py-3.5 bg-[#ffc439] hover:bg-[#f0b72e] text-gray-900 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                                        >
                                            Download with <img src={PAYPAL_LOGO_URL} alt="PayPal" className="h-5 object-contain" />
                                        </button>
                                    </form>
                                    )}

                                    {/* Powered by Stripe */}
                                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-600 font-medium">
                                        <span>Powered by</span>
                                        <span className="font-bold text-gray-500">stripe</span>
                                        <span className="mx-1">•</span>
                                        <span>Terms</span>
                                        <span className="mx-1">•</span>
                                        <span>Privacy</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security note */}
                            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-600 font-medium">
                                <Lock size={11} />
                                <span>256-bit SSL encrypted • Your payment info is secure</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
