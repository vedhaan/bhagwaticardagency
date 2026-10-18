/* =========================================================
   ANIMATION 1: SCROLL REVEAL
   Used on: every element with class="reveal" (cards, panels,
   section headings) across ALL pages. Fades + slides an
   element up into view the first time it scrolls into the
   viewport, with a small stagger per item.
   ========================================================= */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Call again after rendering dynamic content (listing.js / product.js do this).
window.observeReveal = (root = document) => {
  root.querySelectorAll('.reveal:not([data-obs])').forEach((el, i) => {
    el.dataset.obs = '1';
    el.style.transitionDelay = `${Math.min(i * 35, 280)}ms`;
    revealObserver.observe(el);
  });
};
document.addEventListener('DOMContentLoaded', () => window.observeReveal());
/* =========================================================
   ANIMATION 2: STAT COUNTER
   Used on: homepage (index.html) "stats" strip only
   (39+ Years of craft, 40k+ Families served, 45+ Printing
   techniques, 12 Languages typeset).
   Counts each number up from 0 to its target the first time
   the stats strip scrolls into view. Keeps any "+" or "k+"
   suffix exactly as written in the HTML, so no text needs to
   change - just the number animates.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const statNumbers = document.querySelectorAll('.stats .n');
  if (!statNumbers.length) return;

  function animateCount(el) {
    const raw = el.textContent.trim();
    const match = raw.match(/^([\d.]+)(.*)$/);
    if (!match) return;
    const target = parseFloat(match[1]);
    const suffix = match[2];
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        statNumbers.forEach(animateCount);
        obs.disconnect();
      }
    });
  }, { threshold: 0.4 });

  statsObserver.observe(document.querySelector('.stats'));
});

/* =========================================================
   ANIMATION 3: PRODUCT IMAGE - SINGLE STATIC IMAGE
   Used on: every product card's image box (.thumb) on the
   listing pages (wedding-cards.html, invitation-cards.html,
   gift-covers.html, wedding-accessories.html,
   corporate-printing.html, packaging-printing.html) and on
   the "related products" strip on every product detail page.

   Previously this auto-rotated through 4 images per card.
   Per the site update, listing/related cards now show ONE
   fixed image only (the first image, already marked
   class="active" in the HTML) - the 4-image gallery now
   lives only on the product detail page itself (its own
   click-to-swap thumbnail gallery, handled separately in
   filters.js). This block intentionally does nothing now;
   left in place (instead of deleted) so it's easy to revert
   later if auto-rotation is ever wanted back.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const productSliders = document.querySelectorAll('.thumb[data-slider]');
  productSliders.forEach((thumb) => {
    const imgs = thumb.querySelectorAll('img');
    if (!imgs.length) return;
    // Make sure exactly the first image is the visible one and stop here.
    imgs.forEach((img, idx) => img.classList.toggle('active', idx === 0));
  });
});
