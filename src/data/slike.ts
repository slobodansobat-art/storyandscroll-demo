import meta from './slike-meta.json';

type Meta = Record<string, { w: number; h: number; v: [number, string][] }>;
const m = meta as Meta;

// Vraća sve što treba za <img>: srednju verziju kao src, sve verzije za srcset i dimenzije.
// `zeljena` je širina koja se koristi kao src (podrazumevano oko 800 px).
export function slika(putanja: string, zeljena = 800) {
  const p = m[putanja];
  if (!p || !p.v.length) return { src: putanja, srcset: undefined as string | undefined, w: undefined as number | undefined, h: undefined as number | undefined };
  const izabrana = p.v.find(([s]) => s >= zeljena) ?? p.v[p.v.length - 1];
  return { src: izabrana[1], srcset: p.v.map(([s, u]) => `${u} ${s}w`).join(', '), w: p.w, h: p.h };
}
