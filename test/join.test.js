'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var join = require('../assets/join.js');

var ROOT = path.join(__dirname, '..');

function eq(actual, expected, msg) {
  assert.deepStrictEqual(actual, expected, msg);
}

// --- parseInvite: exactly /join/<child|parent>/<4 letters or digits> ---
eq(join.parseInvite('/join/child/K7PQ'), { kind: 'child', code: 'K7PQ' });
eq(join.parseInvite('/join/parent/prnt'), { kind: 'parent', code: 'PRNT' }, 'code is upper-cased');
eq(join.parseInvite('/join/child/K7PQ/'), { kind: 'child', code: 'K7PQ' }, 'trailing slash');

[
  '/join',
  '/join/',
  '/join/child',
  '/join/admin/K7PQ',
  '/join/child/TOOLONG',
  '/join/child/K7',
  '/join/child/K7-Q',
  '/join/child/K7PQ/extra',
  '/join/child/<b>x',
  '/get',
  '/',
  '',
  null
].forEach(function (bad) {
  eq(join.parseInvite(bad), null, String(bad) + ' is not an invite');
});

// --- platformOf ---
eq(join.platformOf('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 5), 'ios');
eq(join.platformOf('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5), 'ios', 'iPad in desktop mode');
eq(join.platformOf('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0), 'desktop');
eq(join.platformOf('Mozilla/5.0 (Linux; Android 15; Pixel 9)', 5), 'android');
eq(join.platformOf('', 0), 'desktop');

// --- appUrl: the scheme the app registers ---
eq(join.appUrl({ kind: 'child', code: 'K7PQ' }), 'safini://join/child/K7PQ');
eq(join.appUrl({ kind: 'parent', code: 'PRNT' }), 'safini://join/parent/PRNT');

// --- storeUrl: Play carries the invite as a referrer, the App Store cannot ---
var invite = { kind: 'child', code: 'K7PQ' };
eq(join.storeUrl('ios', invite), 'https://apps.apple.com/us/app/safini-parental-control/id6761075183');
eq(
  join.storeUrl('android', invite),
  'https://play.google.com/store/apps/details?id=com.safini.app&referrer=invite%3Dchild%3AK7PQ'
);
eq(join.storeUrl('android', null), 'https://play.google.com/store/apps/details?id=com.safini.app');

// --- pickLang: an explicit pick wins; uz, ky and kk only by a pick ---
eq(join.pickLang(null, ['ru-RU', 'en']), 'ru');
eq(join.pickLang(null, ['uz-UZ']), 'en', 'Uzbek phone does not auto-select uz');
eq(join.pickLang(null, ['kk', 'ru']), 'ru');
eq(join.pickLang('uz', ['ru']), 'uz', 'stored pick wins');
eq(join.pickLang('xx', ['de-DE']), 'de', 'unknown stored value is ignored');
eq(join.pickLang(null, []), 'en');
eq(join.pickLang(null, [undefined]), 'en');

// --- every language has every string ---
var LANGS = ['en', 'ru', 'uz', 'ky', 'kk', 'tr', 'es', 'pt', 'de', 'fr', 'id', 'ar'];
eq(Object.keys(join.STRINGS).sort(), LANGS.slice().sort());
var KEYS = Object.keys(join.STRINGS.en).sort();
LANGS.forEach(function (lang) {
  eq(Object.keys(join.STRINGS[lang]).sort(), KEYS, lang + ' has the same keys as en');
  KEYS.forEach(function (key) {
    var text = join.STRINGS[lang][key];
    assert.ok(text && text.trim(), lang + '.' + key + ' is not empty');
    assert.ok(text.indexOf('--') === -1 && text.indexOf('—') === -1, lang + '.' + key + ' has no dash');
  });
});

// --- the page and the hosting rules ---
var html = fs.readFileSync(path.join(ROOT, 'join.html'), 'utf8');
assert.ok(html.indexOf('/assets/join.js') !== -1, 'join.html loads join.js');
assert.ok(/name="robots" content="noindex/.test(html), 'invite pages are not indexed');
assert.ok(/name="referrer" content="no-referrer"/.test(html), 'the code is kept out of Referer');
[
  'join-title', 'join-invite', 'join-code-label', 'join-code', 'join-copy', 'join-steps',
  'join-step1', 'join-step2', 'join-get-ios', 'join-get-android', 'join-note',
  'join-open-block', 'join-have', 'join-open'
].forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, 'join.html has #' + id);
});

var redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
assert.ok(/^\/join\/\* \/join\.html 200$/m.test(redirects), 'invite paths are rewritten to join.html');

// iOS reads this file to let https://safini.fun/join/... open the app.
var aasaPath = path.join(ROOT, '.well-known', 'apple-app-site-association');
var aasa = JSON.parse(fs.readFileSync(aasaPath, 'utf8'));
var detail = aasa.applinks.details[0];
eq(detail.appIDs, ['X3B4RJS8GN.com.safini.app']);
eq(detail.components.map(function (c) { return c['/']; }), ['/join/*'], 'only invite links open the app');

var headers = fs.readFileSync(path.join(ROOT, '_headers'), 'utf8');
assert.ok(
  /\/\.well-known\/apple-app-site-association\n\s+Content-Type: application\/json/.test(headers),
  'the association file is served as JSON'
);

// Android reads this file to verify that https://safini.fun/join/... may open
// the app. The fingerprint is the Play app signing key (Play Console, App
// integrity); a wrong or missing one silently sends the link to the browser.
var assetLinks = JSON.parse(
  fs.readFileSync(path.join(ROOT, '.well-known', 'assetlinks.json'), 'utf8')
);
eq(assetLinks.length, 1);
eq(assetLinks[0].relation, ['delegate_permission/common.handle_all_urls']);
eq(assetLinks[0].target.namespace, 'android_app');
eq(assetLinks[0].target.package_name, 'com.safini.app');
assetLinks[0].target.sha256_cert_fingerprints.forEach(function (print) {
  assert.ok(/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(print), 'fingerprint is 32 upper-case hex bytes');
});
assert.ok(assetLinks[0].target.sha256_cert_fingerprints.length > 0, 'at least one fingerprint');

console.log('join.test.js: ok');
