/* Website checkout through Paddle (SAF-215), shared by the landing and /account/.
   Off until the live Paddle account is verified and safini.fun is an approved
   checkout domain; ?checkout=sandbox turns the sandbox on for this tab, so the
   whole funnel can be tested on safini.fun. */
(function (root) {
  'use strict';

  var ENVIRONMENTS = {
    production: {
      token: 'live_b633622619f872f3807659232dd',
      prices: { monthly: 'pri_01m4n3ej7tptv16kj6baed5kgx', yearly: 'pri_01m4n3ejfvpe33qnyrkv02fgqh' }
    },
    sandbox: {
      token: 'test_7168e365b97bf155f876b55c7c6',
      prices: { monthly: 'pri_01m4jn1zae1736c66yprynjzt0', yearly: 'pri_01m4jn3hstyahmgssewzbt1bp3' }
    }
  };
  var CHECKOUT = { live: false, environments: ENVIRONMENTS };
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

  // Pro buttons on the landing lead to sign-in and checkout instead of the App Store.
  function wireLanding() {
    if (!enabled()) return;
    var links = root.document.querySelectorAll('a[data-web-checkout]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = landingHref(root.document.documentElement.lang);
      links[i].textContent = links[i].getAttribute('data-web-checkout');
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
  CHECKOUT.accountLang = accountLang;
  CHECKOUT.landingHref = landingHref;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CHECKOUT;
    return;
  }
  root.SAFINI_CHECKOUT = CHECKOUT;
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', wireLanding);
  } else {
    wireLanding();
  }
})(typeof window !== 'undefined' ? window : this);
