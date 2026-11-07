// Phoenix meeting places for nonprofits.
// Built from real outreach Opportunity Hack did while researching
// affordable evening meeting space for a small nonprofit training
// (10-12 people, 6-8 PM, screen + Wi-Fi). Every price below is either
// a written quote received Nov 6, 2026 or a rate published on the venue's
// own site, and each card says which.
// Nothing here is a booking: availability and prices change, so confirm
// directly with the venue before you plan around a number.
// Updated Nov 6, 2026: SEO title, meta, and area copy; venue ItemList
// JSON-LD; one DonateCard (DonateNudge, placement phoenix_meeting_places).
import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { serializeJsonLd } from "../../../lib/jsonLd";
import { RefinedPage, PageMasthead, CtaBand, Prose, BackLink } from "../../../components/design/RefinedPage";
import { DonateCard } from "../../../components/design/DonateNudge";

const CANONICAL = "https://www.ohack.dev/phoenix/meeting-places";
const LAST_UPDATED = "November 6, 2026";

// priceSort is the 2-hour cost in USD where we have a number. Infinity
// means "quote on inquiry": the venue publishes no rate, so it sorts last
// on price and the card says so plainly.
const VENUES = [
  {
    id: "found-re",
    name: "FOUND:RE Phoenix",
    area: "Downtown Phoenix",
    address: "1100 N Central Ave, Phoenix, AZ 85004",
    room: "The Studio",
    roomDetail: "512 sq ft, off the pool deck, boardroom style for 12",
    capacity: 12,
    screen: "LCD monitor (not a built-in projector)",
    wifi: "Not restated in the quote; confirm before booking",
    evening: "confirmed",
    eveningNote: "Offered as available for Nov 12, 6-8 PM in writing",
    priceLabel: "About $318 all-in",
    priceSort: 318,
    priceBasis: "quoted",
    priceDetail:
      "$250 rental (usual $750) + 2.9% tax + 24% service charge. Quoted Fri Nov 6, 2026 by Jordan Zurn.",
    includes: ["Boardroom setup for 12", "LCD monitor", "Discounted nonprofit-style rate on the rental"],
    contact: {
      name: "Jordan Zurn",
      email: "JZurn@foundrehotels.com",
      phone: "(602) 875-8003",
      salesEmail: "sales@foundrehotels.com",
      url: "https://www.foundrehotels.com/meetings/",
      urlLabel: "Meetings page",
    },
    verdict:
      "The only confirmed-available evening quote we received. If your training runs 6-8 PM, start here: it fits 12, the price is in writing, and it is the cheapest evening option we found.",
  },
  {
    id: "press-coffee",
    name: "Press Coffee, Biltmore",
    area: "Biltmore / Camelback",
    address: "2390 E Camelback Rd, Phoenix, AZ 85016",
    room: "Private conference room",
    roomDetail: "Seats up to 16",
    capacity: 16,
    screen: "TV + HDMI (no projector; a large screen serves 12 fine)",
    wifi: "Not stated for the room; cafe Wi-Fi is standard, confirm for the room",
    evening: "no",
    eveningNote: "Out for evenings: no reservations past 4:30 PM at Biltmore (past 3:00 PM at Gilbert). Confirmed by reply Fri Nov 6, 2026.",
    priceLabel: "$100 flat",
    priceSort: 100,
    priceBasis: "published",
    priceDetail:
      "$100 for the first 4 hours, so $100 for a 2-hour session. Request at least 72 hours ahead; payment due within 72 hours of reservation. Coffee and pastry catering extra (Joe To Go $25-35, serves 10).",
    includes: ["Private room for up to 16", "TV + HDMI", "Validated parking"],
    contact: {
      phone: "(602) 283-5591",
      url: "https://presscoffee.com/pages/book-a-conference-room",
      urlLabel: "Book a conference room (form; no public email)",
    },
    verdict:
      "Cheapest on paper, but it cannot do a 6-8 PM slot. Best pick for a daytime training: $100 flat, seats 16, book by form. Their Gilbert location has a 24-person room with A/V at the same $100 rate.",
  },
  {
    id: "workuity",
    name: "Workuity",
    area: "Biltmore / Camelback",
    address: "Biltmore: 2390 E Camelback Rd, Ste 130, Phoenix, AZ 85016. Chandler: 3133 W Frye Rd, Ste 101, Chandler, AZ 85226",
    room: "Theater / Training Room (Biltmore) or Four Peaks (Chandler)",
    roomDetail: "Biltmore seats up to 16; Chandler Four Peaks seats exactly 12",
    capacity: 16,
    screen: "TV / monitor with AirPlay + HDMI (no projector)",
    wifi: "Yes, fiber Wi-Fi",
    evening: "no",
    eveningNote: "Out for evenings: after-hours events need staff present and none was available on short notice; both large rooms were also unavailable Nov 12. Confirmed by reply Fri Nov 6, 2026.",
    priceLabel: "$136 - $176",
    priceSort: 136,
    priceBasis: "published",
    priceDetail:
      "Chandler Four Peaks from $68/hr ($136 for 2 hours). Biltmore Theater / Training Room from $88/hr ($176 for 2 hours). Non-members welcome, bookable online, no membership needed. Free cancellation 7+ days out.",
    includes: ["Fiber Wi-Fi", "AirPlay + HDMI screen", "Online booking, no membership"],
    contact: {
      email: "info@workuity.com",
      phone: "Biltmore (602) 761-9675; Chandler (480) 745-2515",
      url: "https://www.workuity.com/meeting-rooms/",
      urlLabel: "Meeting rooms",
    },
    verdict:
      "Best exact fit for a daytime session and instantly bookable online. Chandler is about 25 minutes from central Phoenix; Biltmore costs more but keeps you central. Evenings are the problem: the front desk is staffed Mon-Fri 9 AM-5 PM and after-hours access needs confirmation.",
  },
  {
    id: "valley-ho",
    name: "Hotel Valley Ho",
    area: "Scottsdale",
    address: "6850 E Main St, Scottsdale, AZ 85251",
    room: "Riviera Boardroom",
    roomDetail: "Seats up to 12 (the HVH Boardroom also seats 12)",
    capacity: 12,
    screen: "Not addressed in the reply; confirm projector vs screen",
    wifi: "Available; confirm in-room",
    evening: "unconfirmed",
    eveningNote: "Nov 12 availability was not confirmed in the reply",
    priceLabel: "$500+",
    priceSort: 500,
    priceBasis: "quoted",
    priceDetail:
      "$500+ room rental, quoted Fri Nov 6, 2026 by Cassandra Stanton. The \"+\" is open-ended: the reply did not cap it. Availability, projector / Wi-Fi, and a nonprofit rate were all unaddressed.",
    includes: [
      "Banquet tables in any setup",
      "Water station and pitchers",
      "Standard linen and napkins, banquet chairs",
      "Branded notepads and pens",
    ],
    contact: {
      name: "Cassandra Stanton",
      email: "hvhcateringandconferenceservices@hotelvalleyho.com",
      phone: "(855) 923-7982",
      url: "https://hotelvalleyho.com/",
      urlLabel: "Meetings inquiry form",
    },
    verdict:
      "A real quote, but a soft one: $500+ with no ceiling and no confirmed date. Ask for a firm written quote for your date, and ask directly about a nonprofit rate before you compare it to FOUND:RE.",
  },
  {
    id: "ac-hotel",
    name: "AC Hotel Phoenix Downtown",
    area: "Downtown Phoenix",
    address: "414 N 5th St, Phoenix, AZ 85004",
    room: "Lantana Boardroom",
    roomDetail: "372 sq ft, 12 boardroom (larger rooms available to 300)",
    capacity: 12,
    screen: "10% AV discount with exclusive use of hotel A/V; projector vs screen not specified",
    wifi: "Yes, complimentary Wi-Fi in guestrooms and meeting space",
    evening: "in-principle",
    eveningNote: "24-hour hotel, so evening slots are normal; Nov 12 availability still to confirm",
    priceLabel: "$1,000 + $500 F&B min.",
    priceSort: 1500,
    priceBasis: "quoted",
    priceDetail:
      "$1,000 room rental + $500 food and beverage minimum, from the written proposal dated 11/12/26 (Nala Khamphasithivong). The F&B side runs about $682 once 9.1% tax and a 25% service charge apply, so roughly $1,682 before any tax on the rental. Whether tax and service also apply to the $1,000 rental is still open.",
    includes: ["Complimentary Wi-Fi", "10% AV discount (exclusive hotel A/V)", "Marriott Bonvoy Planner Points"],
    contact: {
      name: "Nala Khamphasithivong",
      phone: "(602) 258-1771",
      url: "https://www.marriott.com/en-us/hotels/phxad-ac-hotel-phoenix-downtown/events/",
      urlLabel: "Events (Marriott RFP form; no public events email)",
    },
    verdict:
      "The priciest quote we received. Only worth it if a downtown hotel setting matters more than the price, and only after you confirm whether tax and service apply to the rental on top of the F&B side.",
  },
  {
    id: "camby",
    name: "The Camby, Autograph Collection",
    area: "Biltmore / Camelback",
    address: "2401 E Camelback Rd, Phoenix, AZ 85016",
    room: "Camelback Boardroom",
    roomDetail: "Max 12 (225 sq ft); larger rooms Embers (40) and The Back Office (20 banquet / 40 reception)",
    capacity: 12,
    screen: "Full audiovisual capabilities (per Marriott events page); confirm projector vs screen",
    wifi: "Yes, wireless internet",
    evening: "in-principle",
    eveningNote: "24-hour hotel, so evening slots are normal; Nov 12 availability still to confirm",
    priceLabel: "Quote on inquiry",
    priceSort: Infinity,
    priceBasis: "unpublished",
    priceDetail:
      "No rate published. Rental fee and/or food and beverage minimum, quoted on inquiry only. No free option found. No reply to our Nov 5 inquiry as of Nov 6, 2026.",
    includes: ["True 12-person boardroom", "Full AV", "Biltmore corridor location"],
    contact: {
      email: "CambySales@destinationhotels.com",
      phone: "(602) 522-6621",
      url: "https://www.thecamby.com/gather/meetings/",
      urlLabel: "Meetings (RFP form)",
    },
    verdict:
      "Best hotel fit on paper: a true 12-person boardroom with full AV in a 24-hour hotel, so 6-8 PM is no problem. The catch is the price is unknown. Email and ask directly about nonprofit or community pricing.",
  },
  {
    id: "kimpton-palomar",
    name: "Kimpton Hotel Palomar Phoenix",
    area: "Downtown Phoenix",
    address: "2 E Jefferson St, Phoenix, AZ 85004",
    room: "Rangoli or Curator Boardroom",
    roomDetail: "Each seats up to 10; for 12, the next size is Mural I (726 sq ft, listed 28-60)",
    capacity: 10,
    screen: "AV yes; confirm projector vs screen",
    wifi: "Yes, wireless internet (stated for Rangoli Boardroom)",
    evening: "in-principle",
    eveningNote: "24-hour hotel, so evening slots are normal; Nov 12 availability still to confirm",
    priceLabel: "Quote on inquiry",
    priceSort: Infinity,
    priceBasis: "unpublished",
    priceDetail:
      "No rate published. Rental fee and/or food and beverage minimum, quoted on inquiry only. No free option found. No reply to our Nov 5 inquiry as of Nov 6, 2026.",
    includes: ["State-of-the-art AV (Rangoli)", "Wireless internet", "Downtown location"],
    contact: {
      email: "sales@hotelpalomar-phoenix.com",
      phone: "(602) 253-6633",
      url: "https://www.hotelpalomar-phoenix.com/",
      urlLabel: "Meetings / RFP",
    },
    verdict:
      "The boardrooms top out at 10, so they do not fit a group of 12; the next room up is built for 28-60. Only a fit if your group is 10 or fewer, or you want the larger Mural I room.",
  },
];

const AREAS = ["All areas", "Biltmore / Camelback", "Downtown Phoenix", "Scottsdale"];

const FAQ_ITEMS = [
  {
    q: "Is any meeting space in Phoenix actually free for nonprofits?",
    a: "Not that we could verify in writing. No Phoenix-area hotel we contacted publishes free meeting space; every hotel quotes a rental fee and/or a food and beverage minimum on inquiry only. The only verified low-cost options are Press Coffee ($100 flat) and Workuity ($136-$176 for two hours), and both are out for evening slots. If free is a hard requirement, the realistic path is asking a hotel for a nonprofit or community waiver, not finding a published free offer.",
  },
  {
    q: "What is the cheapest evening option for a 6-8 PM training?",
    a: "FOUND:RE Phoenix quoted about $318 all-in for The Studio (boardroom for 12, LCD monitor) for a weekday evening, and it was the only confirmed-available evening quote we received. Press Coffee ($100) and Workuity ($136-$176) are cheaper but both confirmed they cannot do evenings.",
  },
  {
    q: "Do I need a projector, or is a large screen enough?",
    a: "For 12 people, a large screen works as well as a projector. Press Coffee and Workuity specify TV or monitor screens, not projectors. Hotels say 'full AV' without specifying a projector, so confirm if a true projector is a hard requirement. FOUND:RE's Studio has an LCD monitor; its Gallery rooms have built-in projectors.",
  },
  {
    q: "How did Opportunity Hack get these numbers?",
    a: "We researched seven venues on Nov 5, 2026, then emailed five of them and submitted request forms to two more, all for the same ask: a room for 10-12 people on Thursday, Nov 12, 2026, 6-8 PM, with a screen and Wi-Fi. Five replied on Nov 6, 2026 with written quotes or a clear no for evenings; three had not replied yet. Each card on this page says whether its price is a written quote, a published rate, or unpublished.",
  },
  {
    q: "Can I use this page to book a room?",
    a: "No. Nothing here is a booking and we cannot hold a room for you. Use the contact on each card to reach the venue directly, confirm the price and the date in writing, and ask about nonprofit or community rates before you plan around a number.",
  },
];

const EVENING_LABEL = {
  confirmed: "Evening confirmed",
  "in-principle": "Evenings possible",
  unconfirmed: "Evening unconfirmed",
  no: "No evening slots",
};

const PRICE_BASIS_LABEL = {
  quoted: "Written quote, Nov 6, 2026",
  published: "Published rate",
  unpublished: "Price on inquiry",
};

function sortVenues(venues, sort) {
  const list = [...venues];
  if (sort === "price") {
    list.sort((a, b) => a.priceSort - b.priceSort || a.name.localeCompare(b.name));
  } else if (sort === "capacity") {
    list.sort((a, b) => b.capacity - a.capacity || a.name.localeCompare(b.name));
  } else {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return list;
}

export default function PhoenixMeetingPlaces() {
  const [area, setArea] = useState("All areas");
  const [sort, setSort] = useState("price");
  const [eveningOnly, setEveningOnly] = useState(false);
  const [fitsTwelve, setFitsTwelve] = useState(false);

  const visible = useMemo(() => {
    let list = VENUES;
    if (area !== "All areas") {
      list = list.filter((v) => v.area === area);
    }
    if (eveningOnly) {
      list = list.filter((v) => v.evening === "confirmed" || v.evening === "in-principle");
    }
    if (fitsTwelve) {
      list = list.filter((v) => v.capacity >= 12);
    }
    return sortVenues(list, sort);
  }, [area, sort, eveningOnly, fitsTwelve]);

  return (
    <>
      <Head>
        <title>Phoenix Meeting Space and Training Rooms for Nonprofits | Opportunity Hack</title>
        <meta
          name="description"
          content="Affordable Phoenix meeting space and training rooms for nonprofits, with real written quotes. FOUND:RE about $318 all-in for evenings, Press Coffee $100 daytime, Workuity $136-$176."
        />
        <meta
          name="keywords"
          content="Phoenix meeting space nonprofit, affordable training room Phoenix, nonprofit meeting room Phoenix, Phoenix training room rental, Biltmore meeting room, downtown Phoenix boardroom, Scottsdale meeting room, FOUND:RE Phoenix, Press Coffee conference room, Workuity meeting rooms"
        />
        <meta name="author" content="Opportunity Hack" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Phoenix Meeting Space and Training Rooms for Nonprofits | Opportunity Hack" />
        <meta
          property="og:description"
          content="Real quotes for Phoenix meeting space and training rooms for small nonprofits. Cheapest confirmed evening: FOUND:RE, about $318 all-in."
        />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Phoenix Meeting Space and Training Rooms for Nonprofits | Opportunity Hack" />
        <meta
          name="twitter:description"
          content="Real quotes for Phoenix meeting space and training rooms for small nonprofits. Cheapest confirmed evening: FOUND:RE, about $318 all-in."
        />
        <meta name="twitter:creator" content="@opportunityhack" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebPage",
                  "@id": CANONICAL + "#webpage",
                  url: CANONICAL,
                  name: "Phoenix Meeting Space and Training Rooms for Nonprofits | Opportunity Hack",
                  description:
                    "Affordable meeting and training spaces in Phoenix for small nonprofits, with real written quotes gathered Nov 5-6, 2026.",
                  isPartOf: { "@type": "WebSite", "@id": "https://www.ohack.dev/#website" },
                  about: {
                    "@type": "Service",
                    name: "Affordable meeting space guidance for Phoenix nonprofits",
                    provider: { "@type": "Organization", name: "Opportunity Hack" },
                    areaServed: "Phoenix, AZ",
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ohack.dev" },
                    { "@type": "ListItem", position: 2, name: "Phoenix Meeting Space", item: CANONICAL },
                  ],
                },
                {
                  "@type": "FAQPage",
                  mainEntity: FAQ_ITEMS.map((item) => ({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: { "@type": "Answer", text: item.a },
                  })),
                },
                {
                  "@type": "ItemList",
                  name: "Phoenix meeting and training venues for nonprofits",
                  itemListElement: VENUES.map((v, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    item: {
                      "@type": "Place",
                      name: v.name,
                      address: v.address,
                      url: v.contact.url,
                    },
                  })),
                },
              ],
            }),
          }}
        />
      </Head>

      <RefinedPage>
        <BackLink href="/nonprofits">Nonprofits</BackLink>
        <PageMasthead
          eyebrow="Phoenix, Arizona · For small nonprofits"
          title="Phoenix meeting space,"
          italic="with real prices."
          lead="Finding an inexpensive meeting space in Phoenix is hard for a small nonprofit. Almost nobody publishes prices, and evening slots are the scarcest. We needed a room for 10-12 people on a Thursday evening, with a screen and Wi-Fi, for a nonprofit training. So we emailed the venues and wrote down what they actually quoted. These are the answers, so the next nonprofit does not have to start from zero."
        >
          <p style={{ marginTop: 12, fontSize: 13.5, color: "var(--muted, #5a5f6a)" }}>
            Last updated {LAST_UPDATED}. Prices and availability change: confirm directly with the venue before you plan around a number.
          </p>
        </PageMasthead>

        <section aria-label="At a glance" style={{ marginTop: 36 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
            }}
          >
            {[
              { n: "7", label: "Venues researched and contacted" },
              { n: "1", label: "Confirmed-available evening quote (FOUND:RE, about $318 all-in)" },
              { n: "$100", label: "Cheapest daytime rate (Press Coffee, flat)" },
              { n: "3", label: "Venues yet to reply (Camby, Kimpton Palomar, Colados)" },
            ].map((s) => (
              <div key={s.label} className="ohx-card" style={{ padding: "18px 20px" }}>
                <p className="ohx-display" style={{ fontSize: 30, margin: 0 }}>
                  {s.n}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Find a space" style={{ marginTop: 44 }}>
          <h2 className="ohx-display" style={{ fontSize: 26 }}>
            Find a space
          </h2>
          <p style={{ marginTop: 8, maxWidth: "62ch", lineHeight: 1.6 }}>
            Filter by area, sort by price, and narrow to rooms that work in the evening or fit 12 people.
            Prices marked &ldquo;written quote&rdquo; came back by email on Nov 6, 2026; &ldquo;published rate&rdquo; is
            what the venue lists on its own site; &ldquo;price on inquiry&rdquo; means the venue publishes no rate at all.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px 20px",
              alignItems: "end",
              marginTop: 20,
              padding: "16px 18px",
              border: "1px solid var(--hairline, #E7E1D4)",
              borderRadius: 8,
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              Area
              <select value={area} onChange={(e) => setArea(e.target.value)} style={{ padding: "8px 10px", fontSize: 14, borderRadius: 6 }}>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "8px 10px", fontSize: 14, borderRadius: 6 }}>
                <option value="price">Lowest price first</option>
                <option value="capacity">Largest capacity first</option>
                <option value="name">Name (A to Z)</option>
              </select>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, paddingBottom: 8 }}>
              <input type="checkbox" checked={eveningOnly} onChange={(e) => setEveningOnly(e.target.checked)} />
              Evening (6-8 PM) possible
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, paddingBottom: 8 }}>
              <input type="checkbox" checked={fitsTwelve} onChange={(e) => setFitsTwelve(e.target.checked)} />
              Fits 12 people
            </label>
            <p style={{ margin: 0, marginLeft: "auto", fontSize: 13.5 }}>
              Showing {visible.length} of {VENUES.length} venues
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 18,
              marginTop: 24,
            }}
          >
            {visible.map((v) => (
              <article key={v.id} className="ohx-card ohx-card--hover" style={{ padding: "22px 24px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <h3 className="ohx-display" style={{ fontSize: 20, margin: 0 }}>
                    {v.name}
                  </h3>
                  <span className="ohx-tag" style={{ whiteSpace: "nowrap" }}>
                    {v.area}
                  </span>
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--muted, #5a5f6a)" }}>{v.address}</p>

                <p style={{ margin: "16px 0 0", fontSize: 26, fontWeight: 700 }}>
                  {v.priceLabel}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                  <span className="ohx-tag ohx-tag--accent">{PRICE_BASIS_LABEL[v.priceBasis]}</span>
                </p>
                <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6 }}>{v.priceDetail}</p>

                <dl style={{ margin: "16px 0 0", display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", fontSize: 14 }}>
                  <dt style={{ fontWeight: 600 }}>Room</dt>
                  <dd style={{ margin: 0 }}>
                    {v.room} · {v.roomDetail}
                  </dd>
                  <dt style={{ fontWeight: 600 }}>Seats</dt>
                  <dd style={{ margin: 0 }}>{v.capacity}</dd>
                  <dt style={{ fontWeight: 600 }}>Screen</dt>
                  <dd style={{ margin: 0 }}>{v.screen}</dd>
                  <dt style={{ fontWeight: 600 }}>Wi-Fi</dt>
                  <dd style={{ margin: 0 }}>{v.wifi}</dd>
                  <dt style={{ fontWeight: 600 }}>Evenings</dt>
                  <dd style={{ margin: 0 }}>
                    <strong>{EVENING_LABEL[v.evening]}.</strong> {v.eveningNote}
                  </dd>
                </dl>

                <p style={{ margin: "16px 0 0", fontSize: 14, fontWeight: 600 }}>Included</p>
                <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>
                  {v.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <p style={{ margin: "16px 0 0", fontSize: 14, lineHeight: 1.6 }}>
                  <strong>Our take: </strong>
                  {v.verdict}
                </p>

                <div style={{ marginTop: "auto", paddingTop: 18 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>Contact</p>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>
                    {v.contact.name && (
                      <>
                        {v.contact.name}
                        <br />
                      </>
                    )}
                    {v.contact.email && (
                      <>
                        <a className="ohx-link" href={`mailto:${v.contact.email}`}>
                          {v.contact.email}
                        </a>
                        <br />
                      </>
                    )}
                    {v.contact.salesEmail && (
                      <>
                        <a className="ohx-link" href={`mailto:${v.contact.salesEmail}`}>
                          {v.contact.salesEmail}
                        </a>
                        <br />
                      </>
                    )}
                    {v.contact.phone && (
                      <>
                        {v.contact.phone}
                        <br />
                      </>
                    )}
                    <a className="ohx-link" href={v.contact.url} target="_blank" rel="noopener noreferrer">
                      {v.contact.urlLabel} ↗
                    </a>
                  </p>
                </div>
              </article>
            ))}
          </div>
          {visible.length === 0 && (
            <p role="status" style={{ marginTop: 24 }}>
              No venues match those filters. Clear a filter to see the full list.
            </p>
          )}
        </section>

        <section aria-label="Meeting space by area" style={{ marginTop: 48 }}>
          <h2 className="ohx-display" style={{ fontSize: 26 }}>
            Where to meet in Phoenix: Biltmore, downtown, Scottsdale, and Chandler
          </h2>
          <Prose>
            <p>
              Most of the affordable meeting space and training rooms we found cluster in two parts of town:
              the Biltmore and Camelback corridor, and downtown Phoenix. A nonprofit training in Phoenix can
              usually stay in one of those two areas and still have a room that fits 12 people with a screen
              and Wi-Fi.
            </p>
            <h3>Biltmore and Camelback</h3>
            <p>
              Three of the seven venues sit in the Biltmore corridor on Camelback Road: Press Coffee and
              Workuity Biltmore share the 2390 E Camelback address, and The Camby is across the road at 2401 E
              Camelback. This is the cheapest daytime area on the list, with Press Coffee at $100 flat and
              Workuity Biltmore from $88 an hour, but neither room is available for a 6-8 PM evening training.
            </p>
            <h3>Downtown Phoenix</h3>
            <p>
              Downtown holds the evening options. FOUND:RE Phoenix (1100 N Central Ave) quoted about $318
              all-in for The Studio and confirmed it for a weekday evening. The AC Hotel Phoenix Downtown
              (414 N 5th St) quoted $1,000 plus a $500 food and beverage minimum for its Lantana Boardroom.
              Kimpton Hotel Palomar Phoenix (2 E Jefferson St) has boardrooms that seat up to 10, so it fits a
              smaller group.
            </p>
            <h3>Scottsdale and Chandler</h3>
            <p>
              Hotel Valley Ho (6850 E Main St, Scottsdale) quoted $500+ for its Riviera Boardroom, which seats
              12. In Chandler, Workuity's Four Peaks room seats exactly 12 from $68 an hour ($136 for two
              hours), about 25 minutes from central Phoenix, with the same evening limits as its Biltmore rooms.
            </p>
          </Prose>
        </section>

        <div style={{ marginTop: 44 }}>
          <DonateCard
            placement="phoenix_meeting_places"
            eyebrow="Keep this guide free"
            cta="Donate to Opportunity Hack"
          >
            Opportunity Hack is a nonprofit, and this guide is free because donors keep our work going. If it
            saved you a few emails, a gift of any size helps us keep publishing practical help for Phoenix
            nonprofits, and keep pairing them with volunteers who build their software.
          </DonateCard>
        </div>

        <section aria-label="How we got these numbers" style={{ marginTop: 48 }}>
          <h2 className="ohx-display" style={{ fontSize: 26 }}>
            How we got these numbers
          </h2>
          <Prose>
            <p>
              In November 2026, a small Phoenix nonprofit asked Opportunity Hack for help finding a room to train 10-12 people
              on AI fundamentals: Thursday, November 12, 2026, 6:00-8:00 PM, with a projector or large screen and
              reliable Wi-Fi. We researched seven Phoenix-area venues on Nov 5, then emailed five of them and
              submitted request forms to two more, all with the same ask. Five replied on Nov 6: FOUND:RE, Hotel
              Valley Ho, AC Hotel Phoenix Downtown, Workuity, and Press Coffee. The Camby, Kimpton Hotel Palomar,
              and Colados had not replied as of Nov 6, 2026. Colados was also emailed on Nov 5 but has no card
              here: we have no verified room, capacity, or price for it.
            </p>
            <p>
              Two things surprised us. First, no hotel publishes meeting-room rates: every hotel price on this page
              is a written quote that came back by email, not a listed rate. Second, the cheapest rooms cannot do
              evenings at all. Press Coffee ($100 flat) and Workuity ($136-$176) both wrote back to say their rooms
              are not available after 5 PM. That is why the evening filter on this page matters more than the price
              sort.
            </p>
            <h3>What we could not verify</h3>
            <ul>
              <li>Real-time availability for any specific date: no venue publishes a live calendar for meeting rooms.</li>
              <li>Hotel pricing beyond the quotes above: rental fees and food and beverage minimums are quoted on inquiry only.</li>
              <li>Projector vs screen at the hotels: they say &ldquo;full AV&rdquo; without specifying a projector. For 12 people a large screen works as well, but confirm if a true projector is a hard requirement.</li>
              <li>Nonprofit or community rates: none were published. Ask each venue directly; the quotes above are the starting point for that conversation.</li>
            </ul>
            <h3>A note on free space</h3>
            <p>
              If free is a hard requirement, the realistic path is asking a hotel or a community space for a
              nonprofit waiver, not finding a published free offer. We found no free meeting space in writing
              anywhere in this search. Libraries, community centers, and coworking spaces with community programs
              are the next places to ask, and we will add verified options here as we confirm them.
            </p>
          </Prose>
        </section>

        <section aria-label="Frequently asked questions" style={{ marginTop: 48 }}>
          <h2 className="ohx-display" style={{ fontSize: 26 }}>
            Frequently asked questions
          </h2>
          <div style={{ marginTop: 16 }}>
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="ohx-card" style={{ padding: "16px 20px", marginBottom: 12 }}>
                <summary style={{ fontWeight: 600, cursor: "pointer", fontSize: 16 }}>{item.q}</summary>
                <p style={{ margin: "10px 0 0", lineHeight: 1.65, fontSize: 15 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-label="Disclaimer" style={{ marginTop: 48 }}>
          <div className="ohx-card" style={{ padding: "20px 24px" }}>
            <h2 className="ohx-display" style={{ fontSize: 20 }}>
              Please confirm before you book
            </h2>
            <p style={{ margin: "8px 0 0", lineHeight: 1.65, fontSize: 14.5 }}>
              This page is a starting point, not a booking service. Prices, availability, capacities, and what is
              included can change without notice, and a quote given for one date may not hold for another.
              Opportunity Hack is not affiliated with any venue listed here and earns nothing from these listings.
              Always confirm the price, the date, the room setup, and the screen and Wi-Fi in writing with the venue
              before you plan around a number. If a venue corrects something on this page, tell us and we will
              update it.
            </p>
            <p style={{ margin: "10px 0 0", fontSize: 13.5 }}>
              Last updated {LAST_UPDATED} · Research: Nov 5, 2026 · Replies received: Nov 6, 2026 · Next review when
              new replies arrive.
            </p>
          </div>
        </section>

        <CtaBand
          eyebrow="Running a nonprofit in Phoenix?"
          title="Bring your mission to a hackathon."
          body="Opportunity Hack pairs nonprofits with volunteer engineers, designers, and product people who build real software for your mission, in a weekend."
          primary={{ href: "/nonprofits", label: "See how it works" }}
          secondary={{ href: "/contact", label: "Contact us" }}
        />
      </RefinedPage>
    </>
  );
}

export const getStaticProps = async () => {
  const title = "Phoenix Meeting Space and Training Rooms for Nonprofits | Opportunity Hack";
  const description =
    "Affordable Phoenix meeting space and training rooms for nonprofits, with real written quotes. FOUND:RE about $318 all-in for evenings, Press Coffee $100 daytime, Workuity $136-$176.";

  return {
    props: {
      title,
      description,
      canonical: CANONICAL,
      openGraphData: [
        { name: "title", property: "title", content: title, key: "title" },
        { name: "og:title", property: "og:title", content: title, key: "ogtitle" },
        { name: "author", property: "author", content: "Opportunity Hack", key: "author" },
        { name: "description", property: "description", content: description, key: "description" },
        { name: "og:description", property: "og:description", content: description, key: "ogdescription" },
        { name: "url", property: "url", content: CANONICAL, key: "url" },
        { name: "og:url", property: "og:url", content: CANONICAL, key: "ogurl" },
        { property: "og:type", content: "website", key: "ogtype" },
        { name: "twitter:card", property: "twitter:card", content: "summary", key: "twittercard" },
        { name: "twitter:site", property: "twitter:site", content: "@opportunityhack", key: "twittersite" },
        { name: "twitter:title", property: "twitter:title", content: title, key: "twittertitle" },
        { name: "twitter:description", property: "twitter:description", content: description, key: "twitterdesc" },
        { name: "twitter:creator", property: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
        {
          name: "keywords",
          property: "keywords",
          content:
            "Phoenix meeting space nonprofit, affordable training room Phoenix, nonprofit meeting room Phoenix, Phoenix training room rental, Biltmore meeting room, downtown Phoenix boardroom, Scottsdale meeting room, FOUND:RE Phoenix, Press Coffee conference room, Workuity meeting rooms",
          key: "keywords",
        },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": CANONICAL + "#webpage",
            url: CANONICAL,
            name: title,
            description: description,
            isPartOf: { "@type": "WebSite", "@id": "https://www.ohack.dev/#website" },
            about: {
              "@type": "Service",
              name: "Affordable meeting space guidance for Phoenix nonprofits",
              provider: { "@type": "Organization", name: "Opportunity Hack" },
              areaServed: "Phoenix, AZ",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ohack.dev" },
              { "@type": "ListItem", position: 2, name: "Phoenix Meeting Space", item: CANONICAL },
            ],
          },
          {
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
          {
            "@type": "ItemList",
            name: "Phoenix meeting and training venues for nonprofits",
            itemListElement: VENUES.map((v, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Place",
                name: v.name,
                address: v.address,
                url: v.contact.url,
              },
            })),
          },
        ],
      },
    },
  };
};
