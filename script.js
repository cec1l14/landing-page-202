// Revela os itens da linha do tempo ao rolar a página
const items = document.querySelectorAll('.timeline li');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  items.forEach((li) => io.observe(li));
} else {
  items.forEach((li) => li.classList.add('visible'));
}

// Destaca no menu a seção atual
const links = document.querySelectorAll('.nav nav a');
const sections = [...links].map((a) => document.querySelector(a.getAttribute('href')));
window.addEventListener('scroll', () => {
  const y = window.scrollY + 120;
  sections.forEach((s, i) => {
    if (!s) return;
    links[i].classList.toggle('active', y >= s.offsetTop && y < s.offsetTop + s.offsetHeight);
  });
}, { passive: true });

// Pontos de luz: estrelas que cintilam no fundo da seção do prisma e faíscas que surgem junto ao mouse
(() => {
  const hero = document.getElementById('topo');
  const cv = document.getElementById('stars');
  if (!hero || !cv) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = cv.getContext('2d');
  let w = 0, h = 0, stars = [];
  const sparks = [];
  const bursts = [];
  let lastT = 0;

  function makeStars() {
    const n = Math.round((w * h) / 2400);
    stars = Array.from({ length: n }, () => {
      const big = Math.random() < 0.06;
      return {
        x: Math.random() * w, y: Math.random() * h,
        r: big ? 1.4 + Math.random() * 1.0 : 0.4 + Math.random() * 0.9,
        base: 0.4 + Math.random() * 0.6,
        speed: 0.4 + Math.random() * 1.4, phase: Math.random() * Math.PI * 2,
        // quase branco, com um leve tom de cor
        hue: Math.random() * 360, big
      };
    });
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
    if (reduce) draw(0);
  }

  function dot(x, y, r, color, alpha, glow) {
    if (glow) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
      g.addColorStop(0, color.replace('A', alpha * 0.55));
      g.addColorStop(1, color.replace('A', 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = color.replace('A', alpha);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    const t = now / 1000;
    for (const s of stars) {
      const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
      dot(s.x, s.y, s.r, `hsla(${s.hue}, 35%, 88%, A)`, s.base * tw, s.big);
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i], age = (now - p.born) / p.life;
      if (age >= 1) { sparks.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy;
      const fade = Math.sin(Math.PI * age); // surge e some devagar
      dot(p.x, p.y, p.r, `hsla(${p.hue}, 45%, 72%, A)`, 0.9 * fade, true);
    }
    // brilho do clique: núcleo claro e halo maior que se expande e some
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i], a = (now - b.born) / 1200;
      if (a >= 1) { bursts.splice(i, 1); continue; }
      const r = 28 + 120 * (1 - Math.pow(1 - a, 2.5));
      const al = 0.85 * Math.pow(1 - a, 1.4);
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, `hsla(${b.hue}, 40%, 95%, ${al})`);
      g.addColorStop(0.35, `hsla(${b.hue}, 55%, 72%, ${al * 0.55})`);
      g.addColorStop(1, `hsla(${(b.hue + 40) % 360}, 55%, 60%, 0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  function frame(now) { draw(now); requestAnimationFrame(frame); }

  hero.addEventListener('pointermove', (e) => {
    if (reduce) return;
    const now = performance.now();
    if (now - lastT < 70) return;
    lastT = now;
    const r = hero.getBoundingClientRect();
    const hue = (now * 0.02) % 360; // cor deriva devagar pelo arco-íris
    for (let k = 0; k < 2; k++) {
      sparks.push({
        x: e.clientX - r.left + (Math.random() - 0.5) * 50,
        y: e.clientY - r.top + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18 - 0.03,
        r: 0.7 + Math.random() * 1.4, born: now, life: 2800 + Math.random() * 2200, hue
      });
    }
    if (sparks.length > 140) sparks.splice(0, sparks.length - 140);
  }, { passive: true });

  hero.addEventListener('pointerdown', (e) => {
    if (reduce) return;
    const now = performance.now(), r = hero.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top, hue = (now * 0.02) % 360;
    bursts.push({ x, y, born: now, hue });
    if (bursts.length > 6) bursts.shift();
    for (let k = 0; k < 10; k++) {   // faíscas maiores saindo do ponto do clique
      const ang = Math.random() * Math.PI * 2, sp = 0.3 + Math.random() * 0.9;
      sparks.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        r: 1.2 + Math.random() * 1.6, born: now, life: 1600 + Math.random() * 1200, hue: (hue + Math.random() * 60) % 360 });
    }
    if (sparks.length > 180) sparks.splice(0, sparks.length - 180);
  });

  addEventListener('resize', resize); resize();
  if (!reduce) requestAnimationFrame(frame);
})();

// Altura da barra de navegação, usada para encaixar as seções na janela
const nav = document.querySelector('.nav');
function setNav() { document.documentElement.style.setProperty('--nav', nav.offsetHeight + 'px'); }
addEventListener('resize', setNav); setNav();

// Ao rolar para baixo a partir do prisma, a página leva o usuário até o nome "Pink Floyd"
(() => {
  const nome = document.getElementById('nome');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let locked = false, touchY = null;
  const target = () => nome.offsetTop - nav.offsetHeight;
  const inPrism = () => scrollY < target() - 10;
  function go() {
    if (locked) return;
    locked = true;
    scrollTo({ top: target(), behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(() => { locked = false; }, reduce ? 60 : 1200);
  }
  addEventListener('wheel', (e) => {
    if (locked) { e.preventDefault(); return; }
    if (e.deltaY > 8 && inPrism()) { e.preventDefault(); go(); }
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', ' '].includes(e.key) && inPrism() && !e.target.closest('input,textarea')) {
      e.preventDefault(); go();
    }
  });
  addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => {
    if (locked) { e.preventDefault(); return; }
    if (touchY !== null && touchY - e.touches[0].clientY > 24 && inPrism()) { e.preventDefault(); go(); }
  }, { passive: false });
})();

// Citações que acompanham o movimento do mouse na seção do nome
(() => {
  const sec = document.getElementById('nome');
  const box = document.getElementById('trail');
  if (!sec || !box || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Edite esta lista para trocar o que aparece. Por ora são títulos de músicas e seus álbuns.
  const quotes = [
    'Astronomy Domine · The Piper at the Gates of Dawn',
    'Interstellar Overdrive · The Piper at the Gates of Dawn',
    'Set the Controls for the Heart of the Sun · A Saucerful of Secrets',
    'Echoes · Meddle',
    'Breathe · The Dark Side of the Moon',
    'Time · The Dark Side of the Moon',
    'Money · The Dark Side of the Moon',
    'Us and Them · The Dark Side of the Moon',
    'Brain Damage · The Dark Side of the Moon',
    'Eclipse · The Dark Side of the Moon',
    'Shine On You Crazy Diamond · Wish You Were Here',
    'Welcome to the Machine · Wish You Were Here',
    'Wish You Were Here · Wish You Were Here',
    'Dogs · Animals',
    'Pigs (Three Different Ones) · Animals',
    'Another Brick in the Wall · The Wall',
    'Hey You · The Wall',
    'Comfortably Numb · The Wall',
    'Learning to Fly · A Momentary Lapse of Reason',
    'High Hopes · The Division Bell',
    'Marooned · The Division Bell',
    'Louder than Words · The Endless River'
  ];
  let i = 0, lastX = null, lastY = 0, lastT = 0;

  sec.addEventListener('pointermove', (e) => {
    const now = performance.now();
    const r = sec.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    // ritmo calmo: nova citação a cada 90 px de caminho e a cada 260 ms, em sequência
    if (lastX !== null && (Math.hypot(x - lastX, y - lastY) < 90 || now - lastT < 260)) return;
    lastX = x; lastY = y; lastT = now;
    const q = document.createElement('span');
    q.className = 'quote';
    q.textContent = quotes[i++ % quotes.length];
    q.style.top = y + 'px';
    q.style.setProperty('--h', ((now * 0.02) % 360).toFixed(0));
    q.style.setProperty('--r', ((Math.random() - 0.5) * 8).toFixed(1) + 'deg');
    q.addEventListener('animationend', () => q.remove());
    box.appendChild(q);
    const half = q.offsetWidth / 2 + 12; // mantém a citação inteira dentro da seção
    q.style.left = Math.min(Math.max(x, half), r.width - half) + 'px';
    while (box.children.length > 12) box.firstChild.remove();
  }, { passive: true });
  sec.addEventListener('pointerleave', () => { lastX = null; });
})();

// "Conhecer a banda": cortina de cores do arco-íris cobre a tela, a página passa para a próxima seção e a cortina se abre
(() => {
  const btn = document.querySelector('.name .btn');
  const dest = document.getElementById('integrantes');
  if (!btn || !dest) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const jump = (behavior) => scrollTo({ top: dest.offsetTop - nav.offsetHeight, behavior });
  let busy = false;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (busy) return;
    if (reduce) { jump('auto'); return; }
    busy = true;
    const ov = document.createElement('div');
    ov.className = 'rainbow-wipe';
    document.body.appendChild(ov);
    // as cores escorrem lado a lado enquanto a cortina atravessa a tela
    ov.animate([{ backgroundPosition: '0% 50%' }, { backgroundPosition: '100% 50%' }], { duration: 1700, easing: 'linear' });
    const ease = 'cubic-bezier(.65,0,.35,1)';
    const cover = ov.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
      { duration: 700, easing: ease, fill: 'forwards' });
    cover.onfinish = () => {
      jump('instant');
      const open = ov.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }],
        { duration: 800, easing: ease, fill: 'forwards' });
      open.onfinish = () => { ov.remove(); busy = false; };
    };
  });
})();

// Integrantes: cards deslizantes (arrastar, setas, pontos) sincronizados com o brilho do desenho
(() => {
  const deck = document.getElementById('deck');
  if (!deck) return;
  const cards = [...deck.querySelectorAll('.mcard')];
  const figs = [...document.querySelectorAll('.member')];
  const dots = [...document.querySelectorAll('.dot')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let idx = -1;
  const clamp = (i) => Math.max(0, Math.min(cards.length - 1, i));
  const step = () => cards[1].offsetLeft - cards[0].offsetLeft;

  function setActive(i) {
    if (i === idx) return;
    idx = i;
    cards.forEach((c, k) => c.classList.toggle('active', k === i));
    figs.forEach((f, k) => f.classList.toggle('active', k === i));
    dots.forEach((d, k) => d.classList.toggle('active', k === i));
  }
  function goTo(i) {
    i = clamp(i);
    deck.scrollTo({ left: i * step(), behavior: reduce ? 'auto' : 'smooth' });
    setActive(i);
  }
  deck.addEventListener('scroll', () => setActive(clamp(Math.round(deck.scrollLeft / step()))), { passive: true });
  document.getElementById('prev').addEventListener('click', () => goTo(idx - 1));
  document.getElementById('next').addEventListener('click', () => goTo(idx + 1));
  dots.forEach((d) => d.addEventListener('click', () => goTo(+d.dataset.i)));
  figs.forEach((f) => {
    f.addEventListener('click', () => goTo(+f.dataset.i));
    f.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(+f.dataset.i); }
    });
  });
  deck.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(idx + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(idx - 1); }
  });

  // arrastar com o mouse (no toque, a rolagem lateral já é nativa)
  let drag = null;
  deck.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, left: deck.scrollLeft };
    deck.classList.add('dragging');
    deck.setPointerCapture(e.pointerId);
  });
  deck.addEventListener('pointermove', (e) => {
    if (!drag) return;
    deck.scrollLeft = drag.left - (e.clientX - drag.x);
  });
  const endDrag = () => {
    if (!drag) return;
    deck.classList.remove('dragging');
    drag = null;
    goTo(Math.round(deck.scrollLeft / step()));
  };
  deck.addEventListener('pointerup', endDrag);
  deck.addEventListener('pointercancel', endDrag);

  setActive(0);
})();
