// FastWorks — kleine interacties: openingsreel en trailer-venster.
document.documentElement.classList.add('js');

(function reel() {
  const scope = document.querySelector('[data-reel]');
  if (!scope) return;
  const frames = Array.from(scope.querySelectorAll('.reel img'));
  const captionOut = document.querySelector('[data-caption-out]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0;
  let timer = null;

  function show(n) {
    frames.forEach((f, k) => f.classList.toggle('is-on', k === n));
    if (captionOut) {
      captionOut.classList.add('is-fading');
      setTimeout(() => {
        captionOut.textContent = frames[n].dataset.caption || '';
        captionOut.classList.remove('is-fading');
      }, reduce ? 0 : 500);
    }
  }
  function next() { i = (i + 1) % frames.length; show(i); }
  function start() { if (!reduce && !timer) timer = setInterval(next, 7000); }
  function stop() { clearInterval(timer); timer = null; }

  // Eerst het logo als studio-ident op zwart, dan begint de reel.
  requestAnimationFrame(() => scope.classList.add('is-ready'));
  setTimeout(() => {
    scope.classList.add('is-rolling');
    show(0);
    start();
  }, reduce ? 2500 : 3200);

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();

(function trailers() {
  const dialog = document.querySelector('dialog.trailer');
  if (!dialog) return;
  const frame = dialog.querySelector('.trailer-frame');

  document.querySelectorAll('[data-trailer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.trailer;
      const title = btn.dataset.title || 'Trailer';
      if (typeof dialog.showModal !== 'function') {
        window.open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener');
        return;
      }
      frame.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = title;
      iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      frame.appendChild(iframe);
      dialog.setAttribute('aria-label', title);
      dialog.showModal();
    });
  });

  dialog.addEventListener('close', () => { frame.innerHTML = ''; });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
})();

document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
