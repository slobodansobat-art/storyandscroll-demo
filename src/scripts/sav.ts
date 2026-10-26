// Šav je uvek iste debljine na ekranu (2 px), bez obzira na to koliko je kartica velika.
// Crtež se crta u koordinatama 0–100, pa se debljina preračunava prema njegovoj stvarnoj širini.
const SAV = 2;        // debljina šava u px
const BOD = 5;        // dužina jednog boda u px
const RAZMAK = 4;     // razmak između bodova u px
const OSA = 1;        // tanka osa grafikona u px

function podesi(svg: SVGSVGElement) {
  const sirina = svg.clientWidth || svg.getBoundingClientRect().width;
  if (!sirina) return;
  const k = 100 / sirina;
  svg.querySelectorAll('.sav-st').forEach((p) => {
    p.setAttribute('stroke-width', (SAV * k).toFixed(3));
    p.setAttribute('stroke-dasharray', `${(BOD * k).toFixed(3)} ${(RAZMAK * k).toFixed(3)}`);
  });
  svg.querySelectorAll('.sav-pokr').forEach((p) => p.setAttribute('stroke-width', (SAV * 3 * k).toFixed(3)));
  svg.querySelectorAll('.sav-osa').forEach((p) => p.setAttribute('stroke-width', (OSA * k).toFixed(3)));
}

export function pokreniSav() {
  const svi = Array.from(document.querySelectorAll<SVGSVGElement>('[data-sav]'));
  if (!svi.length) return;
  svi.forEach(podesi);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver((unosi) => unosi.forEach((u) => podesi(u.target as SVGSVGElement)));
    svi.forEach((s) => ro.observe(s));
  } else {
    window.addEventListener('resize', () => svi.forEach(podesi));
  }
}
