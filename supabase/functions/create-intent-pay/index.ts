import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Edge Function: create-intent-pay
// Centralizes Stripe PaymentIntent creation for:
// - lifetime-bundle  → $9.00  (Kitchen Design Book)
// - upsell-5books    → $27.00 (5-book upsell)
// - hardcopy         → $99.00 (physical book) — adjust if needed

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

if (!STRIPE_SECRET_KEY) {
  console.error("[create-intent-pay] STRIPE_SECRET_KEY is not set in Supabase secrets");
}

let stripe: any;

Deno.serve(async (req: Request) => {
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
      return json({ error: "Stripe not configured" }, 500);
    }

    if (!stripe) {
      // @ts-ignore Stripe from npm in Deno
      const { Stripe } = await import("npm:stripe@13.11.0");
      stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" });
    }

    const body = await req.json();
    const { items, email, name, saved_payment_method, customer_id } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return json({ error: "No items in request" }, 400);
    }

    const item = items[0];

    // --- Map product IDs to amounts in cents ---
    let amount = 0;
    if (item.id === "lifetime-bundle") {
      amount = 900; // $9.00 — Kitchen Design Book
    } else if (item.id === "upsell-5books") {
      amount = 2700; // $27.00 — 5-book upsell
    } else if (item.id === "hardcopy") {
      amount = 9900; // $99.00 — Hardcopy (adjust if needed)
    } else {
      return json({ error: `Unknown item id: ${item.id}` }, 400);
    }

    const currency = "usd";

    const metadata: Record<string, string> = {
      product_id: item.id,
      email: email || "",
      name: name || "",
    };

    const isUpsell = item.id === "upsell-5books";

    // If we have a saved payment method + customer for the upsell, create
    // a PI that frontend can confirm with confirmCardPayment (true one-click).
    if (isUpsell && saved_payment_method && customer_id) {
      const pi = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customer_id,
        payment_method: saved_payment_method,
        confirm: false,
        setup_future_usage: "off_session",
        metadata,
        receipt_email: email,
      });

      return json({ clientSecret: pi.client_secret });
    }

    // Default path: normal checkout or upsell without saved card
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      receipt_email: email,
    });

    return json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error("[create-intent-pay] error", err);
    return json({ error: err.message || "Unexpected error" }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
