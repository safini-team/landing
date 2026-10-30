/* Creator links (SAF-143).

   A creator shares safini.fun/c/AIGUL (or any page with ?ref=AIGUL). This
   file keeps that code for the tab, shows it under the store buttons so a
   parent can type it in the app, and hands it to the stores:
   - Google Play gets an install referrer the app reads after install, so an
     Android family is attributed with no typing.
   - The App Store gets a campaign token (ct) when APPLE_PROVIDER_TOKEN is
     set, which gives per-creator App Store downloads in App Analytics.

   With COLLECT on, two anonymous steps also go to our own API: the visit and
   the store click. The id is random per tab and lives in sessionStorage, so
   there is no cookie and nothing to consent to. No name, email or free text
   is ever sent: only the code, the utm tags, the page language and which
   store was clicked. */
(function (root) {
  'use strict';

  var COLLECT = false;
  var API = 'https://api.safini.fun/v1/analytics/events';
  // App Store Connect -> Analytics -> Campaigns shows the provider token.
  var APPLE_PROVIDER_TOKEN = '';
  var KEY = 'safini.creator';
  var CODE = /^[A-Z0-9]{3,32}$/;
  var TOKEN = /^[A-Za-z0-9._-]{1,64}$/;

  var NOTE = {
    en: 'Your code {code}: enter it in the app when you sign in',
    ru: 'Ваш код {code}: введите его в приложении при входе',
    uz: 'Kodingiz {code}: ilovaga kirishda kiriting',
    ky: 'Сиздин код {code}: тиркемеге кирип жатканда жазыңыз',
    kk: 'Сіздің кодыңыз {code}: қосымшаға кіргенде енгізіңіз'
  };

  function normalize(raw) {
    if (!raw) return null;
    var code = String(raw).replace(/[\s-]/g, '').toUpperCase();
    return CODE.test(code) ? code : null;
  }

  /* The code and utm tags from a query string; anything else is ignored. */
  function fromQuery(search) {
    var params = new URLSearchParams(search || '');
    var out = {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (key) {
      var value = params.get(key);
      if (value && TOKEN.test(value)) out[key] = value;
    });
    var code = normalize(params.get('ref') || params.get('c'));
    if (!code && out.utm_source === 'creator') code = normalize(out.utm_campaign);
    if (code) out.code = code;
    return out;
  }

  function storage() {
    try { return root.sessionStorage || null; } catch (e) { return null; }
  }

  function load() {
    try { return JSON.parse((storage() || {}).getItem(KEY) || 'null'); } catch (e) { return null; }
  }

  function save(state) {
    try { storage().setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function randomId() {
    var c = root.crypto;
    if (c && c.randomUUID) return c.randomUUID();
    var bytes = new Uint8Array(16);
    if (c && c.getRandomValues) c.getRandomValues(bytes);
    else for (var i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  }

  /* This visit's attribution: a new code in the URL wins, else the tab's. */
  function current(search) {
    var stored = load() || {};
    var found = fromQuery(search);
    var state = found.code || found.utm_source ? found : stored;
    state.id = stored.id || randomId();
    save(state);
    return state;
  }

  function playHref(href, state) {
    if (!state.code) return href;
    var referrer = 'utm_source=creator&utm_medium=' + (state.utm_medium || 'site') +
      '&utm_campaign=' + state.code;
    var url = new URL(href);
    url.searchParams.set('referrer', referrer);
    return url.toString();
  }

  function appleHref(href, state, providerToken) {
    if (!state.code || !providerToken) return href;
    var url = new URL(href);
    url.searchParams.set('pt', providerToken);
    url.searchParams.set('ct', state.code);
    url.searchParams.set('mt', '8');
    return url.toString();
  }

  function lang(doc) {
    var value = ((doc && doc.documentElement && doc.documentElement.lang) || 'en').slice(0, 2);
    return NOTE[value] ? value : 'en';
  }

  function body(state, language, events) {
    var out = { install_id: state.id, surface: 'web', platform: 'web', lang: language, events: events };
    if (state.code) out.creator_code = state.code;
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (key) {
      if (state[key]) out[key] = state[key];
    });
    return out;
  }

  function send(payload) {
    if (!COLLECT) return;
    try {
      root.fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
        credentials: 'omit'
      }).catch(function () {});
    } catch (e) {}
  }

  function apply() {
    var doc = root.document;
    var state = current(root.location.search);
    var language = lang(doc);
    send(body(state, language, [{ name: 'landing_view' }]));

    var stores = doc.querySelectorAll('a.store');
    for (var i = 0; i < stores.length; i++) {
      var link = stores[i];
      var isPlay = link.classList.contains('store-play');
      link.setAttribute('href', isPlay
        ? playHref(link.getAttribute('href'), state)
        : appleHref(link.getAttribute('href'), state, APPLE_PROVIDER_TOKEN));
      link.addEventListener('click', function (event) {
        var store = event.currentTarget.classList.contains('store-play') ? 'play' : 'apple';
        send(body(state, language, [{ name: 'store_click', step: store }]));
      });
    }

    if (!state.code) return;
    var groups = doc.querySelectorAll('.stores');
    for (var j = 0; j < groups.length; j++) {
      var note = doc.createElement('p');
      note.className = 'creator-code';
      note.textContent = NOTE[language].replace('{code}', state.code);
      groups[j].insertAdjacentElement('afterend', note);
    }
  }

  var api = {
    normalize: normalize, fromQuery: fromQuery, playHref: playHref,
    appleHref: appleHref, body: body, NOTE: NOTE
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }

  root.SAFINI_ATTRIBUTION = api;
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})(typeof window !== 'undefined' ? window : this);
