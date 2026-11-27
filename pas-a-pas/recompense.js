/* « Je m'occupe » ouvert par le professeur (tableau ▸ case 🎁, une heure) : un bandeau en bas de la fiche,
   visible même pendant une séance ou une séquence projetée. Commun à tous les moteurs : blocs.js (par
   sequence-eleve.js, Messagerie 01 et Rat de ville compris).
   AUCUN appel au serveur ici : la fiche passe la réponse qu'elle reçoit déjà — moment() toutes les 5 s —,
   qui porte { recompense, occupe } quand 🎁 est ouvert (Code.gs,
   recompenseEleve_). Sans ces champs, le bandeau s'en va (case décochée).
     Recompense.montre(r)   r = réponse du serveur ; r.recompense = heure de fin (ms), r.occupe = adresse ?vue=occupe */
/* Trésor de classe (17/11/2026) : étoiles COLLECTIVES. Chaque bloc réussi par un élève de la classe ajoute une
   étoile ; jamais d'étoiles individuelles (elles récompensent la vitesse). Le nombre arrive avec moment()
   (r.tresor, Code.gs ▸ tresorLu_) : toujours aucun appel au serveur ici. Une ligne sous « Connecté : … »,
   absente tant que la classe n'a pas d'étoile ; elle ne s'efface pas sur une réponse vide (réseau, fin de séance).
     Tresor.montre(r)   r = réponse du serveur ; r.tresor = nombre d'étoiles de la classe pour la séance */
const Tresor = (() => {
  const COFFRES = [10, 25, 50, 75, 100, 150, 200, 300, 400, 500];
  const prochain = n => COFFRES.find(c => c > n) || (Math.floor(n / 100) + 1) * 100;
  const ouvert = (avant, n) => COFFRES.filter(c => c > avant && c <= n).pop() || (n >= 600 && Math.floor(n / 100) > Math.floor(avant / 100) ? Math.floor(n / 100) * 100 : 0);
  let zone = null, vu = 0, minuterie = 0;
  function cree() {
    const s = document.createElement('style');
    s.textContent = `#tresor{display:flex;flex-wrap:wrap;align-items:center;gap:.25em .6em;margin:.4rem 0;padding:.45em .8em;border-radius:12px;background:var(--fromage-pale,#fbf0d4);border:2px solid var(--fromage,#e3a922);color:var(--encre,#1f2a33);font-size:1rem;line-height:1.35}
#tresor b{font:800 1.25em/1 var(--display,Georgia,serif);white-space:nowrap}
#tresor .tresor-plus{font-weight:700}
#tresor.gagne b{animation:tresor-saut .7s ease-out}
#tresor.coffre{background:var(--fromage,#e3a922);color:#1f2a33}
@keyframes tresor-saut{0%{transform:scale(1)}40%{transform:scale(1.5) rotate(-6deg)}100%{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){#tresor.gagne b{animation:none}}
body.en-sequence #tresor:not(.pot-classe){display:none}
@media print{#tresor{display:none}}`;
    zone = document.createElement('div'); zone.id = 'tresor'; zone.setAttribute('role', 'status');
    const qui = document.getElementById('qui');
    if (qui) qui.after(zone); else document.body.prepend(zone);
    document.head.append(s);
  }
  let precedent = null, detailOuvert = false;
  function ouvreDetail(o){
    detailOuvert = o; if(!zone) return;
    const b = zone.querySelector('.pot-bouton'), d = zone.querySelector('.pot-texte');
    if(b) b.setAttribute('aria-expanded', String(o)); if(d) d.hidden = !o;
  }
  document.addEventListener('click', e => { if(detailOuvert && zone && !zone.contains(e.target)) ouvreDetail(false); });
  document.addEventListener('keydown', e => { if(detailOuvert && e.key==='Escape') ouvreDetail(false); });
  const surprises = ['🌠 Pluie d’étoiles','🪐 Une planète découverte','🌌 Une nouvelle constellation','🚀 Décollage collectif'];
  function dessinePot(r){
    const ancien = precedent;
    if(ancien && ['tresorSeance','tresor','tresorPresents','tresorPaliers'].every(k=>r[k]===ancien[k])) return;
    precedent = r;
    if(!zone) cree();
    zone.setAttribute('role','region'); zone.setAttribute('aria-label','Le pot de la classe');
    const projection = document.getElementById('seq');
    if(projection && projection.previousElementSibling!==zone) projection.before(zone);
    zone.hidden = false;
    clearTimeout(minuterie);
    const memeSeance = ancien && ancien.tresorSeance===r.tresorSeance;
    const ouvre = memeSeance && r.tresorPaliers>ancien.tresorPaliers;
    const gagne = memeSeance && r.tresor>ancien.tresor;
    /* Le pot ne prend plus qu'une pastille en haut à droite, à côté du smiley, de la grille et de la cloche
       (Vincent, 27/11/2026 : dégager le cours) : le bocal et le nombre d'étoiles, le détail au clic. */
    const pot = document.createElement('span'); pot.className='bocal'; pot.setAttribute('aria-hidden','true');
    const niveau = document.createElement('i'); niveau.style.height=(100*r.tresorPot/r.tresorPresents)+'%';
    const piece = document.createElement('span'); piece.textContent='★'; pot.append(niveau,piece);
    const nombre = document.createElement('b'); nombre.className='pot-nombre'; nombre.textContent=r.tresor;
    const bouton = document.createElement('button'); bouton.type='button'; bouton.className='pot-bouton';
    bouton.setAttribute('aria-expanded', String(detailOuvert)); bouton.setAttribute('aria-controls','pot-detail');
    bouton.title = 'Le pot de la classe : '+r.tresor+' étoile'+(r.tresor>1?'s':'')+' gagnée'+(r.tresor>1?'s':'')+' par l’équipe';
    bouton.setAttribute('aria-label', bouton.title);
    bouton.append(pot,nombre);
    const titre = document.createElement('strong'); titre.textContent='Le pot de la classe';
    const compte = document.createElement('span'); compte.textContent=r.tresorPot+' / '+r.tresorPresents+' étoiles pour la prochaine surprise';
    const groupe = document.createElement('small'); groupe.textContent=r.tresorPresents+' élève'+(r.tresorPresents>1?'s':'')+' en séance · '+r.tresor+' ⭐ au total';
    const texte = document.createElement('span'); texte.className='pot-texte'; texte.id='pot-detail'; texte.hidden=!detailOuvert; texte.append(titre,compte,groupe);
    if(r.tresorPaliers){
      const prix=document.createElement('span'); prix.className='pot-prix';
      prix.textContent='Surprise '+r.tresorPaliers+' · '+surprises[(r.tresorPaliers-1)%surprises.length]; texte.append(prix);
      const choix=document.createElement('small'); choix.textContent='Jeu collectif disponible pour la fin de l’heure.'; texte.append(choix);
    }
    bouton.addEventListener('click', e => { e.stopPropagation(); ouvreDetail(!detailOuvert); });
    zone.className='pot-classe'+(ouvre?' pot-ouvert':gagne?' pot-gain':'');
    zone.replaceChildren(bouton,texte);

  }
  function montre(r) {
    if(r && r.tresorPresents>0){ dessinePot(r); return; }
    if(precedent && !r){ zone.hidden=true; precedent=null; vu=0; return; }
    const n = Math.floor(Number(r && r.tresor)) || 0;
    if (n <= 0 || n === vu) return;
    if (!zone) cree();
    const plus = vu && n > vu ? n - vu : 0, coffre = vu ? ouvert(vu, n) : 0;
    vu = n;
    const b = document.createElement('b'); b.textContent = '⭐ ' + n;
    const t = document.createElement('span');
    t.textContent = (n > 1 ? 'étoiles' : 'étoile') + ' dans le trésor de la classe';
    const suite = document.createElement('span'); suite.className = 'tresor-plus';
    suite.textContent = coffre ? '🎉 La classe a ouvert le coffre des ' + coffre + ' étoiles !'
      : (plus ? '+' + plus + ' · ' : '') + 'prochain coffre à ' + prochain(n);
    zone.replaceChildren(b, t, suite);
    zone.classList.remove('gagne'); zone.classList.toggle('coffre', !!coffre);
    if (plus) { void zone.offsetWidth; zone.classList.add('gagne'); }
    clearTimeout(minuterie);
    if (plus || coffre) minuterie = setTimeout(() => {   // la fête passe, le compte reste
      zone.classList.remove('gagne', 'coffre'); suite.textContent = 'prochain coffre à ' + prochain(vu);
    }, coffre ? 12000 : 4000);
  }
  return { montre, prochain, ouvert };
})();
window.Tresor = Tresor;

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
    Tresor.montre(r);                        // le trésor de classe arrive par la même réponse
    const jusqua = Number(r && r.recompense) || 0, url = r && typeof r.occupe === 'string' ? r.occupe : '';
    if (!jusqua || !/^https:\/\//.test(url)) return retire();
    const cle = jusqua + ' ' + url;
    if (cle === deja) return;               // la même réponse toutes les 5 s : on ne redessine rien
    deja = cle;
    if (!zone) cree();
    const a = zone.querySelector('a');
    a.href = url; a.target = '_top';         // sortir du cadre Apps Script, comme le bouton de Mes cours
    a.textContent = '🎁 Je m\'occupe est ouvert pour toi jusqu\'à ' + heure(jusqua) + ' ▸';
    // Fin de l'heure : le bandeau s'en va seul, même sans nouvelle réponse. Un poste
    // en avance sur le serveur le garderait au moins une minute plutôt que de le faire clignoter.
    clearTimeout(minuterie);
    minuterie = setTimeout(retire, Math.max(60000, jusqua - Date.now()));
  }
  return { montre };
})();
window.Recompense = Recompense;
