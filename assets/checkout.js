/* Website checkout through Paddle (SAF-215, SAF-261) for /account/. The landing's
   Pro buttons link to /account/?buy=1 (landingHref). Setting live to false turns
   the account page back to "coming soon"; then ?checkout=sandbox turns the
   sandbox on for this tab, so the whole funnel can be tested on safini.fun. */
(function (root) {
  'use strict';

  var ENVIRONMENTS = {
    production: {
      token: 'live_b633622619f872f3807659232dd',
      prices: { monthly: 'pri_01m4n3ej7tptv16kj6baed5kgx', yearly: 'pri_01m4n3ejfvpe33qnyrkv02fgqh' },
      // Central Asia prices (SAF-305), what the App Store charges in KG, KZ, UZ.
      regional: { monthly: 'pri_01m5989vcfceh273pm92dn69vf', yearly: 'pri_01m598afvntrrvaspy4br1frfv' }
    },
    sandbox: {
      token: 'test_7168e365b97bf155f876b55c7c6',
      prices: { monthly: 'pri_01m4jn1zae1736c66yprynjzt0', yearly: 'pri_01m4jn3hstyahmgssewzbt1bp3' }
    }
  };
  var CHECKOUT = { live: true, environments: ENVIRONMENTS };
  var KEY = 'safini_checkout';

  function accountLang(pageLang) {
    var code = String(pageLang || '').toLowerCase().split('-')[0];
    if (code === 'en' || code === 'uz') return code;
    return 'ru';
  }

  function landingHref(pageLang) {
    return '/account/?buy=1&lang=' + accountLang(pageLang);
  }

  function enabled() {
    if (CHECKOUT.live) return true;
    try {
      if (new URLSearchParams(root.location.search).get('checkout') === 'sandbox') {
        root.sessionStorage.setItem(KEY, 'sandbox');
      }
      return root.sessionStorage.getItem(KEY) === 'sandbox';
    } catch (err) {
      return false;
    }
  }

  // The live flag wins over a sandbox tab, so a real buyer is never sent to the sandbox.
  function environment() {
    return CHECKOUT.live ? 'production' : 'sandbox';
  }

  CHECKOUT.enabled = enabled;
  Object.defineProperty(CHECKOUT, 'environment', { get: environment });
  Object.defineProperty(CHECKOUT, 'token', { get: function () { return ENVIRONMENTS[environment()].token; } });
  Object.defineProperty(CHECKOUT, 'prices', { get: function () { return ENVIRONMENTS[environment()].prices; } });
  // English pages sell at the global price ($9.99 / $59.99); Russian, Uzbek,
  // Kyrgyz and Kazakh pages at the Central Asia price ($4.99 / $29.99), the
  // same as the price shown on that page (SAF-305).
  function pricesFor(pageLang) {
    var env = ENVIRONMENTS[environment()];
    var code = String(pageLang || '').toLowerCase().split('-')[0];
    return code === 'en' ? env.prices : (env.regional || env.prices);
  }

  CHECKOUT.pricesFor = pricesFor;
  CHECKOUT.accountLang = accountLang;
  CHECKOUT.landingHref = landingHref;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CHECKOUT;
    return;
  }
  root.SAFINI_CHECKOUT = CHECKOUT;
})(typeof window !== 'undefined' ? window : this);
