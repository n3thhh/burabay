(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hasMotion = Boolean(window.gsap && window.ScrollTrigger);
  const state = { lenis: null, deck: null, menuOpen: false, filmPaused: reducedMotion.matches, toastTimer: null, itinerary: null };

  const seasons = {
    spring: { label: 'Spring', months: 'APR — MAY', copy: 'Thawing shores, new greens, and the forest waking up.', focus: 'FRESH BEGINNINGS', advice: 'Bring layers and waterproof shoes. Trails may be muddy as the snow melts; ask locally about conditions before setting out.' },
    summer: { label: 'Summer', months: 'JUN — AUG', copy: 'Long light, open water, and pine-scented evenings.', focus: 'LAKESIDE DAYS', advice: 'Make time for the lake and reserve your stay ahead of busy weekends. A light layer is useful after sunset; confirm boat departures locally.' },
    autumn: { label: 'Autumn', months: 'SEP — OCT', copy: 'Golden edges, quiet trails, and crisp forest air.', focus: 'GOLDEN STILLNESS', advice: 'Pack warm layers and plan outdoor time around the shorter daylight. Check which boat trips and seasonal stays are still operating.' },
    winter: { label: 'Winter', months: 'NOV — MAR', copy: 'Snow-softened pines and a landscape held in silence.', focus: 'THE QUIET SEASON', advice: 'Choose a heated stay, check road and weather conditions, and arrange outdoor activities with a local guide. Keep lake exploration to the shore.' }
  };

  const landmarks = {
    okzhetpes: { title: 'Okzhetpes', kicker: 'THE ARROW CANNOT REACH', body: 'Okzhetpes rises above the forest as a granite sentinel. Its name means “an arrow will not reach.” One Kazakh legend tells of a kind giant who grew so tall that arrows could not reach his chest. He protected the people of Kokshetau; the stone keeps his name alive.', note: 'Burabay’s legends have several versions. Hear them from a local guide, and see the rock from the lakeshore and the Glade of Abylai Khan.', map: 'https://www.google.com/maps/search/?api=1&query=Okzhetpes+Rock+Burabay', source: 'https://qazaqculture.com/en/cultural-objects/54b7db67-434e-4f87-a6ee-814308b3e18d' },
    zhumbaktas: { title: 'Zhumbaktas', kicker: 'THE MYSTERY ROCK / SPHINX OF THE LAKE', body: 'In Lake Burabay, a granite formation rises roughly 18 metres above the water. Zhumbaktas means “the mystery stone.” Its silhouette changes with your angle of view, inviting comparisons to a sphinx and a human face. Walk the shore or, when conditions allow, see it from the water.', note: 'Slow down and change your viewpoint. The fascination is in the changing silhouette, as much as in the stories it inspires.', map: 'https://www.google.com/maps/search/?api=1&query=53.08743,70.25207', source: 'https://kazakhstan.travel/en/attractions/5' },
    bolektau: { title: 'Bolektau', kicker: 'THE FOREST OPENS INTO A HORIZON', body: 'Bolektau’s observation point gathers the region into one panorama: Lake Burabay, the forest, and the silhouettes of Okzhetpes and Zhumbaktas. Above the canopy, separate landmarks become one landscape. It is a natural first chapter for exploring Lake Borovoe, another name for Lake Burabay.', note: 'Bring shoes with grip and take your time on uneven ground. Choose a clear day and ask a local guide about the route and current conditions.', map: 'https://www.google.com/maps/search/?api=1&query=53.08945,70.25964', source: 'https://kazakhstan.travel/en/attractions/6' }
  };

  function icons(scope = document) {
    if (window.lucide) window.lucide.createIcons({ root: scope, attrs: { 'stroke-width': 1.5 } });
  }

  function toast(message) {
    const element = $('.toast');
    element.textContent = message;
    element.classList.add('is-visible');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => element.classList.remove('is-visible'), 4000);
  }

  function scrollTo(target, options = {}) {
    if (state.lenis && !reducedMotion.matches) state.lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : -85, duration: 1.25, ...options });
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    else target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  function initializeScrolling() {
    if (window.Lenis && !reducedMotion.matches) {
      state.lenis = new window.Lenis({ duration: 1.18, smoothWheel: true, syncTouch: false, wheelMultiplier: .9, anchors: false });
      document.documentElement.style.scrollBehavior = 'auto';
      if (hasMotion) {
        state.lenis.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add(time => state.lenis?.raf(time * 1000));
        window.gsap.ticker.lagSmoothing(0);
      } else {
        const raf = time => { state.lenis?.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
    }

    $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
      const target = $(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      closeMenu();
      scrollTo(target);
      try { history.replaceState(null, '', link.getAttribute('href')); } catch { /* File previews still scroll without history access. */ }
      if (link.classList.contains('skip-link')) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }));
  }

  function closeMenu() {
    state.menuOpen = false;
    $('.mobile-nav').hidden = true;
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
    $('.menu-toggle').setAttribute('aria-label', 'Open navigation');
    document.body.style.overflow = '';
    state.lenis?.start();
    updateHeader();
  }

  function initializeNavigation() {
    $('.menu-toggle').addEventListener('click', () => {
      if (state.menuOpen) return closeMenu();
      state.menuOpen = true;
      $('.mobile-nav').hidden = false;
      $('.menu-toggle').setAttribute('aria-expanded', 'true');
      $('.menu-toggle').setAttribute('aria-label', 'Close navigation');
      $('.site-header').classList.remove('is-light');
      document.body.style.overflow = 'hidden';
      state.lenis?.stop();
      $('.mobile-nav a').focus();
    });
    document.addEventListener('keydown', event => {
      if (!state.menuOpen) return;
      if (event.key === 'Escape') { closeMenu(); $('.menu-toggle').focus(); }
      if (event.key === 'Tab') {
        const controls = [$('.menu-toggle'), ...$$('a, button', $('.mobile-nav'))];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches && state.menuOpen) closeMenu(); });
    let scheduled = false;
    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        updateHeader();
        const height = document.documentElement.scrollHeight - innerHeight;
        $('.reading-progress').style.transform = `scaleX(${height > 0 ? window.scrollY / height : 0})`;
        scheduled = false;
      });
    }, { passive: true });
    updateHeader();
  }

  function updateHeader() {
    const header = $('.site-header');
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    if (state.menuOpen) return;
    const isLight = $$('.section-light').some(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 55 && rect.bottom > 55;
    });
    header.classList.toggle('is-light', isLight);
  }

  function initializeFilm() {
    const film = $('.hero-video');
    const button = $('.motion-toggle');
    const updateButton = () => {
      button.setAttribute('aria-pressed', String(state.filmPaused));
      button.setAttribute('aria-label', `${state.filmPaused ? 'Play' : 'Pause'} background film`);
      button.innerHTML = `<i data-lucide="${state.filmPaused ? 'play' : 'pause'}" aria-hidden="true"></i>`;
      icons(button);
    };
    const play = () => film.play().catch(() => { state.filmPaused = true; updateButton(); });
    if (state.filmPaused) film.pause(); else play();
    updateButton();
    button.addEventListener('click', () => {
      state.filmPaused = !state.filmPaused;
      if (state.filmPaused) film.pause(); else play();
      updateButton();
    });
    film.addEventListener('error', () => { film.style.opacity = '0'; button.hidden = true; });
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !state.filmPaused && !document.hidden) play(); else film.pause();
    }, { threshold: 0.05 });
    observer.observe($('.hero'));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) film.pause();
      else if (!state.filmPaused && $('.hero').getBoundingClientRect().bottom > 0) play();
    });
  }

  function setSeason(key, focus = false) {
    const season = seasons[key];
    if (!season) return;
    $$('.season-tabs button').forEach(button => {
      const selected = button.dataset.season === key;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    });
    $('#season-detail').setAttribute('aria-labelledby', `tab-${key}`);
    $('#season-months').textContent = season.months;
    $('#season-copy').textContent = season.copy;
    $('#season-focus').textContent = season.focus;
    $('#planner-form [name="season"]').value = key;
    if (hasMotion && !reducedMotion.matches) window.gsap.fromTo('.season-detail', { opacity: .3, y: 6 }, { opacity: 1, y: 0, duration: .45, overwrite: true });
  }

  function initializeFieldNotes() {
    const tabs = $$('.season-tabs button');
    tabs.forEach((button, index) => {
      button.addEventListener('click', () => setSeason(button.dataset.season));
      button.addEventListener('keydown', event => {
        let next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== null) { event.preventDefault(); setSeason(tabs[next].dataset.season, true); }
      });
    });
    $$('.experience-toggle').forEach(button => button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      $(`#${button.getAttribute('aria-controls')}`).hidden = expanded;
      if (hasMotion) window.ScrollTrigger.refresh();
    }));
  }

  function openDialog(dialog) {
    if (state.menuOpen) closeMenu();
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    state.lenis?.stop();
    dialog.scrollTop = 0;
  }

  function initializeDialogs() {
    $$('dialog').forEach(dialog => {
      $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => {
        const box = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
      });
      dialog.addEventListener('close', () => { document.body.style.overflow = ''; state.lenis?.start(); });
    });
    $$('[data-plan]').forEach(button => button.addEventListener('click', () => openDialog($('#planner-dialog'))));
    $$('[data-landmark]').forEach(button => button.addEventListener('click', () => {
      const landmark = landmarks[button.dataset.landmark];
      if (!landmark) return;
      const dialog = $('#story-dialog');
      $('#story-title').textContent = landmark.title;
      $('.story-kicker').textContent = landmark.kicker;
      $('.story-body').textContent = landmark.body;
      $('.story-note').textContent = landmark.note;
      $('.story-map').href = landmark.map;
      $('.story-source').href = landmark.source;
      openDialog(dialog);
    }));
    $('.credits-toggle').addEventListener('click', () => openDialog($('#credits-dialog')));
  }

  function buildItinerary(season, pace, length) {
    const winter = season === 'winter';
    const arrival = { title: 'Arrive in a different world', body: 'Travel from Astana to Burabay by road, or take a train to Shchuchinsk and arrange the onward transfer. Settle in, walk the lakeshore, and leave the evening open.' };
    const discovery = { title: winter ? 'Stone, snow & stories' : 'The landscape, from above', body: winter ? 'Explore the shores around Okzhetpes and Zhumbaktas with a local guide. Follow marked routes through the snow-covered pines, then return for a warm tea.' : 'Visit the Bolektau viewpoint, then explore the shore near Okzhetpes and Zhumbaktas. Arrange a guided lake outing if the weather and departures allow.' };
    const restorative = { title: 'The art of doing a little less', body: 'Take a gentle forest walk, leave time for a sauna or spa at your retreat, and finish beside the lake. Keep the day deliberately unhurried.' };
    const trail = { title: winter ? 'Follow the winter forest' : 'Follow a forest trail', body: winter ? 'Arrange a guided winter walk or a locally operated snow activity suited to your experience. Let weather and daylight set the pace.' : 'Arrange a guided equestrian trail or a forest hike suited to your experience. Pause for a picnic, and return in time for sunset.' };
    const culture = { title: 'Listen to the place', body: 'Explore the Glade of Abylai Khan and the Botai-Burabay Museum. A local guide can connect the landscape to Kazakh history and the stories behind the rocks.' };
    const chosen = pace === 'slow' ? restorative : pace === 'culture' ? culture : trail;
    if (length === 2) return [arrival, { title: discovery.title, body: `${discovery.body} Leave time for your return to Astana.` }];
    if (length === 3) return [arrival, discovery, { title: chosen.title, body: `${chosen.body} Arrange your return transfer for later in the day.` }];
    return [arrival, discovery, chosen, { title: pace === 'culture' ? restorative.title : culture.title, body: `${pace === 'culture' ? restorative.body : culture.body} Return to Astana when you are ready.` }];
  }

  function initializePlanner() {
    $('#planner-form').addEventListener('submit', event => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      const season = values.get('season');
      const pace = values.get('pace');
      const days = Math.min(4, Math.max(2, Number(values.get('days'))));
      const itinerary = buildItinerary(season, pace, days);
      state.itinerary = { season, pace, days, itinerary };
      const list = $('.itinerary-days');
      list.replaceChildren();
      itinerary.forEach((day, index) => {
        const item = document.createElement('li');
        const number = document.createElement('span');
        number.textContent = `DAY 0${index + 1}`;
        const copy = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = day.title;
        const body = document.createElement('p');
        body.textContent = day.body;
        copy.append(title, body);
        item.append(number, copy);
        list.append(item);
      });
      $('.itinerary-meta').textContent = `${seasons[season].label.toUpperCase()} / ${days} DAYS / ${pace === 'slow' ? 'SLOW & RESTORATIVE' : pace === 'culture' ? 'CULTURE & CONNECTION' : 'TRAILS & DISCOVERY'}`;
      $('.itinerary-season').textContent = seasons[season].advice;
      $('#itinerary').hidden = false;
      $('#itinerary').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'nearest' });
    });
    $('.download-brief').addEventListener('click', () => {
      if (!state.itinerary) return;
      const { season, pace, days, itinerary } = state.itinerary;
      const text = [
        'BURABAY — YOUR EXPEDITION FIELD BRIEF', '53.0850° N / 70.3025° E', '',
        `${seasons[season].label} / ${days} days / ${pace === 'slow' ? 'Slow & restorative' : pace === 'culture' ? 'Culture & connection' : 'Trails & discovery'}`, '',
        ...itinerary.flatMap((day, index) => [`DAY ${index + 1} — ${day.title}`, day.body, '']),
        'SEASON NOTES', seasons[season].advice, '', 'ROUTE FROM ASTANA', 'https://www.google.com/maps/dir/Astana/Burabay,+Kazakhstan/', '',
        'DESTINATION GUIDE', 'https://kazakhstan.travel/en/attractions/6', '',
        'A suggested itinerary to adapt with a local guide. Check seasonal operation, weather, trail conditions and current opening hours before travelling.'
      ].join('\n');
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `burabay-${season}-${days}-day-expedition.txt`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Your field brief is ready for the journey.');
    });
  }

  function initializeTime() {
    const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Almaty', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const update = () => {
      const now = new Date();
      $('#local-time').textContent = clock.format(now);
      $('#local-time').dateTime = now.toISOString();
      $('#year').textContent = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Almaty', year: 'numeric' }).format(now);
    };
    update();
    setInterval(update, 1000);
  }

  // A user-initiated, low-volume wind/water soundscape; never autoplay audio.
  function initializeSound() {
    const button = $('.sound-toggle');
    let context, master, source;
    const update = on => {
      button.setAttribute('aria-pressed', String(on));
      $('.sound-label').textContent = on ? 'SOUND ON' : 'SOUND OFF';
      button.setAttribute('aria-label', `${on ? 'Mute' : 'Enable'} ambient wind and water`);
    };
    update(false);
    button.addEventListener('click', async () => {
      const on = button.getAttribute('aria-pressed') !== 'true';
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) { toast('Ambient audio is unavailable in this browser.'); return; }
      try {
        if (!context) {
          context = new AudioContext();
          const buffer = context.createBuffer(1, context.sampleRate * 6, context.sampleRate);
          const data = buffer.getChannelData(0);
          let last = 0;
          for (let i = 0; i < data.length; i++) { last = (last + .018 * (Math.random() * 2 - 1)) / 1.018; data[i] = last * 3.5; }
          source = context.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          const filter = context.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 800;
          master = context.createGain();
          master.gain.value = 0;
          source.connect(filter).connect(master).connect(context.destination);
          source.start();
        }
        await context.resume();
        master.gain.setTargetAtTime(on ? .18 : 0, context.currentTime, .8);
        update(on);
      } catch { update(false); toast('Tap again to enable ambient audio.'); }
    });
    document.addEventListener('visibilitychange', () => {
      if (context && master) master.gain.setTargetAtTime(!document.hidden && button.getAttribute('aria-pressed') === 'true' ? .18 : 0, context.currentTime, .3);
    });
  }

  function initializePointer() {
    if (!finePointer.matches || reducedMotion.matches) return;
    const cursor = $('.cursor');
    const cursorLabel = $('.cursor-label');
    let x = innerWidth / 2, y = innerHeight / 2, lagX = x, lagY = y, previousX = x, previousY = y, active = false, pointerFrame = null;
    const move = () => {
      const dx = x - lagX, dy = y - lagY;
      lagX += dx * .2;
      lagY += dy * .2;
      const speed = Math.min(Math.hypot(x - previousX, y - previousY) / 60, .3);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      cursor.style.transform = `translate3d(${lagX}px, ${lagY}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${1 + speed}, ${1 - speed})`;
      cursorLabel.style.transform = `translate(-50%, -50%) rotate(${-angle}deg)`;
      previousX = x; previousY = y;
      if (active && Math.abs(dx) + Math.abs(dy) > .1) pointerFrame = requestAnimationFrame(move);
      else pointerFrame = null;
    };
    document.addEventListener('pointermove', event => {
      x = event.clientX; y = event.clientY; active = true;
      cursor.style.opacity = '1';
      if (!pointerFrame) pointerFrame = requestAnimationFrame(move);
    }, { passive: true });
    document.addEventListener('pointerleave', () => { active = false; cursor.style.opacity = '0'; });
    window.addEventListener('blur', () => { active = false; cursor.style.opacity = '0'; });
    $$('a, button, select').forEach(element => {
      element.addEventListener('pointerenter', () => {
        if (element.dataset.cursor) { cursor.classList.add('is-explore'); $('.cursor-label').textContent = element.dataset.cursor; }
        else cursor.classList.add('is-link');
      });
      element.addEventListener('pointerleave', () => cursor.classList.remove('is-link', 'is-explore'));
    });
    if (!hasMotion) return;
    $$('[data-magnetic]').forEach(element => {
      const moveX = window.gsap.quickTo(element, 'x', { duration: .45, ease: 'power3.out' });
      const moveY = window.gsap.quickTo(element, 'y', { duration: .45, ease: 'power3.out' });
      element.addEventListener('pointermove', event => {
        const box = element.getBoundingClientRect();
        moveX((event.clientX - box.left - box.width / 2) * .15);
        moveY((event.clientY - box.top - box.height / 2) * .2);
      }, { passive: true });
      element.addEventListener('pointerleave', () => { moveX(0); moveY(0); });
    });
    $$('[data-tilt]').forEach(card => {
      const rotateX = window.gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3.out' });
      const rotateY = window.gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3.out' });
      card.addEventListener('pointermove', event => {
        const box = card.getBoundingClientRect();
        rotateX((event.clientY - box.top - box.height / 2) / box.height * -7);
        rotateY((event.clientX - box.left - box.width / 2) / box.width * 7);
      }, { passive: true });
      card.addEventListener('pointerleave', () => { rotateX(0); rotateY(0); });
    });
  }

  function setChapter(index) {
    $$('[data-chapter]').forEach(button => {
      const selected = Number(button.dataset.chapter) === index;
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
    });
    $('.deck-count').textContent = `0${index + 1} — 03`;
  }

  function initializeChapters() {
    $$('[data-chapter]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.chapter);
      if (state.deck) scrollTo(state.deck.start + (state.deck.end - state.deck.start) * index / 2 + 1);
      else scrollTo($$('.landmark-card')[index]);
      setChapter(index);
    }));
    $$('.landmark-card').forEach((card, index) => card.addEventListener('focusin', event => {
      // Bring a keyboard-focused story into the visible part of the pinned deck.
      if (!state.deck || !event.target.matches(':focus-visible')) return;
      const target = state.deck.start + (state.deck.end - state.deck.start) * index / 2 + 1;
      scrollTo(target, { duration: .65 });
      setChapter(index);
    }));
  }

  function initializeMotion() {
    if (!hasMotion || reducedMotion.matches) return;
    const { gsap, ScrollTrigger, SplitType } = window;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    const title = $('.hero-title');
    const splitHero = SplitType ? new SplitType(title, { types: 'chars', tagName: 'span' }) : null;
    if (splitHero) splitHero.chars.forEach(char => char.setAttribute('aria-hidden', 'true'));
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from(splitHero ? splitHero.chars : title, { yPercent: 110, rotate: 3, duration: 1.55, stagger: .055 }, .05)
      .from('.hero-kicker, .hero-subline', { y: 20, opacity: 0, duration: 1.1, stagger: .12 }, .7)
      .from('.hero-bottom, .hero-topline', { opacity: 0, y: 12, duration: 1.1, stagger: .1 }, 1.05);

    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero-media', { scale: 1.16, yPercent: 12, clipPath: 'inset(0 0% 0 0%)', ease: 'none' }, 0)
      .to('.hero-content', { scale: 1.08, yPercent: -28, opacity: .1, ease: 'none' }, 0)
      .to('.hero-shade', { opacity: .65, ease: 'none' }, 0);

    $$('.reveal').forEach(element => gsap.from(element, { y: 42, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } }));
    $$('.text-reveal').forEach(element => {
      if (!SplitType) return;
      element.setAttribute('aria-label', element.innerText.replace(/\s+/g, ' ').trim());
      const split = new SplitType(element, { types: 'words, chars', tagName: 'span' });
      split.chars.forEach(char => char.setAttribute('aria-hidden', 'true'));
      gsap.from(split.chars, { opacity: .2, stagger: .025, ease: 'none', scrollTrigger: { trigger: element, start: 'top 83%', end: 'bottom 48%', scrub: 1 } });
    });
    gsap.fromTo('.intro-image img', { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.intro-image', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.image-seal', { rotate: -15, ease: 'none', scrollTrigger: { trigger: '.intro-grid', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.experience-card', { y: 65, opacity: 0, rotateX: 7, stagger: .11, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.experience-grid', start: 'top 82%', once: true } });
    gsap.from('.outro h2', { y: 60, opacity: 0, duration: 1.35, ease: 'power3.out', scrollTrigger: { trigger: '.outro', start: 'top 70%', once: true } });
    gsap.fromTo('.outro-background', { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.outro', start: 'top bottom', end: 'bottom top', scrub: true } });

    media.add('(min-width: 901px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)', () => {
      const section = $('.legends'), track = $('.landmark-track');
      section.classList.add('is-pinned');
      const travel = () => Math.max(0, track.scrollWidth - $('.landmark-viewport').clientWidth);
      const tween = gsap.to(track, { x: () => -travel(), ease: 'none', scrollTrigger: {
        trigger: section, pin: $('.legend-stage'), start: 'top top', end: () => `+=${travel() + innerWidth * .3}`,
        scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => { $('.deck-progress > span').style.transform = `scaleX(${Math.max(.02, self.progress)})`; setChapter(Math.round(self.progress * 2)); }
      } });
      state.deck = tween.scrollTrigger;
      $$('.landmark-image img').forEach(image => gsap.fromTo(image, { xPercent: -6 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: image.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }));
      return () => { state.deck = null; section.classList.remove('is-pinned'); setChapter(0); };
    });

    media.add('(min-width: 1101px) and (min-height: 901px) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({ trigger: '.experience-grid', start: 'top 22%', end: '+=200', pin: true, anticipatePin: 1 });
    });
    const skews = $$('.hero-title, .legend-heading h2').map(element => gsap.quickTo(element, 'skewY', { duration: .55, ease: 'power3.out' }));
    const settle = gsap.delayedCall(.15, () => skews.forEach(skew => skew(0))).pause();
    ScrollTrigger.create({ onUpdate: self => { const amount = gsap.utils.clamp(-1.8, 1.8, self.getVelocity() / -1300); skews.forEach(skew => skew(amount)); settle.restart(true); } });
    $$('img').forEach(image => { if (!image.complete) image.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }); });
    ScrollTrigger.refresh();
  }

  function initializeAssetFallbacks() {
    $$('img').forEach(image => image.addEventListener('error', () => {
      if (image.dataset.fallback) return;
      image.dataset.fallback = 'true';
      image.removeAttribute('srcset');
      image.src = 'assets/hero-poster.jpg';
      if (image.alt) image.alt = 'Burabay landscape from the local background film';
    }));
  }

  function initialize() {
    icons();
    initializeScrolling();
    initializeNavigation();
    initializeFilm();
    initializeDialogs();
    initializeFieldNotes();
    initializePlanner();
    initializeTime();
    initializeSound();
    initializePointer();
    initializeChapters();
    initializeAssetFallbacks();
    // Font loading is bounded so a blocked font service cannot stall the experience.
    Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 1800))]).then(initializeMotion);
    reducedMotion.addEventListener('change', () => {
      // Re-initialize cleanly when an operating-system accessibility preference changes.
      window.location.reload();
    });
  }

  initialize();
})();

