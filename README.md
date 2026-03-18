# Safini Landing Page

> Kids earn screen time by completing tasks. Parents stop arguing. Everyone wins.

The marketing landing page for **Safini** — a family screen-time reward app. This is a zero-dependency, single-file HTML/CSS/JS page designed for maximum conversion and sub-second load times.

**Live domain:** `safini.fun` · **Contact:** `safini.team@gmail.com` · **Version:** `0.1.0.0`

> **Entry point:** `index.html` (repo root)

---

## What This Is

A conversion-optimised waitlist page. A parent who fought with their kid over a phone tonight lands here and signs up in under 60 seconds. No frameworks, no build step, no Node.js required — just one HTML file you can deploy anywhere.

**Current conversion goal:** email capture from parents of school-age children.

---

## Project Structure

```
landing/
├── index.html                  # The entire page — HTML + CSS + JS in one file
├── src/
│   ├── app/                    # (legacy path — page now lives at repo root)
│   └── components/             # Component files
├── docs/
│   └── designs/
│       └── safini-landing.md   # CEO plan: vision, scope decisions, pre-launch checklist
├── .context/
│   └── retros/                 # Weekly engineering retrospective snapshots (JSON)
├── CHANGELOG.md                # Version history
├── TODOS.md                    # Deferred work with priority and effort estimates
├── VERSION                     # Current version (4-digit: MAJOR.MINOR.PATCH.MICRO)
└── README.md                   # This file
```

---

## Local Development

No build step. Open the file directly:

```bash
# Option 1: Python (zero dependencies, available everywhere)
python3 -m http.server 8080
# → http://localhost:8080

# Option 2: Any static file server
npx serve .
# → http://localhost:3000
```

The page uses two CDN resources that require an internet connection:
- **Google Fonts** — Bricolage Grotesque + DM Sans
- **canvas-confetti** — celebration animation on form submit

Everything else (layout, interactions, animations) works fully offline.

---

## Page Sections

The page is structured to answer a parent's questions in order:

| Section | Purpose |
|---------|---------|
| **Nav** | Logo + links + "Join Waitlist" CTA + hamburger mobile menu |
| **Hero** | Headline, sub, phone mockup illustration, waitlist counter (1,247 families) |
| **Problem** | 3 illustrated cards naming the exact pain: daily battles, parent guilt, inconsistent rules |
| **How It Works** | 4-step flow: set tasks → kid earns coins → unlock apps → everyone wins |
| **Features** | 6-card grid: coin economy, app blocking, parental controls, progress tracking, multi-child, cross-platform |
| **Comparison** | Safini vs screen time limits vs "just say no" |
| **Testimonials** | Sarah M., David T., Jennifer L. |
| **Pricing** | $4/month, whole family, waitlist members lock in founding price |
| **FAQ** | 5 questions covering the top conversion objections |
| **CTA** | Waitlist form + confetti on success + Twitter/WhatsApp share buttons |
| **Footer** | Logo + contact email |

---

## Key Features

### Waitlist Form
- Submits to **Formspree** via async `fetch`
- **10-second AbortController timeout** with distinct error messages (timeout vs network failure)
- Button state: `Join Waitlist →` → `Joining...` (disabled) → success/error
- On success: form hides, success message appears, confetti fires, share buttons shown
- On failure: button re-enables, error message shown in red

### Confetti
- `canvas-confetti@1.9.3` loaded from jsDelivr CDN (`defer`)
- Fires on successful form submission with brand colours: `#406093`, `#4C8CE4`, `#91D06C`, `#FFF799`
- Safely guarded: `if (typeof confetti !== 'undefined')` — no error if CDN fails

### Google Analytics 4
- Script loaded async from Google Tag Manager
- `waitlist_signup` event fired on successful form submission
- Safely guarded: `if (typeof gtag !== 'undefined')`
- **Replace `GA_MEASUREMENT_ID` before launch** (appears twice: lines 19 and 24)

### Social Sharing
- **Twitter/X:** `https://twitter.com/intent/tweet?text=...` with pre-filled copy
- **WhatsApp:** `https://wa.me/?text=...` with the same message
- Both only visible in the post-signup success state
- Share copy: *"I just joined the Safini waitlist — an app where kids earn screen time by completing tasks..."*

### FAQ Accordion
- CSS `max-height` transition (no JS layout thrash)
- Chevron rotates 180° when open
- `aria-expanded` toggled for screen readers
- Only one item open at a time (accordion behaviour)

### Mobile Navigation
- Hamburger button with 3-line icon
- Full-screen overlay with `body { overflow: hidden }` scroll lock
- Close button + auto-close on link click

### Scroll Animations
- `IntersectionObserver` with `threshold: 0.1` and `-60px` bottom margin
- Animated elements: `.problem-card`, `.how-step`, `.feature-card`, `.testimonial-card`
- Staggered delay: `i % 4 * 0.1s` — up to 4 cards animate in together

### Open Graph / Twitter Cards
```html
og:title       Safini — Kids Earn Screen Time
og:description Replace screen-time battles with a reward system kids actually love.
og:image       https://safini.fun/og-image.png   ← upload this image before launch
og:url         https://safini.fun
twitter:card   summary_large_image
```

---

## Design Tokens

All colours are defined as CSS custom properties in `:root`:

| Token | Value | Usage |
|-------|-------|-------|
| `--navy` | `#406093` | Primary brand, gradients, buttons |
| `--navy-deep` | `#2E4568` | Phone mockup header |
| `--blue` | `#4C8CE4` | Accents, links, step numbers |
| `--blue-light` | `#A5C8F7` | Borders, step arrows |
| `--blue-pale` | `#E8F1FC` | Section backgrounds |
| `--green` | `#91D06C` | Success states, coin rewards |
| `--green-deep` | `#6DB44A` | Green CTA text |
| `--yellow` | `#FFF799` | Confetti, decorative |
| `--cream` | `#FAFCFF` | Page background |
| `--ink` | `#1B2A40` | Primary text |
| `--muted` | `#6B7F99` | Secondary text |
| `--radius` | `20px` | Card border-radius |

**Fonts:**
- **Bricolage Grotesque** (400/600/700/800) — headings, logo, step numbers
- **DM Sans** (400/500/600, italic 400) — body text, buttons, inputs

---

## Before You Launch

Two placeholders must be replaced before the page goes live:

### 1. Formspree Form ID

```html
<!-- index.html, ~line 1128 -->
<form action="https://formspree.io/f/YOUR_FORM_ID" ...>
```

1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form, set destination email to `safini.team@gmail.com`
3. Copy the form ID (e.g. `xpzgkrqw`)
4. Replace `YOUR_FORM_ID` with the actual ID

### 2. Google Analytics 4 Measurement ID

```html
<!-- index.html, lines 19 and 24 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
gtag('config', 'GA_MEASUREMENT_ID');
```

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get the Measurement ID (format: `G-XXXXXXXXXX`)
3. Replace both occurrences of `GA_MEASUREMENT_ID`

### 3. OG Image

Upload a `1200×630px` image to `https://safini.fun/og-image.png`. This is what appears when the link is shared on Twitter, WhatsApp, iMessage, Slack, etc. High impact — do this before sharing the URL anywhere.

### Full Pre-Launch Checklist

- [ ] Replace `YOUR_FORM_ID` in `index.html:~1128` (Formspree)
- [ ] Replace `GA_MEASUREMENT_ID` in `index.html:19,24` (GA4) — 2 occurrences
- [ ] Upload `og-image.png` to `safini.fun/og-image.png` (1200×630px)
- [ ] Deploy to `safini.fun` (Vercel recommended — drag-and-drop `src/app/`)
- [ ] Submit a test email end-to-end and verify receipt in inbox
- [ ] Test on a real mobile device (not just Chrome DevTools)
- [ ] Check link preview on Twitter/WhatsApp using [opengraph.xyz](https://www.opengraph.xyz)

---

## Deployment

The entire page is `src/app/index.html`. Deploy it as a static site anywhere:

**Vercel (recommended):**
1. Connect GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Leave root directory as `/` (repo root — `index.html` is at the root)
3. Set custom domain to `safini.fun`
4. Done — auto-deploys on every push to `main`

**Netlify:**
1. Connect GitHub repo
2. Set publish directory to `/` (repo root)
3. Add custom domain

**GitHub Pages:**
1. `Settings → Pages → Source: main branch → / (root)`
2. Set custom domain `safini.fun` in the Pages settings

---

## Deferred Work

See [TODOS.md](./TODOS.md) for the full backlog. Top item:

**Live Auto-Updating Waitlist Counter (P2)**
Replace the static "1,247 families" counter with a real-time count. Upgrade path:
`Formspree webhook → Cloudflare Workers KV (free tier) → counter API → page polls every 60s`
Total infra cost: $0/month. Start after the static version is validated in production.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | Vanilla HTML5, semantic elements, aria attributes |
| Styles | Vanilla CSS3, custom properties, CSS Grid, Flexbox, `clamp()` |
| Scripts | Vanilla ES2020+, `async/await`, `AbortController`, `IntersectionObserver` |
| Fonts | Google Fonts CDN (Bricolage Grotesque, DM Sans) |
| Animation | `canvas-confetti@1.9.3` via jsDelivr CDN |
| Analytics | Google Analytics 4 |
| Forms | Formspree (hosted form backend, free tier) |
| Hosting | Any static file host (Vercel, Netlify, GitHub Pages) |

**No build step. No npm. No framework. No bundler.**

---

## Contributing

Branch off `main`, make changes to `src/app/index.html`, and open a PR. The page is entirely self-contained — there are no dependencies to install.

For larger changes, run `/plan-eng-review` before starting and `/review` + `/ship` before merging.
