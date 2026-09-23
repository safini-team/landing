/* Safini landing locale defaults.
   Match the parent-app rule: follow the phone when it is Russian or English.
   Uzbek is offered in the switcher but is never chosen from navigator.language
   / Accept-Language. An explicit pick (localStorage) wins forever. */
(function (root) {
  'use strict';

  var KEY = 'safini_lang';
  var AUTO = { en: true, ru: true };

  function languageCode(tag) {
    if (!tag) return '';
    return String(tag).toLowerCase().split(/[-_]/)[0];
  }

  function isStoredLang(code) {
    return code === 'en' || code === 'ru' || code === 'uz';
  }

  function detectFromLanguages(list) {
    if (!list || !list.length) return 'en';
    for (var i = 0; i < list.length; i++) {
      var code = languageCode(list[i]);
      if (code === 'uz') continue;
      if (AUTO[code]) return code;
    }
    return 'en';
  }

  function pageLangFromPath(pathname) {
    var p = String(pathname || '/').replace(/\/index\.html$/i, '/');
    if (p === '/uz' || p.indexOf('/uz/') === 0) return 'uz';
    if (p === '/ru' || p.indexOf('/ru/') === 0) return 'ru';
    return 'en';
  }

  function resolveLang(opts) {
    opts = opts || {};
    if (isStoredLang(opts.stored)) return opts.stored;
    if (opts.page === 'ru' || opts.page === 'uz') return opts.page;
    return detectFromLanguages(opts.languages);
  }

  function pathFor(lang) {
    if (lang === 'ru') return '/ru/';
    if (lang === 'uz') return '/uz/';
    return '/';
  }

  function readStored() {
    try {
      return localStorage.getItem(KEY);
    } catch (err) {
      return null;
    }
  }

  function writeStored(code) {
    if (!isStoredLang(code)) return;
    try {
      localStorage.setItem(KEY, code);
    } catch (err) { /* private mode */ }
  }

  function browserLanguages() {
    if (typeof navigator === 'undefined') return [];
    if (navigator.languages && navigator.languages.length) {
      return navigator.languages;
    }
    return navigator.language ? [navigator.language] : [];
  }

  function boot() {
    if (typeof document === 'undefined' || typeof location === 'undefined') return;

    function closeLangMenus() {
      var open = document.querySelectorAll('details.lang-dd[open]');
      for (var i = 0; i < open.length; i++) open[i].removeAttribute('open');
    }

    document.addEventListener('click', function (e) {
      var node = e.target;
      var inPicker = false;
      while (node && node !== document) {
        if (node.nodeType === 1) {
          if (node.tagName === 'A') {
            var h = node.getAttribute && node.getAttribute('hreflang');
            if (isStoredLang(h)) writeStored(h);
          }
          if (node.classList && node.classList.contains('lang-dd')) inPicker = true;
        }
        node = node.parentNode;
      }
      if (!inPicker) closeLangMenus();
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) closeLangMenus();
    });

    var page = pageLangFromPath(location.pathname);
    var target = resolveLang({
      stored: readStored(),
      page: page,
      languages: browserLanguages()
    });
    if (target === page) return;

    var next = pathFor(target);
    if (location.search) next += location.search;
    if (location.hash) next += location.hash;
    location.replace(next);
  }

  var api = {
    KEY: KEY,
    languageCode: languageCode,
    isStoredLang: isStoredLang,
    detectFromLanguages: detectFromLanguages,
    pageLangFromPath: pageLangFromPath,
    resolveLang: resolveLang,
    pathFor: pathFor
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.SAFINI_LOCALE = api;
    boot();
  }
})(typeof window !== 'undefined' ? window : this);
