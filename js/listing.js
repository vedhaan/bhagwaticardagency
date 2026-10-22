document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("plist");
  if (!list || !list.dataset.category) return;

  const PAGE = 24;
  const cat = list.dataset.category;
  const q = document.getElementById("fq");
  const faithSel = document.getElementById("freligion");
  const matSel = document.getElementById("fmaterial");
  const sortSel = document.getElementById("fsort");
  const empty = document.getElementById("pempty");
  const more = document.getElementById("pmore");

  let all = [], view = [], shown = 0, catName = cat;

  function fillSelect(sel, values) {
    const first = sel.options[0];
    sel.innerHTML = "";
    sel.appendChild(first);
    values.forEach((v) => sel.appendChild(new Option(v, v)));
  }
  const uniq = (key) => [...new Set(all.map((p) => p[key]).filter(Boolean))].sort();

  function renderMore() {
    const slice = view.slice(shown, shown + PAGE);
    const tmp = document.createElement("div");
    tmp.innerHTML = slice.map((p) => cardHTML(p, catName)).join("");
    const nodes = [...tmp.children];
    nodes.forEach((n) => list.appendChild(n));
    shown += slice.length;
    if (window.observeReveal) window.observeReveal(list);
    else nodes.forEach((n) => n.classList.add("visible"));
    more.style.display = shown < view.length ? "inline-flex" : "none";
  }

  function apply() {
    const query = (q.value || "").trim().toLowerCase();
    const faith = faithSel.value, mat = matSel.value, sort = sortSel.value;
    view = all.filter(
      (p) => (!query || p.name.toLowerCase().includes(query)) && (!faith || p.faith === faith) && (!mat || p.material === mat) && extra(p)
    );
    if (sort === "low") view = view.slice().sort((a, b) => a.price - b.price);
    if (sort === "high") view = view.slice().sort((a, b) => b.price - a.price);
    list.innerHTML = "";
    shown = 0;
    empty.style.display = view.length ? "none" : "block";
    empty.textContent = "No pieces match these filters.";
    renderMore();
  }

  try {
    const [rows, cats] = await Promise.all([API.list(cat), API.categories()]);
    all = rows;
    catName = (cats[cat] && cats[cat].name) || cat;
  } catch (e) {
    empty.style.display = "block";
    empty.textContent = "Couldn't load products. Please refresh the page.";
    return;
  }

  fillSelect(matSel, uniq("material"));
  const faiths = uniq("faith");
  if (faiths.length) fillSelect(faithSel, faiths);
  else faithSel.style.display = "none"; // faith filter only when the data has it


  // ---- Links from the home page: ?style= ?finish= ?type= ?price= ----
  const params = new URLSearchParams(location.search);
  const ALIAS = { hindu: ["hindu"], nikah: ["muslim", "nikah", "islam"], sikh: ["sikh"], jain: ["jain"] };
  const FINISH = {
    "laser-cut": { label: "Laser cut", terms: ["laser"] },
    foil: { label: "Gold foil", terms: ["foil"] },
    box: { label: "Box invitations", terms: ["box"] },
    acrylic: { label: "Acrylic", terms: ["acrylic"] },
    "handmade-paper": { label: "Handmade paper", terms: ["handmade"] },
  };
  const TYPE = {
    shagun: { label: "Shagun covers", terms: ["shagun"] },
    velvet: { label: "Velvet covers", terms: ["velvet"] },
    money: { label: "Money covers", terms: ["money"] },
    envelope: { label: "Envelopes", terms: ["envelope"] },
  };
  const PRICE = {
    "under-100": { label: "Under ₹100", test: (n) => n < 100 },
    "100-200": { label: "₹100 to ₹200", test: (n) => n >= 100 && n < 200 },
    "200-plus": { label: "₹200 and above", test: (n) => n >= 200 },
  };

  const style = (params.get("style") || "").toLowerCase();
  if (style && ALIAS[style]) {
    const opt = [...faithSel.options].find((o) => ALIAS[style].some((a) => o.value.toLowerCase().includes(a)));
    if (opt) faithSel.value = opt.value;
  }
  const hit = FINISH[params.get("finish")] || TYPE[params.get("type")];
  const pr = PRICE[params.get("price")];
  const extra = (p) => {
    if (hit) {
      const hay = Object.values(p).filter((v) => typeof v === "string").join(" ").toLowerCase();
      if (!hit.terms.some((t) => hay.includes(t))) return false;
    }
    if (pr && !pr.test(Number(p.price))) return false;
    return true;
  };
  const tags = [hit && hit.label, pr && pr.label].filter(Boolean);
  if (tags.length) {
    list.insertAdjacentHTML(
      "beforebegin",
      '<p class="hm-active-filter">Showing: ' + tags.join(", ") + ' <a href="' + location.pathname + '">Clear</a></p>'
    );
  }
  let t;
  q.addEventListener("input", () => { clearTimeout(t); t = setTimeout(apply, 150); });
  [faithSel, matSel, sortSel].forEach((el) => el.addEventListener("change", apply));
  more.addEventListener("click", renderMore);
  apply();
});