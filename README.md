# Vietnam Food Map

A single-page, CodePen-ready interactive map: one cobalt map of Vietnam with eight pins, each opening a paper "ticket" for a regional dish. Plain HTML, CSS and JavaScript — no frameworks, no build step. Personal educational project.

## Run it locally

Open `index.html` in a browser. That's it.

## Put it on CodePen

The three files map 1:1 to CodePen's panels:

| File | CodePen panel |
|---|---|
| `index.html` — everything between `<main class="page">` and `</main>` | HTML |
| `style.css` — the whole file | CSS |
| `script.js` — the whole file | JS |

Then in **Pen Settings → HTML → Stuff for `<head>`** paste the font link:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Be+Vietnam+Pro:wght@400;500;700&family=Caveat:wght@700&display=swap">
```

## The map image

`map.jpg` is the illustrated map (1024 × 1536). The page loads it from this repo —
`MAP_IMAGE_URL` at the top of `script.js` points at `https://raw.githubusercontent.com/thorokele/vietnam-foodmap/main/map.jpg` —
so CodePen needs no uploaded asset. If that URL fails, the page falls back to a `map.jpg` next to `index.html`.
Pins, stickers and the route are placed in the image's pixel coordinates (`x, y` in `DISHES`), so to move a pin,
open `map.jpg` in any image editor, read the pixel position, and change the numbers. If you replace the image,
keep the same 1024 × 1536 size or re-measure the pins.

## Dish photos

Photos live in `images/<dish-id>.jpg` (1000 × 1000 JPEGs) and are loaded from this repo via `IMAGES_URL` in
`script.js`, so the Pen needs no uploaded assets. Eight of the nine dishes have a photo; `nem-nuong` still shows the
labelled placeholder until you add `images/nem-nuong.jpg` and change its line to:

```js
image: photo("nem-nuong.jpg", "Nem nướng Nha Trang: grilled pork skewers with rice paper, herbs and peanut sauce"),
```

To swap any photo, replace the file in `images/` (keep the name) and push — or point `photo(...)` at a different file.

The small sticker on the map uses the same photo (greyscaled and printed in its tint colour under a halftone screen);
add `thumbSrc: "…"` for a tighter square crop if you want one. Until then the ticket shows a labelled placeholder that
names the dish, and the sticker shows the pin number — never a stand-in photo of something else.

## Night theme

Add `data-theme="night"` to the `<html>` tag. Only the sea darkens; paper stays warm.

## What could break

- **Map image missing**: the GitHub raw URL is blocked or the file was moved → the page tries the local `map.jpg`; if that is missing too, you get pins on a plain blue sea. Fix `MAP_IMAGE_URL` in `script.js`.
- **Fonts not loaded** (no internet, or the head link is missing): titles fall back to Arial Black / Segoe UI. Diacritics still render.
- **Pins drift off the land**: `.map-wrap` lost its `aspect-ratio: 400 / 1000`, or `.pins` is no longer `inset: 0` inside it. Pin positions are percentages of that box. Move a pin by changing its `x, y` in `DISHES`, never in CSS — the route is drawn from the same numbers.
- **Ticket clips on a short phone**: `.ticket` needs its `max-height` and `overflow: auto` (already set, with a `vh` fallback for browsers without `dvh`).
- **Escape does nothing**: the listener is on `document`; if the Pen is embedded, click inside the frame once.
- **A photo does not load**: the raw GitHub URL is blocked, or the file was renamed → the ticket shows a broken image and the sticker shows its tint only. Check `IMAGES_URL` and the file names in `images/`.
- **Wrong photo shows**: only `image.src` decides what is shown — leave it `null` until you have the right photo.
