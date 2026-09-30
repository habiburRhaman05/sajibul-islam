/* Progressive enhancements only. The page renders fully without JS. */
(() => {
  'use strict';

  // 1. Client logos / badges: if an exported asset is missing, show readable text instead of a broken image.
  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    const swap = () => {
      const span = document.createElement('span');
      span.textContent = img.dataset.fallback || img.alt || '';
      span.className = img.dataset.fallbackClass || 'logo-fallback';
      if (img.classList.contains('logo')) {
        span.className += ' logo';
        span.setAttribute('style', img.getAttribute('style'));
        span.classList.add('a');
      }
      img.replaceWith(span);
    };
    img.addEventListener('error', swap, { once: true });
    if (img.complete && img.naturalWidth === 0) swap();
  });

  // 2. Tabs are anchor links. Keep keyboard focus on the target section after the jump.
  document.querySelectorAll('.tabs a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', a.getAttribute('href'));
    });
  });

  // 3. Lazy-load off-screen project imagery (CSS backgrounds have no native loading="lazy").
  //    Elements keep --img in an inline style; we defer applying it until they approach the viewport.
  if ('IntersectionObserver' in window) {
    const slots = document.querySelectorAll('.projects .img[style*="--img"]');
    const stash = new WeakMap();
    slots.forEach((el) => {
      const m = el.getAttribute('style').match(/--img:\s*(url\([^)]+\))/);
      if (!m) return;
      stash.set(el, m[1]);
      el.style.setProperty('--img', 'none');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const url = stash.get(en.target);
        if (url) en.target.style.setProperty('--img', url);
        io.unobserve(en.target);
      });
    }, { rootMargin: '1200px 0px' });
    slots.forEach((el) => stash.has(el) && io.observe(el));
  }
})();
