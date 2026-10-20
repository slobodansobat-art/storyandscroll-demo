// Linija koraka (stranica „Kako sarađujemo”): puni se bordo bojom dok se skroluje,
// a kružić koraka se popuni kad linija stigne do njega.
export function pokreniLiniju() {
  const linije = Array.from(document.querySelectorAll<HTMLElement>('[data-linija]'));
  if (!linije.length) return;
  const smanji = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  linije.forEach((l) => l.classList.add('ziva'));
  if (smanji) {
    linije.forEach((l) => {
      l.style.setProperty('--puna', '1');
      l.querySelectorAll('.tli').forEach((k) => k.classList.add('stigla'));
    });
    return;
  }
  const crtaj = () => {
    const tacka = window.innerHeight * 0.62;
    linije.forEach((l) => {
      const r = l.getBoundingClientRect();
      const puna = r.height > 0 ? Math.min(1, Math.max(0, (tacka - r.top) / r.height)) : 0;
      l.style.setProperty('--puna', puna.toFixed(4));
      l.querySelectorAll<HTMLElement>('.tli').forEach((k) => {
        const kr = k.getBoundingClientRect();
        k.classList.toggle('stigla', kr.top + 15 <= tacka);
      });
    });
  };
  let ceka = false;
  const naSkrol = () => { if (ceka) return; ceka = true; requestAnimationFrame(() => { ceka = false; crtaj(); }); };
  window.addEventListener('scroll', naSkrol, { passive: true });
  window.addEventListener('resize', naSkrol);
  crtaj();
}
