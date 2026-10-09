# Safini landing page

Static marketing site for Safini. Parents create tasks and app limits; children earn Time Coins and redeem them for extra screen time.

The English page is `index.html`, with Russian, Uzbek, Kyrgyz and Kazakh pages in `ru/`, `uz/`, `ky/` and `kk/`. All five use `assets/v4.css`, `assets/v4.js` and `assets/locale.js`. No application dependencies or build step are required.

## Preview

```sh
python3 -m http.server 3000 --bind 127.0.0.1
```

Open http://localhost:3000/. This origin is allowed by the API's current CORS configuration. Newsletter submissions use the production waiting-list endpoint; browser tests intercept those requests.

## Pricing and the API source of truth

`assets/plans.json` stores the USD marketing prices and the last imported free limits. Prices are currently $7/month or $67/year, a 20% annual saving rounded down. Both prices are rendered in HTML, monthly first, without a toggle. The store supplies localized checkout prices; prices are not returned by the subscription API.

The API source of truth for free limits is `app/services/free_limits.py` in `safini-team/safini-api`. Current limits: 1 parent, 1 child, 5 controlled apps per child, 5 recurring tasks per child. Pro adds a second parent and lifts the child, app and recurring-task limits. These limits follow the latest API `origin/main` (the imported commit is recorded in `assets/plans.json`). Pro purchase availability follows the mobile implementation: currently the iOS parent app.

After the API changes, import its constants and update all five static pages:

```sh
# From this landing checkout, assuming the API checkout is next to it:
git -C ../safini-api fetch origin
python3 scripts/sync-plans.py --api-repo ../safini-api --api-ref origin/main
```

To preview changes in the API's working tree instead, omit `--api-ref`. To change the marketing prices, edit `monthly` and `yearly` in `assets/plans.json`, then run `python3 scripts/sync-plans.py`. The script calculates the savings percentage and updates every `data-plan` value. It parses API constants without executing API code and never changes the API repository.

Check for drift without writing:

```sh
python3 scripts/sync-plans.py --check
python3 scripts/sync-plans.py --api-repo ../safini-api --api-ref origin/main --check
```

## Verification

```sh
node --check assets/v4.js
node test/locale.test.js
node test/locale.boot.test.js
```

With Playwright available and Google Chrome installed, start the preview server and run:

```sh
LANDING_URL=http://localhost:3000 node test/landing.e2e.js
```

If Playwright is supplied outside the repository, set `NODE_PATH` to its package directory. Optionally set `SCREENSHOT_DIR` to export desktop and mobile screenshots. Browser tests cover 25 responsive layouts, all five locales, resource and local-link health, pricing, anchors, FAQ controls, language persistence, mobile store navigation, newsletter success/error recovery, and no-JavaScript pricing. All newsletter POST requests are mocked.

## Conversion measurement

Download clicks and successful newsletter submissions dispatch a `safini:conversion` browser event. When an existing `window.gtag` integration is present, they also call it. Event fields contain placement, language and destination, never email or URL query strings. No analytics provider is configured by this change.

See [the conversion review](docs/reviews/2026-10-09-conversion-review.md) for findings, implemented improvements, suggested experiments and verification limits.
