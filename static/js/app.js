/* =========================================================
   #_4root news — JS replicado de 4root.com.br + academy
   (navbar, partículas, typewriter, bolha de status,
    cursor cyber, toasts, scroll preciso, stagger)
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==============================================
     0. TOASTS (avisos de problema em tempo real)
     showToast(mensagem, 'ok'|'warn'|'fail', duracaoMs)
     ============================================== */
  var toastBox = document.getElementById('toasts');

  function showToast(msg, type, ms) {
    if (!toastBox) return;
    type = type || 'warn';
    var t = document.createElement('div');
    t.className = 'toast toast-' + type;
    var icon = type === 'ok'
      ? '<path d="M20 6 9 17l-5-5"/>'
      : (type === 'fail'
        ? '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>'
        : '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v4"/>');
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + icon + '</svg><span>' + String(msg).replace(/[<>&]/g, function (c) {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
      }) + '</span>';
    toastBox.appendChild(t);
    // força reflow para animar a entrada
    void t.offsetWidth;
    t.classList.add('in');
    var life = typeof ms === 'number' ? ms : 7000;
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { t.remove(); }, 420);
    }, life);
  }
  window.showToast = showToast;

  /* ==============================================
     0.1 CURSOR CYBER (efeito oficial 4root.com.br)
     ============================================== */
  (function cursor() {
    var cur = document.getElementById('cyber-cursor');
    if (!cur || reduced) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    var inactivityTimer;

    document.addEventListener('mousemove', function (e) {
      cur.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
      cur.classList.remove('inactive', 'hidden');
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(function () {
        cur.classList.add('inactive');
      }, 2000);
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', function () {
      cur.classList.add('hidden');
    });
    document.documentElement.addEventListener('mouseenter', function () {
      cur.classList.remove('hidden');
    });
    window.addEventListener('blur', function () { cur.classList.add('hidden'); });
    window.addEventListener('focus', function () { cur.classList.remove('hidden'); });

    function triggerRandomGlitch() {
      cur.classList.add('glitch-active');
      setTimeout(function () { cur.classList.remove('glitch-active'); }, 250);
      var randomTime = Math.random() * 2000 + 1000;
      setTimeout(triggerRandomGlitch, randomTime);
    }
    triggerRandomGlitch();
  })();

  /* ==============================================
     0.2 SCROLL EXATO (ler noticias -> #news-wide / .section-wide)
     Compensa a navbar fixa e corrige drift de layout
     (imagens lazy carregando durante o scroll suave).
     ============================================== */
  (function preciseScroll() {
    function scrollToSection(sel) {
      var target = document.querySelector(sel);
      /* fallback: sem artigos ainda o #news-wide nao existe -> vai para #noticias */
      if (!target && sel === '#news-wide') target = document.querySelector('#noticias');
      if (!target) return;
      var navH = (navbar && navbar.offsetHeight) || 76;
      var compute = function () {
        return Math.max(0, target.getBoundingClientRect().top
          + window.pageYOffset - navH - 14);
      };
      window.scrollTo({ top: compute(), behavior: reduced ? 'auto' : 'smooth' });
      /* correcao de drift: quando o scroll para, reajusta se o layout
         mudou no caminho (imagens/covers carregando) */
      var last = -1, stable = 0, ticks = 0;
      var timer = setInterval(function () {
        ticks++;
        var y = window.pageYOffset;
        if (Math.abs(y - last) < 2) stable++; else stable = 0;
        last = y;
        if ((stable >= 2 || ticks > 25) && ticks >= 6) {
          var exact = compute();
          if (Math.abs(window.pageYOffset - exact) > 4) {
            window.scrollTo({ top: exact, behavior: 'auto' });
          }
          clearInterval(timer);
        }
      }, 100);
    }
    document.querySelectorAll('[data-scroll]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        scrollToSection(el.getAttribute('data-scroll'));
      });
    });
  })();

  /* ==============================================
     0.3 STAGGER DOS CARDS (entrada em cascata, academy)
     ============================================== */
  (function stagger() {
    document.querySelectorAll('.news-grid .animate-on-scroll, .courses-grid .animate-on-scroll')
      .forEach(function (card, i) {
        card.style.transitionDelay = ((i % 8) * 70) + 'ms';
      });
  })();


  /* ==============================================
     1. NAVBAR: scroll background (oficial)
     ============================================== */
  var navbar = document.getElementById('navbar');
  var lastY = 0;

  function updateNav() {
    if (!navbar) return;
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    /* some ao rolar para baixo, volta ao rolar para cima */
    var diff = window.scrollY - lastY;
    if (window.scrollY > 320 && diff > 4) {
      navbar.classList.add('nav-hidden');
    } else if (diff < -4 || window.scrollY < 320) {
      navbar.classList.remove('nav-hidden');
    }
    lastY = window.scrollY;
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ==============================================
     2. MOBILE MENU (oficial)
     ============================================== */
  var mobileBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ==============================================
     3. SCROLL PROGRESS
     ============================================== */
  var progress = document.getElementById('scroll-progress');
  function updateProgress() {
    if (!progress) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0) progress.style.width = Math.min(100, (window.scrollY / max) * 100) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ==============================================
     4. ANIMATE ON SCROLL
     ============================================== */
  (function animOnScroll() {
    var items = document.querySelectorAll('.animate-on-scroll');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduced) {
      items.forEach(function (i) { i.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (i) { io.observe(i); });
  })();

  /* ==============================================
     5. TYPEWRITER (frases do news)
     ============================================== */
  (function typewriter() {
    var el = document.getElementById('typewriter');
    if (!el) return;
    var phrases = [
      'root@4root:~$ news --collect --parallel',
      'root@4root:~$ briefing --sem-ia --fonte-original',
      'root@4root:~$ feeds --rank --dedupe',
      'root@4root:~$ collect --24h --sem-ia',
      'root@4root:~$ news --fonte --link-original',
      'root@4root:~$ workflow --run --export-pdf'
    ];
    var phraseIdx = 0, charIdx = 0, isDeleting = false, typeSpeed = 80;
    function typewrite() {
      var current = phrases[phraseIdx];
      if (isDeleting) {
        el.textContent = current.substring(0, charIdx - 1) || '\u00A0';
        charIdx--;
        typeSpeed = 40;
      } else {
        el.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        typeSpeed = 80;
      }
      if (!isDeleting && charIdx === current.length) { typeSpeed = 2000; isDeleting = true; }
      else if (isDeleting && charIdx === 0) { isDeleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; typeSpeed = 500; }
      setTimeout(typewrite, typeSpeed);
    }
    typewrite();
  })();

  /* ==============================================
     6. ANO DO FOOTER
     ============================================== */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ==============================================
     7. BOLHA DE STATUS DOS FEEDS
     (blob liquido + fisica do RootBot 4root.com.br)
     ============================================== */
  (function statusBot() {
    var dot = document.getElementById('bot-dot');
    var goo = document.getElementById('bot-goo');
    var panel = document.getElementById('bot-panel');
    var tipEl = document.getElementById('bot-tip');
    if (!dot || !panel || !goo) return;

    var blob = goo.querySelector('.bot-blob');
    var trail = goo.querySelector('.bot-trail');
    var closeBtn = document.getElementById('bot-close');

    var isMobile = function () { return window.innerWidth <= 620; };
    var open = false;
    var P = { x: 0, y: 0, tx: 0, ty: 0, px: 0, py: 0, ex: 0, ey: 0, svx: 0, svy: 0, squash: 0, enter: 0, enterT: 0, hover: 0, hoverT: 0, dragging: false, side: 'right', vw: 1, vh: 1 };
    var M = 26;
    var clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
    var edgeX = function (side) { return side === 'left' ? M : P.vw - M; };

    function restoreDock() {
      P.vw = Math.max(1, window.innerWidth);
      var vv = window.visualViewport;
      var vh = vv ? vv.height : window.innerHeight;
      var offTop = vv ? vv.offsetTop : 0;
      P.vh = Math.max(1, vh);
      P.side = 'right';
      var yr = 0.72;
      try {
        var raw = localStorage.getItem('r4_news_bot_dock_v1');
        if (raw) {
          var j = JSON.parse(raw);
          if (j && (j.side === 'left' || j.side === 'right')) P.side = j.side;
          if (j && typeof j.yr === 'number') yr = clamp(j.yr, 0.08, 0.92);
        }
      } catch (e) { }
      P.x = P.tx = edgeX(P.side);
      P.y = P.ty = clamp(vh * yr + offTop, M, vh + offTop - M);
      P.px = P.x; P.py = P.y; P.ex = P.x; P.ey = P.y;
    }
    function saveDock() {
      try { localStorage.setItem('r4_news_bot_dock_v1', JSON.stringify({ side: P.side, yr: +(P.y / Math.max(1, P.vh)).toFixed(3) })); } catch (e) { }
    }
    function dock() {
      P.side = P.x < P.vw / 2 ? 'left' : 'right';
      P.tx = edgeX(P.side);
      P.ty = clamp(P.y, M, P.vh - M);
      saveDock();
    }

    /* loop fisico: squash & stretch + trail elastico (oficial) */
    function loop() {
      if (document.hidden) { requestAnimationFrame(loop); return; }
      P.enter += (P.enterT - P.enter) * 0.11;
      if (P.enter < 0.001 && P.enterT === 0) P.enter = 0;
      var gOp = P.enter < 0.01 ? 0 : Math.min(1, P.enter * 1.25);
      if (goo.classList.contains('inactive')) {
        if (P._go !== 0.5) { P._go = 0.5; goo.style.opacity = 0.5; goo.style.visibility = 'visible'; }
      } else if (gOp !== P._go) {
        P._go = gOp; goo.style.opacity = gOp; goo.style.visibility = gOp === 0 ? 'hidden' : 'visible';
      }
      P.hover += (P.hoverT - P.hover) * 0.15;
      if (!P.dragging) { P.x += (P.tx - P.x) * 0.16; P.y += (P.ty - P.y) * 0.16; }
      var dx = P.x - P.px, dy = P.y - P.py;
      P.px = P.x; P.py = P.y;
      P.svx += (dx - P.svx) * 0.28;
      P.svy += (dy - P.svy) * 0.28;
      if (!P.dragging) {
        var dxE = P.tx - P.x;
        if (Math.abs(dxE) < 2 && Math.abs(P.svx) > 3 && P.squash < 0.2) P.squash = 1;
      }
      P.squash *= 0.86;
      P.ex += (P.x - P.ex) * 0.22;
      P.ey += (P.y - P.ey) * 0.22;
      var tdx = P.ex - P.x, tdy = P.ey - P.y;
      var tlen0 = Math.hypot(tdx, tdy);
      if (tlen0 > 170) { tdx *= 170 / tlen0; tdy *= 170 / tlen0; P.ex = P.x + tdx; P.ey = P.y + tdy; }
      var tlen = Math.hypot(P.ex - P.x, P.ey - P.y);
      var es = P.enter * (1 + P.hover * 0.12);
      var sp = Math.hypot(P.svx, P.svy);
      var st = Math.min(sp * 0.045, 0.85);
      var settled = sp < 0.01 && !P.dragging && P.squash < 0.01 && Math.abs(P.tx - P.x) < 0.5 && Math.abs(P.ty - P.y) < 0.5;
      var sx = (1 + st) * es * (1 - P.squash * 0.3);
      var sy = Math.max(0.35, 1 - st * 0.6) * es * (1 + P.squash * 0.38);
      var bT = settled
        ? 'rotate(0rad) scale(' + es.toFixed(3) + ',' + Math.max(0.35, es).toFixed(3) + ')'
        : 'rotate(' + Math.atan2(P.svy, P.svx).toFixed(3) + 'rad) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
      if (blob && bT !== P._bt) { P._bt = bT; blob.style.transform = bT; }
      var tst = Math.min(tlen * 0.02, 0.9);
      var tsx = (1 + tst) * P.enter;
      var tsy = Math.max(0.3, 1 - tst * 0.55) * P.enter;
      var tT = settled
        ? 'scale(' + P.enter.toFixed(3) + ',' + P.enter.toFixed(3) + ')'
        : 'translate(' + tdx.toFixed(1) + 'px,' + tdy.toFixed(1) + 'px) rotate(' + Math.atan2(tdy, tdx).toFixed(3) + 'rad) scale(' + tsx.toFixed(3) + ',' + tsy.toFixed(3) + ')';
      if (trail && tT !== P._tt) { P._tt = tT; trail.style.transform = tT; }
      var gT = 'translate(' + (P.x - 240).toFixed(1) + 'px,' + (P.y - 240).toFixed(1) + 'px)';
      if (gT !== P._gt) { P._gt = gT; goo.style.transform = gT; }
      var dT = 'translate(' + P.x.toFixed(1) + 'px,' + P.y.toFixed(1) + 'px)';
      if (dT !== P._dt) { P._dt = dT; dot.style.transform = dT; }
      if (tipEl && tipEl.classList.contains('bot-tip-in')) placeTip();
      requestAnimationFrame(loop);
    }

    function placePanel() {
      if (window.innerWidth <= 620) return;
      var h = panel.offsetHeight || 560;
      var half = h / 2 + 14;
      panel.style.top = clamp(P.y, half, Math.max(half, P.vh - half)).toFixed(0) + 'px';
    }
    function openPanel() {
      if (open) return;
      open = true; P.enterT = 0;
      panel.classList.toggle('side-left', P.side === 'left');
      placePanel();
      panel.classList.add('bot-open');
      panel.setAttribute('aria-hidden', 'false');
      dot.classList.add('is-open');
      dot.style.pointerEvents = 'none';
      goo.classList.add('bot-goo-hidden');
      if (tipEl) tipEl.classList.remove('bot-tip-in');
      try { localStorage.setItem('r4_news_bot_tip_v1', '1'); } catch (e) { }
    }
    function closePanel() {
      if (!open) return;
      open = false; P.enterT = 1;
      panel.classList.remove('bot-open');
      panel.setAttribute('aria-hidden', 'true');
      dot.classList.remove('is-open');
      dot.style.pointerEvents = 'auto';
      goo.classList.remove('bot-goo-hidden');
    }
    function togglePanel() { if (open) closePanel(); else openPanel(); }

    /* arrastar / tocar */
    var drag = { offX: 0, offY: 0, moved: 0, id: null };
    function onDown(e) {
      if (open || P.dragging) return;
      P.dragging = true; drag.moved = 0; drag.id = e.pointerId;
      drag.offX = e.clientX - P.x; drag.offY = e.clientY - P.y;
      try { dot.setPointerCapture(e.pointerId); } catch (err) { }
      e.preventDefault();
    }
    function onMove(e) {
      if (!P.dragging || e.pointerId !== drag.id) return;
      var nx = clamp(e.clientX - drag.offX, M, P.vw - M);
      var ny = clamp(e.clientY - drag.offY, M, P.vh - M);
      drag.moved += Math.abs(nx - P.x) + Math.abs(ny - P.y);
      P.x = P.tx = nx; P.y = P.ty = ny;
      e.preventDefault();
    }
    function onUp(e) {
      if (!P.dragging || e.pointerId !== drag.id) return;
      P.dragging = false; drag.id = null;
      if (drag.moved < 8) togglePanel();
      else dock();
    }
    dot.addEventListener('pointerdown', onDown);
    dot.addEventListener('pointermove', onMove);
    dot.addEventListener('pointerup', onUp);
    dot.addEventListener('pointercancel', onUp);
    dot.addEventListener('mouseenter', function () { P.hoverT = 1; });
    dot.addEventListener('mouseleave', function () { P.hoverT = 0; });
    dot.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    closeBtn && closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) closePanel();
    });
    document.addEventListener('pointerdown', function (e) {
      if (open && !panel.contains(e.target) && !dot.contains(e.target)) closePanel();
    }, true);

    window.addEventListener('resize', function () {
      P.vw = Math.max(1, window.innerWidth);
      var vv = window.visualViewport;
      P.vh = Math.max(1, vv ? vv.height : window.innerHeight);
      P.tx = edgeX(P.side);
      P.ty = clamp(P.ty, M, P.vh - M);
      P.y = clamp(P.y, M, P.vh - M);
      P.x = clamp(P.x, M, P.vw - M);
      if (open) placePanel();
    }, { passive: true });

    /* tip aparece 1x */
    function placeTip() {
      if (!tipEl) return;
      tipEl.style.top = P.y + 'px';
      tipEl.style.transform = 'translateY(-50%)';
      if (P.side === 'right') { tipEl.style.right = (P.vw - P.x + 42) + 'px'; tipEl.style.left = 'auto'; }
      else { tipEl.style.left = (P.x + 42) + 'px'; tipEl.style.right = 'auto'; }
    }
    try {
      if (!localStorage.getItem('r4_news_bot_tip_v1')) {
        setTimeout(function () {
          if (!open && tipEl) { placeTip(); tipEl.classList.add('bot-tip-in'); }
          setTimeout(function () { tipEl && tipEl.classList.remove('bot-tip-in'); }, 6500);
        }, 2600);
      }
    } catch (e) { }

    /* inatividade: blob 50% apos 3s parado */
    var resetActivity = function () {
      if (dot && !open && !P.dragging) dot.classList.remove('inactive');
      if (goo && !open && !P.dragging) goo.classList.remove('inactive');
    };
    document.addEventListener('mousemove', resetActivity, { passive: true });
    document.addEventListener('touchstart', resetActivity, { passive: true });
    document.addEventListener('keydown', resetActivity, { passive: true });
    document.addEventListener('scroll', resetActivity, { passive: true });
    setInterval(function () {
      if (open || P.dragging) return;
      if (Date.now() - (resetActivity._t || 0) > 3000) {
        dot.classList.add('inactive');
        goo.classList.add('inactive');
      }
    }, 1200);
    ['mousemove', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) {
      document.addEventListener(ev, function () { resetActivity._t = Date.now(); }, { passive: true });
    });

    restoreDock();
    /* entra com elastic ramp depois do load (oficial) */
    setTimeout(function () { P.enterT = 1; document.documentElement.classList.add('bot-in'); }, reduced ? 0 : 900);
    requestAnimationFrame(loop);
  })();

  /* ==============================================
     8. DADOS DO CICLO (API /data/news.json) + ACAO UNICA
     O frontend e estatico (GitHub Pages): busca os dados
     na API do Replit (window.NEWS_API_BASE) ou na mesma
     origem (Flask local) e renderiza tudo. O botao
     "executar workflow" dispara POST /collect na API,
     com cooldown de 1h contado da ULTIMA coleta.
     ============================================== */
  var API = String(window.NEWS_API_BASE || '').replace(/\/+$/, '');
  var NEWS = { data: null };

  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function _artDate(p) {
    /* published ISO -> dd/mm/aaaa hh:mm (igual ao Jinja original) */
    p = String(p || '');
    var d = _esc(p.slice(8, 10) + '/' + p.slice(5, 7) + '/' + p.slice(0, 4));
    var hh = p.slice(11, 16);
    return hh ? d + ' ' + _esc(hh) : d;
  }

  function _pdfHref(file) {
    return file ? API + '/export/' + encodeURIComponent(file) : '#noticias';
  }

  function renderStats(d) {
    var set = function (id, v) {
      var el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    set('stat-articles', d.total_articles || 0);
    set('stat-sources', d.feed_total || 0);
    set('stat-window', (d.window_hours || 24) + 'h');
    set('stat-cycles', (d.sessions || []).length);
  }

  function renderSched(d) {
    var dot = document.getElementById('sched-dot');
    var txt = document.getElementById('sched-text');
    var foot = document.getElementById('footer-sched');
    var s = d.scheduler || {};
    var iv = s.interval_hours != null ? String(s.interval_hours).replace('.0', '') : '3';
    if (dot) dot.classList.toggle('on', s.status === 'ativa');
    if (txt) {
      if (s.status === 'ativa') {
        txt.innerHTML = 'Coleta autom&aacute;tica: <b class="neon-text">ativa</b> &mdash; ciclo a cada '
          + _esc(iv) + 'h'
          + (s.next_run ? ' &middot; pr&oacute;ximo ' + _esc(s.next_run) : '');
      } else {
        txt.innerHTML = 'Coleta autom&aacute;tica: <b>desativada</b>';
      }
    }
    if (foot) foot.textContent = (s.status === 'ativa' ? 'ativa (' + iv + 'h)' : (s.status || '-'));
  }

  function renderExport(d) {
    var btn = document.getElementById('btn-export');
    var name = document.getElementById('pdf-name');
    var wrap = document.getElementById('sessions-wrap');
    var list = document.getElementById('sessions-list');
    if (btn) btn.href = _pdfHref(d.pdf_file);
    if (name) name.textContent = d.pdf_name || 'PDF disponivel apos o proximo ciclo';
    var sessions = (d.sessions || []).slice(0, 8);
    if (wrap) wrap.hidden = !sessions.length;
    if (list) {
      list.innerHTML = sessions.map(function (s) {
        return '<a href="' + _pdfHref(s.pdf_file) + '" class="session-chip" '
          + 'title="Baixar PDF do ciclo ' + _esc(s.when) + ' (' + _esc(s.total) + ' not&iacute;cias)">'
          + '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>'
          + '<span class="chip-when">' + _esc(s.when) + '</span>'
          + '<span class="chip-total">' + _esc(s.total) + '</span></a>';
      }).join('');
    }
  }

  function renderCards(d) {
    var area = document.getElementById('news-area');
    var empty = document.getElementById('empty-state');
    if (!area) return;
    var arts = d.articles || [];
    if (!arts.length) {
      if (empty) empty.hidden = false;
      return;
    }
    var rows = [];
    arts.forEach(function (art, i) {
      var cover = (i % 5) + 1;
      var sum = String(art.summary || '');
      var desc = _esc(sum.slice(0, 220)) + (sum.length > 220 ? '...' : '');
      rows.push(
        '<a class="course-card news-card animate-on-scroll" href="' + _esc(art.link) + '" target="_blank" rel="noopener">',
        '<div class="card-arrow"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg></div>',
        '<div class="course-cover">',
        '<img class="cover-img" src="' + _esc(art.image || '') + '" alt="' + _esc(art.title) + '" loading="lazy" onerror="this.onerror=null;this.src=\'static/img/covers/c' + cover + '.svg\';">',
        '<span class="cover-shade"></span>',
        '<span class="cover-badge">' + _esc(art.source) + '</span></div>',
        '<div class="course-body">',
        '<span class="course-name">' + _esc(art.title) + '</span>',
        '<p class="course-desc">' + desc + '</p>',
        '<div class="course-meta">',
        '<span class="cm"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> ' + _artDate(art.published) + '</span>',
        '<span class="cm">' + _esc(art.type) + '</span>',
        '</div></div></a>'
      );
    });
    area.innerHTML = '<div class="section-wide" id="news-wide"><div class="courses-grid news-grid">'
      + rows.join('') + '</div></div>';

    /* entrada em cascata: o observer da secao 4 roda antes dos cards
       existirem, entao os cards recebem observacao proprio aqui */
    var cards = area.querySelectorAll('.animate-on-scroll');
    cards.forEach(function (card, i) {
      card.style.transitionDelay = ((i % 8) * 70) + 'ms';
    });
    if (reduced || !('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    cards.forEach(function (c) { io.observe(c); });
  }

  function renderBubble(d) {
    var msgs = document.getElementById('bot-msgs');
    if (msgs) {
      if (!(d.feed_status || []).length) {
        msgs.innerHTML = '<div class="bot-empty">Nenhum ciclo de coleta executado ainda.<br>Clique em <b class="neon-text">executar workflow</b> no topo.</div>';
      } else {
        msgs.innerHTML = d.feed_status.map(function (fs) {
          var cls = fs.status === 'ok' ? 'ok' : 'error';
          return '<div class="feed-row ' + cls + '"><span class="feed-dot"></span>'
            + '<span class="feed-name">' + _esc(fs.name) + '</span>'
            + '<span class="feed-count">' + _esc(fs.articles || 0) + '</span></div>';
        }).join('');
      }
    }
    var sum = document.getElementById('bot-summary');
    if (sum) sum.textContent = d.feed_summary || '';
    var ok = document.getElementById('chip-ok');
    var er = document.getElementById('chip-err');
    var tt = document.getElementById('chip-total');
    if (ok) ok.textContent = (d.feed_ok || 0) + ' fontes com dados';
    if (er) er.textContent = (d.feed_err || 0) + ' com erro';
    if (tt) tt.textContent = (d.feed_total || 0) + ' monitoradas';
  }

  /* ACAO UNICA: dispara POST /collect na API (Replit ou mesma origem).
     Cooldown de 1h contado da ULTIMA coleta de qualquer origem. */
  var COLLECT_BTN_HTML = null;   /* label original do botao do hero */
  var _collectTimer = null;

  function _fmtWait(s) {
    s = Math.max(0, Math.round(s));
    if (s >= 5400) return Math.ceil(s / 3600) + 'h';
    if (s >= 90) return Math.round(s / 60) + ' min';
    return s + 's';
  }

  /* Se a ultima coleta foi ha menos de 1h, o botao entra em contagem
     regressiva (desabilitado) ate liberar. JSON traz o saldo do servidor. */
  function armCollectCountdown(readyIn) {
    var btn = document.getElementById('btn-workflow');
    if (!btn) return;
    if (!COLLECT_BTN_HTML) COLLECT_BTN_HTML = btn.innerHTML;
    if (_collectTimer) { clearInterval(_collectTimer); _collectTimer = null; }
    if (!(readyIn > 0)) {
      btn.disabled = false;
      btn.innerHTML = COLLECT_BTN_HTML;
      return;
    }
    var left = readyIn;
    var paint = function () {
      btn.disabled = left > 0;
      btn.innerHTML = left > 0
        ? 'ultima coleta ha pouco &mdash; libera em ' + _fmtWait(left)
        : COLLECT_BTN_HTML;
      if (left <= 0) {
        if (_collectTimer) { clearInterval(_collectTimer); _collectTimer = null; }
        return;
      }
      left -= 30;
    };
    paint();
    if (left > 0) _collectTimer = setInterval(paint, 30000);
  }

  window.runWorkflow = async function () {
    var panel = document.getElementById('workflow-panel');
    var log = document.getElementById('workflow-log');
    var btn = document.getElementById('btn-workflow');
    if (!panel || !btn) return;

    panel.style.display = 'block'; log.innerHTML = '';
    btn.disabled = true;
    const original = COLLECT_BTN_HTML || btn.innerHTML;
    btn.innerHTML = 'executando...';
    panel.scrollIntoView({behavior:'smooth', block:'center'});

    for (let i = 1; i <= 3; i++) {
      const el = document.getElementById(`ws-0${i}`);
      if (el) el.className = 'wstep pending';
    }

    try {
      const r = await fetch(API + '/collect', {method: 'POST'});
      let d2 = null;
      try { d2 = await r.json(); } catch (_) {}

      // ---- COOLDOWN (429): so 1 coleta por hora (qualquer origem) ----
      if (r.status === 429 || (d2 && d2.rate_limited)) {
        const wait = (d2 && d2.retry_after) || 3600;
        log.innerHTML = `<span class="ws-badge fail">COOLDOWN</span> ${d2 ? d2.message : 'aguarde'}`;
        showToast(`Última coleta há menos de 1h — o botão libera em ${_fmtWait(wait)}.`, 'warn', 9000);
        for (let i = 1; i <= 3; i++) {
          const el = document.getElementById(`ws-0${i}`);
          if (el) el.className = 'wstep';
        }
        btn.disabled = false; btn.innerHTML = original;
        armCollectCountdown(wait);
        return;
      }

      (d2.step_results || []).forEach(s => {
        const el = document.getElementById(`ws-${s.step}`);
        if (el) {
          el.className = 'wstep ' + (s.status === 'SUCCESS' ? 'done' : 'error');
          el.innerHTML += ` <small>(${s.elapsed_seconds}s)</small>`;
        }
      });

      if (d2.success) {
        log.innerHTML = `<span class="ws-badge ok">SUCESSO</span> ${d2.total_articles} artigos &middot; PDF pronto. Recarregando...`;
        showToast(`Ciclo concluido: ${d2.total_articles} artigos — PDF do ciclo pronto!`, 'ok', 6000);
        (d2.feed_errors || []).forEach((fe, i) => {
          setTimeout(() => showToast(`Fonte com erro: ${fe.name} (${fe.message || 'falhou'})`, 'fail', 9000), 400 + i * 350);
        });
        setTimeout(() => location.reload(), 2600);
      } else {
        log.innerHTML = `<span class="ws-badge fail">ERRO</span> ${d2.message || 'Desconhecido'}`;
        (d2.errors||[]).forEach(e => { log.innerHTML += `<br><small>${e}</small>`; });
        showToast(`Falha no ciclo: ${d2.message || 'erro desconhecido'}`, 'fail', 9000);
        (d2.errors || []).forEach((e, i) => {
          setTimeout(() => showToast(`${String(e).slice(0, 140)}`, 'fail', 9000), 400 + i * 350);
        });
      }
    } catch(e) {
      log.innerHTML = `<span class="ws-badge fail">ERRO DE CONEXAO</span> ${e.message}`;
      showToast(`Sem resposta da API (${API || 'mesma origem'}) — verifique se o app do News está no ar.`, 'fail', 9000);
    }
    btn.disabled = false; btn.innerHTML = original;
  };

  (function loadData() {
    fetch(API + '/data/news.json', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
        NEWS.data = d;
        window.__NEWS_DATA = d;
        /* a API manda a propria base: no Pages o JSON volta com
           api_base preenchido e PDFs/botao apontam para o Replit */
        if (d.api_base) API = String(d.api_base).replace(/\/+$/, '');
        var ld = document.getElementById('label-date');
        if (ld) ld.textContent = d.date_full || '';
        renderStats(d);
        renderSched(d);
        renderExport(d);
        renderBubble(d);
        renderCards(d);
        armCollectCountdown(d.collect_ready_in_seconds || 0);
      })
      .catch(function (err) {
        var empty = document.getElementById('empty-state');
        if (empty) {
          empty.hidden = false;
         var p2 = empty.querySelector('p:last-child');
          if (p2) p2.innerHTML = 'N&atilde;o consegui carregar <b class="font-mono">'
            + _esc(API + '/data/news.json') + '</b> (' + _esc(err.message)
            + '). Verifique se a API do News (Replit) est&aacute; no ar e se '
            + '<b class="font-mono">NEWS_API_BASE</b> na index.html aponta para a URL dela.';
            + _esc(API + '') + '</b> (' + _esc(err.message)
            + ''
            + '';
        }
        var txt = document.getElementById('sched-text');
        if (txt) txt.innerHTML = 'Coleta autom&aacute;tica: dados indispon&iacute;veis';
        var name = document.getElementById('pdf-name');
        if (name) name.textContent = 'indisponivel';
        showToast('Sem resposta da API do News (' + (API || 'mesma origem') + ')', 'fail', 8000);
      });
  })();

})();
