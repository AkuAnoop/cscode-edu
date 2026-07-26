# CSCODE EDU

A static site for listing classes and taking signups. No build step, no framework —
just HTML, CSS, and one JavaScript file. Open any file in a text editor and change it.

## Run locally

Browsers block loading JSON files when you open HTML directly from disk, so start a
small local server from inside this folder:

```bash
# Python (built in on macOS)
python3 -m http.server 8000

# Or with Node
npx serve .
```

Then open [http://localhost:8000](http://localhost:8000).

## File map

| File | What's in it |
| --- | --- |
| `index.html` | Home page — hero, "What I'm focused on" cards |
| `classes.html` | Class grid with the All / STEM / Arts filters |
| `updates.html` | Journal timeline |
| `enroll.html` | Signup form |
| `css/style.css` | Every style on the site |
| `js/main.js` | Class rendering, filters, floating balls, form logic |
| `data/classes.json` | **The class list — edit this, not the HTML** |
| `images/*.svg` | Hero art and per-class card art |

## Common edits

### Add, remove, or change a class

Edit `data/classes.json`. Each entry looks like:

```json
{
  "code": "CS 101",
  "name": "Introduction to Computer Science",
  "category": "STEM",
  "instructor": "Aku",
  "description": "What the class covers.",
  "schedule": "Mon / Wed · 10:00 AM",
  "notes": "Optional note shown at the bottom of the card.",
  "gradient": "purple",
  "image": "images/class-code.svg"
}
```

- `category` must match a filter tab in `classes.html` (`STEM` or `Arts`).
  Add a new tab there if you want a new category.
- `image` is optional. Leave it out and the card falls back to a gradient + icon.
- Change `"term"` at the top of the file when the semester changes.

### Change the colors

All colors come from variables at the top of `css/style.css`:

```css
:root {
  --orange: #7c3aed;       /* main accent (named "orange" from the old theme) */
  --orange-dark: #6d28d9;  /* darker accent, used on hover */
  --amber: #a78bfa;        /* light accent */
  --cream: #f5f3ff;        /* tinted background */
}
```

Change those four hex codes and the whole site re-themes. The big purple gradients
are set separately on `.classes-section`, `.page-hero`, and `.hero-glow::before`.

### Change the site name

Search and replace `CSCODE EDU` across the four `.html` files. It appears in the
`<title>`, the meta description, the nav logo, and the footer.

### Where signups go

In `enroll.html`, on the `<form>` tag:

```html
data-email="aku.anoop007@gmail.com"   <!-- signups are emailed here -->
data-opens="2027-06-01"               <!-- form stays locked until this date -->
```

Email is handled by [FormSubmit](https://formsubmit.co) — no account or API key.
The first submission to a new address triggers a one-time confirmation email;
click the link in it once to activate.

`data-opens` locks every field and shows a countdown until that date passes.
Delete the attribute to leave the form open permanently. Note this check runs in
the browser, so it's a signal, not real security — someone with dev tools could
bypass it.

### Turn off the floating balls

Delete the `<canvas id="balls" ...>` line from whichever page you don't want them
on. The animation also disables itself automatically for visitors who have
"reduce motion" turned on in their OS settings.

Tuning is in `initBalls()` in `js/main.js` — `count` controls how many, `r`
controls size, and `vx` / `vy` control speed.

## Deploy

It's a static site, so it can be hosted free on
[GitHub Pages](https://pages.github.com/), [Netlify](https://www.netlify.com/), or
[Cloudflare Pages](https://pages.cloudflare.com/). Drag the folder in — no build
command needed.
