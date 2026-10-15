export function pokreniKaruseli() {
  document.querySelectorAll<HTMLElement>('[data-karusel]').forEach((car) => {
    const track = car.querySelector<HTMLElement>('.track')!;
    const slajdovi = track.children.length;
    const tacke = car.querySelectorAll<HTMLButtonElement>('[data-idi]');
    let i = 0;
    const idi = (k: number) => {
      i = (k + slajdovi) % slajdovi;
      track.style.transform = `translateX(calc(${-i} * (78% + 20px)))`;
      tacke.forEach((t, j) => { t.classList.toggle('on', j === i); t.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    };
    tacke.forEach((t) => t.addEventListener('click', () => idi(Number(t.dataset.idi))));
    car.querySelector('[data-pret]')?.addEventListener('click', () => idi(i - 1));
    car.querySelector('[data-sled]')?.addEventListener('click', () => idi(i + 1));
    let x0: number | null = null;
    track.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) idi(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    });
  });
}
