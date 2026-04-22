import React, { useState, useEffect } from 'react';
import {
    Check, ArrowRight, Star, BookOpen, Download, ShieldCheck,
    Sofa, Bed, Bath, Map, Target, Zap, X, AlertCircle, Loader2,
    Lock, Package
} from 'lucide-react';
import { trackMetaEvent } from '../utils/meta-tracking';

const STRIPE_PUBLISHABLE_KEY = "pk_live_51PRJCsGGsoQTkhyv6OrT4zvnaaB5Y0MSSkTXi0ytj33oygsfW3dcu6aOFa9q3dr2mXYTCJErnFQJcOcyuDAsQd4B00lIAdclbB";
const BACKEND_URL = "https://dhufnozehayzjlsmnvdl.supabase.co/functions/v1/create-intent-pay";
const PAYPAL_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg";
const PAYPAL_BUSINESS_EMAIL = "design@avada.in";

declare global { interface Window { Stripe?: (key: string) => any; } }

const UPSELL_BOOKS = [
    {
        id: 'living-room',
        title: 'Living Room Design', 
        icon: <Sofa size={20} />,
        color: 'from-orange-500 to-amber-500',
        tagline: 'The room every guest judges first',
        preview: 'https://drive.google.com/thumbnail?id=1YYJxA6NPSH23Oe3Nal_3QlW_DG0-mqKJ&sz=w1600',
        highlights: [
            'Furniture placement formulas that make rooms look 2× bigger',
            'Sofa-to-TV distance rules nobody tells you',
            'Colors that make living rooms feel luxurious on any budget',
            'The hidden "focal point" strategy used by every great designer',
        ]
    },
    {
        id: 'bedroom',
        title: 'Bedroom Design',
        icon: <Bed size={20} />,
        color: 'from-violet-600 to-purple-500',
        tagline: 'Where people sleep — and where deals are made',
        preview: 'https://drive.google.com/thumbnail?id=12APuUeW_CUcJxCYDG-R0PhmtwpKmWqs8&sz=w1600',
        highlights: [
            'Bed placement rules for best sleep quality & flow',
            'Wardrobe sizing formulas for every bedroom size',
            'Lighting layering to create hotel-quality atmosphere',
            'Master bedroom suites — how to plan your dream space',
        ]
    },
    {
        id: 'washroom',
        title: 'Washroom / Bathroom Design',
        icon: <Bath size={20} />,
        color: 'from-teal-600 to-cyan-500',
        tagline: 'The highest ROI room in any home',
        preview: 'https://drive.google.com/thumbnail?id=17CCyJ7HJhtPg3XPS8y9wf7SOG_kVMgf8&sz=w1600',
        highlights: [
            'Toilet clearance rules (most renovators get these wrong)',
            'Shower vs bathtub decision framework',
            'Wet room dimensions for small & large bathrooms',
            'Ventilation & waterproofing: what designers always specify',
        ]
    },
    {
        id: 'study',
        title: 'Study / Home Office Design',
        icon: <Target size={20} />,
        color: 'from-slate-700 to-slate-500',
        tagline: 'Where money is made & focused work happens',
        preview: 'https://drive.google.com/thumbnail?id=1dzA2UnKUd_S37XMjh53ZiuhviZAivH1B&sz=w1600',
        highlights: [
            'Desk ergonomics & monitor placement for zero neck strain',
            'Acoustic wall strategies for home offices & studios',
            'Built-in shelving dimensions done right',
            'Ideal lighting angles to prevent eye fatigue',
        ]
    },
    {
        id: 'elevations',
        title: 'Interior Elevations & Detailing',
        icon: <Map size={20} />,
        color: 'from-emerald-600 to-green-500',
        tagline: 'The professional drawings clients pay for',
        preview: 'https://drive.google.com/thumbnail?id=1_TGYyThr32ciEl7C7obqHnwq1_WOR8N2&sz=w1600',
        highlights: [
            'How to draw & read interior elevation drawings',
            'Standard millwork & joinery detail dimensions',
            'Door, window & niche detailing templates',
            'Complete furniture symbol library & standard heights',
        ]
    },
];

const COUNTDOWN_SECONDS = 15 * 60; // 15 minutes

export const OnetimePage: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [viewState, setViewState] = useState<'FORM' | 'PROCESSING' | 'SUCCESS'>('FORM');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hidePayPal, setHidePayPal] = useState(false);
    const [hasAddedPaymentInfo, setHasAddedPaymentInfo] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showDownsell, setShowDownsell] = useState(false);
    const [declined, setDeclined] = useState(false);
    const [oneClickProcessing, setOneClickProcessing] = useState(false);
    const [fromStripeCheckout, setFromStripeCheckout] = useState(false);
    const [savedPayment, setSavedPayment] = useState<{
        email: string;
        name: string | null;
        paymentMethodId: string | null;
        customerId: string | null;
        paymentIntentId: string;
        timestamp: number;
    } | null>(null);

    const stripeRef = React.useRef<any>(null);
    const elementsRef = React.useRef<any>(null);

    // Recover email from URL params and any saved payment from the prior checkout step
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const e = params.get('email');
        if (e) setEmail(e);

        const method = params.get('method');
        if (method === 'stripe') setFromStripeCheckout(true);
        try {
            const raw = sessionStorage.getItem('checkoutPayment');
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved && saved.email) {
                    setSavedPayment(saved);
                    setEmail((prev) => prev || saved.email);
                    if (saved.name) setName(saved.name);
                }
            }
        } catch { /* ignore storage errors */ }
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    // Countdown timer
    useEffect(() => {
        const stored = sessionStorage.getItem('upsell_timer');
        const now = Date.now();
        let target: number;
        if (stored) {
            target = parseInt(stored, 10);
            if (target <= now) {
                target = now + COUNTDOWN_SECONDS * 1000;
                sessionStorage.setItem('upsell_timer', target.toString());
            }
        } else {
            target = now + COUNTDOWN_SECONDS * 1000;
            sessionStorage.setItem('upsell_timer', target.toString());
        }

        const id = setInterval(() => {
            const diff = Math.max(0, target - Date.now());
            setTimeLeft(Math.floor(diff / 1000));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    // Meta tracking
    useEffect(() => {
        trackMetaEvent({
            eventName: 'ViewContent',
            content_name: '5 Interior Design Books Bundle — OTO',
            content_ids: ['5-interior-design-books-oto'],
            content_type: 'product',
            value: 27.00,
            currency: 'USD'
        });
    }, []);

    // Init Stripe instance early on mount so one-click flow can use it without opening the modal
    useEffect(() => {
        const loadStripe = (retry = 0) => {
            if (stripeRef.current) return;
            if (!window.Stripe) {
                if (retry < 20) setTimeout(() => loadStripe(retry + 1), 300);
                return;
            }
            stripeRef.current = window.Stripe(STRIPE_PUBLISHABLE_KEY);
        };
        loadStripe();
    }, []);

    const getStripeInstance = async () => {
        if (stripeRef.current) return stripeRef.current;
        for (let i = 0; i < 20; i += 1) {
            await new Promise((r) => setTimeout(r, 150));
            if (stripeRef.current) return stripeRef.current;
        }
        return null;
    };

    // Stripe Elements init (lazy, only when modal opens as fallback)
    useEffect(() => {
        if (!payModalOpen) return;
        if (elementsRef.current) return;
        const init = async (retry = 0) => {
            if (!stripeRef.current) {
                if (retry < 15) setTimeout(() => init(retry + 1), 300);
                return;
            }
            elementsRef.current = stripeRef.current.elements({
                mode: 'payment',
                amount: 2700,
                currency: 'usd',
                setupFutureUsage: 'off_session',
                automatic_payment_methods: { enabled: true },
                appearance: {
                    theme: 'stripe',
                    variables: { fontFamily: '"Inter", sans-serif', fontSizeBase: '14px', colorPrimary: '#ea580c', borderRadius: '8px' }
                }
            });
            const peOptions: any = { layout: 'tabs', fields: { billingDetails: { address: 'never' } } };
            if (email) peOptions.defaultValues = { billingDetails: { email } };
            const pe = elementsRef.current.create('payment', peOptions);
            setTimeout(() => {
                const container = document.getElementById('upsell-stripe-pe');
                if (container) pe.mount('#upsell-stripe-pe');
            }, 100);
            pe.on('change', (e: any) => {
                if (!e.empty) {
                    setHidePayPal(true);
                    if (!hasAddedPaymentInfo) {
                        trackMetaEvent({ eventName: 'AddPaymentInfo', content_name: '5 Interior Design Books Bundle', content_ids: ['5-interior-design-books-oto'], value: 27.00, currency: 'USD' });
                        setHasAddedPaymentInfo(true);
                    }
                }
            });
            const la = elementsRef.current.create('linkAuthentication', email ? { defaultValues: { email } } : {});
            setTimeout(() => {
                const c = document.getElementById('upsell-stripe-la');
                if (c) la.mount('#upsell-stripe-la');
            }, 100);
            la.on('change', (e: any) => { if (e.value?.email) setEmail(e.value.email); });
        };
        init();
    }, [payModalOpen]);

    const openModal = () => {
        setPayModalOpen(true);
        trackMetaEvent({ eventName: 'AddToCart', content_name: '5 Interior Design Books Bundle — OTO', content_ids: ['5-interior-design-books-oto'], value: 27.00, currency: 'USD' });
    };

    // One-click buy: attempts to charge the saved card from checkout without any UI.
    // Falls back to the full payment modal if anything fails.
    const handleBuyClick = async () => {
        trackMetaEvent({ eventName: 'AddToCart', content_name: '5 Interior Design Books Bundle — OTO', content_ids: ['5-interior-design-books-oto'], value: 27.00, currency: 'USD' });

        // If we have a saved payment method from checkout,
        // attempt a true one-click charge with no additional card entry.
        if (savedPayment?.paymentMethodId) {
            setOneClickProcessing(true);
            try {
                const resolvedName = name || (email ? email.split('@')[0].replace(/[._-]+/g, ' ').trim() : 'Customer');
                const res = await fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: [{ id: 'upsell-5books' }],
                        email,
                        name: resolvedName,
                        saved_payment_method: savedPayment.paymentMethodId,
                        customer_id: savedPayment.customerId,
                        autoconfirm_saved_pm: true,
                    })
                });
                if (!res.ok) throw new Error('Server error');
                const data = await res.json();

                // Server-side immediate charge succeeded (best case)
                if (data?.paid && data?.paymentIntentId) {
                    trackMetaEvent({ eventName: 'Purchase', email, value: 27.00, currency: 'USD', content_name: '5 Interior Design Books Bundle', content_ids: ['5-interior-design-books-oto'], order_id: data.paymentIntentId });
                    fetch("https://dhufnozehayzjlsmnvdl.supabase.co/functions/v1/send-book-order-email", {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, name: resolvedName, orderId: data.paymentIntentId, type: 'upsell-5books' })
                    }).catch(() => {});
                    setOneClickProcessing(false);
                    setViewState('SUCCESS');
                    return;
                }

                // If additional bank auth is required, confirm with clientSecret (still no card entry form)
                if (data?.clientSecret) {
                    const stripe = await getStripeInstance();
                    if (!stripe) throw new Error('Stripe not ready');

                    const result = await stripe.confirmCardPayment(data.clientSecret, {
                        payment_method: savedPayment.paymentMethodId,
                    });

                    if (result.error) throw new Error(result.error.message || 'Card declined');

                    if (result.paymentIntent?.status === 'succeeded') {
                        trackMetaEvent({ eventName: 'Purchase', email, value: 27.00, currency: 'USD', content_name: '5 Interior Design Books Bundle', content_ids: ['5-interior-design-books-oto'], order_id: result.paymentIntent.id });
                        fetch("https://dhufnozehayzjlsmnvdl.supabase.co/functions/v1/send-book-order-email", {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, name: resolvedName, orderId: result.paymentIntent.id, type: 'upsell-5books' })
                        }).catch(() => {});
                        setOneClickProcessing(false);
                        setViewState('SUCCESS');
                        return;
                    }
                }

                throw new Error('Auto charge failed');
            } catch (err: any) {
                console.warn('One-click payment failed:', err?.message);
                setOneClickProcessing(false);
                setErrorMessage('Auto payment could not be completed right now. Please try again in a moment.');
                return;
            }
        }

        // If the user paid via Stripe but we couldn't securely reuse their card,
        // we do NOT show a new card form (to avoid asking for card details again).
        if (fromStripeCheckout || !!savedPayment?.paymentMethodId) {
            setErrorMessage('Your original payment is complete. This one-time offer is currently unavailable because we could not securely reuse your card.');
            return;
        }

        // Non-Stripe visitors (PayPal / direct) use the full payment modal
        setPayModalOpen(true);
    };

    const handleCardPay = async () => {
        if (!stripeRef.current || !elementsRef.current) { setErrorMessage('Payment gateway loading, please wait.'); return; }
        setViewState('PROCESSING');
        setErrorMessage(null);
        try {
            const { error: submitError } = await elementsRef.current.submit();
            if (submitError) { setErrorMessage(submitError.message); setViewState('FORM'); return; }
            const resolvedName = name || (email ? email.split('@')[0].replace(/[._-]+/g, ' ').trim() : 'Customer');
            const res = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [{ id: 'upsell-5books' }],
                    email,
                    name: resolvedName,
                    // Hints for a true one-click flow when the backend supports saved PMs.
                    saved_payment_method: savedPayment?.paymentMethodId || null,
                    customer_id: savedPayment?.customerId || null,
                })
            });
            if (!res.ok) throw new Error('Payment server error.');
            const { clientSecret } = await res.json();
            const result = await stripeRef.current.confirmPayment({
                elements: elementsRef.current,
                clientSecret,
                confirmParams: {
                    return_url: window.location.origin + '/onetime?success=true',
                    receipt_email: email,
                    payment_method_data: { billing_details: { address: { country: 'US', state: 'CA', city: 'Los Angeles', line1: '123 Main St', line2: '', postal_code: '90001' } } }
                },
                redirect: 'if_required'
            });
            if (result.error) { setErrorMessage(result.error.message || 'Payment failed.'); setViewState('FORM'); }
            else if (result.paymentIntent?.status === 'succeeded') {
                trackMetaEvent({ eventName: 'Purchase', email, value: 27.00, currency: 'USD', content_name: '5 Interior Design Books Bundle', content_ids: ['5-interior-design-books-oto'], order_id: result.paymentIntent.id });
                fetch("https://dhufnozehayzjlsmnvdl.supabase.co/functions/v1/send-book-order-email", {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, name, orderId: result.paymentIntent.id, type: 'upsell-5books' })
                }).catch(() => {});
                setViewState('SUCCESS');
            }
        } catch (err: any) { setErrorMessage(err.message || 'An error occurred.'); setViewState('FORM'); }
    };

    const pad = (n: number) => n.toString().padStart(2, '0');
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    const isSuccess = new URLSearchParams(window.location.search).get('success') === 'true' || viewState === 'SUCCESS';

    // --- THANK YOU: paid for upsell → all 6 books ---
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-10 text-center space-y-6">
                    <div className="relative mx-auto w-20 h-20">
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
                            <Check size={40} className="text-white" strokeWidth={3} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">You've unlocked all 6 books! 🎉</h2>
                        <p className="text-gray-500 mt-2">Check your email for the download links. You now have the complete 6-book collection.</p>
                    </div>
                    <button onClick={() => window.location.href = "https://drive.google.com/drive/folders/1cVcmiL-fo3o--aA-2YnXTO5UkF_3ERHc"} className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2">
                        <Download size={20} /> Download All 6 Books
                    </button>
                </div>
            </div>
        );
    }

    // --- THANK YOU: declined upsell → kitchen book only ---
    if (declined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-10 text-center space-y-6">
                    <div className="relative mx-auto w-20 h-20">
                        <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-xl">
                            <BookOpen size={36} className="text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Your Kitchen Book is Ready!</h2>
                        <p className="text-gray-500 mt-2">Download your Kitchen Design Book below. It has also been sent to your email.</p>
                    </div>
                    <button onClick={() => window.location.href = "https://drive.google.com/file/d/1FmP4WCWZ3RdHNvPlDK_X99TMcxrB0GPF/view?usp=drive_link"} className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2">
                        <Download size={20} /> Download Kitchen Book
                    </button>
                    <p className="text-xs text-gray-400">You can always reach us at design@avada.in for support.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-white transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800;900&display=swap');
                .font-display { font-family: 'Outfit', sans-serif; }
                body { font-family: 'Inter', sans-serif; }
                @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(234,88,12,0.45); } 50% { box-shadow: 0 0 0 14px rgba(234,88,12,0); } }
                .pulse-cta { animation: pulse-glow 2s ease-in-out infinite; }
                @keyframes pulse-glow-light { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.65); } 50% { box-shadow: 0 0 0 16px rgba(255,255,255,0); } }
                .pulse-cta-light { animation: pulse-glow-light 2s ease-in-out infinite; }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .slide-up { animation: slide-up 0.5s ease-out forwards; }
                .book-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
                .book-card { transition: all 0.3s ease; }
            `}</style>

            {/* === URGENT NOTICE BAR === */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-2.5 text-center text-sm font-semibold">
                ⚡ Special one-time offer for new customers only — expires in <span className="font-mono font-black text-base mx-1 bg-white/20 px-2 py-0.5 rounded">{pad(mins)}:{pad(secs)}</span>
            </div>

            {/* === HEADER === */}
            <div className="max-w-4xl mx-auto px-5 pt-8 pb-4">
                {/* Congrats Header */}
                <div className="text-center mb-8 slide-up">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4 border border-emerald-200">
                        <Check size={14} /> Kitchen Book Purchased — You're In!
                    </div>
                    <h1 className="font-display text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-3">
                        Wait — Your Kitchen Book is Ready.<br />
                        <span style={{ background: 'linear-gradient(135deg, #ea580c, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            We have 5 More Books Every Designer Needs.
                        </span>
                    </h1>
                    <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
                        We have detailed book to Design <span className="font-bold text-orange-600">Elevations</span>, <span className="font-bold text-orange-600">Living Room</span>, <span className="font-bold text-orange-600">Bedroom</span>, <span className="font-bold text-orange-600">Washroom</span> and <span className="font-bold text-orange-600">Study</span>
                    </p>
                </div>

                {/* Price anchor */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 text-center mb-8 slide-up">
                    <p className="text-orange-700 text-sm font-bold uppercase tracking-widest mb-2">One-Time Exclusive Offer</p>
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <span className="text-3xl font-black text-gray-400 line-through decoration-red-500">$99</span>
                        <div>
                            <span className="text-6xl font-black text-orange-600">$27</span>
                            <span className="text-gray-500 text-sm ml-1">one-time</span>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">All 5 books. <strong>Instant PDF download. Lifetime updates. 30-day guarantee.</strong></p>
                    <button
                        onClick={handleBuyClick}
                        className="pulse-cta w-full md:w-auto px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-3"
                    >
                        YES! Add All 5 Books <ArrowRight size={20} />
                    </button>
                    <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                        <Lock size={11} /> Secure checkout · 30-day money-back guarantee
                    </p>
                    <button
                        onClick={() => document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' })}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-800 font-semibold transition-colors underline underline-offset-2"
                    >
                        No, I will Pass
                    </button>
                </div>

                {/* What you're missing — 5 books */}
                <div className="mb-10">
                    <h2 className="font-display text-2xl md:text-3xl font-black text-gray-900 text-center mb-2">
                        The 5 Rooms That Complete Your Design Knowledge
                    </h2>
                    <p className="text-gray-500 text-center text-sm mb-6">Each book is a complete standalone guide. Together, they turn you into a complete interior designer.</p>
                    <div className="space-y-4">
                        {UPSELL_BOOKS.map((book, i) => (
                            <div key={book.id} className="book-card bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                                <div className="relative md:w-60 shrink-0 h-56 md:h-auto bg-gray-100 overflow-hidden">
                                    <img src={book.preview} alt={book.title} loading="lazy" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                                    <div className={`absolute top-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br ${book.color} flex items-center justify-center text-white shadow-lg`}>
                                        {book.icon}
                                    </div>
                                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-black text-gray-900 uppercase tracking-wider shadow">
                                        Book {i + 2} of 6
                                    </div>
                                </div>
                                <div className="flex-1 p-5">
                                    <h3 className="font-display font-black text-gray-900 text-xl leading-tight">{book.title}</h3>
                                    <p className="text-orange-600 font-semibold text-sm italic mb-3">{book.tagline}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                                        {book.highlights.map((h, j) => (
                                            <div key={j} className="flex items-start gap-2 text-sm text-gray-600">
                                                <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                                <span>{h}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why get all 6 together */}
                <div className="bg-gray-900 text-white rounded-3xl p-8 mb-10">
                    <h2 className="font-display text-2xl md:text-3xl font-black mb-4 text-center">
                        The <span className="text-orange-400">Complete Designer</span> Advantage
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { icon: <Zap size={20} />, title: 'Design Any Room', text: 'When a client asks you about their bedroom, you won\'t need to Google dimensions. It\'ll be in your hands.' },
                            { icon: <Target size={20} />, title: 'Skip Costly Mistakes', text: 'Every room book has clearance charts, setback rules and layouts that took years to master.' },
                            { icon: <Star size={20} />, title: 'Charge Extra', text: 'Designers who can handle the full home charge 3× more than specialists. This completes your offer.' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <div className="text-orange-400 mb-3">{item.icon}</div>
                                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social proof */}
                <div className="mb-10">
                    <h2 className="font-display text-2xl font-black text-center text-gray-900 mb-6">What Readers Say About the Full Collection</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { name: 'Olivia R.', role: 'Interior Designer, Dubai', quote: 'I bought the kitchen book first, then came back for the rest immediately. The bedroom and bathroom books alone saved me from 3 contractor errors on a $80k project.' },
                            { name: 'Daniel K.', role: 'Real Estate Developer', quote: 'These books are my pre-construction checklist for every unit. Every dimension, every clearance. A $27 upsell that\'s paid for itself 20 times over.' },
                            { name: 'Priya M.', role: 'Architecture Student', quote: 'The study room and elevations book are gems. They\'re practical in a way textbooks never are — actual numbers you can give to contractors.' },
                            { name: 'James T.', role: 'Homeowner renovating', quote: 'I had just bought the kitchen book when this appeared. Best $27 I ever spent. The bathroom book alone changed how I planned my entire master suite.' },
                        ].map((t, i) => (
                            <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                                <div className="flex gap-0.5 mb-3">
                                    {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                                    <p className="text-gray-500 text-xs">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div id="final-cta" className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8 text-center mb-8">
                    <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-2">Complete Your Library for Just $27</h2>
                    <p className="text-orange-100 mb-6 text-sm md:text-base">5 books · instant download · lifetime updates · 30-day guarantee. This page won't appear again.</p>
                    <button
                        onClick={handleBuyClick}
                        className="pulse-cta-light bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-3"
                    >
                        YES! Add All 5 Books <ArrowRight size={20} />
                    </button>
                    <button
                        onClick={() => setShowDownsell(true)}
                        className="mt-4 block mx-auto text-sm text-white/80 hover:text-white font-semibold transition-colors underline underline-offset-2"
                    >
                        No, I will Pass
                    </button>
                </div>
                <div className="pb-10" />
            </div>

            {/* === DOWNSELL / EXIT CONFIRMATION === */}
            {showDownsell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden slide-up">
                        <div className="bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 p-6 text-center">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full mx-auto flex items-center justify-center mb-3 border-2 border-white/40">
                                <AlertCircle size={28} className="text-white" strokeWidth={2.5} />
                            </div>
                            <h3 className="font-display text-2xl font-black text-white">Wait! Are you sure?</h3>
                            <p className="text-orange-50 text-sm mt-1">This page won't appear again.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-700 text-sm text-center leading-relaxed">
                                You're about to walk away from <strong>5 complete design books</strong> worth <span className="line-through text-gray-400">$99</span> <span className="text-orange-600 font-black">$27</span> — a <strong>$72 savings</strong> that disappears the second you close this tab.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                                <p className="font-bold mb-1">What you'll miss:</p>
                                <ul className="space-y-0.5 pl-4 list-disc">
                                    <li>Living Room, Bedroom, Bathroom, Study & Elevation books</li>
                                    <li>Lifetime PDF access + future updates</li>
                                    <li>30-day money-back guarantee</li>
                                </ul>
                            </div>

                            {/* Big pulsing push-back-to-sale */}
                            <button
                                onClick={() => { setShowDownsell(false); handleBuyClick(); }}
                                className="pulse-cta w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-black text-base shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={18} strokeWidth={3} /> YES — Save $72 & Add All 5 Books
                            </button>

                            {/* Confusing second choice — sounds like decline, actually re-opens offer */}
                            <button
                                onClick={() => setShowDownsell(false)}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
                            >
                                Actually, let me review the offer again
                            </button>

                            {/* Final true-decline — show kitchen-only thank you */}
                            <button
                                onClick={() => { setShowDownsell(false); setDeclined(true); }}
                                className="w-full text-[10px] text-gray-400 hover:text-gray-600 hover:underline underline-offset-2"
                            >
                                No, I'd rather lose the $72 discount and leave the books behind →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === ONE-CLICK PROCESSING OVERLAY === */}
            {oneClickProcessing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
                    <div className="text-center space-y-4 animate-pulse">
                        <Loader2 className="animate-spin mx-auto text-orange-500" size={48} />
                        <p className="text-gray-800 font-bold text-lg">Processing your payment...</p>
                        <p className="text-gray-400 text-sm">Using your saved card. Just a moment.</p>
                    </div>
                </div>
            )}

            {/* === PAYMENT MODAL === */}
            {payModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        {viewState === 'SUCCESS' ? (
                            <div className="p-8 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                                    <Check size={32} className="text-white" />
                                </div>
                                <h3 className="font-display text-2xl font-black text-gray-900">All 5 books unlocked! 🎉</h3>
                                <p className="text-gray-500 text-sm">Check your email for download links. You now own the full 6-book collection.</p>
                                <button onClick={() => window.location.href = "https://drive.google.com/drive/folders/1cVcmiL-fo3o--aA-2YnXTO5UkF_3ERHc"} className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black flex items-center justify-center gap-2">
                                    <Download size={18} /> Download All 6 Books
                                </button>
                            </div>
                        ) : (
                            <div>
                                {/* Modal header */}
                                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                    <div>
                                        <h3 className="font-display font-black text-gray-900 text-lg">Add 5 Books — $27</h3>
                                        <p className="text-xs text-gray-500">Instant PDF download · Lifetime updates</p>
                                    </div>
                                    <button onClick={() => setPayModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Order summary inside modal */}
                                <div className="px-5 pt-4 space-y-2">
                                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">5 Interior Design Books Bundle</p>
                                            <p className="text-xs text-gray-500">Living Room · Bedroom · Bathroom · Study · Elevations</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-black text-orange-600">$27</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stripe form */}
                                <div className="px-5 pb-5 pt-3 space-y-4">
                                    {savedPayment && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                                            <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="font-bold text-emerald-900 text-sm">Your card is saved</p>
                                                <p className="text-emerald-700 text-xs mt-0.5 leading-snug">One-tap checkout with the card from your kitchen book order. No need to re-enter details.</p>
                                            </div>
                                        </div>
                                    )}
                                    <div id="upsell-stripe-la" className="min-h-[40px]" />
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 mb-1 block">Payment method</label>
                                        <div id="upsell-stripe-pe" className="min-h-[44px]" />
                                    </div>

                                    {errorMessage && (
                                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2 border border-red-100">
                                            <AlertCircle size={14} className="shrink-0" /> {errorMessage}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleCardPay}
                                        disabled={viewState === 'PROCESSING'}
                                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-black text-base shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {viewState === 'PROCESSING' ? <Loader2 className="animate-spin" size={20} /> : <><Package size={18} /> Add 5 Books — $27</>}
                                    </button>

                                    {!hidePayPal && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-px bg-gray-200" />
                                                <span className="text-[10px] font-semibold text-gray-400 uppercase">OR</span>
                                                <div className="flex-1 h-px bg-gray-200" />
                                            </div>
                                            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                                                <input type="hidden" name="cmd" value="_xclick" />
                                                <input type="hidden" name="business" value={PAYPAL_BUSINESS_EMAIL} />
                                                <input type="hidden" name="item_name" value="5 Interior Design Books Bundle — OTO" />
                                                <input type="hidden" name="amount" value="27" />
                                                <input type="hidden" name="currency_code" value="USD" />
                                                <input type="hidden" name="return" value={`${window.location.origin}/onetime?success=true&email=${email}`} />
                                                <input type="hidden" name="email" value={email} />
                                                <button type="submit" className="w-full py-3.5 bg-[#ffc439] hover:bg-[#f0b72e] text-gray-900 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2">
                                                    Pay with <img src={PAYPAL_LOGO_URL} alt="PayPal" className="h-5 object-contain" />
                                                </button>
                                            </form>
                                        </>
                                    )}

                                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium">
                                        <Lock size={10} /> 256-bit SSL · Powered by Stripe
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
