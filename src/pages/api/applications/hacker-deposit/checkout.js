import Stripe from "stripe";

export default async function handler(req, res) {
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
      },
      payment_intent_data: {
        metadata: {
          kind: "hacker_deposit",
          event_id,
          disposition: normalizedDisposition,
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

function getBaseUrl(req) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${protocol}://${host}`;
}
