'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var a = require('../assets/attribution.js');

var ROOT = path.join(__dirname, '..');
var PLAY = 'https://play.google.com/store/apps/details?id=com.safini.app';
var APPLE = 'https://apps.apple.com/us/app/safini/id6761075183';

// Codes: loose to type, strict to keep.
assert.strictEqual(a.normalize(' ai-gul '), 'AIGUL');
assert.strictEqual(a.normalize('ai'), null);
assert.strictEqual(a.normalize('mama@mail.ru'), null);

// The code comes from ?ref, ?c, or a creator utm campaign; other params drop.
assert.deepStrictEqual(a.fromQuery('?ref=aigul&utm_source=instagram&fbclid=x&email=a@b.c'), {
  utm_source: 'instagram', code: 'AIGUL'
});
assert.deepStrictEqual(a.fromQuery('?utm_source=creator&utm_campaign=bolat'), {
  utm_source: 'creator', utm_campaign: 'bolat', code: 'BOLAT'
});
assert.deepStrictEqual(a.fromQuery('?utm_campaign=my%20daughter'), {});

// Google Play carries the code to the app as an install referrer.
var play = new URL(a.playHref(PLAY, { code: 'AIGUL', utm_medium: 'instagram' }));
assert.strictEqual(play.searchParams.get('id'), 'com.safini.app');
assert.strictEqual(play.searchParams.get('referrer'),
  'utm_source=creator&utm_medium=instagram&utm_campaign=AIGUL');
assert.strictEqual(a.playHref(PLAY, {}), PLAY);

// The App Store link only changes once a provider token exists.
assert.strictEqual(a.appleHref(APPLE, { code: 'AIGUL' }, ''), APPLE);
var apple = new URL(a.appleHref(APPLE, { code: 'AIGUL' }, '123456'));
assert.strictEqual(apple.searchParams.get('ct'), 'AIGUL');
assert.strictEqual(apple.searchParams.get('pt'), '123456');

// What the API gets: allowlisted keys only.
var sent = a.body({ id: 'tab-1', code: 'AIGUL', utm_source: 'instagram', extra: 'x' }, 'ru',
  [{ name: 'store_click', step: 'play' }]);
assert.deepStrictEqual(Object.keys(sent).sort(),
  ['creator_code', 'events', 'install_id', 'lang', 'platform', 'surface', 'utm_source']);
assert.strictEqual(sent.surface, 'web');

// Collection ships switched off.
var source = fs.readFileSync(path.join(ROOT, 'assets/attribution.js'), 'utf8');
assert.ok(/var COLLECT = false;/.test(source), 'COLLECT stays false until launch');

// Every language has the note, and every landing loads the script.
['en', 'ru', 'uz', 'ky', 'kk'].forEach(function (lang) {
  assert.ok(a.NOTE[lang].indexOf('{code}') !== -1, lang + ' note names the code');
});
['index.html', 'ru/index.html', 'uz/index.html', 'ky/index.html', 'kk/index.html'].forEach(function (file) {
  var html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  assert.ok(html.indexOf('/assets/attribution.js') !== -1, file + ' loads attribution.js');
  assert.ok(html.indexOf('gtag') === -1, file + ' has no gtag');
});
assert.ok(fs.readFileSync(path.join(ROOT, 'assets/v4.js'), 'utf8').indexOf('gtag') === -1, 'v4.js has no gtag');

console.log('attribution.test.js: ok');
