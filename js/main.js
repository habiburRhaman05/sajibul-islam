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

  // 4. Video cards: the thumbnail links to YouTube; with JS, clicking plays the video inside the card itself.
  //    YouTube refuses to embed (error 153) when the page has no origin, i.e. when opened as a file://
  //    document, so in that case the link just opens YouTube. Serve the site over http(s) for inline play.
  const cards = document.querySelectorAll('a[data-yt]');
  let playing = null;
  const stop = (a) => {
    const f = a.querySelector('.thumb-frame');
    if (f) f.remove();
    a.classList.remove('is-playing');
    if (a.dataset.href) { a.href = a.dataset.href; a.target = '_blank'; }
  };
  const canEmbed = location.protocol !== 'file:';
  if (!canEmbed) {
    // file:// has no origin, so YouTube cannot play inside the page. Say so in the card instead of leaving the site.
    cards.forEach((a) => a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      if (a.querySelector('.thumb-note')) return;
      const n = document.createElement('div');
      n.className = 'thumb-note';
      n.innerHTML = '<p>Videos play inside the page on the <b>live (https) site</b>. Open your deployed link, or run <b>start-site.bat</b> locally.</p>';
      const l = document.createElement('a');
      l.href = a.href;
      l.target = '_blank';
      l.rel = 'noopener';
      l.textContent = 'Watch on YouTube';
      n.appendChild(l);
      a.appendChild(n);
    }));
  }
  if (canEmbed) {
    // If YouTube reports that a video cannot be embedded (errors 101, 150, 152, 153), fall back to YouTube itself.
    window.addEventListener('message', (e) => {
      if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin)) return;
      let d = e.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (_) { return; } }
      if (!d || d.event !== 'onError' || !playing) return;
      const a = playing;
      const url = a.dataset.href;
      stop(a);
      a.dataset.noembed = '1';
      playing = null;
      if (url) window.open(url, '_blank', 'noopener');
    });
    cards.forEach((a) => a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || a.dataset.noembed || a.classList.contains('is-playing')) return;
      e.preventDefault();
      if (playing && playing !== a) stop(playing);
      a.dataset.href = a.href;
      a.removeAttribute('href');
      a.removeAttribute('target');
      const f = document.createElement('iframe');
      f.className = 'thumb-frame';
      f.title = a.dataset.title || 'Video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.addEventListener('load', () => {
        try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (_) { /* ignore */ }
      });
      f.src = 'https://www.youtube.com/embed/' + a.dataset.yt + '?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=' + encodeURIComponent(location.origin);
      a.appendChild(f);
      a.classList.add('is-playing');
      playing = a;
    }));
  }
})();
