import Stripe from "stripe";
import products from "../../../data/store-products.json";

export const MAX_ITEM_QUANTITY = 50;

const productsById = new Map(products.map((p) => [p.id, p]));

// Resolve a cart item against the catalog. Name, price and image ALWAYS come
// from the catalog — the request body is untrusted (a tampered price must
// never reach Stripe). Returns { error } on any invalid input.
function resolveItem(item) {
  const product = item && productsById.get(item.id);
  if (!product) return { error: "Unknown product" };

  const quantity = item.quantity;
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_ITEM_QUANTITY
  ) {
    return {
      error: `Quantity must be a whole number between 1 and ${MAX_ITEM_QUANTITY}`,
    };
  }

  const selected = item.selectedVariations;
  if (selected != null) {
    if (typeof selected !== "object" || Array.isArray(selected)) {
      return { error: "Invalid product options" };
    }
    const allowed = product.variations || {};
    for (const [key, value] of Object.entries(selected)) {
      if (
        !Object.prototype.hasOwnProperty.call(allowed, key) ||
        !allowed[key].includes(value)
      ) {
        return { error: "Invalid product options" };
      }
    }
  }

  return { product, quantity, selectedVariations: selected || null };
}

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

    const resolved = items.map(resolveItem);
    const invalid = resolved.find((r) => r.error);
    if (invalid) {
      return res.status(400).json({ error: invalid.error });
    }

    const lineItems = resolved.map(({ product, quantity, selectedVariations }) => {
      const variationDesc = selectedVariations
        ? Object.entries(selectedVariations)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")
        : "";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: variationDesc || undefined,
            images: product.image ? [`${getBaseUrl(req)}${product.image}`] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity,
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
