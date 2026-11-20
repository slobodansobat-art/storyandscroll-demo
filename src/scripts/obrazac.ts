export function pokreniObrazac() {
  const forma = document.querySelector<HTMLFormElement>('[data-obrazac]');
  if (!forma) return;
  // Dugmad „Zatražite ponudu…” šalju ?usluga=… (stari linkovi ?paket=…) i to se upisuje u obrazac.
  const q = new URLSearchParams(location.search);
  const usluga = q.get('usluga') || q.get('paket');
  const polje = forma.querySelector<HTMLInputElement>('[data-usluga]');
  if (usluga && polje) polje.value = usluga.slice(0, 120);
  const hvala = document.querySelector<HTMLElement>('[data-hvala]')!;
  const greska = forma.querySelector<HTMLElement>('[data-greska]')!;
  forma.addEventListener('submit', async (e) => {
    e.preventDefault();
    greska.hidden = true;
    const dugme = forma.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    dugme.disabled = true;
    try {
      const telo = new URLSearchParams(new FormData(forma) as any).toString();
      const odg = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: telo });
      if (!odg.ok) throw new Error(String(odg.status));
      forma.hidden = true;
      hvala.hidden = false;
      hvala.focus();
    } catch {
      greska.hidden = false;
    } finally {
      dugme.disabled = false;
    }
  });
}
