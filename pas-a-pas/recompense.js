/* « Je m'occupe » ouvert par le professeur (tableau ▸ case 🎁, une heure) : un bandeau en bas de la fiche,
   visible même pendant une séance ou une séquence projetée. Commun à tous les moteurs : blocs.js (par
   sequence-eleve.js), Messagerie 01 (messagerie/pas-a-pas/sequence.js) et le Rat de ville (fiche.js).
   AUCUN appel au serveur ici : la fiche passe la réponse qu'elle reçoit déjà — moment() toutes les 5 s,
   ou suiviFormatif() pour le Rat de ville —, qui porte { recompense, occupe } quand 🎁 est ouvert (Code.gs,
   recompenseEleve_). Sans ces champs, le bandeau s'en va (case décochée).
     Recompense.montre(r)   r = réponse du serveur ; r.recompense = heure de fin (ms), r.occupe = adresse ?vue=occupe */
const Recompense = (() => {
  let zone = null, minuterie = 0, deja = '';
  const heure = t => new Date(t).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' });
  function retire() {
    clearTimeout(minuterie); deja = '';
    if (zone) { zone.remove(); zone = null; document.body.classList.remove('avec-occupe'); }
  }
  function cree() {
    const s = document.createElement('style');
    s.textContent = `body.avec-occupe{padding-bottom:84px}
#bandeau-occupe{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;justify-content:center;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));background:var(--fromage,#e3a922);box-shadow:0 -4px 16px #0003}
#bandeau-occupe a{display:block;max-width:44rem;width:100%;text-align:center;font:800 clamp(1.05rem,2.6vw,1.35rem)/1.3 var(--display,Arial,sans-serif);color:var(--encre,#1f2a33);background:var(--carte,#fff);border:3px solid var(--encre,#1f2a33);border-radius:14px;padding:12px 16px;text-decoration:none;animation:occupe-entre .5s ease-out}
#bandeau-occupe a:hover,#bandeau-occupe a:focus-visible{outline:4px solid var(--carte,#fff);outline-offset:2px;text-decoration:underline}
@keyframes occupe-entre{from{transform:translateY(120%)}to{transform:none}}
@media (prefers-reduced-motion:reduce){#bandeau-occupe a{animation:none}}`;
    zone = document.createElement('div'); zone.id = 'bandeau-occupe'; zone.setAttribute('role', 'status');
    zone.append(s, document.createElement('a'));
    document.body.append(zone); document.body.classList.add('avec-occupe');
  }
  function montre(r) {
    const jusqua = Number(r && r.recompense) || 0, url = r && typeof r.occupe === 'string' ? r.occupe : '';
    if (!jusqua || !/^https:\/\//.test(url)) return retire();
    const cle = jusqua + ' ' + url;
    if (cle === deja) return;               // la même réponse toutes les 5 s : on ne redessine rien
    deja = cle;
    if (!zone) cree();
    const a = zone.querySelector('a');
    a.href = url; a.target = '_top';         // sortir du cadre Apps Script, comme le bouton de Mes cours
    a.textContent = '🎁 Je m\'occupe est ouvert pour toi jusqu\'à ' + heure(jusqua) + ' ▸';
    // Fin de l'heure : le bandeau s'en va seul, même sans nouvelle réponse (Rat de ville). Un poste
    // en avance sur le serveur le garderait au moins une minute plutôt que de le faire clignoter.
    clearTimeout(minuterie);
    minuterie = setTimeout(retire, Math.max(60000, jusqua - Date.now()));
  }
  return { montre };
})();
window.Recompense = Recompense;
