'use strict';

var assert = require('assert');
var account = require('../account/account.js');

function eq(actual, expected, msg) {
  assert.deepStrictEqual(actual, expected, msg);
}

// --- every language has every string ---
var en = Object.keys(account.STRINGS.en).sort();
account.LANGS.forEach(function (lang) {
  eq(Object.keys(account.STRINGS[lang]).sort(), en, lang + ' has the same keys as en');
  eq(Object.keys(account.STRINGS[lang].source).sort(), Object.keys(account.STRINGS.en.source).sort(), lang + ' sources');
  eq(account.STRINGS[lang].proFeatures.length, 4, lang + ' pro features');
});

// --- pickLang: explicit picks win, browser gives ru or en, never uz ---
eq(account.pickLang({ query: 'uz', languages: ['ru'] }), 'uz', '?lang=uz wins');
eq(account.pickLang({ query: 'ky' }), 'ru', 'Kyrgyz page opens Russian');
eq(account.pickLang({ query: 'kk' }), 'ru', 'Kazakh page opens Russian');
eq(account.pickLang({ query: 'de', session: 'ru' }), 'ru', 'unknown query falls through');
eq(account.pickLang({ stored: 'uz', languages: ['en'] }), 'uz', 'landing pick is honored');
eq(account.pickLang({ languages: ['ru-RU'] }), 'ru');
eq(account.pickLang({ languages: ['uz-UZ', 'ru'] }), 'ru', 'uz is never auto');
eq(account.pickLang({ languages: ['uz'] }), 'en');
eq(account.pickLang({ languages: ['de', 'en-GB'] }), 'en');
eq(account.pickLang({}), 'en');

// --- children ---
eq(account.childrenLabel(0, 'en'), 'No child profiles yet');
eq(account.childrenLabel(1, 'en'), '1 child');
eq(account.childrenLabel(3, 'en'), '3 children');
eq(account.childrenLabel(1, 'ru'), '1 ребёнок');
eq(account.childrenLabel(2, 'ru'), '2 ребёнка');
eq(account.childrenLabel(5, 'ru'), '5 детей');
eq(account.childrenLabel(2, 'uz'), '2 ta bola');

// --- describePlan ---
var date = account.formatDate('2026-11-09T12:00:00Z', 'en');
assert.ok(/2026/.test(date) && /November/.test(date), 'en date ' + date);

var free = account.describePlan({ plan: 'free', status: null, source: null, product_id: null, is_trial: false, expires_at: null, will_renew: false, manage_url: null }, 'en');
eq(free.isPro, false);
eq(free.title, 'Free plan');
eq(free.lines, []);
eq(free.manage, null);
eq(free.warning, '');

var monthly = account.describePlan({ plan: 'pro', status: 'active', source: 'apple', product_id: 'pro.monthly', is_trial: false, expires_at: '2026-11-09T12:00:00Z', will_renew: true, manage_url: 'https://apps.apple.com/account/subscriptions' }, 'en');
eq(monthly.isPro, true);
eq(monthly.title, 'Safini Pro');
eq(monthly.lines, ['Bought in the App Store', 'Monthly', 'Renews on ' + date]);
eq(monthly.manage.url, 'https://apps.apple.com/account/subscriptions');
eq(monthly.manage.label, 'Manage in the App Store');

var cancelled = account.describePlan({ plan: 'pro', status: 'active', source: 'apple', product_id: 'pro.yearly', is_trial: false, expires_at: '2026-11-09T12:00:00Z', will_renew: false, manage_url: 'https://apps.apple.com/account/subscriptions' }, 'en');
eq(cancelled.lines, ['Bought in the App Store', 'Yearly', 'Ends on ' + date]);

var trial = account.describePlan({ plan: 'pro', status: 'active', source: 'apple', product_id: 'pro.yearly', is_trial: true, expires_at: '2026-11-09T12:00:00Z', will_renew: true, manage_url: 'https://apps.apple.com/account/subscriptions' }, 'en');
eq(trial.lines[2], 'Free trial until ' + date + ', then it renews');

var promo = account.describePlan({ plan: 'pro', status: 'active', source: 'promo', product_id: 'pro.promo', is_trial: true, expires_at: '2026-11-09T12:00:00Z', will_renew: false, manage_url: null }, 'en');
eq(promo.lines, ['Promo code', 'Ends on ' + date], 'a promo is not a trial');
eq(promo.manage, null);

var gift = account.describePlan({ plan: 'pro', status: 'active', source: 'manual', product_id: 'pro.manual', is_trial: false, expires_at: null, will_renew: false, manage_url: null }, 'en');
eq(gift.lines, ['Gift from the Safini team', 'No end date']);

var grace = account.describePlan({ plan: 'pro', status: 'in_grace_period', source: 'apple', product_id: 'pro.monthly', is_trial: false, expires_at: '2026-11-09T12:00:00Z', will_renew: true, manage_url: 'https://apps.apple.com/account/subscriptions' }, 'en');
assert.ok(/App Store retries/.test(grace.warning), grace.warning);

var retry = account.describePlan({ plan: 'free', status: 'in_billing_retry', source: 'apple', product_id: 'pro.monthly', is_trial: false, expires_at: '2026-10-01T12:00:00Z', will_renew: true, manage_url: 'https://apps.apple.com/account/subscriptions' }, 'en');
eq(retry.isPro, false);
assert.ok(/App Store settings/.test(retry.warning), retry.warning);
eq(retry.manage.label, 'Manage in the App Store', 'a lapsed App Store plan still links to Apple');

var refunded = account.describePlan({ plan: 'free', status: 'revoked', source: 'apple', product_id: 'pro.monthly', is_trial: false, expires_at: '2026-10-01T12:00:00Z', will_renew: false, manage_url: 'https://apps.apple.com/account/subscriptions' }, 'en');
eq(refunded.note, 'This purchase was refunded.');

eq(free.canUpgrade, true);
eq(retry.canUpgrade, false, 'no second purchase while a payment is retried');
eq(monthly.canUpgrade, false);

var web = account.describePlan({ plan: 'pro', status: 'active', source: 'paddle', product_id: 'pro.yearly', is_trial: false, expires_at: '2026-11-09T12:00:00Z', will_renew: true, manage_url: null }, 'en');
eq(web.lines, ['Bought on safini.fun', 'Yearly', 'Renews on ' + date]);
eq(web.manage.portal, true, 'website buyers manage in the Paddle portal');
eq(web.manage.label, 'Manage subscription');

var webRetry = account.describePlan({ plan: 'free', status: 'in_billing_retry', source: 'paddle', product_id: 'pro.monthly', is_trial: false, expires_at: '2026-10-01T12:00:00Z', will_renew: true, manage_url: null }, 'en');
eq(webRetry.manage.portal, true, 'a failed card is fixed in the portal');
eq(webRetry.warning, 'Your last payment did not go through, so Pro is paused. Update your payment method to turn it back on.');

var webEnded = account.describePlan({ plan: 'free', status: 'expired', source: 'paddle', product_id: 'pro.monthly', is_trial: false, expires_at: '2026-10-01T12:00:00Z', will_renew: false, manage_url: null }, 'en');
eq(webEnded.manage, null);
eq(webEnded.canUpgrade, true);

var expired = account.describePlan({ plan: 'free', status: 'expired', source: 'promo', product_id: 'pro.promo', is_trial: true, expires_at: '2026-11-09T12:00:00Z', will_renew: false, manage_url: null }, 'en');
eq(expired.note, 'Pro ended on ' + date + '.');

var ru = account.describePlan({ plan: 'pro', status: 'active', source: 'apple', product_id: 'pro.monthly', is_trial: false, expires_at: '2026-11-09T12:00:00Z', will_renew: true, manage_url: 'https://apps.apple.com/account/subscriptions' }, 'ru');
eq(ru.lines[0], 'Куплено в App Store');
assert.ok(/^Продлится 9 ноября 2026/.test(ru.lines[2]), ru.lines[2]);

eq(account.formatDate('2026-10-26T12:00:00Z', 'uz'), '26-oktabr, 2026');

var uz = account.describePlan(null, 'uz');
eq(uz.title, 'Bepul tarif');

console.log('account ok');
