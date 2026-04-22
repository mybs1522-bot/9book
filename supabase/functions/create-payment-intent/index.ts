import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// This Edge Function creates Stripe PaymentIntents for three flows:
// - lifetime-bundle  → $9.00 (Kitchen Design Book)
// - upsell-5books    → $27.00 (5 additional books)
// - hardcopy         → e.g. $99.00 (printed book) — adjust if needed

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

if (!STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set in Supabase secrets");
}

// Lazy import Stripe to avoid startup cost if not needed
let stripe: any;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    if (!STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (!stripe) {
      // @ts-ignore - Stripe is loaded from npm in Deno
      const { Stripe } = await import("npm:stripe@13.11.0");
      stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: "2024-04-10",
      });
    }

    const body = await req.json();
    const { items, email, name, saved_payment_method, customer_id } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items in request" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const item = items[0];

    // Map product IDs to exact USD amounts (in cents)
    let amount = 0;
    if (item.id === "lifetime-bundle") {
      amount = 900; // $9.00 Kitchen Design Book
    } else if (item.id === "upsell-5books") {
      amount = 2700; // $27.00 Upsell (5 more books)
    } else if (item.id === "hardcopy") {
      amount = 9900; // Example: $99.00 hardcopy — adjust if needed
    } else {
      return new Response(JSON.stringify({ error: "Unknown item id" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const currency = "usd";

    // Basic metadata for bookkeeping
    const metadata: Record<string, string> = {
      product_id: item.id,
      email: email || "",
      name: name || "",
    };

    // If we have a saved payment method + customer from checkout and this is the upsell,
    // create a PaymentIntent that can be confirmed off-session for true one-click.
    const isUpsell = item.id === "upsell-5books";

    if (isUpsell && saved_payment_method && customer_id) {
      const pi = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customer_id,
        payment_method: saved_payment_method,
        confirm: false, // frontend will call confirmCardPayment with this client_secret
        setup_future_usage: "off_session",
        metadata,
        receipt_email: email,
      });

      return new Response(JSON.stringify({ clientSecret: pi.client_secret }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Default: regular flow (checkout or upsell without saved card)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      receipt_email: email,
    });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("[create-payment-intent] error", err);
    return new Response(JSON.stringify({ error: err.message || "Unexpected error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
