import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import { trackEvent, initFacebookPixel } from "../../lib/ga";
import { Eyebrow } from "../../components/design/refined";
import {
  RefinedPage,
  PageMasthead,
  CtaBand,
} from "../../components/design/RefinedPage";

const cellStyle = {
  padding: "12px 0",
  borderBottom: "1px solid var(--line)",
  verticalAlign: "top",
  fontSize: 15,
};

const headCellStyle = {
  ...cellStyle,
  padding: "0 0 10px",
  textAlign: "left",
};

// Reserved height so the order card doesn't jump between loading → loaded.
const OrderCard = ({ loading, order }) => (
  <section
    className="ohx-card"
    aria-live="polite"
    style={{ marginTop: 36, padding: "26px 28px", minHeight: 160 }}
  >
    {loading ? (
      <>
        <Eyebrow>Your order</Eyebrow>
        <p className="ohx-muted" style={{ margin: "12px 0 0", fontSize: 15 }}>
          Loading your order details…
        </p>
      </>
    ) : order ? (
      <>
        <Eyebrow>Order #{order.id?.substring(0, 8)}</Eyebrow>
        <p style={{ margin: "12px 0 0", fontSize: 16 }}>
          {order.customerName ? `Thanks, ${order.customerName}! Your` : "Your"}{" "}
          order has been confirmed.
        </p>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 18,
          }}
        >
          <thead>
            <tr>
              <th scope="col" className="ohx-eyebrow" style={headCellStyle}>
                Item
              </th>
              <th
                scope="col"
                className="ohx-eyebrow"
                style={{ ...headCellStyle, textAlign: "center" }}
              >
                Qty
              </th>
              <th
                scope="col"
                className="ohx-eyebrow"
                style={{ ...headCellStyle, textAlign: "right" }}
              >
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i}>
                <td style={cellStyle}>
                  {item.name}
                  {item.description && (
                    <span
                      className="ohx-faint"
                      style={{ display: "block", fontSize: 13, marginTop: 2 }}
                    >
                      {item.description}
                    </span>
                  )}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "center",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ${item.totalPrice?.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr>
              <td
                colSpan={2}
                className="ohx-display"
                style={{
                  ...cellStyle,
                  borderBottom: 0,
                  textAlign: "right",
                  fontSize: 17,
                }}
              >
                Total
              </td>
              <td
                className="ohx-display"
                style={{
                  ...cellStyle,
                  borderBottom: 0,
                  textAlign: "right",
                  fontSize: 20,
                  color: "var(--brand)",
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                ${order.total?.toFixed(2)} {order.currency?.toUpperCase()}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="ohx-muted" style={{ margin: "14px 0 0", fontSize: 14.5 }}>
          A confirmation email has been sent to {order.customerEmail}.
        </p>
      </>
    ) : (
      <>
        <Eyebrow>Your order</Eyebrow>
        <p style={{ margin: "12px 0 0", fontSize: 16 }}>
          Your order has been confirmed. You will receive an email confirmation
          shortly.
        </p>
      </>
    )}
  </section>
);

export default function SuccessPage() {
  const { clearCart } = useShoppingCart();
  const router = useRouter();
  const { session_id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initFacebookPixel();
    clearCart();
    trackEvent({
      action: "store_purchase_complete",
      params: {
        page: "store_success",
        currency: "USD",
      },
    });
    // Only run once on mount
  }, []);

  useEffect(() => {
    if (!session_id) return;

    let cancelled = false;
    let retried = false;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/store/orders/by-session/${session_id}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setOrder(data.order);
        } else if (res.status === 404 && !retried) {
          // Retry once after 2s for webhook race condition
          retried = true;
          await new Promise((r) => setTimeout(r, 2000));
          const retryRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/store/orders/by-session/${session_id}`,
          );
          if (retryRes.ok) {
            const data = await retryRes.json();
            if (!cancelled) setOrder(data.order);
          }
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [session_id]);

  return (
    <>
      <Head>
        <title>Order Confirmed — Opportunity Hack Store</title>
        <meta
          name="description"
          content="Thank you for your purchase! Your order has been confirmed. All proceeds support nonprofits through technology at Opportunity Hack."
        />
        <meta name="robots" content="noindex, nofollow" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Order Confirmed — Opportunity Hack Store"
        />
        <meta
          property="og:description"
          content="Thank you for supporting nonprofits through technology!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Opportunity Hack" />
      </Head>

      <RefinedPage narrow>
        <PageMasthead
          eyebrow="Order confirmed"
          title="Thank you for"
          italic="backing the mission."
          lead="All proceeds support nonprofits through technology at Opportunity Hack. Your order is in, and the details are below."
        />

        <OrderCard loading={loading} order={order} />

        <CtaBand
          eyebrow="What's next"
          title="Keep the good going."
          body="Pick up another piece of gear, or see the nonprofit projects your purchase helps fund."
          primary={{ href: "/store", label: "Continue shopping" }}
          secondary={{ href: "/nonprofits", label: "See the nonprofits" }}
        />
      </RefinedPage>
    </>
  );
}
