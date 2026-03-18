# Changelog

All notable changes to this project will be documented in this file.

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
