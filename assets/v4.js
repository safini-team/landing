/* Safini landing V4-A - newsletter, store links + nav behaviour, shared by all five locales.
   Copy strings come from window.SAFINI_MSG, set inline on each language page. */
(function () {
  'use strict';

  // newsletter signups still land in the waiting-list table
  var API = 'https://api.safini.fun/v1/waiting-list';
  var APP_STORE = 'https://apps.apple.com/us/app/safini/id6761075183';
  var PLAY = 'https://play.google.com/store/apps/details?id=com.safini.app';
  var MSG = window.SAFINI_MSG || {};

  function say(el, text, state) {
    if (!el) return;
    el.textContent = text;
    el.setAttribute('data-state', state);
  }

  document.querySelectorAll('form.joinform').forEach(function (form) {
    var msgEl = document.getElementById(form.getAttribute('data-msg-target'));
    var btn = form.querySelector('button[type=submit]');
    var btnLabel = btn ? btn.textContent : '';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if ((btn && btn.disabled) || !form.reportValidity()) return;

      var field = form.querySelector('input[name=email]');
      var email = (field && field.value || '').trim();
      if (!email) return;

      if (btn) { btn.disabled = true; btn.textContent = MSG.sending || 'Subscribing…'; }
      say(msgEl, MSG.sending || 'Subscribing…', 'pending');

      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 10000);
      var rawUtm = new URLSearchParams(window.location.search).get('utm_source');
      // The API accepts at most 120 characters, including our prefix.
      var utmSource = (rawUtm ? 'landing_page+' + rawUtm : 'landing_page').slice(0, 120);

      function reset() {
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
      }

      try {
        var resp = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email: email, utm_source: utmSource }),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (resp.status === 201) {
          say(msgEl, MSG.ok || "You're subscribed.", 'ok');
          form.reset();
          reset();
          track('newsletter_signup', {
            placement: form.id || 'newsletter_form',
            language: document.documentElement.lang
          });
        } else if (resp.status === 409) {
          say(msgEl, MSG.duplicate || 'That email is already subscribed.', 'error');
          reset();
        } else {
          say(msgEl, MSG.error || 'Something went wrong. Please try again.', 'error');
          reset();
        }
      } catch (err) {
        clearTimeout(timer);
        say(msgEl, err.name === 'AbortError'
          ? (MSG.timeout || 'Timed out. Please try again.')
          : (MSG.error || 'Something went wrong. Please try again.'), 'error');
        reset();
      }
    });
  });

  // Download buttons go straight to the store on a phone, to #download elsewhere
  var ua = navigator.userAgent;
  var store = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? APP_STORE
    : /Android/.test(ua) ? PLAY : null;
  if (store) {
    document.querySelectorAll('a[data-store-link]').forEach(function (a) { a.href = store; });
  }

  // Hooks for the site's analytics integration; never include email or URL queries.
  function track(name, data) {
    window.dispatchEvent(new CustomEvent('safini:conversion', { detail: { event: name, ...data } }));
    if (typeof window.gtag === 'function') window.gtag('event', name, data);
  }
  document.querySelectorAll('a.store, a[data-store-link], .plan.featured .plan-cta').forEach(function (link) {
    link.addEventListener('click', function () {
      var section = link.closest('[data-screen-label]');
      var destination = link.href.indexOf('apps.apple.com') !== -1 ? 'app_store'
        : link.href.indexOf('play.google.com') !== -1 ? 'google_play' : 'download_section';
      track('download_click', {
        destination: destination,
        placement: section ? section.getAttribute('data-screen-label') : 'unknown',
        language: document.documentElement.lang
      });
    });
  });
})();
