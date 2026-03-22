/* ═══════════════════════════════════════════════════════════════
   HACKER THEME — extra.js
   Typewriter · Counter · Copy-to-clipboard · Live clock
   ═══════════════════════════════════════════════════════════════ */

document$.subscribe(function () {

  /* ── Only run on homepage ─────────────────────────────────── */
  const page = document.querySelector('.hk-page');
  if (!page) return;

  /* ── Typewriter ───────────────────────────────────────────── */
  const phrases = [
    'recon --target all',
    'exploit --chain ad',
    'volatility -f mem.raw',
    'nmap -sC -sV -p-',
    'gobuster dir -u ...',
    'knowledge --base load',
  ];

  const el = document.getElementById('hkTypewriter');
  if (el) {
    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;
    let pausing   = false;

    function type() {
      const phrase = phrases[phraseIdx];

      if (pausing) {
        pausing = false;
        deleting = true;
        setTimeout(type, 1200);
        return;
      }

      if (!deleting) {
        el.textContent = phrase.slice(0, ++charIdx);
        if (charIdx === phrase.length) {
          pausing = true;
          setTimeout(type, 2000);
          return;
        }
      } else {
        el.textContent = phrase.slice(0, --charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }

      setTimeout(type, deleting ? 35 : 75);
    }

    setTimeout(type, 800);
  }

  /* ── Counter animation ────────────────────────────────────── */
  const counters = document.querySelectorAll('.hk-stat__val');
  counters.forEach(function (counter) {
    const target = parseInt(counter.dataset.target, 10);
    const duration = 1200;
    const step = Math.ceil(target / (duration / 30));
    let current = 0;

    const interval = setInterval(function () {
      current = Math.min(current + step, target);
      counter.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 30);
  });

  /* ── Copy to clipboard ────────────────────────────────────── */
  document.querySelectorAll('.hk-cmd__copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const text = btn.dataset.copy;
      if (!text) return;

      navigator.clipboard.writeText(text).then(function () {
        const original = btn.textContent;
        btn.textContent = 'COPIED';
        btn.classList.add('hk-copied');
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('hk-copied');
        }, 1500);
      }).catch(function () {
        /* fallback for older browsers */
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
    });
  });

  /* ── Live clock ───────────────────────────────────────────── */
  const clockEl = document.getElementById('hkClock');
  if (clockEl) {
    function updateClock() {
      const now  = new Date();
      const pad  = n => String(n).padStart(2, '0');
      clockEl.textContent =
        now.getFullYear() + '-' +
        pad(now.getMonth() + 1) + '-' +
        pad(now.getDate()) + ' ' +
        pad(now.getHours()) + ':' +
        pad(now.getMinutes()) + ':' +
        pad(now.getSeconds()) + ' UTC+0';
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ── Card entrance animation ──────────────────────────────── */
  document.querySelectorAll('.hk-card').forEach(function (card, i) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease, background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease';
    setTimeout(function () {
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + i * 80);
  });

  /* ── Feed entrance animation ──────────────────────────────── */
  document.querySelectorAll('.hk-feed__item').forEach(function (item, i) {
    item.style.opacity = '0';
    setTimeout(function () {
      item.style.transition = 'opacity 0.35s ease';
      item.style.opacity    = '1';
    }, 200 + i * 80);
  });

});