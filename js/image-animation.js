/* IMAGE ANIMATION ONLY - delegated, so it also works on cards rendered later from the API.
   No image paths are stored here. */
(function () {
  const SEL =
    ".hero img, .hero-image img, .hero-art img, " +
    ".card img, .product-card img, .service-card img, " +
    ".category-card img, .gallery img, .gallery-item img, " +
    ".banner img, .section-image img";

  function set(img, on) {
    if (!img || !img.matches || !img.matches(SEL)) return;
    img.style.transition = "transform .45s ease, filter .45s ease";
    img.style.transform = on ? "scale(1.035)" : "scale(1)";
    img.style.filter = on ? "brightness(1.03)" : "brightness(1)";
  }
  document.addEventListener("mouseover", (e) => set(e.target, true));
  document.addEventListener("mouseout", (e) => set(e.target, false));
})();