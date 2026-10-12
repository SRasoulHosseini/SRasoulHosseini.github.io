/* Research notebook — no frameworks or runtime dependencies. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeButton = document.querySelector('[data-theme-toggle]');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    themeButton?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    const label = document.querySelector('[data-theme-label]');
    if (label) label.textContent = theme === 'dark' ? 'Night' : 'Paper';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#191b22' : '#f7f7f2');
  }

  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  if (themeButton) {
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch { /* Theme works without storage. */ }
    });
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const portrait = document.querySelector('.portrait-paper img');
  if (portrait) {
    const fallback = () => { portrait.hidden = true; };
    portrait.addEventListener('error', fallback);
    if (portrait.complete && portrait.naturalWidth === 0) fallback();
  }

  // Ordinary anchor navigation: no wheel handlers or scroll interception.
  const chapters = [...document.querySelectorAll('main > section[id]')];
  const navigation = document.querySelector('.contents');
  const links = [...document.querySelectorAll('.contents a')];
  let scrollQueued = false;
  let activeId = '';

  function syncReadingPosition() {
    scrollQueued = false;
    const probe = Math.min(window.innerHeight * .32, 300);
    let active = chapters[0];
    chapters.forEach(chapter => {
      if (chapter.getBoundingClientRect().top <= probe) active = chapter;
    });
    const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / available));
    root.style.setProperty('--reading-progress', String(progress));

    if (!active || active.id === activeId) return;
    activeId = active.id;
    links.forEach(link => {
      const isActive = link.hash === `#${activeId}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      if (isActive && navigation && window.innerWidth <= 1000) {
        // Keep the selected tab visible without moving the page vertically.
        const x = link.getBoundingClientRect().left - navigation.getBoundingClientRect().left + navigation.scrollLeft;
        const right = x + link.offsetWidth;
        if (x < navigation.scrollLeft || right > navigation.scrollLeft + navigation.clientWidth) {
          navigation.scrollTo({ left: Math.max(0, x - 18), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        }
      }
    });
  }

  function queueReadingPosition() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(syncReadingPosition);
  }

  window.addEventListener('scroll', queueReadingPosition, { passive: true });
  window.addEventListener('resize', queueReadingPosition, { passive: true });
  window.addEventListener('pageshow', queueReadingPosition);
  window.addEventListener('load', queueReadingPosition);
  document.fonts?.ready.then(queueReadingPosition);
  queueReadingPosition();

  // Reveal once, and only after the observer exists. The baseline is readable.
  const revealItems = [...document.querySelectorAll('.reveal')];
  let revealObserver;

  function showAll() {
    revealObserver?.disconnect();
    root.classList.remove('motion-ready');
    revealItems.forEach(element => element.classList.add('visible'));
  }

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    root.classList.add('motion-ready');
    revealItems.forEach(element => revealObserver.observe(element));
  } else showAll();

  document.addEventListener('focusin', event => {
    event.target.closest?.('.reveal')?.classList.add('visible');
  });

  function revealHashTarget() {
    try {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      target.closest('.reveal')?.classList.add('visible');
      // Preserve the staggered reading experience farther down a long chapter.
      target.querySelector('.reveal')?.classList.add('visible');
      queueReadingPosition();
    } catch { /* Ignore invalid URL fragments. */ }
  }
  window.addEventListener('hashchange', revealHashTarget);
  revealHashTarget();
  reducedMotion.addEventListener?.('change', event => { if (event.matches) showAll(); });

  // A deliberately conceptual illustration, not training or benchmark data.
  function initializeLearningStudy() {
    const study = document.querySelector('.learning-study');
    const oldGroup = document.getElementById('past-points');
    const newGroup = document.getElementById('new-points');
    const timeInput = document.getElementById('learning-time');
    const memoryInput = document.getElementById('memory-toggle');
    const playButton = document.querySelector('[data-play]');
    if (!study || !oldGroup || !newGroup || !timeInput || !memoryInput || !playButton) return;

    let seed = 73019;
    function random() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    function makeCloud(group, count) {
      const fragment = document.createDocumentFragment();
      const points = Array.from({ length: count }, () => {
        const angle = random() * Math.PI * 2;
        const radius = Math.sqrt(random());
        const element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const point = { element, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, phase: random() * Math.PI * 2, size: 1.8 + random() * 1.9 };
        element.setAttribute('r', point.size.toFixed(2));
        fragment.append(element);
        return point;
      });
      group.replaceChildren(fragment);
      return points;
    }

    const older = makeCloud(oldGroup, 46);
    const newer = makeCloud(newGroup, 38);
    const oldRegion = study.querySelector('.past-region');
    const newRegion = study.querySelector('.new-region');
    const oldTrace = study.querySelector('.memory-trace');
    const status = study.querySelector('.study-status');
    const playLabel = study.querySelector('[data-play-label]');
    const playSymbol = study.querySelector('.play-symbol');
    let time = .25;
    let running = !reducedMotion.matches;
    let visible = study.getBoundingClientRect().top < window.innerHeight && study.getBoundingClientRect().bottom > 0;
    let frameId = 0;
    let lastTick = 0;

    function updatePlayButton() {
      const word = running ? 'Pause' : time >= 1 ? 'Replay' : 'Play';
      playLabel.textContent = word;
      playSymbol.textContent = running ? 'Ⅱ' : time >= 1 ? '↻' : '▷';
      playButton.setAttribute('aria-label', `${word} learning illustration`);
    }

    function updateCaption() {
      status.textContent = memoryInput.checked
        ? 'New experience. Earlier knowledge, retained.'
        : 'Without replay, earlier knowledge can fade.';
    }

    function draw() {
      const memory = memoryInput.checked;
      const drift = memory ? 0 : time;
      const phase = time * Math.PI * 2;
      older.forEach(point => {
        const x = 155 + point.x * (65 + drift * 17) + point.y * 14 + drift * 24;
        const y = 178 + point.y * (51 + drift * 17) + Math.sin(phase + point.phase) * time * 2.2;
        point.element.setAttribute('cx', x.toFixed(2));
        point.element.setAttribute('cy', y.toFixed(2));
        point.element.setAttribute('opacity', ((.55 + point.size * .1) * (1 - drift * .78)).toFixed(3));
      });
      newer.forEach((point, index) => {
        const arrival = Math.max(0, Math.min(1, time * 1.8 - index / newer.length * .65));
        const eased = 1 - (1 - arrival) ** 3;
        const x = 449 + (345 + point.x * 58 + point.y * 13 - 449) * eased;
        const y = 221 + (143 + point.y * 44 - 221) * eased + Math.sin(phase + point.phase) * arrival * 2;
        point.element.setAttribute('cx', x.toFixed(2));
        point.element.setAttribute('cy', y.toFixed(2));
        point.element.setAttribute('opacity', (.12 + eased * .72).toFixed(3));
      });
      oldRegion.style.opacity = (.58 - drift * .4).toFixed(3);
      oldTrace.style.opacity = (.27 - drift * .22).toFixed(3);
      newRegion.style.opacity = (.22 + time * .36).toFixed(3);
      timeInput.value = String(Math.round(time * 100));
      timeInput.setAttribute('aria-valuetext', `${Math.round(time * 100)} percent through the illustration`);
    }

    function tick(now) {
      frameId = 0;
      if (!running || !visible || document.hidden) { lastTick = 0; return; }
      if (lastTick) time = Math.min(1, time + Math.min(now - lastTick, 80) / 18000);
      lastTick = now;
      draw();
      if (time >= 1) { running = false; updatePlayButton(); }
      schedule();
    }

    function schedule() {
      if (running && visible && !document.hidden && !frameId) frameId = window.requestAnimationFrame(tick);
    }

    function pause() {
      running = false;
      lastTick = 0;
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      updatePlayButton();
    }

    playButton.addEventListener('click', () => {
      if (running) { pause(); return; }
      if (time >= 1) time = 0;
      running = true;
      lastTick = 0;
      updatePlayButton();
      schedule();
    });
    timeInput.addEventListener('input', () => {
      pause();
      time = Number(timeInput.value) / 100;
      draw();
      updatePlayButton();
    });
    memoryInput.addEventListener('change', () => { draw(); updateCaption(); });
    memoryInput.setAttribute('aria-describedby', 'study-description');
    document.addEventListener('visibilitychange', () => { lastTick = 0; schedule(); });
    reducedMotion.addEventListener?.('change', event => { if (event.matches) pause(); });

    if ('IntersectionObserver' in window) {
      const studyObserver = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        lastTick = 0;
        schedule();
      }, { threshold: .05 });
      studyObserver.observe(study);
    }

    draw();
    updateCaption();
    updatePlayButton();
    study.querySelector('.study-controls').hidden = false;
    schedule();
  }

  initializeLearningStudy();
})();
