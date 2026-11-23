/* « Fait / à faire » des révisions : une petite mémoire dans le navigateur de l'élève, rien sur le serveur.
   Progres.marque('mots-croises:python-1', 'fait') · Progres.etat(cle) rend '', 'commence' ou 'fait'.
   Dans une page « je révise » :  <script src="…/assets/progres.js" data-quiz="quiz:python-1"></script>
   la page est notée « commencée » à l'ouverture, et « faite » quand le score du quiz s'affiche. */
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
  }
  globalThis.Progres = { etat, marque, lit };

  const moi = typeof document !== 'undefined' && document.currentScript;
  const quiz = moi && moi.dataset.quiz;
  if (!quiz) return;
  marque(quiz, 'commence');
  const zone = document.getElementById('quiz');
  if (!zone || typeof MutationObserver === 'undefined') return;
  new MutationObserver(() => { if (zone.querySelector('.score')) marque(quiz, 'fait'); }).observe(zone, { childList: true, subtree: true });
})();
