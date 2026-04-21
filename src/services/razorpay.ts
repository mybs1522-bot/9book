
import { PricingPlan } from "../types";

// UPDATED WITH LIVE KEY
const RAZORPAY_KEY_ID = 'rzp_live_Wh4xEHePkQXqRO'; 

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    address?: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => any;
  }
}

export const openRazorpayCheckout = (
  plan: PricingPlan, 
  userDetails: { name: string; email: string; phone: string },
  onSuccess: (paymentId: string) => void,
  onFailure: (error: any) => void
) => {
  if (!window.Razorpay) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    onFailure('SDK_NOT_LOADED');
    return;
  }

  // Parse "$1.58" -> 1.58. Multiply by 100 for minor units -> 158.
  const rawPrice = parseFloat(plan.price.replace(/[^0-9.]/g, ''));
  const amountInMinorUnits = Math.round(rawPrice * 100);

  const options: RazorpayOptions = {
    key: RAZORPAY_KEY_ID, 
    amount: amountInMinorUnits, 
    currency: "USD",
    name: "Avada Design",
    description: `${plan.duration} Bundle`,
    image: "https://d1yei2z3i6k35z.cloudfront.net/13138299/68654971c890d_Your-Numbered-Points-Title-Comes-Right-Here-9-min3.png",
    handler: function (response: any) {
      console.log("Payment Successful", response);
      onSuccess(response.razorpay_payment_id);
    },
    prefill: {
      name: userDetails.name,
      email: userDetails.email,
      contact: userDetails.phone
    },
    theme: {
      color: "#D90429"
    }
  };

  try {
    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response: any){
      console.error("Payment Failed", response.error);
      onFailure(response.error);
    });
    rzp1.open();
  } catch (error) {
    console.error("Razorpay Error", error);
    onFailure(error);
  }
};
