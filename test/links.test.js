'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var links = require('../assets/links.js');

var ROOT = path.join(__dirname, '..');
var PAGES = [
  { file: 'index.html', label: 'Join beta testing' },
  { file: 'ru/index.html', label: 'Стать бета-тестером' },
  { file: 'uz/index.html', label: "Beta-testga qo'shiling" },
  { file: 'ky/index.html', label: 'Бета-тестке кошулуңуз' },
  { file: 'kk/index.html', label: 'Бета-тестке қосылыңыз' }
];
var KEYS = ['beta', 'instagram', 'threads', 'x'];

eq(links.LINKS.beta, 'https://t.me/safini_beta');
eq(links.LINKS.instagram, 'https://www.instagram.com/safini.app/');
eq(links.LINKS.threads, 'https://www.threads.com/@safini.app');
eq(links.LINKS.x, 'https://x.com/safini_ai');
assert.deepStrictEqual(Object.keys(links.LINKS).sort(), KEYS.slice().sort());

PAGES.forEach(function (page) {
  var html = fs.readFileSync(path.join(ROOT, page.file), 'utf8');
  var tags = anchorTags(html);

  assert.ok(html.indexOf('/assets/links.js') !== -1, page.file + ' loads links.js');
  assert.strictEqual(countKey(tags, 'beta'), 2, page.file + ' has beta in nav and hero');
  KEYS.forEach(function (key) {
    var found = tags.filter(function (t) { return t.key === key; });
    assert.ok(found.length > 0, page.file + ' has ' + key);
    found.forEach(function (t) {
      eq(t.href, links.LINKS[key], page.file + ' ' + key + ' href');
      eq(t.target, '_blank', page.file + ' ' + key + ' target');
      eq(t.rel, 'noopener noreferrer', page.file + ' ' + key + ' rel');
    });
  });

  var beta = tags.filter(function (t) { return t.key === 'beta'; });
  beta.forEach(function (t) {
    assert.ok(t.inner.indexOf(page.label) !== -1, page.file + ' beta label');
    assert.ok(t.inner.indexOf('--') === -1, page.file + ' no double dash in beta copy');
  });

  ['instagram', 'threads', 'x'].forEach(function (key) {
    var social = tags.filter(function (t) { return t.key === key; });
    eq(social.length, 1, page.file + ' one ' + key + ' link');
    assert.ok(social[0].aria, page.file + ' ' + key + ' aria-label');
    assert.ok(social[0].aria.indexOf('--') === -1, page.file + ' ' + key + ' aria has no double dash');
    assert.ok(social[0].cls.indexOf('social-' + key) !== -1, page.file + ' ' + key + ' icon class');
  });
});

var applied = runApply();
eq(applied.beta, links.LINKS.beta);
eq(applied.instagram, links.LINKS.instagram);
eq(applied.target, '_blank');
eq(applied.rel, 'noopener noreferrer');

console.log('links ok');

function eq(actual, expected, msg) {
  assert.strictEqual(actual, expected, msg);
}

function countKey(tags, key) {
  return tags.filter(function (t) { return t.key === key; }).length;
}

function anchorTags(html) {
  var re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  var out = [];
  var m;
  while ((m = re.exec(html))) {
    var attrs = m[1];
    var keyMatch = attrs.match(/data-safini-link="([^"]+)"/);
    if (!keyMatch) continue;
    out.push({
      key: keyMatch[1],
      href: attr(attrs, 'href'),
      target: attr(attrs, 'target'),
      rel: attr(attrs, 'rel'),
      aria: attr(attrs, 'aria-label'),
      cls: attr(attrs, 'class') || '',
      inner: m[2]
    });
  }
  return out;
}

function attr(attrs, name) {
  var m = attrs.match(new RegExp('\\b' + name + '="([^"]*)"'));
  return m ? m[1] : '';
}

function runApply() {
  var code = fs.readFileSync(path.join(ROOT, 'assets/links.js'), 'utf8');
  var node = {
    getAttribute: function (name) { return name === 'data-safini-link' ? 'beta' : null; },
    attrs: {},
    setAttribute: function (name, value) { this.attrs[name] = value; }
  };
  var ig = {
    getAttribute: function (name) { return name === 'data-safini-link' ? 'instagram' : null; },
    attrs: {},
    setAttribute: function (name, value) { this.attrs[name] = value; }
  };
  var sandbox = {
    window: null,
    document: {
      readyState: 'complete',
      querySelectorAll: function () { return [node, ig]; },
      addEventListener: function () {}
    }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(code, sandbox);
  return {
    beta: node.attrs.href,
    instagram: ig.attrs.href,
    target: node.attrs.target,
    rel: node.attrs.rel
  };
}
