/* ======================================================================
   Vietnam Food Map — JS panel
   Plain JavaScript, no libraries. Pins are real <button>s, so mouse,
   touch and keyboard all work without extra code.
   ====================================================================== */

// 0. Map coordinate space = the pixels of map.jpg (1024 wide, 1536 tall). Pins, thumbnails, leader lines and
//    the note are all placed from the same numbers, as % of the map box, so they scale with the image.
const VB = { x: 0, w: 1024, h: 1536 };
const pctX = (x) => ((x - VB.x) / VB.w) * 100 + "%";
const pctY = (y) => (y / VB.h) * 100 + "%";

// 1. Content model. x, y are the pin tip in map.jpg pixels (measure them in any image editor).
//    thumb: where the dish sticker sits (its centre) and which way it tilts; a leader line joins it to the pin.
//    m (optional): a slightly different pin position on phones, where neighbouring pins would otherwise stack;
//    thumb.m (optional): likewise a phone-only sticker position. The route and leader lines follow whichever is in use.
//    image: null shows a labelled placeholder on the ticket AND a numbered placeholder on the sticker —
//    never a stand-in photo of a different dish. To use a real photo you have the rights to:
//      image: { src: "https://…/bun-bo-hue.jpg", alt: "Bún bò Huế: thick rice noodles, sliced beef shank and a slice of pork in red broth" }
//    thumbSrc (optional): a separate, tighter crop for the small sticker; defaults to image.src.
const DISHES = [
  { id: "bun-cha", number: 1, name: "Bún chả", label: "Bún chả", city: "Hà Nội", region: "Northern Vietnam",
    x: 385, y: 225, m: { x: 368, y: 212 }, thumb: { x: 680, y: 130, tilt: 3 }, tint: "lime", image: null, thumbSrc: null,
    description: "Grilled pork patties and slices of pork belly sit in a bowl of warm, sweet-sour fish-sauce broth. Rice vermicelli and a pile of fresh herbs come on the side to dip as you go." },
  { id: "pho-bo", number: 2, name: "Phở bò", label: "Phở bò", city: "Hà Nội / Nam Định", region: "Northern Vietnam",
    x: 432, y: 268, m: { x: 448, y: 280 }, thumb: { x: 95, y: 380, tilt: -3, m: { x: 95, y: 300 } }, tint: "sky", image: null, thumbSrc: null,
    description: "Flat rice noodles in a clear beef broth simmered with charred ginger and onion, star anise and cinnamon, topped with sliced beef and scallion. Both Nam Định and Hà Nội are associated with its beginnings." },
  { id: "bun-bo-hue", number: 3, name: "Bún bò Huế", label: "Bún bò Huế", city: "Huế", region: "Central Vietnam",
    x: 500, y: 670, m: { x: 488, y: 638 }, thumb: { x: 150, y: 610, tilt: -3, m: { x: 150, y: 560 } }, tint: "sand", image: null, thumbSrc: null,
    description: "Thick round rice noodles in a beef-bone broth scented with lemongrass and coloured with annatto and chili. Beef shank, a slice of pork and often cubes of pork blood are served with shredded banana blossom and herbs." },
  { id: "cao-lau", number: 4, name: "Cao lầu", label: "Cao lầu", city: "Hội An", region: "Central Vietnam",
    x: 538, y: 722, m: { x: 566, y: 722 }, thumb: { x: 850, y: 735, tilt: 3, m: { x: 850, y: 730 } }, tint: "lime", image: null, thumbSrc: null,
    description: "Chewy, yellow-tinted noodles served nearly dry with a splash of broth, slices of seasoned pork, crisp fried dough squares, bean sprouts and greens. It is closely tied to Hội An and rarely served far from it." },
  { id: "mi-quang", number: 5, name: "Mì Quảng", label: "Mì Quảng", city: "Quảng Nam", region: "Central Vietnam",
    x: 528, y: 778, m: { x: 505, y: 832 }, thumb: { x: 140, y: 840, tilt: 2, m: { x: 140, y: 820 } }, tint: "sky", image: null, thumbSrc: null,
    description: "Wide turmeric-yellow rice noodles with only a little rich broth, shrimp and pork, crushed peanuts and herbs, with a toasted sesame rice cracker to break over the top. Eaten across Quảng Nam and Đà Nẵng." },
  { id: "nem-nuong", number: 6, name: "Nem nướng Nha Trang", label: "Nem nướng", city: "Nha Trang", region: "South-Central coast",
    x: 585, y: 1030, thumb: { x: 860, y: 925, tilt: -3, m: { x: 860, y: 990 } }, tint: "sand", image: null, thumbSrc: null,
    description: "Grilled minced-pork skewers are rolled at the table in rice paper with lettuce, herbs, pickled vegetables and crispy fried rice-paper strips. The roll is dipped in a thick, peanut-based sauce." },
  { id: "com-tam", number: 7, name: "Cơm tấm", label: "Cơm tấm", city: "Hồ Chí Minh City", region: "Southern Vietnam",
    x: 480, y: 1150, thumb: { x: 150, y: 1080, tilt: -2, m: { x: 150, y: 1080 } }, tint: "lime", image: null, thumbSrc: null,
    description: "Broken rice served with a grilled pork chop, shredded pork skin, a slice of steamed egg-and-pork loaf, pickles and a small bowl of sweet fish sauce. Common at breakfast and late at night alike." },
  { id: "banh-xeo", number: 8, name: "Bánh xèo (Southern style)", label: "Bánh xèo", city: "Cần Thơ", region: "Mekong Delta",
    x: 375, y: 1225, thumb: { x: 600, y: 1420, tilt: 3 }, tint: "sky", image: null, thumbSrc: null,
    description: "A large, thin, crisp turmeric-yellow rice-flour crêpe folded over shrimp, pork and bean sprouts. It is torn into pieces, wrapped in lettuce and herbs and dipped in nước chấm. The Central version is smaller and thicker." }
];

// The inline SVG check glyph (ink / on-pin via currentColor). No icon font, no emoji.
const CHECK_SVG = '<svg class="icon-check" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><polyline points="3,8.5 6.5,12 13,4.5"/></svg>';
const SVG_NS = "http://www.w3.org/2000/svg";

// 2. Elements and state
const el = (id) => document.getElementById(id);
const pinsLayer = el("pins");
const thumbsLayer = el("thumbs");
const leaders = el("leaders");
const ticket = el("ticket");
const scrim = el("scrim");
const pad = (n) => String(n).padStart(2, "0");
const isMobile = () => window.matchMedia("(max-width: 599px)").matches;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const visited = new Set();   // dish ids whose ticket has been opened and closed
let selectedId = null;       // dish currently shown on the ticket
let lastPin = null;          // the pin that opened the ticket, so Close can return focus to it

// 3. The pin position in use right now (phones may use dish.m); the route is drawn from these in layout()
const pinPos = (dish) => (isMobile() && dish.m) ? dish.m : dish;

// 4. Build, per dish: a leader line (SVG), a thumbnail sticker and a <button class="pin">.
//    Tab order = pin DOM order = number order, north to south.
DISHES.forEach((dish) => {
  // 4a. Leader line from the pin tip to the sticker centre (the sticker covers its end); positioned in layout()
  ["leader-casing", "leader"].forEach((cls) => {
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("class", cls);
    line.dataset.id = dish.id;
    leaders.appendChild(line);
  });

  // 4b. Thumbnail sticker. Decorative for screen readers (the pin carries the name); clicking it opens the same ticket.
  const thumb = document.createElement("div");
  thumb.className = "thumb";
  thumb.dataset.id = dish.id;
  thumb.setAttribute("aria-hidden", "true");
  thumb.style.setProperty("--thumb-tilt", dish.thumb.tilt + "deg");
  thumb.style.setProperty("--tint", `var(--tint-${dish.tint})`);
  const src = dish.thumbSrc || (dish.image && dish.image.src);
  thumb.innerHTML = src
    ? `<span class="thumb-img"><img src="${src}" alt=""></span>`
    : `<span class="thumb-img"><span class="thumb-placeholder">${pad(dish.number)}</span></span>`;
  const label = document.createElement("span");
  label.className = "thumb-label";
  label.textContent = dish.label || dish.name;   // textContent, so diacritics and odd characters are safe
  thumb.appendChild(label);
  thumb.addEventListener("click", () => document.querySelector(`.pin[data-id="${dish.id}"]`).click());
  thumbsLayer.appendChild(thumb);

  // 4c. The pin itself
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pin";
  btn.dataset.id = dish.id;
  btn.style.left = pctX(dish.x);
  btn.style.top = pctY(dish.y);
  btn.setAttribute("aria-pressed", "false");
  btn.setAttribute("aria-label", `Pin ${dish.number}: ${dish.name}, ${dish.city}`);
  btn.title = dish.name;                       // hover is never the only way to learn the name
  btn.innerHTML = `<span class="pin-head"><span>${pad(dish.number)}</span></span>`;
  btn.addEventListener("click", () => openTicket(dish, btn));
  pinsLayer.appendChild(btn);
});

// 4d. Place everything. Runs once now and again on resize, because stickers are bigger relative to
//     the map on phones (some have a phone-only position, thumb.m) and must stay inside the map's edges.
const mapWrap = document.querySelector(".map-wrap");
const note = document.querySelector(".map-note");
function layout() {
  // How wide a sticker is in map units, so it can be kept inside the map
  const firstThumb = thumbsLayer.firstElementChild;
  const unit = mapWrap.getBoundingClientRect().width / VB.w;           // px per map unit
  const half = (firstThumb.getBoundingClientRect().width / unit) / 2;  // half a sticker, in map units
  const clampX = (x) => Math.max(VB.x + half, Math.min(VB.x + VB.w - half, x));

  // Route through the pins (same numbers as the pins, so it always connects)
  const points = DISHES.map((d) => `${pinPos(d).x},${pinPos(d).y}`).join(" ");
  document.querySelectorAll(".route, .route-casing").forEach((p) => p.setAttribute("points", points));

  DISHES.forEach((dish) => {
    const p = pinPos(dish);
    const pos = (isMobile() && dish.thumb.m) ? dish.thumb.m : dish.thumb;
    const tx = clampX(pos.x), ty = pos.y;
    const pin = pinsLayer.querySelector(`[data-id="${dish.id}"]`);
    pin.style.left = pctX(p.x);
    pin.style.top = pctY(p.y);
    const thumb = thumbsLayer.querySelector(`[data-id="${dish.id}"]`);
    thumb.style.left = pctX(tx);
    thumb.style.top = pctY(ty);
    leaders.querySelectorAll(`[data-id="${dish.id}"]`).forEach((line) => {
      line.setAttribute("x1", p.x); line.setAttribute("y1", p.y);
      line.setAttribute("x2", tx);     line.setAttribute("y2", ty);
    });
  });

  // The "start here ↓" scribble floats in the sea above the northern coast, over pin 01
  note.style.left = pctX(pinPos(DISHES[0]).x);
  note.style.top = pctY(50);
}
layout();
let resizeTimer;
window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });

// 5. Open / close the ticket
function openTicket(dish, btn) {
  selectedId = dish.id;
  lastPin = btn;
  document.querySelectorAll(".pin").forEach((p) => p.setAttribute("aria-pressed", String(p === btn)));
  document.querySelectorAll(".thumb").forEach((t) => t.classList.toggle("is-selected", t.dataset.id === dish.id));

  el("ticket-count").textContent = `Ticket ${pad(dish.number)} / ${pad(DISHES.length)}`;
  el("ticket-status").textContent = visited.has(dish.id) ? "Collected" : "New";
  el("ticket-name").textContent = dish.name;
  el("ticket-place").textContent = `${dish.city} · ${dish.region}`;
  el("ticket-desc").textContent = dish.description;

  const photo = el("ticket-photo");
  photo.replaceChildren();
  if (dish.image) {
    photo.className = "ticket-photo";
    const img = new Image();
    img.src = dish.image.src;
    img.alt = dish.image.alt;
    photo.appendChild(img);
    photo.removeAttribute("aria-label");
  } else {
    // Honest placeholder: says which dish is missing instead of showing a different one.
    photo.className = "ticket-photo is-placeholder";
    const label = document.createElement("strong");
    label.textContent = "Photo placeholder";
    photo.appendChild(label);
    photo.appendChild(document.createTextNode(`${dish.name} - add a photo of this dish`));
    photo.setAttribute("aria-label", `Photo placeholder for ${dish.name}`);
  }

  // Restart the slide-in animation when switching directly from one pin to another
  const inner = ticket.querySelector(".ticket-inner");
  inner.style.animation = "none";
  void inner.offsetWidth; // reflow so the animation restarts
  inner.style.animation = "";

  const wasOpen = !ticket.hidden;
  ticket.hidden = false;
  scrim.hidden = false;
  document.body.classList.add("has-ticket");
  keepPinVisible(btn, wasOpen);
  el("ticket-close").focus({ preventScroll: true });
}

// On a phone the bottom sheet covers ~72% of the screen: scroll so the selected pin sits in the visible top part.
// On desktop the ticket floats over the middle, so we only scroll if the pin is off-screen.
function keepPinVisible(btn, wasOpen) {
  const r = btn.getBoundingClientRect();
  const visibleBottom = isMobile() ? window.innerHeight * 0.28 : window.innerHeight;
  const target = isMobile() ? window.innerHeight * 0.16 : window.innerHeight * 0.5;
  if (r.top < 0 || r.bottom > visibleBottom) {
    window.scrollBy({ top: r.top - target, behavior: reducedMotion() || !wasOpen ? "auto" : "smooth" });
  }
}

function closeTicket({ returnFocus = true } = {}) {
  if (selectedId) markVisited(selectedId);
  selectedId = null;
  ticket.hidden = true;
  scrim.hidden = true;
  document.body.classList.remove("has-ticket");
  document.querySelectorAll(".pin").forEach((p) => p.setAttribute("aria-pressed", "false"));
  document.querySelectorAll(".thumb").forEach((t) => t.classList.remove("is-selected"));
  if (returnFocus && lastPin) lastPin.focus({ preventScroll: true });
}

// Visited = deeper fill + check mark + "(visited)" in the accessible name — never colour alone.
function markVisited(id) {
  if (visited.has(id)) return;
  visited.add(id);
  const pin = document.querySelector(`.pin[data-id="${id}"]`);
  const dish = DISHES.find((d) => d.id === id);
  pin.classList.add("is-visited");
  pin.querySelector(".pin-head > span").innerHTML = CHECK_SVG;
  pin.setAttribute("aria-label", `Pin ${dish.number}: ${dish.name}, ${dish.city} (visited)`);
  el("legend-count").textContent = `${pad(visited.size)} / ${pad(DISHES.length)} collected`;
}

// "Explore another dish": close, then move focus to the next unvisited pin (wrapping around).
// When every ticket is collected, focus returns to the pin that opened this one.
function exploreNext() {
  const current = DISHES.findIndex((d) => d.id === selectedId);
  closeTicket({ returnFocus: false });
  for (let i = 1; i <= DISHES.length; i++) {
    const next = DISHES[(current + i) % DISHES.length];
    if (!visited.has(next.id)) {
      const pin = document.querySelector(`.pin[data-id="${next.id}"]`);
      pin.focus({ preventScroll: true });
      pin.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
      return;
    }
  }
  if (lastPin) lastPin.focus({ preventScroll: true });
}

// 6. Wiring
el("ticket-close").addEventListener("click", () => closeTicket());
el("ticket-next").addEventListener("click", exploreNext);
scrim.addEventListener("click", () => closeTicket());
// Clicking the dimmed area around the card (inside .ticket but outside .ticket-inner) also closes
ticket.addEventListener("click", (e) => { if (e.target === ticket) closeTicket(); });

document.addEventListener("keydown", (e) => {
  if (ticket.hidden) return;
  if (e.key === "Escape") { closeTicket(); return; }
  // Keep Tab inside the dialog while it is open (the pins stay reachable by mouse/touch to switch dishes)
  if (e.key === "Tab") {
    const focusable = ticket.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])");
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
