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

## Adding a real dish photo

In `script.js`, replace `image: null` on a dish with a photo you have the rights to:

```js
image: { src: "https://…/bun-bo-hue.jpg", alt: "Bún bò Huế: thick rice noodles, sliced beef shank and a slice of pork in red broth" }
```

Until then the ticket shows a labelled placeholder that names the dish — never a stand-in photo of something else.

## Night theme

Add `data-theme="night"` to the `<html>` tag. Only the sea darkens; paper stays warm.

## What could break

- **Fonts not loaded** (no internet, or the head link is missing): titles fall back to Arial Black / Segoe UI. Diacritics still render.
- **Pins drift off the land**: `.map-wrap` lost its `aspect-ratio: 400 / 1000`, or `.pins` is no longer `inset: 0` inside it. Pin positions are percentages of that box. Move a pin by changing its `x, y` in `DISHES`, never in CSS — the route is drawn from the same numbers.
- **Ticket clips on a short phone**: `.ticket` needs its `max-height` and `overflow: auto` (already set, with a `vh` fallback for browsers without `dvh`).
- **Escape does nothing**: the listener is on `document`; if the Pen is embedded, click inside the frame once.
- **Wrong photo shows**: only `image.src` decides what is shown — leave it `null` until you have the right photo.
