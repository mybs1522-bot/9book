import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-5">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
        <button 
          onClick={goBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-gray-900">Refund Policy</h1>
        </div>

        <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
          <p>
            Thank you for purchasing The Kitchen Design Book. We want to ensure that you are fully satisfied with your purchase. Please read our refund policy carefully regarding digital products.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Digital Products & E-Books</h2>
          <p>
            Due to the digital nature of this item, standard purchases are generally <strong>non-refundable once the files have been downloaded</strong>. Digital goods are delivered instantly and cannot be physically returned, making it impossible for us to verify that the product is no longer in use.
          </p>
          <p>
            We highly encourage you to review the preview images, check the provided dimensions/formats, and reach out to us with any questions before completing your purchase.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7-Day Conditional Refund</h2>
          <p>
            We do offer a conditional refund policy: <strong>If you have not downloaded all the files associated with your purchase</strong>, you may request a full refund within <strong>7 days</strong> of your original transaction. 
          </p>
          <p>
            To be eligible for this refund, our system must verify that the core digital assets (the e-books) have not been fully downloaded to your device. Once all items are downloaded, the purchase becomes final.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">How to Request a Refund</h2>
          <p>
            To request a refund under the 7-day conditional policy, please contact our support team. Provide your order number and the email address used during checkout. Our team will verify your download history and process the refund accordingly.
          </p>

          <p className="mt-12 text-sm text-gray-500 italic">
            Last updated: Oct 21, 2025
          </p>
        </div>
      </div>
    </div>
  );
};
