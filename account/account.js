/* Safini web account (SAF-210). A parent signs in with the same Supabase
   account as the app and sees the family and its Safini Pro plan, read from
   the API exactly like the apps read it. */
(function (root) {
  'use strict';

  var SUPABASE_URL = 'https://ehxcgommwwamuglcquxg.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_dGU01a4oLmpxEFZptcG1Jg_cjkAox6-';
  var API_BASE = 'https://api.safini.fun/v1';
  var LANGS = ['en', 'ru', 'uz'];
  var LANG_KEY = 'safini_account_lang';
  var RESEND_SECONDS = 60;
  // Supabase's built-in mailer only reaches members of the Supabase org; turn on once custom SMTP is set.
  var EMAIL_SIGN_IN = false;

  var STRINGS = {
    en: {
      docTitle: 'Your Safini account',
      eyebrow: 'Account',
      back: '← Back to homepage',
      title: 'Your Safini account',
      heroSub: 'Your family and your Safini Pro plan, in one place.',
      signInTitle: 'Sign in',
      signInLede: 'Use the same Google account or email you use in the Safini app.',
      signInLedeGoogle: 'Use the same Google account you use in the Safini app.',
      appleSoon: 'Signed in to the app with Apple? Sign in with Apple is coming to the website soon.',
      google: 'Continue with Google',
      or: 'or',
      emailLabel: 'Email',
      sendCode: 'Email me a sign-in code',
      sending: 'Sending…',
      codeSentTo: 'We sent a sign-in email to {email}. Type the code from it, or open the link in it on this device.',
      codeLabel: 'Code from the email',
      verify: 'Sign in',
      verifying: 'Signing in…',
      resend: 'Send a new code',
      otherEmail: 'Use a different email',
      errNoAccount: 'There is no Safini account with this email yet. Create one in the Safini app first, then sign in here.',
      errBadEmail: 'Enter a valid email address.',
      errBadCode: 'That code is wrong or has expired. Check the latest email or send a new code.',
      errRate: 'Too many attempts. Wait a minute and try again.',
      errGeneric: 'Something went wrong. Please try again.',
      errOauth: 'Sign-in was cancelled or did not work. Please try again.',
      errSession: 'Your session has ended. Please sign in again.',
      loading: 'Loading your account…',
      signedInAs: 'Signed in as {email}',
      signOut: 'Sign out',
      family: 'Your family',
      parents: 'Parents',
      you: 'you',
      childrenNone: 'No child profiles yet',
      children: { one: '{n} child', other: '{n} children' },
      planTitle: 'Your plan',
      planPro: 'Safini Pro',
      planFree: 'Free plan',
      freeLimits: 'One parent, one child, up to 5 controlled apps and 5 recurring tasks per child.',
      proAdds: 'Safini Pro adds:',
      proFeatures: ['Room for a second parent', 'Unlimited child profiles', 'Unlimited controlled apps', 'Unlimited recurring tasks'],
      proPrice: '$7 a month or $67 a year, one subscription for the whole family.',
      upgrade: 'Upgrade to Pro',
      upgradeSoon: 'Buying Safini Pro on the website is coming soon. You can already subscribe in the Safini app on iPhone: Settings → Safini Pro.',
      source: { apple: 'Bought in the App Store', paddle: 'Bought on safini.fun', promo: 'Promo code', manual: 'Gift from the Safini team', finik: 'Finik pass' },
      period: { monthly: 'Monthly', yearly: 'Yearly' },
      renewsOn: 'Renews on {date}',
      endsOn: 'Ends on {date}',
      trialRenews: 'Free trial until {date}, then it renews',
      trialEnds: 'Free trial until {date}',
      noEnd: 'No end date',
      graceWarn: 'Your last payment did not go through. Pro stays on while {store} retries it; update your payment method to keep it.',
      retryWarnApple: 'Your last payment did not go through, so Pro is paused. Update your payment method in your App Store settings to turn it back on.',
      retryWarn: 'Your last payment did not go through, so Pro is paused. Update your payment method to turn it back on.',
      endedOn: 'Pro ended on {date}.',
      refunded: 'This purchase was refunded.',
      manageApple: 'Manage in the App Store',
      manage: 'Manage subscription',
      manageAppleNote: 'Only the parent who bought it can change or cancel it, on their iPhone: Settings → your name → Subscriptions.',
      noFamilyTitle: 'Set up your family in the app',
      noFamilyBody: 'Your account is not in a Safini family yet. Open the Safini app on your phone to create a family, or join one with an invite code from the other parent.',
      childTitle: 'This is a child account',
      childBody: 'Plans are managed by a parent. Ask your parent to sign in here with their own account.',
      loadError: 'We could not load your account.',
      retry: 'Try again',
      accountTitle: 'Account',
      deleteAccount: 'Delete account',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      refund: 'Refund Policy',
      noscript: 'Turn on JavaScript to sign in to your Safini account.'
    },
    ru: {
      docTitle: 'Ваш аккаунт Safini',
      eyebrow: 'Аккаунт',
      back: '← На главную',
      title: 'Ваш аккаунт Safini',
      heroSub: 'Ваша семья и план Safini Pro в одном месте.',
      signInTitle: 'Вход',
      signInLede: 'Используйте тот же аккаунт Google или email, что и в приложении Safini.',
      signInLedeGoogle: 'Используйте тот же аккаунт Google, что и в приложении Safini.',
      appleSoon: 'Входите в приложение через Apple? Вход через Apple на сайте скоро появится.',
      google: 'Войти через Google',
      or: 'или',
      emailLabel: 'Email',
      sendCode: 'Прислать код для входа',
      sending: 'Отправляем…',
      codeSentTo: 'Мы отправили письмо для входа на {email}. Введите код из него или откройте ссылку из письма на этом устройстве.',
      codeLabel: 'Код из письма',
      verify: 'Войти',
      verifying: 'Входим…',
      resend: 'Прислать новый код',
      otherEmail: 'Другой email',
      errNoAccount: 'Аккаунта Safini с этим email пока нет. Сначала создайте его в приложении Safini, затем войдите здесь.',
      errBadEmail: 'Введите корректный email.',
      errBadCode: 'Код неверный или устарел. Проверьте последнее письмо или запросите новый код.',
      errRate: 'Слишком много попыток. Подождите минуту и попробуйте снова.',
      errGeneric: 'Что-то пошло не так. Попробуйте ещё раз.',
      errOauth: 'Вход отменён или не удался. Попробуйте ещё раз.',
      errSession: 'Сессия закончилась. Войдите снова.',
      loading: 'Загружаем аккаунт…',
      signedInAs: 'Вы вошли как {email}',
      signOut: 'Выйти',
      family: 'Ваша семья',
      parents: 'Родители',
      you: 'вы',
      childrenNone: 'Детских профилей пока нет',
      children: { one: '{n} ребёнок', few: '{n} ребёнка', many: '{n} детей', other: '{n} ребёнка' },
      planTitle: 'Ваш план',
      planPro: 'Safini Pro',
      planFree: 'Бесплатный тариф',
      freeLimits: 'Один родитель, один ребёнок, до 5 контролируемых приложений и 5 регулярных заданий на ребёнка.',
      proAdds: 'Safini Pro добавляет:',
      proFeatures: ['Возможность добавить второго родителя', 'Детские профили без ограничений', 'Контролируемые приложения без ограничений', 'Регулярные задания без ограничений'],
      proPrice: '$7 в месяц или $67 в год, одна подписка на всю семью.',
      upgrade: 'Перейти на Pro',
      upgradeSoon: 'Покупка Safini Pro на сайте скоро появится. Уже сейчас подписку можно оформить в приложении Safini на iPhone: Настройки → Safini Pro.',
      source: { apple: 'Куплено в App Store', paddle: 'Куплено на safini.fun', promo: 'Промокод', manual: 'Подарок от команды Safini', finik: 'Пропуск Finik' },
      period: { monthly: 'Помесячно', yearly: 'На год' },
      renewsOn: 'Продлится {date}',
      endsOn: 'Закончится {date}',
      trialRenews: 'Пробный период до {date}, затем продление',
      trialEnds: 'Пробный период до {date}',
      noEnd: 'Без даты окончания',
      graceWarn: 'Последний платёж не прошёл. Pro работает, пока {store} повторяет попытки; обновите способ оплаты, чтобы сохранить его.',
      retryWarnApple: 'Последний платёж не прошёл, поэтому Pro приостановлен. Обновите способ оплаты в настройках App Store, чтобы снова включить его.',
      retryWarn: 'Последний платёж не прошёл, поэтому Pro приостановлен. Обновите способ оплаты, чтобы снова включить его.',
      endedOn: 'Pro закончился {date}.',
      refunded: 'Деньги за эту покупку возвращены.',
      manageApple: 'Управлять в App Store',
      manage: 'Управлять подпиской',
      manageAppleNote: 'Изменить или отменить подписку может только купивший её родитель, на своём iPhone: Настройки → ваше имя → Подписки.',
      noFamilyTitle: 'Создайте семью в приложении',
      noFamilyBody: 'Ваш аккаунт пока не состоит в семье Safini. Откройте приложение Safini на телефоне, чтобы создать семью или присоединиться к ней по коду приглашения от второго родителя.',
      childTitle: 'Это детский аккаунт',
      childBody: 'Планом управляет родитель. Попросите родителя войти здесь со своим аккаунтом.',
      loadError: 'Не удалось загрузить аккаунт.',
      retry: 'Попробовать снова',
      accountTitle: 'Аккаунт',
      deleteAccount: 'Удалить аккаунт',
      terms: 'Условия использования',
      privacy: 'Политика конфиденциальности',
      refund: 'Политика возврата',
      noscript: 'Включите JavaScript, чтобы войти в аккаунт Safini.'
    },
    uz: {
      docTitle: 'Safini hisobingiz',
      eyebrow: 'Hisob',
      back: '← Bosh sahifaga',
      title: 'Safini hisobingiz',
      heroSub: 'Oilangiz va Safini Pro tarifingiz bir joyda.',
      signInTitle: 'Kirish',
      signInLede: 'Safini ilovasidagi Google hisobi yoki email manzilingizdan foydalaning.',
      signInLedeGoogle: 'Safini ilovasidagi Google hisobingizdan foydalaning.',
      appleSoon: 'Ilovaga Apple orqali kirasizmi? Saytda Apple orqali kirish tez orada paydo bo‘ladi.',
      google: 'Google orqali kirish',
      or: 'yoki',
      emailLabel: 'Email',
      sendCode: 'Kirish kodini yuborish',
      sending: 'Yuborilmoqda…',
      codeSentTo: '{email} manziliga kirish xatini yubordik. Undagi kodni kiriting yoki xatdagi havolani shu qurilmada oching.',
      codeLabel: 'Xatdagi kod',
      verify: 'Kirish',
      verifying: 'Kirilmoqda…',
      resend: 'Yangi kod yuborish',
      otherEmail: 'Boshqa email',
      errNoAccount: 'Bu email bilan Safini hisobi hali yo‘q. Avval Safini ilovasida hisob yarating, so‘ng shu yerda kiring.',
      errBadEmail: 'To‘g‘ri email manzil kiriting.',
      errBadCode: 'Kod noto‘g‘ri yoki eskirgan. Oxirgi xatni tekshiring yoki yangi kod so‘rang.',
      errRate: 'Urinishlar juda ko‘p. Bir daqiqa kutib, qayta urinib ko‘ring.',
      errGeneric: 'Nimadir xato ketdi. Qayta urinib ko‘ring.',
      errOauth: 'Kirish bekor qilindi yoki amalga oshmadi. Qayta urinib ko‘ring.',
      errSession: 'Seans tugadi. Qayta kiring.',
      loading: 'Hisobingiz yuklanmoqda…',
      signedInAs: '{email} sifatida kirdingiz',
      signOut: 'Chiqish',
      family: 'Oilangiz',
      parents: 'Ota-onalar',
      you: 'siz',
      childrenNone: 'Hali bola profillari yo‘q',
      children: { other: '{n} ta bola' },
      planTitle: 'Tarifingiz',
      planPro: 'Safini Pro',
      planFree: 'Bepul tarif',
      freeLimits: 'Bitta ota-ona, bitta bola, har bir bola uchun 5 tagacha boshqariladigan ilova va 5 tagacha takroriy vazifa.',
      proAdds: 'Safini Pro qo‘shadi:',
      proFeatures: ['Ikkinchi ota-onani qo‘shish imkoniyati', 'Cheksiz bola profillari', 'Cheksiz boshqariladigan ilovalar', 'Cheksiz takroriy vazifalar'],
      proPrice: 'Oyiga $7 yoki yiliga $67, butun oila uchun bitta obuna.',
      upgrade: 'Pro’ga o‘tish',
      upgradeSoon: 'Safini Pro’ni saytda sotib olish tez orada paydo bo‘ladi. Hozircha obunani iPhone’dagi Safini ilovasida rasmiylashtirishingiz mumkin: Sozlamalar → Safini Pro.',
      source: { apple: 'App Store’da sotib olingan', paddle: 'safini.fun’da sotib olingan', promo: 'Promokod', manual: 'Safini jamoasidan sovg‘a', finik: 'Finik chiptasi' },
      period: { monthly: 'Oylik', yearly: 'Yillik' },
      renewsOn: '{date} kuni yangilanadi',
      endsOn: '{date} kuni tugaydi',
      trialRenews: 'Sinov muddati {date} gacha, keyin yangilanadi',
      trialEnds: 'Sinov muddati {date} gacha',
      noEnd: 'Tugash sanasi yo‘q',
      graceWarn: 'Oxirgi to‘lov o‘tmadi. {store} qayta urinayotgan paytda Pro ishlaydi; uni saqlab qolish uchun to‘lov usulini yangilang.',
      retryWarnApple: 'Oxirgi to‘lov o‘tmadi, shuning uchun Pro to‘xtatildi. Uni qayta yoqish uchun App Store sozlamalarida to‘lov usulini yangilang.',
      retryWarn: 'Oxirgi to‘lov o‘tmadi, shuning uchun Pro to‘xtatildi. Uni qayta yoqish uchun to‘lov usulini yangilang.',
      endedOn: 'Pro {date} kuni tugadi.',
      refunded: 'Bu xarid uchun pul qaytarilgan.',
      manageApple: 'App Store’da boshqarish',
      manage: 'Obunani boshqarish',
      manageAppleNote: 'Obunani faqat uni sotib olgan ota-ona o‘z iPhone’ida o‘zgartirishi yoki bekor qilishi mumkin: Sozlamalar → ismingiz → Obunalar.',
      noFamilyTitle: 'Oilangizni ilovada yarating',
      noFamilyBody: 'Hisobingiz hali Safini oilasiga qo‘shilmagan. Oila yaratish yoki ikkinchi ota-onadan olingan taklif kodi bilan qo‘shilish uchun telefoningizda Safini ilovasini oching.',
      childTitle: 'Bu bola hisobi',
      childBody: 'Tarifni ota-ona boshqaradi. Ota-onangizdan o‘z hisobi bilan shu yerda kirishini so‘rang.',
      loadError: 'Hisobingizni yuklab bo‘lmadi.',
      retry: 'Qayta urinish',
      accountTitle: 'Hisob',
      deleteAccount: 'Hisobni o‘chirish',
      terms: 'Foydalanish shartlari',
      privacy: 'Maxfiylik siyosati',
      refund: 'Pulni qaytarish siyosati',
      noscript: 'Safini hisobingizga kirish uchun JavaScript’ni yoqing.'
    }
  };

  var STORES = { apple: 'App Store', paddle: 'Paddle' };
  var UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

  function fmt(template, values) {
    return String(template).replace(/\{(\w+)\}/g, function (match, key) {
      return values && values[key] != null ? String(values[key]) : match;
    });
  }

  function normalizeLang(code) {
    var c = String(code || '').toLowerCase().split(/[-_]/)[0];
    if (LANGS.indexOf(c) !== -1) return c;
    if (c === 'ky' || c === 'kk') return 'ru';
    return '';
  }

  // Same rule as the landing: Russian or English from the browser, Uzbek
  // only when the visitor picked it.
  function pickLang(opts) {
    opts = opts || {};
    var explicit = normalizeLang(opts.query) || normalizeLang(opts.session) || normalizeLang(opts.stored);
    if (explicit) return explicit;
    var list = opts.languages || [];
    for (var i = 0; i < list.length; i++) {
      var c = String(list[i] || '').toLowerCase().split(/[-_]/)[0];
      if (c === 'ru' || c === 'en') return c;
    }
    return 'en';
  }

  function formatDate(iso, lang) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    // Chromium ships no Uzbek month names and prints "2026 M10 26".
    if (lang === 'uz') return d.getDate() + '-' + UZ_MONTHS[d.getMonth()] + ', ' + d.getFullYear();
    try {
      return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    } catch (err) {
      return d.toISOString().slice(0, 10);
    }
  }

  function childrenLabel(count, lang) {
    var s = STRINGS[lang];
    if (!count) return s.childrenNone;
    var rule = 'other';
    try {
      rule = new Intl.PluralRules(lang === 'uz' ? 'uz' : lang).select(count);
    } catch (err) { /* old browser */ }
    return fmt(s.children[rule] || s.children.other, { n: count });
  }

  function periodOf(productId) {
    if (productId === 'pro.monthly') return 'monthly';
    if (productId === 'pro.yearly') return 'yearly';
    return '';
  }

  function describePlan(plan, lang) {
    var s = STRINGS[lang];
    plan = plan || { plan: 'free' };
    var isPro = plan.plan === 'pro';
    var out = { isPro: isPro, title: isPro ? s.planPro : s.planFree, lines: [], warning: '', note: '', manage: null };
    var date = plan.expires_at ? formatDate(plan.expires_at, lang) : '';
    var store = STORES[plan.source] || '';

    if (isPro) {
      if (s.source[plan.source]) out.lines.push(s.source[plan.source]);
      var period = periodOf(plan.product_id);
      if (period) out.lines.push(s.period[period]);
      if (!plan.expires_at) {
        out.lines.push(s.noEnd);
      } else if (plan.is_trial && plan.source !== 'promo') {
        out.lines.push(fmt(plan.will_renew ? s.trialRenews : s.trialEnds, { date: date }));
      } else {
        out.lines.push(fmt(plan.will_renew ? s.renewsOn : s.endsOn, { date: date }));
      }
      if (plan.status === 'in_grace_period') out.warning = fmt(s.graceWarn, { store: store || STORES.apple });
    } else if (plan.status === 'in_billing_retry') {
      out.warning = plan.source === 'apple' ? s.retryWarnApple : s.retryWarn;
    } else if (plan.status === 'revoked') {
      out.note = s.refunded;
    } else if (plan.status === 'expired' && date) {
      out.note = fmt(s.endedOn, { date: date });
    }

    if (plan.manage_url) {
      out.manage = {
        url: plan.manage_url,
        label: plan.source === 'apple' ? s.manageApple : s.manage,
        note: plan.source === 'apple' ? s.manageAppleNote : ''
      };
    }
    return out;
  }

  var api = {
    STRINGS: STRINGS,
    LANGS: LANGS,
    fmt: fmt,
    pickLang: pickLang,
    formatDate: formatDate,
    childrenLabel: childrenLabel,
    describePlan: describePlan
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }
  root.SAFINI_ACCOUNT = api;

  var app = document.getElementById('app');
  var state = { view: 'loading', lang: 'en', email: '', message: '', session: null, me: null, family: null, plan: null, busy: false, resendAt: 0 };
  var client = null;

  function t(key) {
    return STRINGS[state.lang][key];
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k) || attrs[k] == null || attrs[k] === false) continue;
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'on') {
        for (var ev in attrs.on) node.addEventListener(ev, attrs.on[ev]);
      } else if (k === 'className') node.className = attrs[k];
      else node.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function setLang(lang) {
    state.lang = lang;
    try { sessionStorage.setItem(LANG_KEY, lang); } catch (err) { /* private mode */ }
    document.documentElement.lang = lang;
    document.title = t('docTitle');
    var nodes = document.querySelectorAll('[data-t]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute('data-t'));
    var pills = document.querySelectorAll('[data-lang]');
    for (var j = 0; j < pills.length; j++) {
      pills[j].setAttribute('aria-pressed', pills[j].getAttribute('data-lang') === lang ? 'true' : 'false');
    }
    render();
  }

  function redirectUrl() {
    return location.origin + '/account/';
  }

  function show(view, message) {
    state.view = view;
    state.message = message || '';
    state.busy = false;
    render();
  }

  function errorKey(error) {
    var code = (error && (error.code || error.error_code)) || '';
    var msg = String((error && error.message) || '').toLowerCase();
    var status = error && error.status;
    if (code === 'otp_disabled' || msg.indexOf('signups not allowed') !== -1) return 'errNoAccount';
    if (code === 'otp_expired' || msg.indexOf('expired') !== -1 || msg.indexOf('invalid') !== -1) return 'errBadCode';
    if (status === 429 || code.indexOf('rate_limit') !== -1) return 'errRate';
    if (code === 'validation_failed' || code === 'email_address_invalid') return 'errBadEmail';
    return 'errGeneric';
  }

  function sendCode(email) {
    state.email = email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      show(state.view, t('errBadEmail'));
      return;
    }
    state.busy = true;
    render();
    client.auth.signInWithOtp({
      email: email,
      options: { shouldCreateUser: false, emailRedirectTo: redirectUrl() }
    }).then(function (res) {
      if (res.error) {
        show(state.view, t(errorKey(res.error)));
        return;
      }
      state.resendAt = Date.now() + RESEND_SECONDS * 1000;
      show('code');
    }, function () {
      show(state.view, t('errGeneric'));
    });
  }

  function verifyCode(code) {
    state.busy = true;
    render();
    client.auth.verifyOtp({ email: state.email, token: code, type: 'email' }).then(function (res) {
      if (res.error) show('code', t(errorKey(res.error)));
    }, function () {
      show('code', t('errGeneric'));
    });
  }

  function signInWithGoogle() {
    state.busy = true;
    render();
    client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUrl() } }).then(function (res) {
      if (res.error) show('signin', t('errOauth'));
    });
  }

  function signOut(message) {
    client.auth.signOut().then(function () {
      state.me = state.family = state.plan = state.session = null;
      show('signin', message);
    });
  }

  function apiGet(path) {
    return fetch(API_BASE + path, {
      headers: { Authorization: 'Bearer ' + state.session.access_token, Accept: 'application/json' }
    }).then(function (res) {
      if (res.status === 401) throw { auth: true };
      if (!res.ok) throw { status: res.status };
      return res.json();
    });
  }

  function loadAccount() {
    show('loading');
    apiGet('/me').then(function (me) {
      state.me = me;
      if (me.account_type === 'child') return show('child');
      if (me.account_type !== 'parent' || !me.family_id) return show('nofamily');
      return Promise.all([apiGet('/families/current'), apiGet('/families/current/subscription')]).then(function (res) {
        state.family = res[0];
        state.plan = res[1];
        show('account');
      });
    }).catch(function (err) {
      if (err && err.auth) signOut(t('errSession'));
      else show('error');
    });
  }

  function onSession(session) {
    var hadSession = !!state.session;
    state.session = session;
    if (!session) {
      if (hadSession || state.view === 'loading') show('signin', state.view === 'loading' ? state.message : '');
      return;
    }
    if (!hadSession) loadAccount();
  }

  function card(title, children, extra) {
    return el('section', { className: 'account-card' + (extra ? ' ' + extra : '') }, [title ? el('h2', { text: title }) : null].concat(children));
  }

  function message() {
    return state.message ? el('p', { className: 'account-error', role: 'alert', text: state.message }) : null;
  }

  function googleIcon() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 48 48');
    svg.setAttribute('aria-hidden', 'true');
    [
      ['#EA4335', 'M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'],
      ['#4285F4', 'M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'],
      ['#FBBC05', 'M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'],
      ['#34A853', 'M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z']
    ].forEach(function (p) {
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('fill', p[0]);
      path.setAttribute('d', p[1]);
      svg.appendChild(path);
    });
    return svg;
  }

  function viewSignIn() {
    var input = el('input', { id: 'email', type: 'email', name: 'email', autocomplete: 'email', inputmode: 'email', required: true, value: state.email, placeholder: 'you@example.com' });
    var form = el('form', { className: 'account-form', novalidate: true, on: { submit: function (e) { e.preventDefault(); sendCode(input.value.trim()); } } }, [
      el('label', { for: 'email', text: t('emailLabel') }),
      input,
      el('button', { type: 'submit', className: 'btn btn-primary', disabled: state.busy, text: state.busy ? t('sending') : t('sendCode') })
    ]);
    return card(t('signInTitle'), [
      el('p', { className: 'account-lede', text: t(EMAIL_SIGN_IN ? 'signInLede' : 'signInLedeGoogle') }),
      message(),
      el('button', { type: 'button', className: 'btn btn-google', disabled: state.busy, on: { click: signInWithGoogle } }, [googleIcon(), el('span', { text: t('google') })]),
      EMAIL_SIGN_IN ? el('div', { className: 'account-or' }, [el('span', { text: t('or') })]) : null,
      EMAIL_SIGN_IN ? form : null,
      el('p', { className: 'account-meta', text: t('appleSoon') })
    ]);
  }

  function viewCode() {
    var input = el('input', { id: 'code', type: 'text', name: 'code', autocomplete: 'one-time-code', inputmode: 'numeric', pattern: '[0-9]*', maxlength: '10', required: true });
    var wait = state.resendAt - Date.now();
    var resend = el('button', { type: 'button', className: 'link-btn', disabled: wait > 0 || state.busy, on: { click: function () { sendCode(state.email); } }, text: t('resend') });
    if (wait > 0) setTimeout(function () { resend.disabled = false; }, wait);
    var form = el('form', { className: 'account-form', novalidate: true, on: { submit: function (e) { e.preventDefault(); var v = input.value.replace(/\D/g, ''); if (v) verifyCode(v); } } }, [
      el('label', { for: 'code', text: t('codeLabel') }),
      input,
      el('button', { type: 'submit', className: 'btn btn-primary', disabled: state.busy, text: state.busy ? t('verifying') : t('verify') })
    ]);
    var node = card(t('signInTitle'), [
      el('p', { className: 'account-lede', text: fmt(t('codeSentTo'), { email: state.email }) }),
      message(),
      form,
      el('div', { className: 'account-links' }, [
        resend,
        el('button', { type: 'button', className: 'link-btn', on: { click: function () { show('signin'); } }, text: t('otherEmail') })
      ])
    ]);
    setTimeout(function () { input.focus(); }, 0);
    return node;
  }

  function signedInBar() {
    var email = (state.session && state.session.user && state.session.user.email) || '';
    return el('div', { className: 'account-bar' }, [
      el('span', { text: fmt(t('signedInAs'), { email: email }) }),
      el('button', { type: 'button', className: 'link-btn', on: { click: function () { signOut(''); } }, text: t('signOut') })
    ]);
  }

  function viewFamily() {
    var family = state.family || {};
    var parents = (family.parents || []).map(function (p) {
      var name = p.display_name || p.email || '';
      var you = state.me && p.user_id === state.me.user_id;
      return el('li', {}, [name, you ? el('span', { className: 'muted', text: ' (' + t('you') + ')' }) : null]);
    });
    return card(family.name || t('family'), [
      el('p', { className: 'account-label', text: t('parents') }),
      el('ul', { className: 'account-list' }, parents),
      el('p', { className: 'account-meta', text: childrenLabel((family.children || []).length, state.lang) })
    ]);
  }

  function viewPlan() {
    var d = describePlan(state.plan, state.lang);
    var children = [
      el('p', { className: 'plan-name' + (d.isPro ? ' is-pro' : ''), text: d.title }),
      d.lines.length ? el('ul', { className: 'account-list' }, d.lines.map(function (line) { return el('li', { text: line }); })) : null,
      d.warning ? el('p', { className: 'account-warning', role: 'status', text: d.warning }) : null,
      d.note ? el('p', { className: 'account-meta', text: d.note }) : null
    ];
    if (d.manage) {
      children.push(el('a', { className: 'btn btn-primary', href: d.manage.url, target: '_blank', rel: 'noopener', text: d.manage.label }));
      if (d.manage.note) children.push(el('p', { className: 'account-meta', text: d.manage.note }));
    }
    if (!d.isPro) {
      var s = STRINGS[state.lang];
      children.push(
        el('p', { className: 'account-meta', text: s.freeLimits }),
        el('p', { className: 'account-label', text: s.proAdds }),
        el('ul', { className: 'account-list checks' }, s.proFeatures.map(function (f) { return el('li', { text: f }); })),
        el('p', { className: 'account-meta', text: s.proPrice }),
        el('button', { type: 'button', className: 'btn btn-primary', disabled: true, text: s.upgrade }),
        el('p', { className: 'account-meta', text: s.upgradeSoon })
      );
    }
    return card(t('planTitle'), children, d.isPro ? 'is-pro' : '');
  }

  function viewAccountLinks() {
    return card(t('accountTitle'), [
      el('div', { className: 'account-links' }, [
        el('a', { href: '/delete-account', text: t('deleteAccount') }),
        el('a', { href: '/terms-of-service', text: t('terms') }),
        el('a', { href: '/privacy-policy', text: t('privacy') }),
        el('a', { href: '/refund-policy', text: t('refund') })
      ])
    ]);
  }

  function storeBadges() {
    return el('div', { className: 'account-links' }, [
      el('a', { className: 'btn btn-secondary', href: 'https://apps.apple.com/us/app/safini/id6761075183', rel: 'noopener', text: 'App Store' }),
      el('a', { className: 'btn btn-secondary', href: 'https://play.google.com/store/apps/details?id=com.safini.app', rel: 'noopener', text: 'Google Play' })
    ]);
  }

  function render() {
    if (!app) return;
    var nodes = [];
    switch (state.view) {
      case 'signin': nodes = [viewSignIn()]; break;
      case 'code': nodes = [viewCode()]; break;
      case 'loading': nodes = [card('', [el('p', { className: 'account-lede', text: t('loading') })])]; break;
      case 'nofamily': nodes = [signedInBar(), card(t('noFamilyTitle'), [el('p', { className: 'account-lede', text: t('noFamilyBody') }), storeBadges()]), viewAccountLinks()]; break;
      case 'child': nodes = [signedInBar(), card(t('childTitle'), [el('p', { className: 'account-lede', text: t('childBody') })])]; break;
      case 'fatal': nodes = [card('', [el('p', { className: 'account-error', role: 'alert', text: t('errGeneric') })])]; break;
      case 'error': nodes = [signedInBar(), card(t('loadError'), [el('button', { type: 'button', className: 'btn btn-primary', on: { click: loadAccount }, text: t('retry') })])]; break;
      default: nodes = [signedInBar(), viewPlan(), viewFamily(), viewAccountLinks()];
    }
    app.textContent = '';
    nodes.forEach(function (n) { app.appendChild(n); });
  }

  function urlError() {
    var params = new URLSearchParams(location.hash.replace(/^#/, '') + '&' + location.search.replace(/^\?/, ''));
    if (!params.get('error') && !params.get('error_description')) return '';
    history.replaceState(null, '', location.pathname);
    return t('errOauth');
  }

  function boot() {
    var query = new URLSearchParams(location.search).get('lang');
    var session = null;
    try { session = sessionStorage.getItem(LANG_KEY); } catch (err) { /* private mode */ }
    var stored = null;
    try { stored = localStorage.getItem('safini_lang'); } catch (err) { /* private mode */ }
    var languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    state.lang = pickLang({ query: query, session: session, stored: stored, languages: languages });

    var pills = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < pills.length; i++) {
      pills[i].addEventListener('click', function (e) { setLang(e.currentTarget.getAttribute('data-lang')); });
    }
    setLang(state.lang);

    state.message = urlError();
    if (!root.supabase || !root.supabase.createClient) {
      show('fatal');
      return;
    }
    client = root.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true }
    });
    client.auth.onAuthStateChange(function (event, session) {
      // supabase-js asks not to await its own calls inside this callback.
      setTimeout(function () { onSession(session); }, 0);
    });
  }

  boot();
})(typeof window !== 'undefined' ? window : this);
