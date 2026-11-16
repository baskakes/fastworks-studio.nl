// FastWorks: kop, menu, openingsreel, trailers en lightbox.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Kop wordt donker zodra je scrollt
  const header = document.querySelector('[data-header]');
  const hasHero = document.body.classList.contains('has-hero');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-solid', !hasHero || window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobiel menu
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-label').textContent = open ? 'Sluiten' : 'Menu';
    document.body.classList.toggle('menu-open', open);
    header.classList.toggle('is-solid', open || !hasHero || window.scrollY > 40);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      const first = menu.querySelector('a');
      if (first) first.focus();
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 350);
    }
  }
  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); } });
    window.addEventListener('resize', () => { if (window.innerWidth > 760 && toggle.getAttribute('aria-expanded') === 'true') setMenu(false); });
  }

  // Openingsreel: eerst het logo als studio-ident, dan de beelden
  const hero = document.querySelector('[data-reel]');
  if (hero) {
    const clips = Array.from(hero.querySelectorAll('video'));
    const bars = Array.from(hero.querySelectorAll('.reel-bars li'));
    const captionOut = hero.querySelector('[data-caption-out]');
    let i = 0;
    const seen = sessionStorageGet('fw-ident');

    function caption(text) {
      if (!captionOut) return;
      captionOut.classList.add('is-fading');
      setTimeout(() => { captionOut.textContent = text || ''; captionOut.classList.remove('is-fading'); }, 400);
    }
    function play(n) {
      const v = clips[n];
      clips.forEach((c, k) => c.classList.toggle('is-on', k === n));
      bars.forEach((b, k) => b.style.setProperty('--p', k < n ? 1 : 0));
      caption(v.dataset.caption);
      v.currentTime = 0;
      v.playbackRate = 0.7; // rustig, filmisch tempo
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
      const nxt = clips[(n + 1) % clips.length];
      if (nxt.preload === 'none') { nxt.preload = 'auto'; nxt.load(); }
    }
    clips.forEach((v, k) => {
      v.addEventListener('timeupdate', () => {
        if (k !== i || !v.duration) return;
        if (bars[k]) bars[k].style.setProperty('--p', Math.min(1, v.currentTime / v.duration));
        if (v.duration - v.currentTime < 0.6 && !v.dataset.next) {
          v.dataset.next = '1';
          i = (i + 1) % clips.length;
          play(i);
          setTimeout(() => { delete v.dataset.next; }, 1500);
        }
      });
    });

    function start() {
      hero.classList.add('is-rolling');
      if (reduce) { clips[0].classList.add('is-on'); caption(clips[0].dataset.caption); return; }
      play(0);
    }
    if (seen || reduce) {
      hero.classList.add('no-ident');
      start();
    } else {
      requestAnimationFrame(() => hero.classList.add('is-ready'));
      setTimeout(start, 2600);
      sessionStorageSet('fw-ident', '1');
    }
    document.addEventListener('visibilitychange', () => {
      const v = clips[i];
      if (document.hidden) v.pause(); else if (!reduce && hero.classList.contains('is-rolling')) v.play().catch(() => {});
    });
  }

  // Video bovenaan filmpagina's
  document.querySelectorAll('video[data-autoplay]').forEach((v) => {
    if (reduce) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  });

  // Trailers: pas laden na klikken (privacyvriendelijk)
  document.querySelectorAll('[data-trailer]').forEach((box) => {
    const btn = box.querySelector('.trailer-play');
    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + box.dataset.trailer + '?autoplay=1&rel=0&modestbranding=1';
      iframe.title = box.dataset.title || 'Trailer';
      iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      box.appendChild(iframe);
      box.classList.add('is-playing');
    });
  });

  // Lightbox voor stills
  const lb = document.querySelector('[data-lightbox]');
  if (lb && typeof lb.showModal === 'function') {
    const img = lb.querySelector('img');
    const cap = lb.querySelector('.lightbox-caption');
    document.querySelectorAll('.gallery-item').forEach((b) => {
      b.addEventListener('click', () => {
        img.src = b.dataset.full; img.alt = b.dataset.caption || '';
        cap.textContent = b.dataset.caption || '';
        lb.showModal();
      });
    });
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* niets */ } }
})();
