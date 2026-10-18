(function () {
  const slug = new URLSearchParams(location.search).get("slug");

  // Reviews: key must be set before filters.js binds on DOMContentLoaded.
  // Same key format as before, so existing localStorage reviews still match.
  const rf = document.getElementById("reviewForm");

  const app = document.getElementById("app");
  const notFound = () => {
    app.innerHTML = `<section class="section"><div class="container center">
      <h1>Product not found</h1><p class="muted" style="margin:1rem 0">This piece may no longer be available.</p>
      <a class="btn" href="categories.html">Browse all categories</a></div></section>`;
  };

  document.addEventListener("DOMContentLoaded", async () => {
    if (!slug) return notFound();
    let p, cats;
    try {
      [p, cats] = await Promise.all([API.one(slug), API.categories()]);
    } catch (e) {
      app.innerHTML = `<section class="section"><div class="container center muted">Couldn't load this product. Please refresh.</div></section>`;
      return;
    }
    if (!p) return notFound();

    const cat = cats[p.category] || { name: p.category, faqs: [], return_policy: "" };
    const catHref = p.category + ".html";
    const images = p.images || [];
    const meta = [cat.name, p.material, p.faith].filter(Boolean).map(esc).join(" &middot; ");
    const faqs = p.faqs && p.faqs.length ? p.faqs : cat.faqs || [];
    document.title = `${p.name} | ${cat.name} | Bhagwati Card Agency`;
    document.getElementById("reviewsTitle").textContent = "Reviews for " + p.name;

    const crumbs = `Home / <a href="${catHref}">${esc(cat.name)}</a> / ${esc(p.name)}`;

    app.innerHTML = `
    <section class="page-hero">
      <div class="hero-slider">
        ${images.slice(0, 3).map((im, i) => `<div class="hero-slide${i ? "" : " active"}" style="background-image:url('${esc(imgUrl(im))}')"></div>`).join("")}
      </div>
      <div class="hero-overlay"></div>
      <div class="container">
        <p class="crumbs">${crumbs}</p>
        <p class="eyebrow" style="margin-top:0.8rem">${esc(cat.name)}</p>
        <h1>${esc(p.name)}</h1>
        <p>${p.material ? esc(p.material) + " &middot; " : ""}Starting at ${money(p.price)} per piece</p>
      </div>
    </section>

    <section class="section reveal">
      <div class="container">
        <p class="crumbs" style="margin-bottom:1.5rem">${crumbs}</p>
        <div class="grid g2" style="gap:3rem;align-items:start">
          <div>
            <div class="pd-gallery-main"><img id="pdMainImage" src="${esc(imgUrl(images[0]))}" alt="${esc(p.name)}" /></div>
            <div class="pd-thumbs">
              ${images.map((im, i) => `<div class="pd-thumb${i ? "" : " active"}" data-full="${esc(imgUrl(im))}">
                <img src="${esc(imgUrl(thumbOf(im)))}" alt="${esc(p.name)} view ${i + 1}" loading="lazy" /></div>`).join("")}
            </div>
          </div>
          <div>
            <p class="meta">${meta}</p>
            <h1 style="margin-top:0.5rem;font-size:clamp(1.8rem,3vw,2.4rem)">${esc(p.name)}</h1>
            <p style="font-family:var(--font-display);font-size:1.8rem;color:var(--maroon);margin-top:0.6rem">
              ${money(p.price)} <span style="font-size:0.9rem;color:var(--muted);font-family:var(--font-sans)">per piece</span></p>
            ${p.min_qty > 1 ? `<p class="meta" style="margin-top:0.4rem">Minimum order: ${p.min_qty} pieces</p>` : ""}

            <div class="pd-info-row">
              <div>
                <p class="meta" style="margin-bottom:0.4rem">Quantity</p>
                <div class="pd-qty">
                  <button type="button" id="pdQtyMinus" aria-label="Decrease quantity">&minus;</button>
                  <span id="pdQty">${p.min_qty}</span>
                  <button type="button" id="pdQtyPlus" aria-label="Increase quantity">+</button>
                </div>
              </div>
              <div><p class="meta" style="margin-bottom:0.4rem">Total</p><p class="pd-total" id="pdTotalPrice"></p></div>
            </div>

            <a class="btn" id="pdEnquireBtn" href="#" target="_blank" rel="noopener" style="width:100%;text-align:center">Enquire on WhatsApp</a>

            ${p.dimensions ? `<div class="pd-detail-block"><h3>Dimensions</h3><p class="muted" style="font-size:0.9rem">${esc(p.dimensions)}</p></div>` : ""}
            ${p.description ? `<div class="pd-detail-block"><h3>Description</h3><p class="muted" style="font-size:0.9rem">${esc(p.description)}</p></div>` : ""}
            ${cat.return_policy ? `<div class="pd-detail-block"><h3>Return &amp; Replacement Policy</h3><p class="muted" style="font-size:0.9rem">${esc(cat.return_policy)}</p></div>` : ""}
          </div>
        </div>
      </div>
    </section>

    ${faqs.length ? `<section class="section reveal" style="background:var(--gold-soft,#f0e3c2)">
      <div class="container" style="max-width:52rem">
        <p class="eyebrow">Questions</p><div class="rule"></div>
        <h2 style="font-size:clamp(1.6rem,3vw,2.2rem);margin-bottom:1.5rem">Frequently asked questions</h2>
        <div id="faqBox">${faqs.map((f) => `<div class="acc"><button type="button">${esc(f.q)}<span>+</span></button><div class="a">${esc(f.a)}</div></div>`).join("")}</div>
      </div></section>` : ""}

    <section class="section reveal" id="relatedSection" style="display:none">
      <div class="container">
        <p class="eyebrow">You may also like</p><div class="rule"></div>
        <h2 style="font-size:clamp(1.6rem,3vw,2.2rem);margin-bottom:1.5rem">More from ${esc(cat.name)}</h2>
        <div class="related-scroll" id="relatedList"></div>
      </div>
    </section>`;

    if (window.observeReveal) window.observeReveal(app);
    if (window.initReviews) window.initReviews(p.id);
    else app.querySelectorAll(".reveal").forEach((n) => n.classList.add("visible"));

    // gallery
    const main = document.getElementById("pdMainImage");
    const thumbs = app.querySelectorAll(".pd-thumb");
    thumbs.forEach((t) => t.addEventListener("click", () => {
      main.src = t.dataset.full;
      thumbs.forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
    }));

    // hero slider
    const slides = app.querySelectorAll(".hero-slide");
    if (slides.length > 1) {
      let cur = 0;
      setInterval(() => {
        slides[cur].classList.remove("active");
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add("active");
      }, 5000);
    }

    // FAQ accordion (delegated)
    const fb = document.getElementById("faqBox");
    if (fb) fb.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) b.parentElement.classList.toggle("open");
    });

    // quantity + WhatsApp, starts at min_qty
    const price = Number(p.price);
    const step = p.min_qty >= 50 ? 10 : 1;
    let qty = p.min_qty;
    const qEl = document.getElementById("pdQty");
    const tEl = document.getElementById("pdTotalPrice");
    const wa = document.getElementById("pdEnquireBtn");
    function refresh() {
      qEl.textContent = qty;
      tEl.textContent = money(price * qty);
      wa.href = waLink(
        `Enquiry about ${p.name}\nProduct: ${p.name}\nCategory: ${cat.name}\n` +
          (p.material ? `Material/Fabric: ${p.material}\n` : "") +
          `Price: Rs.${price}\nQuantity: ${qty}\nTotal: Rs.${price * qty}`
      );
    }
    document.getElementById("pdQtyMinus").addEventListener("click", () => { if (qty - step >= p.min_qty) { qty -= step; refresh(); } });
    document.getElementById("pdQtyPlus").addEventListener("click", () => { qty += step; refresh(); });
    refresh();

    // related (loaded after the main render so it never blocks it)
    try {
      const rel = await API.related(p.category, p.slug);
      if (rel.length) {
        document.getElementById("relatedList").innerHTML = rel.map((r) => `
          <a class="card" href="product.html?slug=${encodeURIComponent(r.slug)}">
            <div class="thumb ${esc(r.thumb_color)}" data-slider><img src="${esc(imgUrl(r.thumb))}" alt="${esc(r.name)}" loading="lazy" class="active" /></div>
            <div class="body"><p class="meta">${esc(cat.name)}</p>
              <h3 style="margin-top:.3rem;font-size:1rem">${esc(r.name)}</h3>
              <p class="price" style="margin-top:.4rem">${money(r.price)}</p></div></a>`).join("");
        const sec = document.getElementById("relatedSection");
        sec.style.display = "";
        if (window.observeReveal) window.observeReveal(sec.parentElement);
      }
    } catch (e) { /* related is optional */ }
  });
})();