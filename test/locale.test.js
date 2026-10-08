'use strict';

var assert = require('assert');
var locale = require('../assets/locale.js');

function eq(actual, expected, msg) {
  assert.strictEqual(actual, expected, msg);
}

// --- languageCode ---
eq(locale.languageCode('ru-RU'), 'ru');
eq(locale.languageCode('en-GB'), 'en');
eq(locale.languageCode('uz-UZ'), 'uz');
eq(locale.languageCode('uz-Cyrl'), 'uz');
eq(locale.languageCode('RU'), 'ru');
eq(locale.languageCode('en_US'), 'en');
eq(locale.languageCode(''), '');
eq(locale.languageCode(null), '');

// --- detectFromLanguages: ru and en auto, uz never ---
eq(locale.detectFromLanguages(['ru']), 'ru', 'Russian phone -> Russian');
eq(locale.detectFromLanguages(['ru-RU']), 'ru');
eq(locale.detectFromLanguages(['ru-KZ']), 'ru');
eq(locale.detectFromLanguages(['en']), 'en', 'English phone -> English');
eq(locale.detectFromLanguages(['en-GB']), 'en');
eq(locale.detectFromLanguages(['en-US']), 'en');

eq(
  locale.detectFromLanguages(['uz']),
  'en',
  'Uzbek-only must not auto-select uz'
);
eq(locale.detectFromLanguages(['uz-UZ']), 'en');
eq(locale.detectFromLanguages(['uz-Cyrl-UZ']), 'en');

eq(
  locale.detectFromLanguages(['uz', 'ru', 'en']),
  'ru',
  'skip uz, then take the next auto-selectable language'
);
eq(locale.detectFromLanguages(['uz-UZ', 'en-GB']), 'en');
eq(
  locale.detectFromLanguages(['de', 'ru', 'en']),
  'ru',
  'walk the preference list like mobile'
);
eq(locale.detectFromLanguages(['tr', 'en']), 'en');
eq(locale.detectFromLanguages(['de']), 'en', 'unmatched falls back to English');
eq(locale.detectFromLanguages(['kk']), 'en', 'Kazakh-only must not auto-select kk');
eq(locale.detectFromLanguages(['ky']), 'en', 'Kyrgyz-only must not auto-select ky');
eq(locale.detectFromLanguages(['ky-KG', 'kk-KZ', 'ru']), 'ru');
eq(locale.detectFromLanguages([]), 'en');
eq(locale.detectFromLanguages(null), 'en');
eq(locale.detectFromLanguages(undefined), 'en');

// --- pageLangFromPath ---
eq(locale.pageLangFromPath('/'), 'en');
eq(locale.pageLangFromPath('/index.html'), 'en');
eq(locale.pageLangFromPath('/ru/'), 'ru');
eq(locale.pageLangFromPath('/ru'), 'ru');
eq(locale.pageLangFromPath('/ru/index.html'), 'ru');
eq(locale.pageLangFromPath('/uz/'), 'uz');
eq(locale.pageLangFromPath('/uz'), 'uz');
eq(locale.pageLangFromPath('/uz/index.html'), 'uz');
eq(locale.pageLangFromPath('/ky/'), 'ky');
eq(locale.pageLangFromPath('/ky/index.html'), 'ky');
eq(locale.pageLangFromPath('/kk/'), 'kk');
eq(locale.pageLangFromPath('/kk'), 'kk');
eq(locale.pageLangFromPath('/kkx/'), 'en');

// --- resolveLang: stored pick wins; URL ru/uz honored; else detect ---
eq(
  locale.resolveLang({ stored: 'uz', page: 'en', languages: ['ru'] }),
  'uz',
  'explicit Uzbek pick is allowed and wins'
);
eq(locale.resolveLang({ stored: 'ru', page: 'en', languages: ['en'] }), 'ru');
eq(locale.resolveLang({ stored: 'en', page: 'ru', languages: ['ru'] }), 'en');
eq(
  locale.resolveLang({ stored: null, page: 'uz', languages: ['ru'] }),
  'uz',
  'opening /uz/ is not overwritten by auto-detect'
);
eq(locale.resolveLang({ stored: null, page: 'ru', languages: ['en'] }), 'ru');
eq(locale.resolveLang({ stored: null, page: 'en', languages: ['ru-RU'] }), 'ru');
eq(locale.resolveLang({ stored: null, page: 'en', languages: ['en'] }), 'en');
eq(
  locale.resolveLang({ stored: null, page: 'en', languages: ['uz'] }),
  'en',
  'Uzbek browser on / stays English'
);
eq(
  locale.resolveLang({ stored: 'kk', page: 'en', languages: ['ru'] }),
  'kk',
  'explicit Kazakh pick is allowed and wins'
);
eq(locale.resolveLang({ stored: null, page: 'ky', languages: ['ru'] }), 'ky');
eq(locale.resolveLang({ stored: null, page: 'en', languages: ['ky', 'kk'] }), 'en');
eq(locale.resolveLang({ stored: 'de', page: 'en', languages: ['ru'] }), 'ru');
eq(locale.resolveLang({ stored: '', page: 'en', languages: ['ru'] }), 'ru');

eq(locale.pathFor('en'), '/');
eq(locale.pathFor('ru'), '/ru/');
eq(locale.pathFor('uz'), '/uz/');
eq(locale.pathFor('ky'), '/ky/');
eq(locale.pathFor('kk'), '/kk/');
eq(locale.pathFor('de'), '/');

eq(locale.isStoredLang('uz'), true);
eq(locale.isStoredLang('en'), true);
eq(locale.isStoredLang('ru'), true);
eq(locale.isStoredLang('ky'), true);
eq(locale.isStoredLang('kk'), true);
eq(locale.isStoredLang('de'), false);
eq(locale.isStoredLang(null), false);

console.log('ok');
