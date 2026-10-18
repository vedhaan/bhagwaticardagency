// Depends on api.js (esc, API) and filters.js globals (isValidName, showFieldError)
const reviewStars = (n) => "\u2605".repeat(n) + "\u2606".repeat(5 - n);
const reviewPanelHTML = (r) =>
  `<div class="panel reveal visible"><span class="star-display" aria-label="${r.rating} out of 5 stars">${reviewStars(r.rating)}</span>` +
  `<p class="quote">\u201C${esc(r.body)}\u201D</p><div class="rule"></div>` +
  `<p style="font-weight:500">${esc(r.name)}</p><p class="meta">${esc(r.occasion)}</p></div>`;

window.initReviews = async function (productId) {
  const form = document.getElementById("reviewForm");
  const grid = document.getElementById("allReviewsGrid") || document.querySelector(".reviews-grid");
  const msg = document.getElementById("reviewMsg");
  if (!form || !grid) return;

  try {
    const rows = await API.reviews(productId);
    if (rows.length) {
      const ph = grid.querySelector("[data-placeholder]");
      if (ph) ph.remove();
      grid.insertAdjacentHTML("afterbegin", rows.map(reviewPanelHTML).join(""));
    }
  } catch (e) { /* page still works without reviews */ }

  const nameEl = document.getElementById("reviewName");
  const occEl = document.getElementById("reviewOccasion");
  const textEl = document.getElementById("reviewText");
  const nameErr = document.getElementById("reviewNameError");
  const occErr = document.getElementById("reviewOccasionError");
  const textErr = document.getElementById("reviewTextError");

  const vName = () => {
    const v = nameEl.value.trim();
    if (!v) return showFieldError(nameEl, nameErr, "Please enter your name.");
    if (!isValidName(v)) return showFieldError(nameEl, nameErr, "Name should only contain letters.");
    return showFieldError(nameEl, nameErr, "");
  };
  const vOcc = () => showFieldError(occEl, occErr, occEl.value.trim() ? "" : "Please add the occasion & city.");
  const vText = () => {
    const v = textEl.value.trim();
    if (!v) return showFieldError(textEl, textErr, "Please write a short review.");
    if (v.length < 10) return showFieldError(textEl, textErr, "Review is too short - please add a little more detail.");
    return showFieldError(textEl, textErr, "");
  };
  nameEl.addEventListener("blur", vName);
  occEl.addEventListener("blur", vOcc);
  textEl.addEventListener("blur", vText);

  const say = (t, color) => { if (!msg) return; msg.style.display = "block"; msg.style.color = color || ""; msg.textContent = t; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const hp = document.getElementById("reviewWebsite");
    if (hp && hp.value) return; // honeypot: bots fill it, humans can't see it
    if (!(vName() & vOcc() & vText())) return say("Please fix the highlighted fields above.", "#c0392b");

    const last = +localStorage.getItem("bc:lastReview") || 0;
    if (Date.now() - last < 60000) return say("Please wait a minute before submitting another review.", "#c0392b");

    const checked = form.querySelector('input[name="reviewRating"]:checked');
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await API.submitReview({
        product_id: productId || null,
        name: nameEl.value.trim(),
        occasion: occEl.value.trim(),
        rating: checked ? parseInt(checked.value, 10) : 5,
        body: textEl.value.trim(),
      });
      localStorage.setItem("bc:lastReview", Date.now());
      form.reset();
      say("Thank you! Your review will appear once it has been approved.");
    } catch (err) {
      say("Sorry, we couldn't submit your review. Please try again later.", "#c0392b");
    } finally {
      btn.disabled = false;
    }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  // Pages without the product #app (e.g. reviews.html) use site-wide reviews.
  if (!document.getElementById("app")) window.initReviews(null);

  // Homepage: show the 4 newest approved site-wide reviews.
  const home = document.getElementById("homeReviews");
  if (home) {
    try {
      const rows = (await API.reviews(null)).slice(0, 4);
      if (rows.length) home.innerHTML = rows.map(reviewPanelHTML).join("");
    } catch (e) { /* keep the static fallback */ }
  }
});