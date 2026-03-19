import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const storeWebhookSecret = process.env.STORE_WEBHOOK_SECRET;
  const apiServerUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;

  if (!secretKey || !webhookSecret) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return res.status(500).json({ error: "Stripe is not configured" });
  }

  const stripe = new Stripe(secretKey);

  let event;
  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Retrieve full session with line items and customer details
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items", "customer_details"],
      });

      const lineItems = fullSession.line_items?.data || [];
      const customerDetails = fullSession.customer_details || {};
      const shipping = fullSession.shipping_details || {};

      const items = lineItems.map((item) => ({
        name: item.description || item.price?.product?.name || "",
        description: item.price?.product?.description || "",
        quantity: item.quantity || 1,
        unitPrice: (item.price?.unit_amount || 0) / 100,
        totalPrice: (item.amount_total || 0) / 100,
      }));

      const orderData = {
        stripeSessionId: fullSession.id,
        stripePaymentIntentId: fullSession.payment_intent || "",
        customerEmail: customerDetails.email || fullSession.customer_email || "",
        customerName: customerDetails.name || shipping.name || "",
        shippingAddress: shipping.address
          ? {
              line1: shipping.address.line1 || "",
              line2: shipping.address.line2 || "",
              city: shipping.address.city || "",
              state: shipping.address.state || "",
              postal_code: shipping.address.postal_code || "",
              country: shipping.address.country || "",
            }
          : {},
        items,
        subtotal: (fullSession.amount_subtotal || 0) / 100,
        total: (fullSession.amount_total || 0) / 100,
        currency: fullSession.currency || "usd",
      };

      // POST to backend
      const response = await fetch(`${apiServerUrl}/api/store/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": storeWebhookSecret || "",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend order creation failed:", errorText);
      } else {
        const result = await response.json();
        console.log("Order created:", result.id);
      }
    } catch (err) {
      console.error("Error processing checkout.session.completed:", err);
      // Still return 200 to Stripe to prevent retries for processing errors
    }
  }

  return res.status(200).json({ received: true });
}
