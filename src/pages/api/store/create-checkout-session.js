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

  const stripe = new Stripe(secretKey);

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    const lineItems = items.map((item) => {
      const variationDesc = item.selectedVariations
        ? Object.entries(item.selectedVariations)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")
        : "";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: variationDesc || undefined,
            images: item.image ? [`${getBaseUrl(req)}${item.image}`] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/store/cart`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return res.status(500).json({
      error: "Failed to create checkout session. Please try again.",
    });
  }
}

function getBaseUrl(req) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${protocol}://${host}`;
}
