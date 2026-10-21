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
function mulberry32(a) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function initStars(hero, cv) {
  if (!hero || !cv) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = cv.getContext('2d');
  let w = 0, h = 0, stars = [];
  const sparks = [];
  const bursts = [];
  let lastT = 0;

  function makeStars() {
    const rnd = mulberry32(2024);
    const n = Math.round((w * h) / 2400);
    stars = Array.from({ length: n }, () => {
      const big = rnd() < 0.06;
      return {
        x: rnd() * w, y: rnd() * h,
        r: big ? 1.4 + rnd() * 1.0 : 0.4 + rnd() * 0.9,
        base: 0.4 + rnd() * 0.6,
        speed: 0.4 + rnd() * 1.4, phase: rnd() * Math.PI * 2,
        // quase branco, com um leve tom de cor
        hue: rnd() * 360, big
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
}
initStars(document.getElementById('topo'), document.getElementById('stars'));
initStars(document.getElementById('ciclo'), document.getElementById('starsEnd'));

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
  // setas do teclado: valem enquanto esta seção está no centro da tela
  addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (e.target.closest('input,textarea,select')) return;
    const r = document.getElementById('integrantes').getBoundingClientRect();
    if (!(r.top < innerHeight / 2 && r.bottom > innerHeight / 2)) return;
    e.preventDefault();
    goTo(idx + (e.key === 'ArrowRight' ? 1 : -1));
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

// Álbuns: a capa acompanha o mouse e cada rolagem na seção avança para o próximo álbum
(() => {
  const sec = document.getElementById('albuns');
  const stage = document.getElementById('albStage');
  if (!sec || !stage) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const covers = [...sec.querySelectorAll('.alb-cover')];
  const infos = [...sec.querySelectorAll('.alb-info')];
  const dots = [...sec.querySelectorAll('.adot')];
  const count = document.getElementById('albCount');
  const tilt = document.getElementById('albTilt');
  const N = covers.length;
  const wide = () => innerWidth > 860;
  let idx = 0, coolUntil = 0, holdUntil = 0, pulling = false, touchY = null;

  function setActive(i, dir) {
    i = Math.max(0, Math.min(N - 1, i));
    idx = i;
    covers.forEach((c, k) => {
      c.classList.toggle('active', k === i);
      c.classList.toggle('past', k < i);
    });
    infos.forEach((f, k) => f.classList.toggle('active', k === i));
    dots.forEach((d, k) => d.classList.toggle('active', k === i));
    count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
    sec.style.setProperty('--ac', infos[i].dataset.ac);
  }
  setActive(0);

  document.getElementById('albPrev').addEventListener('click', () => setActive(idx - 1));
  document.getElementById('albNext').addEventListener('click', () => setActive(idx + 1));
  dots.forEach((d) => d.addEventListener('click', () => setActive(+d.dataset.i)));

  // a seção acompanha o mouse: a capa se inclina e o brilho de fundo segue o cursor
  sec.addEventListener('pointermove', (e) => {
    const r = sec.getBoundingClientRect();
    sec.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    sec.style.setProperty('--my', (e.clientY - r.top) + 'px');
    if (reduce || !wide()) return;
    const s = stage.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (e.clientX - (s.left + s.width / 2)) / (r.width / 2)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - (s.top + s.height / 2)) / (r.height / 2)));
    tilt.style.setProperty('--ry', (nx * 16).toFixed(1) + 'deg');
    tilt.style.setProperty('--rx', (-ny * 12).toFixed(1) + 'deg');
    tilt.style.setProperty('--gx', (50 + nx * 40).toFixed(0) + '%');
    tilt.style.setProperty('--gy', (35 + ny * 40).toFixed(0) + '%');
  }, { passive: true });
  sec.addEventListener('pointerleave', () => {
    tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg');
  });

  // a rolagem troca de álbum enquanto a seção ocupa a tela; nas pontas, a página segue normalmente
  const navH = () => nav.offsetHeight;
  const fills = () => { const r = sec.getBoundingClientRect(); return r.top <= navH() + 6 && r.bottom >= innerHeight - 6; };
  const alignTop = () => sec.offsetTop - navH();

  function pull(fromBelow) {
    pulling = true;
    if (fromBelow) setActive(N - 1);
    scrollTo({ top: alignTop(), behavior: reduce ? 'auto' : 'smooth' });
    holdUntil = performance.now() + 900;
    setTimeout(() => { pulling = false; }, reduce ? 60 : 950);
  }

  // decide o que fazer com um gesto de rolagem (dir = +1 para baixo, -1 para cima); true = gesto consumido
  function handle(dir) {
    if (!wide()) return false;
    const now = performance.now();
    if (pulling) return true;
    const r = sec.getBoundingClientRect();
    if (fills()) {
      if (now < holdUntil) return true;
      const next = idx + dir;
      if (next < 0 || next > N - 1) return false;       // nas pontas, libera a rolagem da página
      if (now < coolUntil) return true;
      setActive(next);
      coolUntil = now + 750;
      if (next === 0 || next === N - 1) holdUntil = now + 900;   // evita que a inércia já saia da seção
      return true;
    }
    // entrando pelo topo ou por baixo: leva a seção até a tela inteira
    if (dir > 0 && r.top > navH() + 6 && r.top < innerHeight * 0.55) { pull(false); return true; }
    if (dir < 0 && r.bottom > navH() + 6 && r.bottom < innerHeight * 0.55 && r.top < 0) { pull(true); return true; }
    return false;
  }

  addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 4) return;
    if (handle(e.deltaY > 0 ? 1 : -1)) e.preventDefault();
  }, { passive: false });

  addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,button')) return;
    const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
    if (dir && handle(dir)) e.preventDefault();
  });

  // setas esquerda/direita trocam de álbum enquanto a seção está no centro da tela
  addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (e.target.closest('input,textarea,select')) return;
    const r = sec.getBoundingClientRect();
    if (!(r.top < innerHeight / 2 && r.bottom > innerHeight / 2)) return;
    e.preventDefault();
    setActive(idx + (e.key === 'ArrowRight' ? 1 : -1));
  });

  addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => {
    if (touchY === null) return;
    const dy = touchY - e.touches[0].clientY;
    if (Math.abs(dy) < 28) return;
    if (handle(dy > 0 ? 1 : -1)) { e.preventDefault(); touchY = e.touches[0].clientY; }
  }, { passive: false });
})();

// Linha do tempo: uma lua percorre uma trilha pelo universo, passando pelas quatro fases a cada marco
(() => {
  const sec = document.getElementById('timeline');
  const view = document.getElementById('tlView');
  const world = document.getElementById('tlWorld');
  const cv = document.getElementById('tlStars');
  if (!sec || !view || !world) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...sec.querySelectorAll('.tl-card')];
  const N = cards.length;
  const count = document.getElementById('tlCount');
  const PHASES = ['Lua nova', 'Quarto crescente', 'Lua cheia', 'Quarto minguante'];
  const NS = 'http://www.w3.org/2000/svg';
  const wide = () => innerWidth > 860;
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  let Wv = 0, H = 0, pts = [], lens = [], total = 1;
  let target = 0, s = 0, activeIdx = -1, lastT = performance.now();
  let moonX = 0;

  // --- trilha (SVG), marcos e lua ---
  const svg = el('svg', {});
  const defs = el('defs', {}, svg);
  const grad = el('linearGradient', { id: 'tlRainbow', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
  [['0', '#e40303'], ['.2', '#ff8c00'], ['.4', '#ffed00'], ['.6', '#2dbb2d'], ['.8', '#1e90ff'], ['1', '#8a2be2']]
    .forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, grad));
  const glow = el('filter', { id: 'tlGlow', x: '-10%', y: '-60%', width: '120%', height: '220%' }, defs);
  el('feGaussianBlur', { stdDeviation: 4 }, glow);
  const base = el('path', { fill: 'none', stroke: 'rgba(255,255,255,.22)', 'stroke-width': 2, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round' }, svg);
  const litGlow = el('path', { fill: 'none', stroke: 'url(#tlRainbow)', 'stroke-width': 7, 'stroke-linecap': 'round', filter: 'url(#tlGlow)', opacity: .55 }, svg);
  const lit = el('path', { fill: 'none', stroke: 'url(#tlRainbow)', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
  world.appendChild(svg);

  const nodes = cards.map((c, i) => {
    const d = document.createElement('div');
    d.className = 'tl-node';
    d.style.setProperty('--nc', `hsl(${Math.round(i / (N - 1) * 280)} 80% 66%)`);
    d.innerHTML = '<span class="dot"></span><span class="yr">' + c.dataset.year + '</span>';
    d.addEventListener('click', () => setTarget(i));
    world.appendChild(d);
    return d;
  });

  // lua com fases: parte iluminada = meia-lua + elipse do terminador
  const moon = document.createElement('div');
  moon.className = 'tl-moon';
  moon.innerHTML =
    '<svg viewBox="-30 -30 60 60" aria-hidden="true"><defs>' +
    '<radialGradient id="tlMoonG" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fffef2"/><stop offset=".6" stop-color="#d4d8e2"/><stop offset="1" stop-color="#9aa0b2"/></radialGradient>' +
    '<clipPath id="tlMoonClip"><path id="tlMoonClipPath" d=""/></clipPath></defs>' +
    '<circle r="28" fill="#10131c" stroke="rgba(255,255,255,.2)" stroke-width="1"/>' +
    '<g id="tlMoonGrp"><path id="tlMoonLit" d="" fill="url(#tlMoonG)"/>' +
    '<g clip-path="url(#tlMoonClip)" fill="rgba(70,76,92,.4)"><circle cx="-8" cy="-10" r="5"/><circle cx="10" cy="6" r="7"/>' +
    '<circle cx="-7" cy="13" r="3.4"/><circle cx="13" cy="-14" r="3"/><circle cx="0" cy="-1" r="3.6"/></g></g></svg>';
  world.appendChild(moon);
  const moonLit = moon.querySelector('#tlMoonLit');
  const moonClip = moon.querySelector('#tlMoonClipPath');
  const moonGrp = moon.querySelector('#tlMoonGrp');

  function moonPath(k) {
    const R = 28, rx = R * Math.abs(1 - 2 * k), sweep = k > 0.5 ? 1 : 0;
    return `M0 ${-R} A${R} ${R} 0 0 1 0 ${R} A${rx.toFixed(2)} ${R} 0 0 ${sweep} 0 ${-R} Z`;
  }

  // --- geometria da trilha ---
  function catmull(p) {
    let d = `M${p[0].x} ${p[0].y}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += ` C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(1)},` +
           `${(p2.x - (p3.x - p1.x) / 6).toFixed(1)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(1)},${p2.x} ${p2.y}`;
    }
    return d;
  }
  function lengthNear(p) {
    let best = 0, bd = Infinity;
    const S = 1500;
    for (let k = 0; k <= S; k++) {
      const q = base.getPointAtLength(total * k / S);
      const dd = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
      if (dd < bd) { bd = dd; best = k; }
    }
    return total * best / S;
  }
  function layout() {
    Wv = view.clientWidth; H = view.clientHeight;
    if (!Wv || !H) return;
    const step = Math.max(240, Math.min(380, Wv * 0.34));
    pts = cards.map((_, i) => ({ x: 120 + i * step, y: H * 0.64 + Math.sin(i * 1.15 + 0.4) * H * 0.13 }));
    const worldW = pts[N - 1].x + Wv;
    world.style.width = worldW + 'px'; world.style.height = H + 'px';
    svg.setAttribute('width', worldW); svg.setAttribute('height', H);
    grad.setAttribute('x2', worldW);
    const d = catmull(pts);
    base.setAttribute('d', d); lit.setAttribute('d', d); litGlow.setAttribute('d', d);
    total = base.getTotalLength();
    lens = pts.map(lengthNear);
    nodes.forEach((n, i) => { n.style.left = pts[i].x + 'px'; n.style.top = pts[i].y + 'px'; });
    cv && resizeStars();
    render(performance.now());
  }

  // --- quadro a quadro ---
  function render(now) {
    if (!pts.length) return;
    const i0 = Math.min(Math.floor(s), N - 1), i1 = Math.min(i0 + 1, N - 1), f = s - i0;
    const L = lens[i0] + (lens[i1] - lens[i0]) * f;
    const P = base.getPointAtLength(L);
    moonX = P.x;
    const bob = reduce ? 0 : Math.sin(now / 900) * 3;
    moon.style.transform = `translate(${P.x - 28}px,${P.y - 28 - 58 + bob}px)`;
    world.style.transform = `translateX(${Wv * 0.3 - P.x}px)`;
    const da = `${L} ${total}`;
    lit.style.strokeDasharray = da; litGlow.style.strokeDasharray = da;
    nodes.forEach((n, i) => {
      const g = Math.max(0, 1 - Math.abs(s - i) / 0.95);
      n.style.setProperty('--g', (g * g).toFixed(3));
    });
    // fase contínua: cada marco avança um quarto do ciclo (nova, crescente, cheia, minguante)
    const p = (s / 4) % 1;
    const k = (1 - Math.cos(2 * Math.PI * p)) / 2;
    const d = moonPath(k);
    moonLit.setAttribute('d', d); moonClip.setAttribute('d', d);
    moonGrp.setAttribute('transform', p < 0.5 ? '' : 'scale(-1 1)');
    moon.style.filter = `drop-shadow(0 0 ${(6 + 16 * k).toFixed(1)}px rgba(200,215,255,${(0.25 + 0.45 * k).toFixed(2)}))`;
    const idx = Math.max(0, Math.min(N - 1, Math.round(s)));
    if (idx !== activeIdx) {
      activeIdx = idx;
      cards.forEach((c, j) => c.classList.toggle('active', j === idx));
      sec.style.setProperty('--tc', nodes[idx].style.getPropertyValue('--nc'));
    }
    count.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0') + ' · ' + PHASES[idx % 4];
  }

  function setTarget(i) { target = Math.max(0, Math.min(N - 1, i)); if (reduce) s = target; }

  // --- fundo de estrelas com paralaxe: acompanha o movimento da lua ---
  let stars = [], sw = 0, sh = 0;
  const sctx = cv ? cv.getContext('2d') : null;
  function resizeStars() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    sw = sec.clientWidth; sh = sec.clientHeight;
    cv.width = sw * dpr; cv.height = sh * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(sw * sh / 3200);
    stars = Array.from({ length: n }, () => {
      const layer = Math.random();
      return {
        x: Math.random() * sw, y: Math.random() * sh,
        z: layer < .5 ? 0.12 : layer < .85 ? 0.3 : 0.6,
        r: layer < .5 ? 0.5 : layer < .85 ? 0.9 : 1.5,
        ph: Math.random() * 6.28, sp: 0.5 + Math.random() * 1.5, h: Math.random() * 360
      };
    });
  }
  function drawStars(now) {
    sctx.clearRect(0, 0, sw, sh);
    for (const st of stars) {
      let x = (st.x - moonX * st.z) % sw; if (x < 0) x += sw;
      const a = (reduce ? .8 : .45 + .45 * Math.sin(now / 1000 * st.sp + st.ph)) * (st.z > .5 ? 1 : .8);
      sctx.fillStyle = `hsla(${st.h},35%,88%,${a.toFixed(2)})`;
      sctx.beginPath(); sctx.arc(x, st.y, st.r, 0, 6.2832); sctx.fill();
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    const diff = target - s;
    if (Math.abs(diff) > 0.0005) s += diff * (1 - Math.exp(-dt * 4.2)); else s = target;
    render(now);
    if (sctx) drawStars(now);
    requestAnimationFrame(frame);
  }

  document.getElementById('tlPrev').addEventListener('click', () => setTarget(Math.round(target) - 1));
  document.getElementById('tlNext').addEventListener('click', () => setTarget(Math.round(target) + 1));

  // --- entrada: a rolagem avança um marco por vez enquanto a seção ocupa a tela ---
  let coolUntil = 0, holdUntil = 0, pulling = false, touchY = null, touchX = null;
  const navH = () => nav.offsetHeight;
  const fills = () => { const r = sec.getBoundingClientRect(); return r.top <= navH() + 6 && r.bottom >= innerHeight - 6; };
  const alignTop = () => sec.offsetTop - navH();

  function pull(fromBelow) {
    pulling = true;
    if (fromBelow) setTarget(N - 1);
    scrollTo({ top: alignTop(), behavior: reduce ? 'auto' : 'smooth' });
    holdUntil = performance.now() + 900;
    setTimeout(() => { pulling = false; }, reduce ? 60 : 950);
  }
  function handle(dir) {
    if (!wide()) return false;
    const now = performance.now();
    if (pulling) return true;
    const r = sec.getBoundingClientRect();
    if (fills()) {
      if (now < holdUntil) return true;
      const cur = Math.round(target), next = cur + dir;
      if (next < 0 || next > N - 1) return false;
      if (now < coolUntil) return true;
      setTarget(next);
      coolUntil = now + 800;
      if (next === 0 || next === N - 1) holdUntil = now + 900;
      return true;
    }
    if (dir > 0 && r.top > navH() + 6 && r.top < innerHeight * 0.55) { pull(false); return true; }
    if (dir < 0 && r.bottom > navH() + 6 && r.bottom < innerHeight * 0.55 && r.top < 0) { pull(true); return true; }
    return false;
  }

  addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 4) return;
    if (handle(e.deltaY > 0 ? 1 : -1)) e.preventDefault();
  }, { passive: false });

  addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,select')) return;
    const r = sec.getBoundingClientRect();
    const center = r.top < innerHeight / 2 && r.bottom > innerHeight / 2;
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && center) {
      e.preventDefault();
      setTarget(Math.round(target) + (e.key === 'ArrowRight' ? 1 : -1));
      return;
    }
    if (e.target.closest('button')) return;
    const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
    if (dir && handle(dir)) e.preventDefault();
  });

  addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; touchX = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchmove', (e) => {
    if (touchY === null) return;
    const dy = touchY - e.touches[0].clientY;
    if (Math.abs(dy) < 28) return;
    if (handle(dy > 0 ? 1 : -1)) { e.preventDefault(); touchY = e.touches[0].clientY; }
  }, { passive: false });
  // no celular a rolagem é livre: deslizar para os lados sobre a trilha troca de marco
  view.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) setTarget(Math.round(target) + (dx > 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  addEventListener('resize', layout);
  layout();
  setTimeout(layout, 300);
  requestAnimationFrame(frame);
})();

// Encerramento: frase final, prisma invertido e retorno automático ao topo com a inversão do prisma
(() => {
  const outro = document.getElementById('escuro');
  const fin = document.getElementById('ciclo');
  if (!outro || !fin) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const navH = () => nav.offsetHeight;
  const alignTop = (el) => el.offsetTop - navH();
  const visibleFrac = (el) => {
    const r = el.getBoundingClientRect();
    return (Math.min(r.bottom, innerHeight) - Math.max(r.top, navH())) / (innerHeight - navH());
  };

  // a frase aparece ao entrar na tela (e reaparece nas próximas visitas)
  new IntersectionObserver((es) => es.forEach((e) => outro.classList.toggle('in', e.isIntersecting)),
    { threshold: 0.45 }).observe(outro);

  let busy = false, snapLock = false, timer = null;

  // salto instantâneo ao topo (sem rolagem suave, para não mostrar as seções do meio):
  // o comportamento "auto" fica ativo por alguns quadros, até a posição ser aplicada de fato
  function jumpTop() {
    const el = document.documentElement;
    el.style.scrollBehavior = 'auto';
    scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.scrollingElement.scrollTop = 0;
    setTimeout(() => { el.style.scrollBehavior = ''; }, 250);
    const hint = document.querySelector('#topo .scroll-hint');
    if (hint) { hint.classList.remove('fade-in'); void hint.offsetWidth; hint.classList.add('fade-in'); }
  }

  // o prisma e as luzes completam a volta no lugar (as estrelas ficam paradas); ao final, a cena é idêntica à do topo
  // e a página volta ao início sem que a troca seja percebida
  async function flip() {
    if (busy) return;
    busy = true;
    clearTimeout(timer); timer = null;
    const target = alignTop(fin);
    if (Math.abs(scrollY - target) > 2) {
      scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
      await delay(reduce ? 60 : 700);
    }
    if (reduce) { jumpTop(); busy = false; return; }
    const DUR = 1500;
    document.getElementById('prism3dEnd').dispatchEvent(new CustomEvent('prism-flip', { detail: { duration: DUR } }));
    await delay(DUR + 120);
    jumpTop();
    await delay(700);   // período de silêncio: ignora a rolagem que ainda esteja em curso
    busy = false;
    check();
  }

  // depois de alguns segundos olhando o prisma invertido, o retorno ao topo é automático
  function check() {
    const on = visibleFrac(fin) >= 0.75 && !busy;
    if (on && !timer) {
      timer = setTimeout(() => { timer = null; if (visibleFrac(fin) >= 0.75) flip(); }, 5600);
    } else if (!on && timer) {
      clearTimeout(timer); timer = null;
    }
  }
  addEventListener('scroll', check, { passive: true });
  addEventListener('resize', check);

  // encaixe suave ao se aproximar de cada uma das duas seções finais
  function snapTo(el) {
    snapLock = true;
    scrollTo({ top: alignTop(el), behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(() => { snapLock = false; }, reduce ? 60 : 950);
  }
  // durante o giro e logo depois do salto, nenhuma outra rolagem (nem a do topo) deve agir
  addEventListener('wheel', (e) => {
    if (busy) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, { passive: false, capture: true });
  addEventListener('wheel', (e) => {
    if (busy || snapLock) { e.preventDefault(); return; }
    if (e.deltaY <= 8) return;
    if (visibleFrac(fin) >= 0.75) { e.preventDefault(); flip(); return; }   // rolar no fim também reinicia o ciclo
    for (const el of [outro, fin]) {
      const r = el.getBoundingClientRect();
      if (r.top > navH() + 6 && r.top < innerHeight * 0.55) { e.preventDefault(); snapTo(el); return; }
    }
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,select,button')) return;
    if (['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key) && visibleFrac(fin) >= 0.75) {
      e.preventDefault(); flip();
    }
  });
  check();
})();
