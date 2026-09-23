# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Locale defaulting on first visit: browser language Russian opens `/ru/`,
  English stays on `/`. Uzbek is never auto-selected from `navigator.language`
  (the switcher still offers it). An explicit pick is remembered in
  `localStorage`.
- Nav language control is a flag dropdown (uz / ru / en), matching the
  in-app picker: SVG flags, native names, check on the current language.
- App Store and Google Play badges in the hero and a "Download Safini" block in the footer,
  across en/ru/uz. Badges are HTML + inline SVG so the small line is localized
- `apple-itunes-app` meta so Safari on iOS shows the Smart App Banner

- Newsletter signup in the bottom CTA, posting to the same `/v1/waiting-list` endpoint;
  the GA event is now `newsletter_signup`
- `data-store-link` Download buttons open the App Store on iOS and Google Play on Android,
  and scroll to `#download` on desktop

### Changed
- The page now presents Safini as live on both stores. The waitlist is gone: nav CTA and plan
  CTAs say Download, the bottom CTA (`#join` -> `#download`) leads with the store badges,
  and "launching", "146 families", "first 500 families" and "founding price" copy is removed
  from en/ru/uz, including meta and `og:description`
- Hero leads with the store badges instead of the waitlist form. Hero pill, footer tagline
  and meta say "Try it Free on iOS & Android"
- Privacy policy (en/ru) covers newsletter emails: collected from the website newsletter or
  earlier waitlist, used to send the newsletter, unsubscribe by email. Date -> 2026-09-23
- Launch date copy moved from "September" to "Fall 2026" across en/ru/uz
  (meta description, `og:description`, hero badge, footer tagline in each locale)

### Removed
- Honest-promise section ("Straight answers" / "What we promise - and what we don't")
  from en/ru/uz, its nav and footer links, and the now-dead `.honest`/`.panel` CSS

## [0.2.0.0] - 2026-08-15

### Added
- Trilingual landing: `index.html` (en), `ru/index.html` (ru), `uz/index.html` (uz)
- Language switcher in nav and footer, `hreflang` alternates and per-locale `canonical`
- Shared `assets/v4.css` and `assets/v4.js` so only copy differs between locales

### Changed
- Replaced the landing with design V4-A "Price List": earn/spend price-list section,
  three-step loop, blockers-vs-Safini comparison, honest-promise panels, plans, FAQ
- Waitlist now posts from two forms (hero + CTA) to `https://api.safini.fun/v1/waiting-list`
  with localized 201/409/error/timeout messages; `utm_source` passthrough unchanged

### Removed
- Cognitive-character selector and the old single-language page

## [0.1.1.0] - 2026-03-19

### Changed
- Moved `src/app/index.html` → `index.html` (repo root) for simpler deployment

## [0.1.0.0] - 2026-03-19

### Added
- Full launch-ready landing page (`src/app/index.html`) — single-file HTML/CSS/JS
- Open Graph and Twitter Card meta tags with `safini.fun` domain
- Google Analytics 4 integration (placeholder `GA_MEASUREMENT_ID` to replace before launch)
- `canvas-confetti` CDN for celebratory burst on waitlist signup
- Static waitlist social proof counter: "1,247 families on the waitlist"
- Trust badges: child privacy, no ads, no data sold
- FAQ section with 5 questions, CSS accordion, chevron flip animation, aria-expanded
- Twitter and WhatsApp share buttons in post-signup success state
- Waitlist form with 10s AbortController timeout and distinct error messages
- Formspree form integration (placeholder `YOUR_FORM_ID` to replace before launch)
- Hamburger mobile nav with overlay and body scroll lock
- Intersection Observer scroll animations on cards and steps
- Responsive layouts: mobile (375px), tablet (768px), desktop (1280px)
- Phone mockup illustration with floating coin and badge animations
- Testimonials from Sarah M., David T., Jennifer L.
- Production domain set to `safini.fun`
- Contact email: `safini.team@gmail.com` (visible in footer)
- `TODOS.md` with P2 deferred item: live auto-updating waitlist counter
- CEO plan promoted to `docs/designs/safini-landing.md`
- Proper web project `.gitignore` (replaces AL/BC template)
