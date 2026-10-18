/* =========================================================
   OWNER EMAIL - CHANGE THIS ONE LINE ANYTIME
   Used by: newsletter signup (index.html) AND the contact
   page enquiry form (contact.html). Both send their details
   to this single address. To change the email address later,
   just edit the line below - nothing else needs to change.
   ========================================================= */
const OWNER_EMAIL = "hardikjosh7@gmail.com";

/* =========================================================
   SHARED FORM VALIDATION HELPERS
   Used by: contact form (#cform) AND the review forms
   (#reviewForm on index.html and reviews.html).

   Rules:
   - Name: letters and spaces only, at least 2 characters -
     no numbers, no special characters.
   - Email: must look like a real email address
     (something@something.something).
   - Phone: exactly 10 digits, numbers only.
   These are checked on submit, and also as the person types/
   leaves a field, so mistakes are caught immediately with a
   message under that field - the form will not submit (and no
   email/WhatsApp message will be prepared) until every field
   is valid.
   ========================================================= */
function isValidName(value) {
  return /^[A-Za-z\s]{2,60}$/.test(value.trim());
}
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.trim());
}
function isValidPhone(value) {
  return /^[6-9]\d{9}$/.test(value.trim());
}
function showFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add("invalid");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("show");
    }
    return false;
  }
  inputEl.classList.remove("invalid");
  if (errorEl) errorEl.classList.remove("show");
  return true;
}

/* =========================================================
   NEWSLETTER SIGNUP -> EMAIL
   Used on: index.html ("Stay in touch" section, #newsletterForm).

   IMPORTANT - how this actually works without a backend:
   A plain website (no server) cannot silently send an email by
   itself - browsers don't allow JavaScript to send emails
   directly. So when someone subscribes, this opens THEIR email
   app with a ready-made message addressed to you (OWNER_EMAIL)
   - they just need to hit "Send" once it opens. This is the
   only way to receive form data by email without adding a paid
   backend/service. If you'd rather have subscribers land
   silently in your inbox with zero extra click from them,
   that needs a small backend (e.g. a form-handling service or
   your own server) added later.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletterForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletterEmail").value.trim();
    if (!email) return;

    const subject = encodeURIComponent("New newsletter subscriber");
    const body = encodeURIComponent(
      "A visitor subscribed on the website.\n\nTheir email: " + email
    );
    window.location.href =
      "mailto:" + OWNER_EMAIL + "?subject=" + subject + "&body=" + body;

    const msg = document.getElementById("newsletterMsg");
    if (msg) {
      msg.textContent =
        "Your email app is opening with the details filled in - just hit Send.";
    }
    form.reset();
  });
});

/* =========================================================
   CONTACT PAGE ENQUIRY FORM -> EMAIL
   Used on: contact.html ("Send an enquiry" form, #cform).
   Same mailto approach as the newsletter above - opens the
   visitor's email app pre-filled with everything they typed
   (name, email, phone, interest, message), addressed to
   OWNER_EMAIL, ready for them to press Send.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cform");
  if (!form) return;

  const nameEl = document.getElementById("cname");
  const emailEl = document.getElementById("cemail");
  const phoneEl = document.getElementById("cphone");
  const messageEl = document.getElementById("cmessage");
  const nameErr = document.getElementById("cnameError");
  const emailErr = document.getElementById("cemailError");
  const phoneErr = document.getElementById("cphoneError");
  const messageErr = document.getElementById("cmessageError");

  function validateName() {
    const v = nameEl.value.trim();
    if (!v) return showFieldError(nameEl, nameErr, "Please enter your name.");
    if (!isValidName(v))
      return showFieldError(
        nameEl,
        nameErr,
        "Name should only contain letters (no numbers or symbols)."
      );
    return showFieldError(nameEl, nameErr, "");
  }
  function validateEmail() {
    const v = emailEl.value.trim();
    if (!v) return showFieldError(emailEl, emailErr, "Please enter your email.");
    if (!isValidEmail(v))
      return showFieldError(emailEl, emailErr, "Please enter a valid email address.");
    return showFieldError(emailEl, emailErr, "");
  }
  function validatePhone() {
    const v = phoneEl.value.trim();
    if (!v) return showFieldError(phoneEl, phoneErr, "Please enter your phone number.");
    if (!isValidPhone(v))
      return showFieldError(
        phoneEl,
        phoneErr,
        "Enter a valid 10-digit Indian mobile number."
      );
    return showFieldError(phoneEl, phoneErr, "");
  }
  function validateMessage() {
    const v = messageEl.value.trim();
    if (!v)
      return showFieldError(messageEl, messageErr, "Please add a short message.");
    return showFieldError(messageEl, messageErr, "");
  }

  nameEl.addEventListener("blur", validateName);
  emailEl.addEventListener("blur", validateEmail);
  phoneEl.addEventListener("blur", validatePhone);
  messageEl.addEventListener("blur", validateMessage);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const okName = validateName();
    const okEmail = validateEmail();
    const okPhone = validatePhone();
    const okMessage = validateMessage();
    if (!okName || !okEmail || !okPhone || !okMessage) {
      const msg = document.getElementById("cformMsg");
      if (msg) msg.textContent = "Please fix the highlighted fields above.";
      return;
    }

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const phone = phoneEl.value.trim();
    const interest = document.getElementById("cinterest").value;
    const message = messageEl.value.trim();

    const subject = encodeURIComponent("New enquiry from " + name);
    const body = encodeURIComponent(
      "Name: " + name +
      "\nEmail: " + email +
      "\nPhone: " + phone +
      "\nInterested in: " + interest +
      "\nMessage: " + message
    );
    window.location.href =
      "mailto:" + OWNER_EMAIL + "?subject=" + subject + "&body=" + body;

    const msg = document.getElementById("cformMsg");
    if (msg) {
      msg.textContent =
        "Your email app is opening with your enquiry filled in - just hit Send.";
    }
  });
});


/* =========================================================
   GALLERY CHIP FILTER
   Used on: gallery.html only (#gchips buttons + #ggrid items).
   Clicking a chip (All / Wedding / Foil / Laser Cut / Boxes /
   Corporate / Packaging) shows only the gallery pieces whose
   data-tag matches that chip. "All" shows everything again.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const chipsWrap = document.getElementById("gchips");
  const galleryGrid = document.getElementById("ggrid");
  if (!chipsWrap || !galleryGrid) return;

  const chips = Array.from(chipsWrap.querySelectorAll(".chip"));
  const items = Array.from(galleryGrid.querySelectorAll(":scope > figure"));
  const emptyMsg = document.getElementById("gempty");

  function filterGallery(tag) {
    let visibleCount = 0;
    items.forEach((item) => {
      const match = tag === "All" || item.dataset.tag === tag;
      item.style.display = match ? "" : "none";
      if (match) visibleCount += 1;
    });
    if (emptyMsg) emptyMsg.style.display = visibleCount === 0 ? "block" : "none";
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      filterGallery(chip.dataset.tag);
    });
  });
});