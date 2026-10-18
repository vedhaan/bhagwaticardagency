const REST = SUPABASE_URL + "/rest/v1";
const HDR = { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY };
const LIST_COLS = "slug,name,category,material,faith,price,min_qty,tag,thumb_color,thumb";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => "\u20B9" + Number(n).toLocaleString("en-IN");
const imgUrl = (p) => (p ? `${SUPABASE_URL}/storage/v1/object/public/product-images/${p}` : "images/logo/logo.jpg");
const thumbOf = (p) => (p ? p.replace(/(\.\w+)$/, "-t$1") : "");
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

// localStorage cache with TTL. If the network fails (e.g. free project paused),
// stale cached data is served instead of an empty page.
async function cached(key, url, ttl = 5 * 60 * 1000) {
  let hit = null;
  try { hit = JSON.parse(localStorage.getItem(key)); } catch (e) {}
  if (hit && Date.now() - hit.t < ttl) return hit.d;
  try {
    const res = await fetch(url, { headers: HDR });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const d = await res.json();
    try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d })); } catch (e) {}
    return d;
  } catch (e) {
    if (hit) return hit.d;
    throw e;
  }
}

const API = {
  async categories() {
    const rows = await cached("bc:cats", `${REST}/categories?select=*&order=sort_order`, 10 * 60 * 1000);
    return Object.fromEntries(rows.map((c) => [c.slug, c]));
  },
  list: (cat) =>
    cached(
      "bc:list:" + cat,
      `${REST}/products?select=${LIST_COLS}&category=eq.${encodeURIComponent(cat)}&is_active=eq.true&order=sort_order.asc,created_at.desc&limit=1000`
    ),
  async one(slug) {
    const r = await cached("bc:p:" + slug, `${REST}/products?select=*&slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&limit=1`);
    return r[0] || null;
  },
  related: (cat, slug) =>
    cached(
      `bc:rel:${cat}:${slug}`,
      `${REST}/products?select=${LIST_COLS}&category=eq.${encodeURIComponent(cat)}&slug=neq.${encodeURIComponent(slug)}&is_active=eq.true&order=sort_order.asc,created_at.desc&limit=6`
    ),
    reviews: (productId) =>
    cached(
      "bc:rev:" + (productId || "site"),
      `${REST}/reviews?select=name,occasion,rating,body,created_at&is_approved=eq.true&` +
        (productId ? `product_id=eq.${productId}` : "product_id=is.null") +
        `&order=created_at.desc&limit=200`,
      60 * 1000
    ),
  async submitReview(row) {
    const res = await fetch(`${REST}/reviews`, {
      method: "POST",
      headers: { ...HDR, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error(await res.text());
  },
};

// Same markup as your current listing cards.
function cardHTML(p, catName) {
  const href = "product.html?slug=" + encodeURIComponent(p.slug);
  const wa = waLink(
    `Enquiry about ${p.name}\nProduct: ${p.name}\n` +
      (p.material ? `Material/Fabric: ${p.material}\n` : "") +
      `Price: Rs.${p.price}\nPlease share more details and availability.`
  );
  return `
  <article class="card reveal">
    <a href="${href}"><div class="thumb ${esc(p.thumb_color)}" data-slider>
      <img src="${esc(imgUrl(p.thumb))}" alt="${esc(p.name)}" loading="lazy" class="active" />
      ${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ""}
    </div></a>
    <div class="body">
      <p class="meta">${esc(catName)}${p.material ? " &middot; " + esc(p.material) : ""}</p>
      <h3 style="margin-top:0.35rem"><a href="${href}" style="color:inherit;text-decoration:none">${esc(p.name)}</a></h3>
      <div class="price-row" style="display:flex;align-items:center;justify-content:space-between;margin-top:0.6rem;">
        <span class="price">${money(p.price)}</span>
        <a class="btn sm outline" href="${wa}" target="_blank" rel="noopener">Enquire</a>
      </div>
    </div>
  </article>`;
}

