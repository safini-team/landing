'use strict';

var assert = require('assert');
var checkout = require('../assets/checkout.js');

assert.strictEqual(checkout.live, false, 'web checkout stays off until the live Paddle account is approved');
assert.strictEqual(checkout.environment, 'sandbox');
assert.ok(/^test_/.test(checkout.token), 'sandbox needs a test_ client token');
assert.ok(/^pri_/.test(checkout.prices.monthly) && /^pri_/.test(checkout.prices.yearly));

assert.strictEqual(checkout.landingHref('en'), '/account/?buy=1&lang=en');
assert.strictEqual(checkout.landingHref('uz'), '/account/?buy=1&lang=uz');
assert.strictEqual(checkout.landingHref('ru'), '/account/?buy=1&lang=ru');
assert.strictEqual(checkout.landingHref('ky'), '/account/?buy=1&lang=ru', 'Kyrgyz page opens the Russian account page');
assert.strictEqual(checkout.landingHref('kk'), '/account/?buy=1&lang=ru', 'Kazakh page opens the Russian account page');

console.log('checkout ok');
