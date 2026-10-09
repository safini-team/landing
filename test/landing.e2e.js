'use strict';

// Requires Playwright and installed Chrome. Never submits to the production API.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, devices } = require('playwright');
const base = process.env.LANDING_URL || 'http://127.0.0.1:8080';
const plans = require('../assets/plans.json');
const api = 'https://api.safini.fun/v1/waiting-list';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  let layouts = 0;
  try {
    for (const lang of ['en', 'ru', 'uz', 'ky', 'kk']) {
      const context = await browser.newContext({ locale: 'en-US', reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base) && response.status() >= 400) errors.push(response.url());
      });
      await page.goto(`${base}/${lang === 'en' ? '' : lang + '/'}?utm_source=e2e`);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('html').getAttribute('lang'), lang);
      assert.equal(await page.locator('.skip-link').evaluate(el => getComputedStyle(el).opacity), '0');
      await page.keyboard.press('Tab');
      assert.ok(await page.locator('.skip-link').evaluate(el => el === document.activeElement));
      assert.equal(await page.locator('.skip-link').evaluate(el => getComputedStyle(el).opacity), '1');
      await page.keyboard.press('Tab');
      for (const width of [320, 375, 768, 901, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${lang}/${width}: page overflow`);
        const clipped = await page.locator('.nav, .nav-cta, .lang-dd, .plan, .plan-annual, .store').evaluateAll(els => els.filter(el => {
          const r = el.getBoundingClientRect();
          return r.left < -1 || r.right > innerWidth + 1 || el.scrollWidth > el.clientWidth + 2;
        }).map(el => el.className));
        assert.deepEqual(clipped, [], `${lang}/${width}: clipped controls`);
        assert.ok(await page.locator('[data-plan="monthly"]').isVisible());
        assert.ok(await page.locator('[data-plan="yearly"]').isVisible());
        assert.equal(await page.locator('.billing-opt').count(), 0);
        if (width >= 901) {
          for (const selector of ['.plan-name', '.plan-price', '.plan-cta']) {
            const tops = await page.locator('.plans-grid ' + selector).evaluateAll(els => els.map(el => el.getBoundingClientRect().top));
            assert.ok(Math.abs(tops[0] - tops[1]) < 2, `${lang}: ${selector} alignment`);
          }
          assert.ok((await page.locator('.plan-price-row').boundingBox()).height <= 96, `${lang}: price row fits its grid track`);
        }
        layouts++;
      }
      for (const [key, value] of Object.entries({ monthly: `$${plans.monthly}`, yearly: `$${plans.yearly}`, free_parents: String(plans.free_parents), free_children: String(plans.free_children), free_apps: String(plans.free_apps), free_tasks: String(plans.free_tasks) })) {
        for (const text of await page.locator(`[data-plan="${key}"]`).allTextContents()) assert.equal(text, value);
      }
      const targets = await page.locator('a[href^="#"]').evaluateAll(els => els.map(el => el.hash));
      for (const target of targets) assert.equal(await page.locator(target).count(), 1, `${lang}: anchor ${target}`);
      // Local legal, media-kit and language URLs must resolve on a plain static host.
      const links = await page.locator('a[href]').evaluateAll(els => [...new Set(els.map(el => el.href).filter(href => href.startsWith(location.origin) && !href.includes('#')))]);
      for (const link of links) assert.equal((await page.request.get(link)).status(), 200, link);
      await page.locator('.cta').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth));
      const faq = page.locator('.faq-list details').first();
      await faq.locator('summary').click();
      assert.ok(await faq.getAttribute('open') !== null);
      await faq.locator('summary').press('Enter');
      assert.equal(await faq.getAttribute('open'), null);
      await page.locator('.lang-dd summary').click();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.lang-dd').getAttribute('open'), null);
      // Verify the desktop download path, URL hash, and conversion event.
      await page.evaluate(() => { window.events = []; window.addEventListener('safini:conversion', event => window.events.push(event.detail)); });
      await page.locator('.nav-cta').click();
      assert.equal(new URL(page.url()).hash, '#download');
      assert.equal((await page.evaluate(() => window.events))[0].destination, 'download_section');
      // All newsletter status messages must work in every locale.
      for (const status of [201, 409, 500]) {
        await page.route(api, route => {
          assert.deepEqual(route.request().postDataJSON(), { email: 'landing-check@example.test', utm_source: 'landing_page+e2e' });
          return route.fulfill({ status, contentType: 'application/json', body: '{}' });
        });
        await page.locator('input[name=email]').fill('landing-check@example.test');
        await page.locator('form.joinform button').click();
        await page.waitForFunction(expected => document.querySelector('.formmsg').dataset.state === expected, status === 201 ? 'ok' : 'error');
        assert.equal(await page.locator('form.joinform button').isEnabled(), true);
        await page.unroute(api);
      }
      assert.ok((await page.evaluate(() => window.events)).some(event => event.event === 'newsletter_signup'));
      assert.deepEqual(errors, [], `${lang}: local resource or JS errors`);
      await context.close();
    }
    // Device-specific CTAs and the actual outbound click targets.
    for (const [device, store] of [['iPhone 13', 'apps.apple.com'], ['Pixel 7', 'play.google.com']]) {
      const context = await browser.newContext({ ...devices[device], locale: 'en-US' });
      const page = await context.newPage();
      await page.goto(base);
      assert.ok((await page.locator('.nav-cta').getAttribute('href')).includes(store));
      assert.ok((await page.locator('.plan:not(.featured) .plan-cta').getAttribute('href')).includes(store));
      assert.ok((await page.locator('.plan.featured .plan-cta').getAttribute('href')).includes('apps.apple.com'));
      let destination;
      await page.route(`https://${store}/**`, route => { destination = route.request().url(); return route.fulfill({ body: 'Mock store page' }); });
      await page.locator('.nav-cta').click();
      await page.waitForURL(url => url.host === store);
      assert.ok(destination.includes(store));
      await context.close();
    }
    // Switching language persists and preserves navigation on return.
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    await page.goto(base);
    await page.locator('.lang-dd summary').click();
    await page.locator('.lang-menu a[hreflang=ru]').click();
    await page.waitForURL('**/ru/');
    assert.equal(await page.evaluate(() => localStorage.getItem('safini_lang')), 'ru');
    await page.goto(base);
    await page.waitForURL('**/ru/');
    await page.locator('.lang-dd summary').click();
    await page.locator('.lang-menu a[hreflang=en]').click();
    await page.waitForURL(base + '/');
    // Long acquisition tags stay within the API schema, and invalid emails send nothing.
    await page.goto(`${base}/?utm_source=${'x'.repeat(200)}`);
    let posts = 0;
    await page.route(api, route => {
      posts++;
      assert.equal(route.request().postDataJSON().utm_source.length, 120);
      return route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
    });
    await page.locator('input[name=email]').fill('not-an-email');
    await page.locator('form.joinform button').click();
    assert.equal(posts, 0);
    await page.locator('input[name=email]').fill('landing-check@example.test');
    await page.locator('form.joinform button').click();
    await page.waitForFunction(() => document.querySelector('.formmsg').dataset.state === 'ok');
    assert.equal(posts, 1);
    await page.unroute(api);
    // Network failure and timeout both recover the form; no production POSTs.
    await page.route(api, route => route.abort('failed'));
    await page.locator('input[name=email]').fill('landing-check@example.test');
    await page.locator('form.joinform button').click();
    await page.waitForFunction(() => document.querySelector('.formmsg').dataset.state === 'error');
    assert.ok(await page.locator('form.joinform button').isEnabled());
    await page.unroute(api);
    await page.route(api, () => {});
    await page.clock.install();
    await page.locator('form.joinform button').click();
    await page.clock.runFor(10001);
    await page.waitForFunction(() => document.querySelector('.formmsg').dataset.state === 'error');
    assert.match(await page.locator('.formmsg').textContent(), /Timed out/);
    assert.ok(await page.locator('form.joinform button').isEnabled());
    await page.unroute(api);
    await context.close();
    // Pricing and native navigation also work without JavaScript.
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJS.newPage();
    await staticPage.goto(base);
    assert.ok(await staticPage.locator('[data-plan=monthly]').isVisible());
    assert.ok(await staticPage.locator('[data-plan=yearly]').isVisible());
    await staticPage.locator('.hero-how').click();
    assert.equal(new URL(staticPage.url()).hash, '#loop');
    await noJS.close();
    // Export review screenshots only when requested.
    if (process.env.SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await page.goto(base);
      await page.locator('.cta').scrollIntoViewIfNeeded();
      await page.locator('#top').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, 'desktop.png'), fullPage: true });
      await page.setViewportSize({ width: 375, height: 812 });
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, 'mobile.png'), fullPage: true });
      await page.close();
    }
    console.log(`PASS: ${layouts} responsive layouts; 5 languages; pricing; resources; anchors; FAQ; locale persistence; iOS/Android store navigation; newsletter success, duplicate, server, network and timeout states; no-JS pricing.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
