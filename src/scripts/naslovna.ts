type Prica = { naziv: string; skraceno: string; boja: string; link: string; dugme: string; slajdovi: string[] };

const cl = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function animacija() {
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  if (!intro) return;
  const smanji = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (smanji.matches) return;

  intro.classList.add('anim');
  const stage = intro.querySelector<HTMLElement>('.stage')!;
  const tekst = intro.querySelector<HTMLElement>('[data-tekst]')!;
  const vrh = intro.querySelector<HTMLElement>('.topC')!;
  const strelica = intro.querySelector<HTMLElement>('[data-strelica]')!;
  const senka = intro.querySelector<HTMLElement>('[data-senka]')!;
  const profil = intro.querySelector<HTMLElement>('[data-profil]')!;
  const tiles = Array.from(intro.querySelectorAll<HTMLElement>('.tile')).map((el) => ({
    el,
    r: Number(el.dataset.r),
    c: Number(el.dataset.c),
    back: el.querySelector<HTMLElement>('.back')!,
    front: el.querySelector<HTMLElement>('.front')!,
    fimg: el.querySelector<HTMLElement>('.fimg')!,
    x: 0, y: 0, w: 0, h: 0,
  }));

  let W = 0, H = 0, gx = 0, gy = 0, gw = 0, gh = 0;
  let poslednji = -1;

  const izmeri = () => {
    tiles.forEach((t) => { t.el.style.transform = ''; t.el.style.width = ''; t.el.style.height = ''; });
    const s = stage.getBoundingClientRect();
    W = s.width; H = s.height;
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
    tiles.forEach((t) => {
      const r = t.el.getBoundingClientRect();
      t.x = r.left - s.left; t.y = r.top - s.top; t.w = r.width; t.h = r.height;
      minX = Math.min(minX, t.x); minY = Math.min(minY, t.y);
      maxX = Math.max(maxX, t.x + t.w); maxY = Math.max(maxY, t.y + t.h);
    });
    gx = minX; gy = minY; gw = maxX - minX; gh = maxY - minY;
    poslednji = -1;
    crtaj();
  };

  const napredak = () => {
    const r = intro.getBoundingClientRect();
    const dug = r.height - window.innerHeight;
    return dug > 0 ? cl(-r.top / dug) : 1;
  };

  const crtaj = () => {
    const p = napredak();
    if (Math.abs(p - poslednji) < 0.0005) return;
    poslednji = p;
    const e = ease(cl(p / 0.5));
    const iw = lerp(W, gw, e), ih = lerp(H, gh, e);
    tiles.forEach((t) => {
      const sx = (t.c * W) / 3, sy = (t.r * H) / 3;
      const w = lerp(W / 3, t.w, e), h = lerp(H / 3, t.h, e);
      const x = lerp(sx, t.x, e), y = lerp(sy, t.y, e);
      t.el.style.width = w + 'px';
      t.el.style.height = h + 'px';
      t.el.style.transform = `translate3d(${x - t.x}px, ${y - t.y}px, 0)`;
      const ox = lerp(sx, t.x - gx, e), oy = lerp(sy, t.y - gy, e);
      t.fimg.style.width = iw + 'px';
      t.fimg.style.height = ih + 'px';
      t.fimg.style.transform = `translate3d(${-ox}px, ${-oy}px, 0)`;
      const f = cl((p - (0.56 + (t.r + t.c) * 0.035)) / 0.12);
      if (f < 0.5) {
        t.front.style.transform = `scaleX(${1 - f * 2})`;
        t.front.style.visibility = 'visible';
        t.back.style.transform = 'scaleX(0)';
      } else {
        t.front.style.visibility = 'hidden';
        t.back.style.transform = f >= 1 ? '' : `scaleX(${f * 2 - 1})`;
      }
      t.el.style.borderRadius = (4 * e) + 'px';
      t.el.style.pointerEvents = p > 0.86 ? 'auto' : 'none';
      t.el.tabIndex = p > 0.86 ? 0 : -1;
    });
    const to = 1 - cl(p / 0.18);
    tekst.style.opacity = String(to);
    tekst.style.transform = `translateY(${-30 * (1 - to)}px)`;
    tekst.style.visibility = to <= 0.01 ? 'hidden' : 'visible';
    vrh.style.opacity = String(to);
    vrh.style.visibility = to <= 0.01 ? 'hidden' : 'visible';
    strelica.style.opacity = String(to);
    strelica.style.visibility = to <= 0.01 ? 'hidden' : 'visible';
    senka.style.opacity = String(1 - cl(p / 0.35));
    const po = cl((p - 0.72) / 0.16);
    profil.style.opacity = String(po);
    profil.style.transform = `translateY(${(1 - po) * 18}px)`;
    profil.style.visibility = po <= 0.01 ? 'hidden' : 'visible';
  };

  let ceka = false;
  const naSkrol = () => {
    if (ceka) return;
    ceka = true;
    requestAnimationFrame(() => { ceka = false; crtaj(); });
  };
  window.addEventListener('scroll', naSkrol, { passive: true });
  let t: number | undefined;
  window.addEventListener('resize', () => { clearTimeout(t); t = window.setTimeout(izmeri, 120); });
  smanji.addEventListener?.('change', () => location.reload());
  if (document.fonts?.ready) document.fonts.ready.then(izmeri);
  izmeri();

  const naKraj = (glatko: boolean) => {
    const r = intro.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top + r.height - window.innerHeight, behavior: glatko ? 'smooth' : 'auto' });
  };
  if (location.hash === '#feed') requestAnimationFrame(() => naKraj(false));
  document.querySelectorAll<HTMLAnchorElement>('[data-na-feed]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const r = intro.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + r.top + r.height - window.innerHeight, behavior: 'smooth' });
    });
  });
}

function price() {
  const podaci = document.getElementById('price-podaci');
  const prikaz = document.querySelector<HTMLElement>('[data-prikaz]');
  if (!podaci || !prikaz) return;
  const lista: Prica[] = JSON.parse(podaci.textContent || '[]');
  const KLJUC = 'ss-pogledane-price';
  const procitaj = (): number[] => { try { return JSON.parse(localStorage.getItem(KLJUC) || '[]'); } catch { return []; } };
  const sacuvaj = (a: number[]) => { try { localStorage.setItem(KLJUC, JSON.stringify(a)); } catch { /* bez memorije */ } };
  const osvezi = () => {
    const v = procitaj();
    document.querySelectorAll<HTMLElement>('[data-prsten]').forEach((el) => el.classList.toggle('seen', v.includes(Number(el.dataset.prsten))));
  };
  osvezi();

  const kartica = prikaz.querySelector<HTMLElement>('[data-kartica]')!;
  const trake = prikaz.querySelector<HTMLElement>('[data-trake]')!;
  const ime = prikaz.querySelector<HTMLElement>('[data-ime]')!;
  const broj = prikaz.querySelector<HTMLElement>('[data-broj]')!;
  const tekst = prikaz.querySelector<HTMLElement>('[data-tekst-price]')!;
  const otvori = prikaz.querySelector<HTMLAnchorElement>('[data-otvori]')!;
  let k = -1, s = 0;
  let izvor: HTMLElement | null = null;

  const prikazi = () => {
    const p = lista[k];
    kartica.style.background = p.boja;
    ime.textContent = p.naziv;
    broj.textContent = `${s + 1} / ${p.slajdovi.length}`;
    tekst.textContent = p.slajdovi[s];
    otvori.href = p.link;
    otvori.textContent = `${p.dugme} →`;
    trake.innerHTML = '';
    p.slajdovi.forEach((_x, i) => {
      const seg = document.createElement('span');
      seg.className = i < s ? 'seg done' : i === s ? 'seg cur' : 'seg';
      const ii = document.createElement('i');
      if (i === s) ii.addEventListener('animationend', () => dalje());
      seg.appendChild(ii);
      trake.appendChild(seg);
    });
  };
  const zatvori = () => {
    prikaz.classList.remove('open');
    prikaz.hidden = true;
    document.body.style.overflow = '';
    k = -1;
    izvor?.focus();
  };
  const dalje = () => { if (k < 0) return; if (s < lista[k].slajdovi.length - 1) { s++; prikazi(); } else zatvori(); };
  const nazad = () => { if (k < 0) return; if (s > 0) { s--; prikazi(); } };
  const pokreni = (i: number, el: HTMLElement) => {
    izvor = el; k = i; s = 0;
    const v = procitaj(); if (!v.includes(i)) { v.push(i); sacuvaj(v); }
    osvezi();
    prikaz.hidden = false;
    prikaz.classList.add('open');
    document.body.style.overflow = 'hidden';
    prikazi();
    prikaz.querySelector<HTMLElement>('[data-zatvori]')!.focus();
  };

  document.querySelectorAll<HTMLElement>('[data-prica]').forEach((el) => el.addEventListener('click', () => pokreni(Number(el.dataset.prica), el)));
  prikaz.querySelector('[data-zatvori]')!.addEventListener('click', zatvori);
  prikaz.querySelector('[data-dalje]')!.addEventListener('click', dalje);
  prikaz.querySelector('[data-nazad]')!.addEventListener('click', nazad);
  prikaz.addEventListener('click', (e) => { if (e.target === prikaz) zatvori(); });
  document.addEventListener('keydown', (e) => {
    if (k < 0) return;
    if (e.key === 'Escape') zatvori();
    if (e.key === 'ArrowRight') dalje();
    if (e.key === 'ArrowLeft') nazad();
  });
}

export function pokreniNaslovnu() {
  animacija();
  price();
}
