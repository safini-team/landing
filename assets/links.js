/* Official Safini beta and social URLs (SAF-265).
   One place to update them. Pages mark links with data-safini-link and this
   file fills href, target and rel so the HTML never drifts from the config. */
(function (root) {
  'use strict';

  var LINKS = {
    beta: 'https://t.me/safini_beta',
    instagram: 'https://www.instagram.com/safini.app/',
    threads: 'https://www.threads.com/@safini.app',
    x: 'https://x.com/safini_ai'
  };

  function apply() {
    if (typeof document === 'undefined') return;
    var nodes = document.querySelectorAll('[data-safini-link]');
    for (var i = 0; i < nodes.length; i++) {
      var href = LINKS[nodes[i].getAttribute('data-safini-link')];
      if (!href) continue;
      nodes[i].setAttribute('href', href);
      nodes[i].setAttribute('target', '_blank');
      nodes[i].setAttribute('rel', 'noopener noreferrer');
    }
  }

  var api = { LINKS: LINKS, apply: apply };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }

  root.SAFINI_LINKS = api;
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})(typeof window !== 'undefined' ? window : this);
