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

async function getOrCreateCustomer(email?: string, name?: string) {
  if (!email) return null;
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing?.data?.length) return existing.data[0];
  return await stripe.customers.create({ email, name: name || undefined });
}

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
    const { items, email, name, saved_payment_method, customer_id, autoconfirm_saved_pm } = body;

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
    const isCheckout = item.id === "lifetime-bundle";

    // For reuse on upsell, ensure checkout payment belongs to a customer
    // and marks setup for future off-session usage.
    const customer = await getOrCreateCustomer(email, name);

    const effectiveCustomerId = customer_id || customer?.id;

    // One-click upsell: attempt immediate server-side charge first.
    // If bank needs auth, fallback to returning clientSecret for frontend confirmCardPayment.
    if (isUpsell && saved_payment_method && effectiveCustomerId && autoconfirm_saved_pm) {
      try {
        const immediate = await stripe.paymentIntents.create({
          amount,
          currency,
          customer: effectiveCustomerId,
          payment_method: saved_payment_method,
          confirm: true,
          off_session: true,
          metadata,
          receipt_email: email,
        });

        return json({
          status: immediate.status,
          paymentIntentId: immediate.id,
          paid: immediate.status === "succeeded",
        });
      } catch (err: any) {
        const maybePi = err?.raw?.payment_intent;
        const requiresAction = err?.code === "authentication_required" || maybePi?.status === "requires_action";

        if (requiresAction) {
          const pi = await stripe.paymentIntents.create({
            amount,
            currency,
            customer: effectiveCustomerId,
            payment_method: saved_payment_method,
            confirm: false,
            metadata,
            receipt_email: email,
          });

          return json({
            status: "requires_action",
            clientSecret: pi.client_secret,
            paymentIntentId: pi.id,
            paid: false,
          });
        }

        throw err;
      }
    }

    // Upsell with saved card hints but without autoconfirm flag: return clientSecret as fallback path
    if (isUpsell && saved_payment_method && effectiveCustomerId) {
      const pi = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: effectiveCustomerId,
        payment_method: saved_payment_method,
        confirm: false,
        metadata,
        receipt_email: email,
      });

      return json({ clientSecret: pi.client_secret, paymentIntentId: pi.id, paid: false });
    }

    // Default path: normal checkout or upsell without saved card
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer?.id,
      setup_future_usage: (isCheckout || isUpsell) ? "off_session" : undefined,
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
