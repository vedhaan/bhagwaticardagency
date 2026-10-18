BHAGWATI CARD AGENCY WEBSITE - README (LATEST ROUND)
========================================================
Is baar bahut bade changes hue hain - 120+ naye pages ban gaye
hain. Neeche sab kuch detail mein hai.

------------------------------------------------
1. WHITE LINE FIX
------------------------------------------------
File: style.css (.thumb rule)
Har image box ke top corner par ek patli white line dikh rahi
thi - ye card ke rounded corner aur image ke corner mismatch
hone ki wajah se ho raha tha (ek classic CSS rendering issue).
Ab dono ka corner radius match kar diya hai, line gayab ho gayi.

------------------------------------------------
2. CONTACT FORM - Proper Validation
------------------------------------------------
Files: contact.html, js/filters.js
- Naam: sirf letters allowed, number ya special character nahi
  (error: "Name should only contain letters")
- Email: proper format check (something@something.com)
- Phone: exactly 10 digit Indian mobile number (6-9 se shuru)
- Message: khaali nahi ho sakta
- Koi bhi field khaali ho ya galat format mein ho to red error
  message us field ke neeche turant dikh jaata hai, aur form
  submit hi nahi hota jab tak sab sahi na ho.

------------------------------------------------
3. REVIEWS - Naya dedicated page
------------------------------------------------
Naya file: reviews.html
Changed: index.html
- Homepage par ab sirf 4 reviews hain (jaisa pehle tha), form
  wahan se hata diya gaya hai.
- Homepage ke neeche "All Reviews" button hai jo reviews.html
  par le jaata hai.
- reviews.html par sabhi reviews 2-2 ki pair mein dikhte hain,
  aur yahin "Share your experience" form bhi hai.
- Review form mein bhi wahi validation hai jo contact form mein
  hai - naam sahi format mein, occasion aur review text khaali
  nahi hona chahiye, kam se kam 10 characters ka review.
- REMINDER: Reviews sirf submit karne wale ke apne browser mein
  save hote hain (koi backend/database nahi hai) - dusre
  visitors ko automatically nahi dikhenge.

------------------------------------------------
4. HAR PRODUCT KA APNA ALAG PAGE (120 pages!)
------------------------------------------------
Naye files: product-*.html (120 files, e.g.
  product-maroon-mughal-foil-invitation.html)
Changed: wedding-cards.html, invitation-cards.html,
  gift-covers.html, wedding-accessories.html,
  corporate-printing.html, packaging-printing.html
  (in sabme product ki image aur naam par click karke ab uska
  detail page khulta hai)

Har product page mein hai:
- 4 images ki gallery (thumbnails par click karke bada image
  badalta hai)
- Product ka naam, price
- Quantity selector (+ / -) jisse total price automatically
  update hoti hai
- WhatsApp "Enquire" button - jisme quantity, price, material
  sab automatically message mein chala jaata hai
- Dimensions (size details)
- Return & Replacement Policy
- 4 FAQs (us category ke hisaab se, jaise "minimum order
  quantity kya hai", "customization ho sakti hai kya")
- "You may also like" - side-scroll mein 6 related products
  usi category se
- Us specific product ke liye alag Reviews section (validated
  form, autosave, same tareeka jaisa homepage/reviews page mein
  hai, lekin har product ka apna alag review set hai)

------------------------------------------------
5. BLOG - Har post ka apna page (6 pages)
------------------------------------------------
Naye files: blog-*.html (6 files)
Changed: blog.html (ab title/image par click karke poora blog
  post khulta hai)

Har blog page mein hai:
- 4 images ki gallery
- Blog ka title, category, date
- 4-5 paragraphs ka poora likha hua content (specific us topic
  ke hisaab se - jaise paper/GSM guide, foil vs emboss vs
  letterpress, wording etiquette, wagera)
- Neeche "More from the journal" mein 3 related blog posts

------------------------------------------------
6. SEO - On-page SEO poore site mein
------------------------------------------------
Files: sabhi HTML pages, naya sitemap.xml, naya robots.txt

Kya kiya:
- BADA BUG MIL KE FIX KIYA: Pehle SABHI 16 original pages
  (index, about, contact, wagera) ka EK HI <title> tag tha -
  ye Google ke liye bahut bura hota hai (duplicate titles).
  Ab har page ka apna alag, keyword-relevant title aur meta
  description hai.
- Har page par canonical tag add kiya (Google ko batata hai
  "yehi is page ka asli/original URL hai").
- Har product page par structured data (JSON-LD "Product"
  schema) add kiya - isse Google search results mein price,
  availability wagera dikhne ke chances badhte hain (rich
  results).
- sitemap.xml banaya - isme sabhi 143 pages ki list hai. Ye
  file aap Google Search Console mein submit kar sakte ho taaki
  Google saari pages jaldi crawl kare.
- robots.txt banaya - Google/search engines ko batata hai ki
  poori site crawl karne ki permission hai, aur sitemap.xml
  kaha milega.
- Har image mein already alt text tha (product/blog naam se) -
  wo sab jagah maintain kiya gaya hai naye pages mein bhi.
- Har page par ek hi H1 (main heading) hai - proper heading
  hierarchy follow ki gayi hai.

IMPORTANT: SEO "on-page" (jo website ke andar control hota hai)
poora sahi kiya gaya hai. Lekin SEO ranking sirf on-page se nahi
hoti - domain hosting, backlinks, Google Business Profile,
page-load speed (jab real images add karoge tab image-size
optimize karna important hoga), aur samay ke saath content
freshness bhi matter karte hain. Ye sab website ke bahar ki
cheezein hain jo is file ke through control nahi hoti.

------------------------------------------------
SABHI PURANE CHANGES (previous rounds se, abhi bhi active hain)
------------------------------------------------
- Gallery mein 24 items, filter chips (Wedding/Foil/Laser Cut/
  Boxes/Corporate/Packaging) kaam karte hain.
- "Craft you can feel before you read it" section mobile mein
  side-scroll karta hai.
- Phone number: +91 81600 08957 (sabhi jagah)
- Email: hardikjosh8@gmail.com (js/filters.js ki top line
  "OWNER_EMAIL" mein change kar sakte ho)
- WhatsApp number "918160008957" - kisi bhi file mein Find se
  search karke sabhi jagah replace kar sakte ho.
- Newsletter aur Contact form dono email app kholte hain
  pre-filled details ke saath.

========================================================
SABHI CHANGES FULLY RESPONSIVE HAIN - 320px se 1440px tak,
143 pages mein se representative sample (38 pages x 5 screen
sizes = 190 checks) test kiya, zero horizontal-scroll issues.
========================================================
