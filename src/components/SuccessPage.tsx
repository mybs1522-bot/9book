import React, { useEffect } from 'react';
import { Check, Download, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { trackMetaEvent } from '../utils/meta-tracking';

export const SuccessPage: React.FC = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get('email') || '';
    const method = searchParams.get('method') || 'unknown';
    const stripeId = searchParams.get('payment_intent');

    useEffect(() => {
        if (email) {
            console.log(`SuccessPage: Triggering email for ${email} (via ${method})`);
            const orderId = method === 'paypal' ? (searchParams.get('tx') || 'paypal-pending') : (stripeId || 'stripe-order');

            // Meta Purchase Tracking
            trackMetaEvent({
                eventName: 'Purchase',
                email: email,
                value: 49.00,
                currency: 'USD',
                content_name: 'Interior Design System - 6 Book Collection',
                content_ids: ['interior-design-system-6-books'],
                content_type: 'product',
                order_id: orderId
            });

            fetch("https://dhufnozehayzjlsmnvdl.supabase.co/functions/v1/send-book-order-email", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, orderId })
            }).catch(err => console.error("Email trigger failed:", err));
        }
    }, [email, method, stripeId, searchParams]);

    const handleDownload = () => {
        window.location.href = "https://drive.google.com/file/d/1FmP4WCWZ3RdHNvPlDK_X99TMcxrB0GPF/view?usp=drive_link";
    };

    return (
        <div className="min-h-screen bg-[#FDFAF6] flex items-center justify-center p-4 sm:p-6">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden text-center p-8 sm:p-12 space-y-8 animate-in fade-in zoom-in duration-700">

                {/* Success Icon */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                        <Check size={48} className="text-white" strokeWidth={3} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-display font-black text-gray-900 leading-tight">
                        Order Confirmed!
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Your interior design book collection is ready for you.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 font-medium border border-gray-100 italic">
                    "We've also sent the download links to <strong>{email || 'your email'}</strong> just in case."
                </div>

                {/* Primary CTA */}
                {/* This button is removed as per the instruction, replaced by the new block below */}
                {/* <button
                    onClick={handleDownload}
                    className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black text-lg uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 premium-stroke"
                >
                    Download Books Now <Download size={20} strokeWidth={3} />
                </button> */}

                {/* Support Link */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
                    <p className="text-gray-600 font-medium">Your collection is ready for immediate access.</p>
                    <button
                        onClick={() => window.location.href = "https://drive.google.com/file/d/1FmP4WCWZ3RdHNvPlDK_X99TMcxrB0GPF/view?usp=drive_link"}
                        className="w-full py-4 bg-orange-500 text-white rounded-xl font-black text-lg uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        Download Files <Download size={20} strokeWidth={3} />
                    </button>
                    <div className="pt-2">
                        <a
                            href="https://wa.me/919198747810"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackMetaEvent({ eventName: 'Contact' })}
                            className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100"
                        >
                            <MessageSquare size={16} fill="currentColor" stroke="none" />
                            WhatsApp Support
                        </a>
                    </div>
                </div>

                <button
                    onClick={() => window.location.href = '/'}
                    className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest block mx-auto underline underline-offset-4"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};
