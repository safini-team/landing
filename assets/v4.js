/* Safini landing V4-A - waitlist + nav behaviour, shared by en / ru / uz.
   Copy strings come from window.SAFINI_MSG, set inline on each language page. */
(function () {
  'use strict';

  var API = 'https://api.safini.fun/v1/waiting-list';
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

      var field = form.querySelector('input[name=email]');
      var email = (field && field.value || '').trim();
      if (!email) return;

      if (btn) { btn.disabled = true; btn.textContent = MSG.sending || 'Joining…'; }
      say(msgEl, MSG.sending || 'Joining…', 'pending');

      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 10000);
      var rawUtm = new URLSearchParams(window.location.search).get('utm_source');
      var utmSource = rawUtm ? 'landing_page+' + rawUtm : 'landing_page';

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
          say(msgEl, MSG.ok || "You're on the list.", 'ok');
          form.reset();
          reset();
          if (typeof gtag !== 'undefined') {
            gtag('event', 'waitlist_signup', {
              event_category: 'engagement',
              event_label: form.id || 'waitlist_form'
            });
          }
        } else if (resp.status === 409) {
          say(msgEl, MSG.duplicate || 'That email is already on the list.', 'error');
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

  // plans: monthly / yearly toggle. CSS shows the .cyc- span matching data-cycle
  var plans = document.querySelector('.plans');
  if (plans) {
    var opts = plans.querySelectorAll('.billing-opt');
    opts.forEach(function (btn) {
      btn.addEventListener('click', function () {
        plans.setAttribute('data-cycle', btn.getAttribute('data-cycle'));
        opts.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
      });
    });
  }

  // smooth scroll for in-page anchors, offset for the sticky nav
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
  });
})();
