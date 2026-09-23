'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var code = fs.readFileSync(path.join(__dirname, '../assets/locale.js'), 'utf8');

function runBoot(opts) {
  var replaced = null;
  var clicks = [];
  var store = Object.assign({}, opts.store || {});
  var location = {
    pathname: opts.pathname || '/',
    search: opts.search || '',
    hash: opts.hash || '',
    replace: function (url) { replaced = url; }
  };
  var document = {
    addEventListener: function (type, fn, capture) {
      clicks.push({ type: type, fn: fn, capture: capture });
    }
  };
  var sandbox = {
    window: null,
    document: document,
    location: location,
    navigator: {
      languages: opts.languages,
      language: (opts.languages && opts.languages[0]) || ''
    },
    localStorage: {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem: function (k, v) { store[k] = String(v); }
    }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(code, sandbox);
  return {
    replaced: replaced,
    store: store,
    clicks: clicks,
    api: sandbox.SAFINI_LOCALE,
    fireClick: function (hreflang) {
      var event = {
        target: {
          tagName: 'A',
          getAttribute: function (name) { return name === 'hreflang' ? hreflang : null; },
          parentNode: document
        }
      };
      clicks.forEach(function (c) {
        if (c.type === 'click') c.fn(event);
      });
    }
  };
}

var ru = runBoot({ pathname: '/', languages: ['ru-RU', 'ru'] });
assert.strictEqual(ru.replaced, '/ru/', 'Russian browser on / redirects to /ru/');
assert.strictEqual(ru.store.safini_lang, undefined, 'auto-detect does not persist');

var en = runBoot({ pathname: '/', languages: ['en-US'] });
assert.strictEqual(en.replaced, null, 'English browser on / stays');

var uz = runBoot({ pathname: '/', languages: ['uz-UZ'] });
assert.strictEqual(uz.replaced, null, 'Uzbek-only browser on / stays English');

var uzThenRu = runBoot({ pathname: '/', languages: ['uz', 'ru'] });
assert.strictEqual(uzThenRu.replaced, '/ru/', 'skip uz then take ru from the list');

var honorUz = runBoot({ pathname: '/uz/', languages: ['ru'] });
assert.strictEqual(honorUz.replaced, null, 'direct /uz/ is not overwritten');

var honorRu = runBoot({ pathname: '/ru/', languages: ['en'] });
assert.strictEqual(honorRu.replaced, null, 'direct /ru/ is not overwritten');

var storedUz = runBoot({
  pathname: '/',
  languages: ['en'],
  store: { safini_lang: 'uz' }
});
assert.strictEqual(storedUz.replaced, '/uz/', 'explicit Uzbek pick wins on later visits');

var storedEn = runBoot({
  pathname: '/ru/',
  languages: ['ru'],
  store: { safini_lang: 'en' }
});
assert.strictEqual(storedEn.replaced, '/', 'explicit English pick wins over a Russian browser');

var qs = runBoot({
  pathname: '/',
  search: '?utm_source=telegram',
  hash: '#download',
  languages: ['ru']
});
assert.strictEqual(qs.replaced, '/ru/?utm_source=telegram#download');

var clicker = runBoot({ pathname: '/', languages: ['en'] });
clicker.fireClick('uz');
assert.strictEqual(clicker.store.safini_lang, 'uz', 'switcher click persists Uzbek');

console.log('boot ok');
