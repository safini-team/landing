/* Safini invite links: https://safini.fun/join/<child|parent>/<code>.

   A parent shares this link from the app. With Safini installed the phone
   opens the app straight away and never loads this page. Everyone else lands
   here: the page shows the code, sends the phone to its store, and can hand
   over to the app through its own scheme (safini://join/<kind>/<code>).

   The page only displays the invite. It never contacts the API and nothing is
   joined by loading it, so link-preview bots that fetch the URL change nothing. */
(function (root) {
  'use strict';

  var APP_STORE = 'https://apps.apple.com/us/app/safini-parental-control/id6761075183';
  var PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.safini.app';
  var LANG_KEY = 'safini_lang';
  // Same rule as locale.js: Uzbek, Kyrgyz and Kazakh only by an explicit pick.
  var AUTO = { en: true, ru: true, tr: true, es: true, pt: true, de: true, fr: true, id: true, ar: true };

  var STRINGS = {
    en: {
      titleChild: 'Connect this phone to your family on Safini',
      titleParent: 'Join your family on Safini',
      codeLabel: 'Invite code',
      copy: 'Copy code',
      copied: 'Copied',
      get: 'Get Safini',
      step1: 'Install Safini on this phone.',
      step2: 'Then tap the invite link again, or enter this code in the app.',
      haveApp: 'Already have Safini?',
      open: 'Open Safini',
      desktop: 'Open this link on the phone you want to connect.',
      valid: 'The invite is valid for 24 hours.',
      invalidTitle: 'This invite link is not complete',
      invalidBody: 'Ask the person who invited you for a new link.'
    },
    ru: {
      titleChild: 'Подключите этот телефон к семье в Safini',
      titleParent: 'Присоединяйтесь к семье в Safini',
      codeLabel: 'Код приглашения',
      copy: 'Скопировать код',
      copied: 'Скопировано',
      get: 'Скачать Safini',
      step1: 'Установите Safini на этот телефон.',
      step2: 'Затем снова нажмите на ссылку-приглашение или введите этот код в приложении.',
      haveApp: 'Safini уже установлен?',
      open: 'Открыть Safini',
      desktop: 'Откройте эту ссылку на телефоне, который нужно подключить.',
      valid: 'Приглашение действует 24 часа.',
      invalidTitle: 'Ссылка-приглашение неполная',
      invalidBody: 'Попросите новую ссылку у того, кто вас пригласил.'
    },
    uz: {
      titleChild: 'Bu telefonni Safini ilovasida oilangizga ulang',
      titleParent: 'Safini ilovasida oilangizga qoʻshiling',
      codeLabel: 'Taklif kodi',
      copy: 'Koddan nusxa olish',
      copied: 'Nusxa olindi',
      get: 'Safini ilovasini yuklab olish',
      step1: 'Safini ilovasini shu telefonga oʻrnating.',
      step2: 'Soʻng taklif havolasini yana bosing yoki shu kodni ilovaga kiriting.',
      haveApp: 'Safini allaqachon oʻrnatilganmi?',
      open: 'Safini ilovasini ochish',
      desktop: 'Bu havolani ulanadigan telefonda oching.',
      valid: 'Taklif 24 soat amal qiladi.',
      invalidTitle: 'Taklif havolasi toʻliq emas',
      invalidBody: 'Sizni taklif qilgan odamdan yangi havola soʻrang.'
    },
    ky: {
      titleChild: 'Бул телефонду Safini\'де үй-бүлөңүзгө кошуңуз',
      titleParent: 'Safini\'де үй-бүлөңүзгө кошулуңуз',
      codeLabel: 'Чакыруу коду',
      copy: 'Кодду көчүрүү',
      copied: 'Көчүрүлдү',
      get: 'Safini\'ни жүктөп алуу',
      step1: 'Safini\'ни ушул телефонго орнотуңуз.',
      step2: 'Андан кийин чакыруу шилтемесин кайра басыңыз же бул кодду колдонмого жазыңыз.',
      haveApp: 'Safini орнотулганбы?',
      open: 'Safini\'ни ачуу',
      desktop: 'Бул шилтемени кошула турган телефондон ачыңыз.',
      valid: 'Чакыруу 24 саат жарактуу.',
      invalidTitle: 'Чакыруу шилтемеси толук эмес',
      invalidBody: 'Сизди чакырган адамдан жаңы шилтеме сураңыз.'
    },
    kk: {
      titleChild: 'Бұл телефонды Safini-де отбасыңызға қосыңыз',
      titleParent: 'Safini-де отбасыңызға қосылыңыз',
      codeLabel: 'Шақыру коды',
      copy: 'Кодты көшіру',
      copied: 'Көшірілді',
      get: 'Safini-ді жүктеп алу',
      step1: 'Safini-ді осы телефонға орнатыңыз.',
      step2: 'Содан кейін шақыру сілтемесін қайта басыңыз немесе осы кодты қолданбаға енгізіңіз.',
      haveApp: 'Safini орнатылған ба?',
      open: 'Safini-ді ашу',
      desktop: 'Бұл сілтемені қосылатын телефоннан ашыңыз.',
      valid: 'Шақыру 24 сағат жарамды.',
      invalidTitle: 'Шақыру сілтемесі толық емес',
      invalidBody: 'Сізді шақырған адамнан жаңа сілтеме сұраңыз.'
    },
    tr: {
      titleChild: 'Bu telefonu Safini\'de ailene bağla',
      titleParent: 'Safini\'de ailene katıl',
      codeLabel: 'Davet kodu',
      copy: 'Kodu kopyala',
      copied: 'Kopyalandı',
      get: 'Safini\'yi indir',
      step1: 'Safini\'yi bu telefona yükle.',
      step2: 'Sonra davet bağlantısına tekrar dokun ya da bu kodu uygulamaya gir.',
      haveApp: 'Safini zaten yüklü mü?',
      open: 'Safini\'yi aç',
      desktop: 'Bu bağlantıyı bağlamak istediğin telefonda aç.',
      valid: 'Davet 24 saat geçerli.',
      invalidTitle: 'Davet bağlantısı eksik',
      invalidBody: 'Seni davet eden kişiden yeni bir bağlantı iste.'
    },
    es: {
      titleChild: 'Conecta este teléfono a tu familia en Safini',
      titleParent: 'Únete a tu familia en Safini',
      codeLabel: 'Código de invitación',
      copy: 'Copiar código',
      copied: 'Copiado',
      get: 'Descargar Safini',
      step1: 'Instala Safini en este teléfono.',
      step2: 'Luego vuelve a tocar el enlace de invitación o escribe este código en la app.',
      haveApp: '¿Ya tienes Safini?',
      open: 'Abrir Safini',
      desktop: 'Abre este enlace en el teléfono que quieres conectar.',
      valid: 'La invitación vale 24 horas.',
      invalidTitle: 'El enlace de invitación está incompleto',
      invalidBody: 'Pide un enlace nuevo a quien te invitó.'
    },
    pt: {
      titleChild: 'Conecte este celular à sua família no Safini',
      titleParent: 'Entre na sua família no Safini',
      codeLabel: 'Código de convite',
      copy: 'Copiar código',
      copied: 'Copiado',
      get: 'Baixar o Safini',
      step1: 'Instale o Safini neste celular.',
      step2: 'Depois toque no link de convite de novo ou digite este código no app.',
      haveApp: 'Já tem o Safini?',
      open: 'Abrir o Safini',
      desktop: 'Abra este link no celular que você quer conectar.',
      valid: 'O convite vale por 24 horas.',
      invalidTitle: 'O link de convite está incompleto',
      invalidBody: 'Peça um novo link a quem convidou você.'
    },
    de: {
      titleChild: 'Verbinde dieses Handy mit deiner Familie bei Safini',
      titleParent: 'Tritt deiner Familie bei Safini bei',
      codeLabel: 'Einladungscode',
      copy: 'Code kopieren',
      copied: 'Kopiert',
      get: 'Safini laden',
      step1: 'Installiere Safini auf diesem Handy.',
      step2: 'Tippe danach noch einmal auf den Einladungslink oder gib diesen Code in der App ein.',
      haveApp: 'Safini schon installiert?',
      open: 'Safini öffnen',
      desktop: 'Öffne diesen Link auf dem Handy, das du verbinden möchtest.',
      valid: 'Die Einladung gilt 24 Stunden.',
      invalidTitle: 'Der Einladungslink ist unvollständig',
      invalidBody: 'Bitte die Person, die dich eingeladen hat, um einen neuen Link.'
    },
    fr: {
      titleChild: 'Connecte ce téléphone à ta famille sur Safini',
      titleParent: 'Rejoins ta famille sur Safini',
      codeLabel: 'Code d\'invitation',
      copy: 'Copier le code',
      copied: 'Copié',
      get: 'Télécharger Safini',
      step1: 'Installe Safini sur ce téléphone.',
      step2: 'Touche ensuite de nouveau le lien d\'invitation, ou saisis ce code dans l\'app.',
      haveApp: 'Safini est déjà installé ?',
      open: 'Ouvrir Safini',
      desktop: 'Ouvre ce lien sur le téléphone à connecter.',
      valid: 'L\'invitation est valable 24 heures.',
      invalidTitle: 'Le lien d\'invitation est incomplet',
      invalidBody: 'Demande un nouveau lien à la personne qui t\'a invité.'
    },
    id: {
      titleChild: 'Hubungkan ponsel ini ke keluargamu di Safini',
      titleParent: 'Gabung dengan keluargamu di Safini',
      codeLabel: 'Kode undangan',
      copy: 'Salin kode',
      copied: 'Tersalin',
      get: 'Unduh Safini',
      step1: 'Pasang Safini di ponsel ini.',
      step2: 'Lalu ketuk lagi tautan undangan, atau masukkan kode ini di aplikasi.',
      haveApp: 'Sudah punya Safini?',
      open: 'Buka Safini',
      desktop: 'Buka tautan ini di ponsel yang ingin dihubungkan.',
      valid: 'Undangan berlaku 24 jam.',
      invalidTitle: 'Tautan undangan tidak lengkap',
      invalidBody: 'Minta tautan baru kepada orang yang mengundangmu.'
    },
    ar: {
      titleChild: 'اربط هذا الهاتف بعائلتك في Safini',
      titleParent: 'انضم إلى عائلتك في Safini',
      codeLabel: 'رمز الدعوة',
      copy: 'نسخ الرمز',
      copied: 'تم النسخ',
      get: 'تنزيل Safini',
      step1: 'ثبّت Safini على هذا الهاتف.',
      step2: 'ثم اضغط على رابط الدعوة مرة أخرى، أو أدخل هذا الرمز في التطبيق.',
      haveApp: 'هل Safini مثبّت بالفعل؟',
      open: 'فتح Safini',
      desktop: 'افتح هذا الرابط على الهاتف الذي تريد ربطه.',
      valid: 'الدعوة صالحة لمدة 24 ساعة.',
      invalidTitle: 'رابط الدعوة غير مكتمل',
      invalidBody: 'اطلب رابطًا جديدًا ممن دعاك.'
    }
  };

  /* `/join/<child|parent>/<4 letters or digits>` and nothing else, the same
     rule the app applies. Anything else is not an invite. */
  function parseInvite(pathname) {
    var parts = String(pathname || '').split('/').filter(function (p) { return p !== ''; });
    if (parts.length !== 3 || parts[0] !== 'join') return null;
    if (parts[1] !== 'child' && parts[1] !== 'parent') return null;
    if (!/^[A-Za-z0-9]{4}$/.test(parts[2])) return null;
    return { kind: parts[1], code: parts[2].toUpperCase() };
  }

  function platformOf(userAgent, maxTouchPoints) {
    var ua = String(userAgent || '');
    if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'desktop';
  }

  /* The app's own scheme, for a phone that has Safini but opened the link in
     a browser (a messenger's in-app browser, for one). */
  function appUrl(invite) {
    return 'safini://join/' + invite.kind + '/' + invite.code;
  }

  /* Google Play hands the referrer to the app on first launch, which is how
     the invite can outlive the install there. The App Store passes nothing. */
  function storeUrl(platform, invite) {
    if (platform === 'ios') return APP_STORE;
    if (!invite) return PLAY_STORE;
    return PLAY_STORE + '&referrer=' +
      encodeURIComponent('invite=' + invite.kind + ':' + invite.code);
  }

  function pickLang(stored, languages) {
    if (stored && STRINGS[stored]) return stored;
    var list = languages || [];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i] || '').toLowerCase().split(/[-_]/)[0];
      if (AUTO[code] && STRINGS[code]) return code;
    }
    return 'en';
  }

  function boot() {
    var doc = root.document;
    var nav = root.navigator || {};
    var stored = null;
    try { stored = root.localStorage.getItem(LANG_KEY); } catch (err) { /* private mode */ }
    var lang = pickLang(stored, nav.languages || [nav.language]);
    var s = STRINGS[lang];
    var invite = parseInvite(root.location.pathname);
    var platform = platformOf(nav.userAgent, nav.maxTouchPoints);

    function el(id) { return doc.getElementById(id); }
    function show(id, visible) { el(id).hidden = !visible; }

    doc.documentElement.lang = lang;
    doc.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    el('join-get-ios').textContent = s.get + ' · App Store';
    el('join-get-android').textContent = s.get + ' · Google Play';
    el('join-get-ios').href = storeUrl('ios', invite);
    el('join-get-android').href = storeUrl('android', invite);
    show('join-get-ios', platform !== 'android');
    show('join-get-android', platform !== 'ios');

    if (!invite) {
      el('join-title').textContent = s.invalidTitle;
      el('join-note').textContent = s.invalidBody;
      show('join-invite', false);
      show('join-steps', false);
      show('join-open-block', false);
      return;
    }

    el('join-title').textContent = invite.kind === 'child' ? s.titleChild : s.titleParent;
    el('join-code-label').textContent = s.codeLabel;
    el('join-code').textContent = invite.code;
    el('join-step1').textContent = s.step1;
    el('join-step2').textContent = s.step2;
    el('join-note').textContent = platform === 'desktop' ? s.desktop : s.valid;
    el('join-have').textContent = s.haveApp;
    el('join-open').textContent = s.open;
    el('join-open').href = appUrl(invite);
    // No app to open on a computer.
    show('join-open-block', platform !== 'desktop');

    var copy = el('join-copy');
    copy.textContent = s.copy;
    copy.addEventListener('click', function () {
      var done = function () {
        copy.textContent = s.copied;
        root.setTimeout(function () { copy.textContent = s.copy; }, 1600);
      };
      if (nav.clipboard && nav.clipboard.writeText) {
        nav.clipboard.writeText(invite.code).then(done, function () {});
      }
    });
    show('join-copy', !!(nav.clipboard && nav.clipboard.writeText));
  }

  var api = {
    STRINGS: STRINGS,
    parseInvite: parseInvite,
    platformOf: platformOf,
    appUrl: appUrl,
    storeUrl: storeUrl,
    pickLang: pickLang
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.SAFINI_JOIN = api;
    boot();
  }
})(typeof window !== 'undefined' ? window : this);
