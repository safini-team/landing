'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var checkout = require('../assets/checkout.js');

assert.strictEqual(checkout.live, true, 'web checkout is on with the live Paddle account');
assert.strictEqual(checkout.environment, 'production');
assert.strictEqual(checkout.enabled(), true);

var live = checkout.environments.production;
var sandbox = checkout.environments.sandbox;
assert.ok(/^live_/.test(live.token), 'production needs a live_ client token');
assert.ok(/^pri_/.test(live.prices.monthly) && /^pri_/.test(live.prices.yearly));
assert.ok(/^test_/.test(sandbox.token), 'sandbox needs a test_ client token');
assert.ok(/^pri_/.test(sandbox.prices.monthly) && /^pri_/.test(sandbox.prices.yearly));
assert.notStrictEqual(live.prices.monthly, sandbox.prices.monthly, 'live and sandbox prices are different Paddle accounts');
assert.notStrictEqual(live.prices.yearly, sandbox.prices.yearly);
assert.strictEqual(checkout.token, live.token);
assert.strictEqual(checkout.prices.yearly, live.prices.yearly);

checkout.live = false;
assert.strictEqual(checkout.environment, 'sandbox');
assert.strictEqual(checkout.token, sandbox.token);
assert.strictEqual(checkout.enabled(), false, 'with live off, checkout needs ?checkout=sandbox in a browser');
checkout.live = true;

assert.strictEqual(checkout.landingHref('en'), '/account/?buy=1&lang=en');
assert.strictEqual(checkout.landingHref('uz'), '/account/?buy=1&lang=uz');
assert.strictEqual(checkout.landingHref('ru'), '/account/?buy=1&lang=ru');
assert.strictEqual(checkout.landingHref('ky'), '/account/?buy=1&lang=ru', 'Kyrgyz page opens the Russian account page');
assert.strictEqual(checkout.landingHref('kk'), '/account/?buy=1&lang=ru', 'Kazakh page opens the Russian account page');

['index.html', 'ru/index.html', 'uz/index.html', 'ky/index.html', 'kk/index.html'].forEach(function (file) {
  var html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  var lang = html.match(/<html lang="([^"]+)"/)[1];
  var ctas = html.match(/<a [^>]*data-web-checkout[^>]*>[^<]*<\/a>/g) || [];
  assert.strictEqual(ctas.length, 1, file + ' has one Pro button');
  var href = ctas[0].match(/href="([^"]+)"/)[1].replace(/&amp;/g, '&');
  assert.strictEqual(href, checkout.landingHref(lang), file + ' Pro button leads to sign-in and checkout');
  assert.ok(!/iOS/.test(ctas[0]), file + ' Pro button does not say iOS');
});

console.log('checkout ok');

// SAF-305: the price a page shows is the price its checkout charges.
assert.strictEqual(checkout.pricesFor('en'), live.prices, 'English pages sell at the global price');
['ru', 'uz', 'ky', 'kk'].forEach(function (lang) {
  assert.strictEqual(checkout.pricesFor(lang), live.regional, lang + ' pages sell at the Central Asia price');
});
assert.ok(/^pri_/.test(live.regional.monthly) && /^pri_/.test(live.regional.yearly));
assert.notStrictEqual(live.regional.yearly, live.prices.yearly);
[['index.html', '$9.99', '$59.99'], ['ru/index.html', '$4.99', '$29.99'], ['uz/index.html', '$4.99', '$29.99'],
 ['ky/index.html', '$4.99', '$29.99'], ['kk/index.html', '$4.99', '$29.99']].forEach(function (row) {
  var html = fs.readFileSync(path.join(__dirname, '..', row[0]), 'utf8');
  assert.ok(html.indexOf('<div class="plan-price">' + row[1] + '<small>') !== -1, row[0] + ' shows ' + row[1]);
  assert.ok(html.indexOf(row[2] + '/') !== -1, row[0] + ' shows ' + row[2]);
  assert.ok(html.indexOf('$67') === -1 && html.indexOf('>$7<') === -1, row[0] + ' has no old price');
});
