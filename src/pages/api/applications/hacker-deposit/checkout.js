import Stripe from "stripe";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({
      error: "Stripe is not configured. Please set STRIPE_SECRET_KEY.",
    });
  }

  const { event_id, amount_cents, disposition, hacker_email } = req.body || {};

  const amount = Number(amount_cents);
  if (!Number.isInteger(amount) || amount < 100 || amount > 50000) {
    return res
      .status(400)
      .json({ error: "amount_cents must be between 100 and 50000" });
  }

  if (!event_id || typeof event_id !== "string") {
    return res.status(400).json({ error: "event_id is required" });
  }

  // Enforce the event's deposit config server-side so a tampered client can't
  // pay less than the event minimum (or pay when deposits are off). NOTE: the
  // backend worker-caches the event payload for ~10 min, so enabling deposits
  // or changing the minimum can take up to 10 min to be honoured here.
  // Fail OPEN on any lookup problem — never block a payment on a backend hiccup.
  const eventCheck = await checkEventDeposit(event_id, amount);
  if (eventCheck) {
    return res.status(400).json(eventCheck);
  }

  const normalizedDisposition =
    disposition === "donate" ? "donate" : "refund";

  const stripe = new Stripe(secretKey);
  const baseUrl = getBaseUrl(req);

  const description =
    normalizedDisposition === "donate"
      ? "Hacker deposit (donated to Opportunity Hack)"
      : "Hacker deposit (refundable on hackathon completion)";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: hacker_email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Opportunity Hack — Hacker Deposit (${event_id})`,
              description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        kind: "hacker_deposit",
        event_id,
        disposition: normalizedDisposition,
        // Carried on the session metadata so the webhook can reconcile the
        // volunteer doc by email + event_id without depending on Stripe's
        // customer_details being populated.
        hacker_email: hacker_email || "",
      },
      payment_intent_data: {
        metadata: {
          kind: "hacker_deposit",
          event_id,
          disposition: normalizedDisposition,
          hacker_email: hacker_email || "",
        },
      },
      success_url: `${baseUrl}/hack/${encodeURIComponent(event_id)}/hacker-application?deposit_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/hack/${encodeURIComponent(event_id)}/hacker-application?deposit_cancelled=1`,
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Hacker deposit Stripe error:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to create checkout session. Please try again." });
  }
}

// Returns a 400 error body when the event rejects this deposit, or null to
// proceed (including when the event lookup fails — fail open).
async function checkEventDeposit(eventId, amount) {
  let data;
  try {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${encodeURIComponent(eventId)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!resp.ok) {
      console.warn(
        `Hacker deposit: event lookup returned ${resp.status}; skipping event checks`
      );
      return null;
    }
    data = await resp.json();
  } catch (error) {
    console.warn(
      "Hacker deposit: event lookup failed; skipping event checks:",
      error.message
    );
    return null;
  }

  const hd = data?.constraints?.hacker_deposit;
  if (!hd || hd.enabled !== true) {
    return { error: "deposits_disabled" };
  }
  if (
    Number.isInteger(hd.default_amount_cents) &&
    amount < hd.default_amount_cents
  ) {
    return {
      error: "amount_below_minimum",
      minimum_cents: hd.default_amount_cents,
    };
  }
  return null;
}

function getBaseUrl(req) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${protocol}://${host}`;
}
