# Landing conversion review — 9 October 2026

Prepared as a local preview on `codex/landing-conversion-review`, based on the latest landing `origin/main` (`7f57eab`). This review prepares the changes for a pull request; the production site has not been deployed.

## What changed and why

- Lead with the family outcome: “Less negotiating. Screen time they earn.” Explain tasks, parental approval, coins and extra time in plain language.
- Retain the real product screenshots and keep free-plan limits in pricing and the FAQ.
- Replace the unsupported category-wide competitor comparison with a labeled example: reading earns 30 coins; approval awards them; the child exchanges them for 15 extra minutes. These are illustrative values chosen by a parent.
- Restore the missing `#prices` destination so both “Time Coins” navigation links work.
- Show $7/month first, with $67/year and a 20% saving beside it. No toggle and no hidden prices. $67 versus $84 is a 20.24% saving, rounded down to 20%.
- Compare Free and Pro using the actual entitlements: parent accounts, children, controlled apps and recurring tasks. Remove unsupported Pro promises about Telegram, school schedules and a guaranteed answer-blocking AI tutor.
- Explain that Pro purchases currently run through the iOS parent app and that the family can use both iOS and Android. This matches the mobile paywall/store implementation. Local store prices and renewal terms are shown at checkout.
- Rewrite the FAQ around free access, connecting phones, mixed platforms, cancellation and privacy. Replace guarantees about bypass detection and disputes disappearing with supported statements.
- Fix legal links for static hosts, small-screen navigation clipping, visible keyboard focus and reduced-motion handling. Prices and anchor navigation work without JavaScript.
- Add conversion event hooks and cap acquisition-source strings at the API's 120-character limit.
- Apply the pricing, content and interaction changes across English, Russian, Uzbek, Kyrgyz and Kazakh. Update the previously outdated README.

## Product sources

Free limits come from the updated `safini-api` `origin/main`, commit `34df523`, `app/services/free_limits.py`: `FREE_PARENTS = 1`, `FREE_CHILDREN = 1`, `FREE_CONTROLLED_APPS = 5`, `FREE_RECURRING_TASKS = 5`. App and task limits are checked per child. Pro adds a second parent and removes the child, controlled-app and recurring-task limits. The free-plan change is merged into API, mobile and landing `main`. API enforcement and the mobile paywall copy were both inspected; deployment state was not inferred from the merge.

The subscription API reports entitlements, not monetary prices. USD prices retain the latest merged landing values ($7 and $67). Mobile `pro_store.dart` loads localized prices from StoreKit, and `paywall_screen.dart` lists the paid features. The store implementation and updated feature translations were inspected in mobile `origin/main` (`61e6a95`); its paywall source comment still mentions the old 3/3 limits, but the rendered translations match the API’s 5/5 limits. The API and mobile checkouts were not edited.

`assets/plans.json` records the last imported source. `scripts/sync-plans.py` can import future API changes from a fetched Git ref or its working tree and update all static numeric values, including pricing and FAQ copy. `--check` detects drift. Run this when changing the API; the published landing does not depend on a live API request to display prices or limits.

Store destinations were verified against the official [App Store listing](https://apps.apple.com/us/app/safini/id6761075183) and [Google Play listing](https://play.google.com/store/apps/details?id=com.safini.app). The privacy FAQ follows the repository's Privacy Policy.

## Suggested next experiments

These are hypotheses; conversion improvement has not yet been measured.

| Experiment | Why | Success metric |
| --- | --- | --- |
| Test the outcome-led headline against “Turn chores into screen-time rewards” | Find the clearest motivation for arriving parents | Store clicks per unique visitor, segmented by device and locale |
| Connect store attribution to first family connection and first rewarded task | A download alone does not show whether the family gets value | Connected families and first approved tasks per attributed install |
| Invite real early families to provide approved quotes | Address setup and daily-use objections with evidence | Activated families per visitor; publish only real, consented quotes |
| Add a short walkthrough using the current app release | Help parents understand connecting the two phones | Family connections per install and setup drop-off |
| Translate product screenshots for Kyrgyz and Kazakh | These pages currently inherit Russian screenshots | Store click and setup rates for those locales |
| Test $6.99 against $7 only after store price alignment | Avoid a marketing price that differs from checkout | Paid upgrades per activated family and retention |

The page emits download and signup events, but analytics still needs a configured destination. Use store attribution or an approved analytics integration to connect marketing visits to app activation. No new tracking service or fabricated social proof was added.

## Validation and limits

- Playwright/Chrome: 5 locales × 320, 375, 768, 901 and 1440 pixels; no page overflow or clipped controls. Checks at the 901-pixel pricing breakpoint confirm aligned plan headings, prices and CTAs in every locale.
- Desktop and mobile hero, pricing and download screenshots visually reviewed in all five languages. Skip links remain hidden until keyboard focus, and translated pricing rows wrap cleanly.
- Monthly and annual amounts are simultaneously visible, with consistent numeric plan values.
- Local assets, language destinations, media-kit and legal links return successfully.
- Native anchor navigation, FAQ click/keyboard behavior, language switching/persistence and Escape-to-close work.
- iPhone and Android primary CTAs navigate to the correct store. Pro directs to iOS.
- Mocked newsletter checks cover 201, 409, 500, network failure and timeout, including submission payload and restored button state.
- JavaScript-disabled pricing and anchor navigation work.
- Existing locale unit and boot tests pass; JavaScript syntax and Git whitespace checks pass; API plan-sync check passes.
- Live read-only OPTIONS checks returned 200 and correct CORS permission for `https://safini.fun` and `http://localhost:3000`. The initial `127.0.0.1:8080` preview origin was rejected, so the user preview uses `localhost:3000`.

Real newsletter submissions, email delivery, store installation, in-app purchases and payment-provider behavior were not exercised. We did not alter the production service or app. No measured conversion lift is claimed.
