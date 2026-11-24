/* « Fait / à faire » des révisions : une petite mémoire dans le navigateur de l'élève, doublée sur le serveur.
   Progres.marque('mots-croises:python-1', 'fait') · Progres.etat(cle) rend '', 'commence' ou 'fait'.
   Dans une page « je révise » :  <script src="…/assets/progres.js" data-quiz="quiz:python-1"></script>
   la page est notée « commencée » à l'ouverture, et « faite » quand le score du quiz s'affiche.

   Le serveur (Vincent, 24/11/2026 : « dans une feuille séparée du Google Sheet ») : la page charge
   …/exec?vue=progres&m=activité~état,… comme un script, de la même façon que la question « connecté ? » du portail.
   Elle y envoie ce que le serveur ne sait pas encore et reçoit campinProgres({ activité: état }) : tout ce que l'élève
   a déjà fait, sur n'importe quel poste. Élève non connecté, serveur pas encore republié, réseau coupé : le script
   ne se charge pas, il ne se passe rien, et la mémoire du navigateur continue de servir seule.
   Quand une activité change d'état, ici ou par le serveur, la page émet l'évènement « campin-progres » sur document.
   Le portail servi par « Mes cours » fournit globalThis.ProgresPont : l'envoi passe alors par google.script.run. */
(function () {
  const CLE = 'campin-progres';
  function lit() { try { const v = JSON.parse(localStorage.getItem(CLE) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
  function etat(cle) { const v = lit()[cle]; return v === 'fait' || v === 'commence' ? v : ''; }
  /** « fait » ne redevient jamais « commencé ». */
  function marque(cle, quoi) {
    if (!/^[a-z0-9:\-]{1,80}$/.test(cle) || (quoi !== 'fait' && quoi !== 'commence')) return;
    const tout = lit();
    if (tout[cle] === 'fait' || tout[cle] === quoi) return;
    tout[cle] = quoi;
    try { localStorage.setItem(CLE, JSON.stringify(tout)); } catch (e) {}
    previent();
    bientot();
  }
  /** La page qui affiche un « fait / à faire » (révisions, portail) se redessine. */
  function previent() { try { document.dispatchEvent(new Event('campin-progres')); } catch (e) {} }

  /* ----- Le double sur le serveur. ----- */
  const EXEC = 'https://script.google.com/a/macros/arcampin.be/s/AKfycbyOPTaq-L1PuittB1rkkiL9OOtShFc2WpiD8H_pH_INaw9ePWenCzhlIPlHu4zBOgLk/exec';
  const SU = 'campin-progres-serveur', LOT = 40, BON = /^[a-z0-9:\-]{1,80}$/;
  const web = typeof document !== 'undefined' && typeof location !== 'undefined' && /^https?:$/.test(location.protocol);
  let su = {}, attente = 0, enVol = false;   // su : ce que le serveur a confirmé savoir
  try { const v = JSON.parse(localStorage.getItem(SU) || '{}'); if (v && typeof v === 'object' && !Array.isArray(v)) su = v; } catch (e) {}
  /** Ce que le serveur ne sait pas encore, LOT activités au plus : « activité~état ». */
  function aEnvoyer() {
    const tout = lit();
    return Object.keys(tout).filter(c => BON.test(c) && (tout[c] === 'fait' || tout[c] === 'commence') && su[c] !== 'fait' && su[c] !== tout[c])
      .slice(0, LOT).map(c => c + '~' + tout[c]);
  }
  /** La réponse du serveur : on garde l'état le plus avancé des deux, et on prévient la page si elle apprend quelque chose. */
  function recoit(serveur) {
    enVol = false;
    if (!serveur || typeof serveur !== 'object' || Array.isArray(serveur)) return;   // null : pas un compte de l'école
    const tout = lit(); let neuf = false; su = {};
    for (const c of Object.keys(serveur)) {
      const e = serveur[c];
      if (!BON.test(c) || (e !== 'fait' && e !== 'commence')) continue;
      su[c] = e;
      if (tout[c] !== 'fait' && tout[c] !== e) { tout[c] = e; neuf = true; }
    }
    try { localStorage.setItem(SU, JSON.stringify(su)); if (neuf) localStorage.setItem(CLE, JSON.stringify(tout)); } catch (e) {}
    if (neuf) previent();
    if (aEnvoyer().length) bientot();   // plus de LOT activités en attente : le reste part à l'appel suivant
  }
  function synchro() {
    attente = 0;
    if (!web || enVol) return;
    enVol = true;
    const m = aEnvoyer();
    // Dans le portail servi par « Mes cours », la page a son pont Apps Script : ProgresPont('a~fait,b~commence') ▸ Promise.
    if (typeof globalThis.ProgresPont === 'function') {
      try { Promise.resolve(globalThis.ProgresPont(m.join(','))).then(recoit, () => { enVol = false; }); } catch (e) { enVol = false; }
      return;
    }
    globalThis.campinProgres = recoit;
    const s = document.createElement('script');
    s.src = EXEC + '?vue=progres' + (m.length ? '&m=' + encodeURIComponent(m.join(',')) : '');
    s.async = true; s.onerror = () => { enVol = false; };
    document.head.append(s);
  }
  function bientot() { if (web && !attente) attente = setTimeout(synchro, 1500); }
  globalThis.Progres = { etat, marque, lit };
  if (web) synchro();   // à l'ouverture : la page apprend ce qui a été fait ailleurs

  const moi = typeof document !== 'undefined' && document.currentScript;
  const quiz = moi && moi.dataset.quiz;
  if (!quiz) return;
  marque(quiz, 'commence');
  const zone = document.getElementById('quiz');
  if (!zone || typeof MutationObserver === 'undefined') return;
  new MutationObserver(() => { if (zone.querySelector('.score')) marque(quiz, 'fait'); }).observe(zone, { childList: true, subtree: true });
})();
