'use strict';

var assert = require('assert');
var checkout = require('../assets/checkout.js');

assert.strictEqual(checkout.live, false, 'web checkout stays off until the live Paddle account is approved');
assert.strictEqual(checkout.environment, 'sandbox');
assert.ok(/^test_/.test(checkout.token), 'sandbox needs a test_ client token');
assert.ok(/^pri_/.test(checkout.prices.monthly) && /^pri_/.test(checkout.prices.yearly));

var live = checkout.environments.production;
var sandbox = checkout.environments.sandbox;
assert.ok(/^live_/.test(live.token), 'production needs a live_ client token');
assert.ok(/^pri_/.test(live.prices.monthly) && /^pri_/.test(live.prices.yearly));
assert.notStrictEqual(live.prices.monthly, sandbox.prices.monthly, 'live and sandbox prices are different Paddle accounts');
assert.notStrictEqual(live.prices.yearly, sandbox.prices.yearly);

checkout.live = true;
assert.strictEqual(checkout.environment, 'production');
assert.strictEqual(checkout.token, live.token);
assert.strictEqual(checkout.prices.yearly, live.prices.yearly);
assert.strictEqual(checkout.enabled(), true);
checkout.live = false;

assert.strictEqual(checkout.landingHref('en'), '/account/?buy=1&lang=en');
assert.strictEqual(checkout.landingHref('uz'), '/account/?buy=1&lang=uz');
assert.strictEqual(checkout.landingHref('ru'), '/account/?buy=1&lang=ru');
assert.strictEqual(checkout.landingHref('ky'), '/account/?buy=1&lang=ru', 'Kyrgyz page opens the Russian account page');
assert.strictEqual(checkout.landingHref('kk'), '/account/?buy=1&lang=ru', 'Kazakh page opens the Russian account page');

console.log('checkout ok');
