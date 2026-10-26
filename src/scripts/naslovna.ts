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

  let W = 0, H = 0, gx = 0, gy = 0, gw = 0, gh = 0, ke = 1;
  let poslednji = -1;

  // Kartice uvek zadržavaju svoju konačnu veličinu; tokom animacije se samo pomeraju i uvećavaju
  // (transform), a slika unutar njih ima obrnuto uvećanje da se ne bi razvukla.
  const izmeri = () => {
    tiles.forEach((t) => { t.el.style.transform = ''; });
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
    ke = Math.max(gw / W, gh / H);
    tiles.forEach((t) => { t.fimg.style.width = W + 'px'; t.fimg.style.height = H + 'px'; });
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
    // Slika (veličine ekrana) na početku izgleda tačno kao hero, a na kraju se smanji da pokrije mrežu.
    const k = lerp(1, ke, e);
    const ix = lerp(0, gx + (gw - W * ke) / 2, e), iy = lerp(0, gy + (gh - H * ke) * 0.12, e);
    tiles.forEach((t) => {
      const x0 = (t.c * W) / 3, y0 = (t.r * H) / 3;
      const w = lerp(W / 3, t.w, e), h = lerp(H / 3, t.h, e);
      const x = lerp(x0, t.x, e), y = lerp(y0, t.y, e);
      const sx = w / t.w, sy = h / t.h;
      t.el.style.transform = `translate3d(${x - t.x}px, ${y - t.y}px, 0) scale(${sx}, ${sy})`;
      t.fimg.style.transform = `translate3d(${(ix - x) / sx}px, ${(iy - y) / sy}px, 0) scale(${k / sx}, ${k / sy})`;
      const f = cl((p - (0.56 + (t.r + t.c) * 0.035)) / 0.12);
      if (f < 0.5) {
        t.front.style.transform = `scaleX(${1 - f * 2})`;
        t.front.style.visibility = 'visible';
        t.back.style.transform = 'scaleX(0)';
      } else {
        t.front.style.visibility = 'hidden';
        t.back.style.transform = f >= 1 ? '' : `scaleX(${f * 2 - 1})`;
      }
      t.el.classList.toggle('crtano', f >= 1);
      t.el.classList.toggle('slozena', e >= 1);
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

  // Granice dela stranice u kome se animacija odvija (u pikselima skrola).
  const pocetak = () => window.scrollY + intro.getBoundingClientRect().top;
  const kraj = () => { const r = intro.getBoundingClientRect(); return window.scrollY + r.top + r.height - window.innerHeight; };
  const skoci = (y: number) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });

  // Glatko pomeranje skrola koje sami vodimo (animacija prati skrol, pa se i ona odvrti).
  let tok = 0;
  let vodimo = false;
  const prekini = () => { tok++; vodimo = false; };
  const usporiNaKraju = (k: number) => 1 - Math.pow(1 - k, 3);
  const ubrzajIUspori = (k: number) => -(Math.cos(Math.PI * k) - 1) / 2;
  const vozi = (cilj: number, trajanje: number, posle?: () => void, kriva = ubrzajIUspori) => {
    const moj = ++tok;
    const od = window.scrollY;
    const t0 = performance.now();
    vodimo = true;
    const korak = (sad: number) => {
      if (moj !== tok) return;
      const k = cl((sad - t0) / trajanje);
      const e2 = kriva(k);
      skoci(od + (cilj - od) * e2);
      if (k < 1) requestAnimationFrame(korak);
      else { vodimo = false; posle?.(); }
    };
    requestAnimationFrame(korak);
  };

  const nacin = izaberiNacin();
  let smer = 1;
  let zadnjiY = window.scrollY;
  let dodir = false;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > zadnjiY) smer = 1; else if (y < zadnjiY) smer = -1;
    zadnjiY = y;
  }, { passive: true });
  window.addEventListener('touchstart', () => { dodir = true; }, { passive: true });
  window.addEventListener('touchend', () => { dodir = false; }, { passive: true });
  window.addEventListener('touchcancel', () => { dodir = false; }, { passive: true });

  let doFeeda: () => void;

  if (nacin === 'b') {
    // B · Dovršavanje: animacija prati prst, a kad korisnik stane, sama se dovrši.
    let mir: number | undefined;
    const dovrsi = () => {
      if (dodir || vodimo) return;
      const p = napredak();
      if (p <= 0.002 || p >= 0.998) return;
      const napred = smer > 0 ? p > 0.1 : p > 0.9;
      const cilj = napred ? kraj() : pocetak();
      const put = Math.abs(cilj - window.scrollY);
      vozi(cilj, Math.min(750, 320 + put * 0.35), undefined, usporiNaKraju);
    };
    window.addEventListener('scroll', () => {
      if (vodimo) return;
      clearTimeout(mir);
      mir = window.setTimeout(dovrsi, 170);
    }, { passive: true });
    window.addEventListener('touchend', () => { clearTimeout(mir); mir = window.setTimeout(dovrsi, 170); }, { passive: true });
    const korisnikPreuzima = () => { if (vodimo) prekini(); };
    window.addEventListener('wheel', korisnikPreuzima, { passive: true });
    window.addEventListener('touchstart', korisnikPreuzima, { passive: true });
    window.addEventListener('keydown', korisnikPreuzima);
    doFeeda = () => vozi(kraj(), 900);
  } else {
    // A · Okidač: jedan pokret skrola pokreće celu animaciju do kraja.
    const TRAJANJE = 1300;
    const igraj = (cilj: number) => { if (!vodimo) vozi(cilj, TRAJANJE); };
    const namera = (dir: number, ev: Event) => {
      if (vodimo) { if (ev.cancelable) ev.preventDefault(); return; }
      const y = window.scrollY, a = pocetak(), b = kraj();
      if (dir > 0 && y < b - 1 && y >= a - 1) { if (ev.cancelable) ev.preventDefault(); igraj(b); }
      else if (dir < 0 && y <= b + 1 && y > a + 1) { if (ev.cancelable) ev.preventDefault(); igraj(a); }
    };
    window.addEventListener('wheel', (e) => { if (Math.abs(e.deltaY) > 0) namera(Math.sign(e.deltaY), e); }, { passive: false });
    let y0 = 0;
    window.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      const dy = y0 - e.touches[0].clientY;
      if (vodimo) { if (e.cancelable) e.preventDefault(); return; }
      if (Math.abs(dy) > 6) namera(Math.sign(dy), e);
    }, { passive: false });
    window.addEventListener('keydown', (e) => {
      const el = e.target as HTMLElement;
      if (el && (el.isContentEditable || /input|textarea|select/i.test(el.tagName))) return;
      const dole = ['ArrowDown', 'PageDown', 'End'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
      const gore = ['ArrowUp', 'PageUp', 'Home'].includes(e.key) || (e.key === ' ' && e.shiftKey);
      if (dole) namera(1, e); else if (gore) namera(-1, e);
    });
    // Ako se stranica ipak nađe na pola (inercija prsta, prevlačenje trake za skrol), dovrši u smeru kretanja.
    let mir: number | undefined;
    window.addEventListener('scroll', () => {
      if (vodimo) return;
      clearTimeout(mir);
      mir = window.setTimeout(() => {
        if (dodir || vodimo) return;
        const p = napredak();
        if (p > 0.002 && p < 0.998) igraj(smer > 0 ? kraj() : pocetak());
      }, 90);
    }, { passive: true });
    doFeeda = () => igraj(kraj());
  }

  if (location.hash === '#feed') requestAnimationFrame(() => skoci(kraj()));
  document.querySelectorAll<HTMLAnchorElement>('[data-na-feed]').forEach((a) => {
    a.addEventListener('click', (ev) => { ev.preventDefault(); doFeeda(); });
  });
}

// Za test se varijanta bira linkom: /?animacija=a (okidač) ili /?animacija=b (dovršavanje).
// Izbor se pamti dok je kartica pregledača otvorena; podrazumevano je B.
function izaberiNacin(): 'a' | 'b' {
  const iz = new URLSearchParams(location.search).get('animacija');
  try {
    if (iz === 'a' || iz === 'b') sessionStorage.setItem('ss-animacija', iz);
    const s = sessionStorage.getItem('ss-animacija');
    if (s === 'a' || s === 'b') return s;
  } catch { /* bez memorije */ }
  return iz === 'a' ? 'a' : 'b';
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
