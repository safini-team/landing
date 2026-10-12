/* Safini landing V4-A - newsletter, store links + nav behaviour, shared by en / ru / uz.
   Copy strings come from window.SAFINI_MSG, set inline on each language page. */
(function () {
  'use strict';

  // newsletter signups still land in the waiting-list table
  var API = 'https://api.safini.fun/v1/waiting-list';
  var APP_STORE = 'https://apps.apple.com/us/app/safini/id6761075183';
  var PLAY = 'https://play.google.com/store/apps/details?id=com.safini.app';
  var MSG = window.SAFINI_MSG || {};
  var SOCIAL_LINKS = [
    { name: 'Instagram', mark: 'IG', url: 'https://www.instagram.com/safini.app/' },
    { name: 'Threads', mark: 'Th', url: 'https://www.threads.com/@safini.app' },
    { name: 'X', mark: 'X', url: 'https://x.com/safini_ai' }
  ];

  document.querySelectorAll('[data-social-links]').forEach(function (list) {
    SOCIAL_LINKS.forEach(function (social) {
      var item = document.createElement('li');
      var link = document.createElement('a');
      var mark = document.createElement('span');
      mark.className = 'social-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = social.mark;
      link.href = social.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.append(mark, document.createTextNode(social.name));
      item.appendChild(link);
      list.appendChild(item);
    });
  });

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

      if (btn) { btn.disabled = true; btn.textContent = MSG.sending || 'Subscribing…'; }
      say(msgEl, MSG.sending || 'Subscribing…', 'pending');

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
          say(msgEl, MSG.ok || "You're subscribed.", 'ok');
          form.reset();
          reset();
          if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_signup', {
              event_category: 'engagement',
              event_label: form.id || 'newsletter_form'
            });
          }
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

  var dialog;
  function showPlayReview() {
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'play-review';
      var h = document.createElement('h3');
      h.textContent = MSG.playReviewTitle || 'Update in review';
      var p = document.createElement('p');
      p.textContent = MSG.playReviewBody || 'The new Safini version is in review on Google Play. Check back soon.';
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'play-review-close';
      b.textContent = MSG.playReviewClose || 'Got it';
      b.addEventListener('click', function () { dialog.close(); });
      dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
      dialog.append(h, p, b);
      document.body.appendChild(dialog);
    }
    if (!dialog.open) dialog.showModal();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.href.indexOf('play.google.com') === -1) return;
    e.preventDefault();
    showPlayReview();
  });

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
