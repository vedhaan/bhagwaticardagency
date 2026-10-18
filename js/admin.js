const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const BUCKET = "product-images";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const imgUrl = (p) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${p}`;
const thumbOf = (p) => p.replace(/(\.\w+)$/, "-t$1");
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

let cats = [], products = [], editingId = null, imgs = [], removed = [];

/* ---------- auth ---------- */
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const { error } = await sb.auth.signInWithPassword({ email: $("email").value, password: $("password").value });
  if (error) { $("loginMsg").textContent = error.message; return; }
  boot();
});
$("logout").addEventListener("click", async () => { await sb.auth.signOut(); location.reload(); });

async function boot() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
  if (!data) { await sb.auth.signOut(); $("loginMsg").textContent = "This account is not an admin."; return; }
  $("login").classList.add("hidden");
  $("app").classList.remove("hidden");
  await loadAll();
}

async function loadAll() {
  const c = await sb.from("categories").select("*").order("sort_order");
  cats = c.data || [];
  const p = await sb.from("products").select("id,slug,name,category,price,is_active,thumb").order("created_at", { ascending: false }).limit(2000);
  products = p.data || [];
  const opts = cats.map((x) => `<option value="${x.slug}">${esc(x.name)}</option>`).join("");
  $("f_category").innerHTML = opts;
  $("scat").innerHTML = `<option value="">All categories</option>` + opts;
  $("c_sel").innerHTML = opts;
  renderRows();
  await loadReviews();
  loadCategoryForm();
}

/* ---------- tabs ---------- */
document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("outline", x !== b));
  $("tab-products").classList.toggle("hidden", b.dataset.tab !== "products");
  $("tab-categories").classList.toggle("hidden", b.dataset.tab !== "categories");
}));

document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll("[data-tab]").forEach((x) => {
    x.classList.toggle("outline", x !== b);
    $("tab-" + x.dataset.tab).classList.toggle("hidden", x !== b);
  });
}));

/* ---------- list ---------- */
function renderRows() {
  const q = $("s").value.trim().toLowerCase(), c = $("scat").value;
  const rows = products.filter((p) => (!q || p.name.toLowerCase().includes(q)) && (!c || p.category === c));
  $("count").textContent = `${rows.length} of ${products.length} products`;
  $("rows").innerHTML = rows.map((p) => `<tr>
    <td>${p.thumb ? `<img src="${esc(imgUrl(p.thumb))}" alt="">` : ""}</td>
    <td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>₹${p.price}</td>
    <td><input type="checkbox" data-live="${p.id}" ${p.is_active ? "checked" : ""}></td>
    <td><button class="btn sm outline" data-edit="${p.id}" type="button">Edit</button>
        <button class="btn sm outline" data-del="${p.id}" type="button">Delete</button></td></tr>`).join("");
}
$("s").addEventListener("input", renderRows);
$("scat").addEventListener("change", renderRows);
$("rows").addEventListener("click", async (e) => {
  if (e.target.dataset.edit) openForm(e.target.dataset.edit);
  if (e.target.dataset.del) delProduct(e.target.dataset.del);
});
$("rows").addEventListener("change", async (e) => {
  if (!e.target.dataset.live) return;
  const { error } = await sb.from("products").update({ is_active: e.target.checked }).eq("id", e.target.dataset.live);
  if (error) { alert(error.message); e.target.checked = !e.target.checked; }
});

async function delProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!confirm(`Delete "${p.name}" permanently? Consider unchecking "Live" instead.`)) return;
  const { data } = await sb.from("products").select("images").eq("id", id).single();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) return alert(error.message);
  const paths = (data && data.images) || [];
  if (paths.length) await sb.storage.from(BUCKET).remove(paths.flatMap((x) => [x, thumbOf(x)]));
  await loadReviews();
}

/* ---------- form ---------- */
$("addBtn").addEventListener("click", () => openForm(null));
$("cancelBtn").addEventListener("click", closeForm);
function closeForm() { $("formView").classList.add("hidden"); $("listView").classList.remove("hidden"); }

async function openForm(id) {
  editingId = id; imgs = []; removed = [];
  $("formMsg").textContent = "";
  $("formTitle").textContent = id ? "Edit product" : "Add product";
  let p = { name: "", slug: "", category: cats[0] ? cats[0].slug : "", material: "", faith: "", price: "", min_qty: 1,
    tag: "", thumb_color: "maroon", dimensions: "", description: "", sort_order: 0, is_active: true, images: [] };
  if (id) {
    const r = await sb.from("products").select("*").eq("id", id).single();
    if (r.error) return alert(r.error.message);
    p = r.data;
  }
  $("f_name").value = p.name; $("f_slug").value = p.slug; $("f_category").value = p.category;
  $("f_material").value = p.material || ""; $("f_faith").value = p.faith || "";
  $("f_price").value = p.price; $("f_min").value = p.min_qty; $("f_tag").value = p.tag || "";
  $("f_color").value = p.thumb_color; $("f_dim").value = p.dimensions || ""; $("f_desc").value = p.description || "";
  $("f_sort").value = p.sort_order; $("f_active").checked = p.is_active;
  $("f_files").value = "";
  imgs = (p.images || []).map((path) => ({ path, url: imgUrl(thumbOf(path)) }));
  renderImgs();
  $("listView").classList.add("hidden"); $("formView").classList.remove("hidden");
  window.scrollTo(0, 0);
}

$("f_name").addEventListener("input", () => { if (!editingId) $("f_slug").value = slugify($("f_name").value); });

$("f_files").addEventListener("change", (e) => {
  [...e.target.files].forEach((file) => imgs.push({ file, url: URL.createObjectURL(file) }));
  e.target.value = "";
  renderImgs();
});

function renderImgs() {
  $("imgs").innerHTML = imgs.map((im, i) => `<figure><img src="${esc(im.url)}" alt="">
    <div>${i === 0 ? "<b>Cover</b>" : `<button type="button" data-cover="${i}">Make cover</button>`}
    <button type="button" data-rm="${i}">Remove</button></div></figure>`).join("");
}
$("imgs").addEventListener("click", (e) => {
  if (e.target.dataset.cover) { const [im] = imgs.splice(+e.target.dataset.cover, 1); imgs.unshift(im); }
  if (e.target.dataset.rm) { const [im] = imgs.splice(+e.target.dataset.rm, 1); if (im.path) removed.push(im.path); }
  renderImgs();
});

// Resize + compress in the browser. WebP where supported, JPEG fallback.
async function toBlob(file, max, quality) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  let blob = await new Promise((r) => c.toBlob(r, "image/webp", quality));
  if (!blob || blob.type !== "image/webp") blob = await new Promise((r) => c.toBlob(r, "image/jpeg", quality));
  return blob;
}
async function upload(path, blob) {
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) throw error;
}

$("formView").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = (t) => ($("formMsg").textContent = t);
  const name = $("f_name").value.trim();
  const slug = slugify($("f_slug").value || name);
  const price = parseFloat($("f_price").value);
  if (!name || !slug) return msg("Name is required.");
  if (isNaN(price) || price < 0) return msg("Enter a valid price.");
  if (!imgs.length) return msg("Add at least one image.");

  $("saveBtn").disabled = true;
  try {
    for (const [i, im] of imgs.entries()) {
      if (!im.file) continue;
      msg(`Uploading image ${i + 1} of ${imgs.length}…`);
      const full = await toBlob(im.file, 1200, 0.82);
      const th = await toBlob(im.file, 400, 0.78);
      const ext = full.type === "image/webp" ? "webp" : "jpg";
      im.path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      await upload(im.path, full);
      await upload(thumbOf(im.path), th);
      delete im.file;
    }
    const paths = imgs.map((i) => i.path);
    const row = {
      name, slug, category: $("f_category").value,
      material: $("f_material").value.trim() || null, faith: $("f_faith").value.trim() || null,
      price, min_qty: Math.max(1, parseInt($("f_min").value) || 1),
      tag: $("f_tag").value || null, thumb_color: $("f_color").value,
      dimensions: $("f_dim").value.trim() || null, description: $("f_desc").value.trim() || null,
      images: paths, thumb: thumbOf(paths[0]),
      sort_order: parseInt($("f_sort").value) || 0, is_active: $("f_active").checked,
    };
    msg("Saving…");
    const { error } = editingId ? await sb.from("products").update(row).eq("id", editingId) : await sb.from("products").insert(row);
    if (error) throw error;
    if (removed.length) await sb.storage.from(BUCKET).remove(removed.flatMap((x) => [x, thumbOf(x)]));
    closeForm();
    await loadAll();
  } catch (err) {
    msg(err.message && err.message.includes("duplicate") ? "That slug already exists. Change the URL slug." : "Error: " + (err.message || err));
  } finally {
    $("saveBtn").disabled = false;
  }
});

/* ---------- categories ---------- */
function loadCategoryForm() {
  const c = cats.find((x) => x.slug === $("c_sel").value);
  if (!c) return;
  $("c_min").value = c.default_min_qty;
  $("c_policy").value = c.return_policy || "";
  $("c_faqs").value = (c.faqs || []).map((f) => `${f.q} || ${f.a}`).join("\n");
  $("c_msg").textContent = "";
}
$("c_sel").addEventListener("change", loadCategoryForm);
$("c_save").addEventListener("click", async () => {
  const faqs = $("c_faqs").value.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [q, ...a] = l.split("||");
    return { q: q.trim(), a: a.join("||").trim() };
  }).filter((f) => f.q && f.a);
  const { error } = await sb.from("categories").update({
    default_min_qty: Math.max(1, parseInt($("c_min").value) || 1),
    return_policy: $("c_policy").value.trim() || null, faqs,
  }).eq("slug", $("c_sel").value);
  $("c_msg").textContent = error ? error.message : "Saved.";
  if (!error) await loadAll();
});

/* ---------- reviews moderation ---------- */
let revs = [];
async function loadReviews() {
  const { data } = await sb.from("reviews")
    .select("id,name,occasion,rating,body,is_approved,created_at,products(name)")
    .order("created_at", { ascending: false }).limit(500);
  revs = data || [];
  const pending = revs.filter((r) => !r.is_approved).length;
  $("r_badge").textContent = pending ? `(${pending})` : "";
  renderReviews();
}
function renderReviews() {
  const f = $("r_filter").value;
  const rows = revs.filter((r) => f === "all" || (f === "approved") === r.is_approved);
  $("r_list").innerHTML = rows.length ? rows.map((r) => `
    <div class="panel" style="margin-bottom:.8rem">
      <b>${"\u2605".repeat(r.rating)}${"\u2606".repeat(5 - r.rating)}</b>
      <span class="muted"> &middot; ${esc(r.products ? r.products.name : "Site review")} &middot; ${new Date(r.created_at).toLocaleDateString("en-IN")}</span>
      <p style="margin:.5rem 0">${esc(r.body)}</p>
      <p class="meta">${esc(r.name)} &middot; ${esc(r.occasion)}</p>
      <div class="bar">
        ${r.is_approved
          ? `<button class="btn sm outline" data-unapprove="${r.id}" type="button">Unapprove</button>`
          : `<button class="btn sm" data-approve="${r.id}" type="button">Approve</button>`}
        <button class="btn sm outline" data-rdel="${r.id}" type="button">Delete</button>
      </div></div>`).join("") : `<p class="muted">Nothing here.</p>`;
}
$("r_filter").addEventListener("change", renderReviews);
$("r_list").addEventListener("click", async (e) => {
  const d = e.target.dataset;
  let res;
  if (d.approve) res = await sb.from("reviews").update({ is_approved: true }).eq("id", d.approve);
  else if (d.unapprove) res = await sb.from("reviews").update({ is_approved: false }).eq("id", d.unapprove);
  else if (d.rdel) { if (!confirm("Delete this review permanently?")) return; res = await sb.from("reviews").delete().eq("id", d.rdel); }
  else return;
  if (res.error) return alert(res.error.message);
  await loadReviews();
});


boot();