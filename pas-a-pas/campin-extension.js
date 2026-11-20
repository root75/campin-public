// Bouton « à côté du cours » des fiches Pas à pas.
// Un lien <a data-a-cote href="https://…" target="_blank"> devient un bouton qui ouvre le site
// à droite du cours, en vue fractionnée, quand l'extension Chrome « Campin — cours » est installée
// (source : campin-pedagogique/outils/extension-chrome, Chrome 155+).
// Sans l'extension, ou si Chrome ne sait pas faire : nouvel onglet, et le volet <details class="cote">
// le plus proche s'ouvre pour montrer le geste à la main. La fiche ne casse jamais.
// Un <button data-cote-a-cote hidden> (le document de l'élève, dont on ne connaît pas l'adresse) n'apparaît
// qu'avec l'extension : il met le cours à côté de l'onglet que l'élève vient de quitter. Sans l'extension,
// la fiche garde le geste écrit juste à côté.
// Avec data-auto en plus de data-a-cote, le site s'ouvre à côté dès le chargement de la fiche (une fois par onglet).
(function () {
  let n = 0;
  function presente() {
    return !!document.documentElement.dataset.campinExtension;
  }
  function demander(action, url) {
    return new Promise((resoudre) => {
      const id = 'c' + (++n) + '-' + Date.now();
      const minuterie = setTimeout(() => {
        window.removeEventListener('message', ecoute);
        resoudre({ ok: false, erreur: 'pas de réponse de l’extension' });
      }, 3000);
      function ecoute(ev) {
        if (ev.source !== window || !ev.data || ev.data.campin !== 'reponse' || ev.data.id !== id) return;
        clearTimeout(minuterie);
        window.removeEventListener('message', ecoute);
        resoudre(ev.data);
      }
      window.addEventListener('message', ecoute);
      window.postMessage({ campin: 'demande', id, action, url }, '*');
    });
  }
  async function ouvrirACote(url) {
    let u;
    try { u = new URL(url, location.href); } catch (e) { u = null; }
    if (!u || u.protocol !== 'https:') return { ok: false, erreur: 'adresse refusée (https seulement)' };
    url = u.href;
    if (presente()) {
      const r = await demander('ouvrir-a-cote', url);
      if (r.ok) return r;
    }
    window.open(url, '_blank', 'noopener');
    return { ok: true, mode: 'sans-extension' };
  }
  const FAIT = { 'vue-fractionnee': 1, 'vue-existante': 1 };
  function montrerBoutons() {
    if (!presente()) return;
    document.querySelectorAll('button[data-cote-a-cote]').forEach((b) => { b.hidden = false; });
  }
  // Les encadrés sont dessinés par le moteur à chaque étape : on regarde à chaque changement.
  new MutationObserver(montrerBoutons).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', montrerBoutons);
  document.addEventListener('click', async (ev) => {
    const b = ev.target.closest && ev.target.closest('button[data-cote-a-cote]');
    if (!b) return;
    b.disabled = true;
    const r = await demander('cote-a-cote');
    b.disabled = false;
    const statut = b.parentElement.querySelector('.cote-statut') || b.insertAdjacentElement('afterend', Object.assign(document.createElement('span'), { className: 'note cote-statut' }));
    statut.textContent = FAIT[r.mode] ? '' : ' Ça n’a pas marché : fais le geste écrit ci-dessus.';
  });
  document.addEventListener('click', async (ev) => {
    const a = ev.target.closest && ev.target.closest('a[data-a-cote]');
    if (!a || !presente()) return; // sans extension, le lien fait son travail habituel
    ev.preventDefault();
    const r = await ouvrirACote(a.href);
    if (FAIT[r.mode]) return;
    const zone = a.closest('.reel, p, div');
    const volet = (zone && zone.parentElement || document).querySelector('details.cote');
    if (volet) volet.open = true;
  });
  // <a data-a-cote data-auto> : le site s'ouvre à côté tout seul, une seule fois par onglet et par fiche
  // (un rechargement ne rouvre rien : la moitié de droite garde le document de l'élève). Seulement avec
  // l'extension : sans elle, ouvrir un onglet sans clic serait bloqué comme une fenêtre surgissante.
  function ouvrirAuto() {
    if (!presente()) return;
    const a = document.querySelector('a[data-a-cote][data-auto]');
    if (!a) return;
    // Servie par Apps Script, toute fiche a la même adresse de cadre : le titre distingue les fiches.
    const cle = 'campin-a-cote:' + location.pathname + '|' + document.title;
    try {
      if (sessionStorage.getItem(cle)) return;
      sessionStorage.setItem(cle, '1');
    } catch (e) { return; } // pas de mémoire d'onglet : on ne risque pas de rouvrir à chaque chargement
    demander('ouvrir-a-cote', a.href);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ouvrirAuto);
  else ouvrirAuto();
  window.CampinExtension = { presente, ouvrirACote, coteACote: () => demander('cote-a-cote'), ping: () => demander('ping') };
})();
