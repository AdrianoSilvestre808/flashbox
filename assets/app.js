/* Flashbox — landing page behaviour.
   Three jobs: reveal sections on scroll, run the booth demo in the hero,
   and turn the enquiry form into a pre-filled email. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- footer year ---- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- sticky nav ---- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- scroll reveal ---- */
  var targets = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('in'); }, i * 70);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- the booth demo ----------------------------------------------------
     Loops the real session: attract screen, countdown, flash, strip ejects
     into the tray. Static single strip when motion is reduced. */
  var vf = document.querySelector('.viewfinder');
  var count = document.getElementById('count');
  var prompt = document.getElementById('prompt');
  var stack = document.getElementById('stack');
  var tpl = document.getElementById('stripTpl');

  function makeStrip(hour, minute) {
    var strip = tpl.content.firstElementChild.cloneNode(true);
    var tilt = (Math.random() * 7 - 3.5).toFixed(2);
    strip.style.setProperty('--tilt', tilt + 'deg');
    strip.style.left = Math.round(Math.random() * 14 - 7) + 'px';
    strip.querySelector('.strip-foot').textContent =
      'FLASHBOX · ' + hour + ':' + String(minute).padStart(2, '0');
    stack.appendChild(strip);
    while (stack.children.length > 3) stack.removeChild(stack.firstElementChild);
    Array.prototype.forEach.call(stack.children, function (el, i) {
      el.style.zIndex = String(i + 1);
      el.style.opacity = String(0.55 + i * 0.225);
    });
  }

  if (!vf || !count || !stack || !tpl) return;

  if (reduced) {
    count.classList.add('hide');
    prompt.textContent = 'Tap anywhere to start';
    makeStrip(23, 41);
    return;
  }

  var flash = document.createElement('div');
  flash.style.cssText =
    'position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .45s ease';
  vf.appendChild(flash);

  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var minute = 38;

  function session() {
    var seq = Promise.resolve();
    var step = function (fn, ms) {
      seq = seq.then(function () { fn(); return wait(ms); });
    };

    step(function () {
      count.classList.add('hide');
      prompt.textContent = 'Tap anywhere to start';
    }, 2200);

    step(function () { prompt.textContent = 'Card accepted — get in there'; }, 1100);

    [3, 2, 1].forEach(function (n) {
      step(function () {
        count.textContent = n;
        count.classList.remove('hide', 'pop');
        void count.offsetWidth;
        count.classList.add('pop');
        prompt.textContent = 'Frame ' + (4 - n) + ' of 4';
      }, 850);
    });

    step(function () {
      count.classList.add('hide');
      flash.style.opacity = '.92';
      prompt.textContent = 'Nice one';
    }, 160);

    step(function () { flash.style.opacity = '0'; }, 900);

    step(function () {
      prompt.textContent = 'Printing — 12 seconds';
      minute = (minute + 1 + Math.floor(Math.random() * 3)) % 60;
      makeStrip(23, minute);
    }, 2400);

    seq.then(session);
  }
  session();

  /* ---- enquiry form -> pre-filled email ---- */
  var form = document.getElementById('bookForm');
  var note = document.getElementById('formNote');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (id) { return (document.getElementById(id).value || '').trim(); };
    var name = v('f-name'), email = v('f-email'), date = v('f-date');

    note.classList.remove('is-ok', 'is-err');
    if (!name || !email || !date) {
      note.textContent = 'Add your name, email and the date so we can check availability.';
      note.classList.add('is-err');
      return;
    }

    var body = [
      'Name: ' + name,
      'Email: ' + email,
      'Date: ' + date,
      'Type: ' + v('f-type'),
      'Venue and guests: ' + (v('f-venue') || 'not sure yet'),
      '',
      'Sent from the Flashbox site.'
    ].join('\n');

    window.location.href = 'mailto:hello@flashbox.example'
      + '?subject=' + encodeURIComponent('Booth enquiry — ' + date + ' — ' + name)
      + '&body=' + encodeURIComponent(body);

    note.textContent = 'Opening your email app. If nothing happens, write to hello@flashbox.example.';
    note.classList.add('is-ok');
  });
})();
