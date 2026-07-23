import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({
      error: "Stripe is not configured. Please set STRIPE_SECRET_KEY.",
    });
  }

  const { session_id } = req.query;
  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ error: "session_id is required" });
  }

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return res.status(200).json({
      payment_status: session.payment_status,
      payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata || {},
    });
  } catch (error) {
    console.error("Hacker deposit session lookup error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve session" });
  }
}
