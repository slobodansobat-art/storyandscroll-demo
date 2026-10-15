const velicine: Record<string, number[]> = {
  telefon: [480, 800, 1280, 1600],
  ruza: [480, 800, 1200],
  koralni: [362],
  makaze: [540, 900, 1350],
};
export function slika(kljuc: string) {
  const v = velicine[kljuc] ?? [];
  const src = `/img/${kljuc}-${v[Math.min(1, v.length - 1)]}.webp`;
  const srcset = v.map((w) => `/img/${kljuc}-${w}.webp ${w}w`).join(', ');
  return { src, srcset };
}
