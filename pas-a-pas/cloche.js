/* Cloche « J'attends de l'aide » — code commun à tous les cours (blocs.js).
   Un clic sur la cloche sonne, tout de suite : plus aucune question ni bouton avant (17/11/2026).
   (Avant : un panneau « As-tu demandé à ton voisin ? » puis un bouton par motif. Les élèves ouvraient le
   panneau, ne cliquaient pas sur le motif et croyaient la cloche active, dit Vincent. Jusqu'au 14/11/2026 :
   trois cases à cocher.) Le rappel « relis, demande au voisin » reste dans « Ça coince ? ».
   Au plus 3 sonneries par heure glissante : le serveur compte (Code.gs, CLOCHE_MAX_) et refuse la 4e.
   Le seul panneau qui reste dit qu'une sonnerie n'est PAS partie : limite atteinte, ou demande non transmise.
   Sans serveur (aperçu), le compte est tenu dans la page ouverte.
   Une sonnerie éteinte par l'élève dans la minute ne compte pas (17/11/2026 : des clics répétés mangeaient les 3
   sonneries sans que le professeur soit passé) ; le serveur applique la même règle (Code.gs, CLOCHE_ANNULE_).
   Tant que la demande est en cours, la cloche bouge un peu toutes les 3 secondes : l'élève voit qu'elle est active.

     Cloche.refuse({ ancre, plein, info, coince })   la sonnerie n'est pas partie : le panneau dit pourquoi
       ancre  : la zone de la cloche (#aide) ; le panneau s'ouvre dedans
       plein  : true = limite atteinte ; sinon, demande non transmise
       info   : { cloches, clocheMax, clocheLibre } du serveur, ou une promesse, ou rien
       coince : le <details> « Ça coince ? » de la page (facultatif)
     Cloche.sonnee()          à appeler quand une sonnerie est confirmée (compte local)
     Cloche.eteinte()         à appeler quand l'élève éteint sa cloche : dans la minute, la sonnerie est décomptée
     Cloche.restantes(info)   { n, max, libre }
     Cloche.marque(ancre, info)  cloche en pointillés quand il ne reste rien
     Cloche.ferme(ancre), Cloche.ouvert(ancre)
     Cloche.mot(ancre, o)     « Un mot pour le professeur » sous la cloche allumée (24/11/2026 : écrire au professeur
                              passe par la file de la cloche, pas par un second canal). Facultatif, APRÈS la sonnerie :
                              rien ne s'intercale avant elle. o = { envoie(texte) ▸ promesse, mot, reponse } ; o = null
                              retire la saisie (cloche éteinte) et laisse la réponse du professeur lisible.
     Cloche.reponse(ancre, r) la réponse du professeur, { texte } ; Cloche.oublie(ancre) efface tout (nouvelle sonnerie)
   Rien n'est enregistré sur le poste. */
const Cloche = (() => {
  const MAX = 3, HEURE = 3600 * 1000, ANNULE = 60 * 1000, ici = [];
  const el = (tag, cls, t) => { const n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; };
  const heure = t => new Date(t).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' });
  let style = false;
  function css() {
    if (style) return; style = true;
    const s = el('style');
    s.textContent = `.verif>p{display:none!important}
.epuise:not(.active)>button{opacity:.55;border-style:dashed!important}
#aide.active #aide-btn{animation:sonne 1s ease 2,cloche-attend 3s ease-in-out 2s infinite}
@keyframes cloche-attend{0%,70%,100%{transform:rotate(0)}78%{transform:rotate(9deg)}86%{transform:rotate(-8deg)}94%{transform:rotate(4deg)}}
@media (prefers-reduced-motion:reduce){#aide.active #aide-btn{animation:none}}
.cloche-verif{background:var(--carte,#fff);color:var(--encre,#1f2a33);border:3px solid var(--fromage,#e3a922);border-radius:14px;padding:12px 14px;max-width:min(22rem,calc(100vw - 32px));box-shadow:0 6px 20px #0003;display:grid;gap:8px;text-align:left;font-size:1rem}
.cloche-verif p{margin:0}.cloche-titre{font-weight:800}
.cloche-verif .cloche-lien{background:none;border:0;padding:0;font:inherit;font-weight:700;color:var(--encre-bouton,#1d5a73);text-decoration:underline;cursor:pointer;justify-self:start}
.cloche-pied{display:flex;gap:8px;flex-wrap:wrap}.cloche-pied button{font:inherit;font-weight:700;border-radius:20px;padding:6px 14px;cursor:pointer;border:2px solid var(--encre-bouton,#1d5a73);background:var(--carte,#fff);color:var(--encre-bouton,#1d5a73)}
.cloche-note{font-size:.85rem;color:var(--doux,#5b6873)}
.cloche-mot{display:grid;gap:6px;max-width:min(22rem,calc(100vw - 32px));font-size:.9rem;text-align:left}
.cloche-mot [hidden]{display:none!important}.cloche-mot p{margin:0}.cloche-mot form{display:flex;gap:6px;flex-wrap:wrap}
.cloche-mot input{flex:1 1 9rem;min-width:0;font:inherit;padding:6px 8px;border-radius:8px;border:2px solid var(--doux,#5b6873);background:var(--carte,#fff);color:var(--encre,#1f2a33)}
.cloche-mot button{font:inherit;font-weight:700;border-radius:20px;padding:4px 12px;cursor:pointer;border:2px solid var(--encre-bouton,#1d5a73);background:var(--carte,#fff);color:var(--encre-bouton,#1d5a73)}
.cloche-rep{background:var(--carte,#fff);color:var(--encre,#1f2a33);border:3px solid var(--encre-bouton,#1d5a73);border-radius:12px;padding:8px 10px;font-weight:700}
.cloche-rep button{float:right;border:0;padding:0 4px;margin-left:6px}`;
    document.head.append(s);
  }
  function local() {
    const t = Date.now(); while (ici.length && t - ici[0] >= HEURE) ici.shift();
    return { cloches: ici.length, clocheMax: MAX, clocheLibre: ici.length >= MAX ? ici[ici.length - MAX] + HEURE : 0 };
  }
  function restantes(info) {
    const i = info && typeof info.cloches === 'number' ? info : local(), max = i.clocheMax || MAX;
    return { n: Math.max(0, max - i.cloches), max, libre: i.clocheLibre || 0 };
  }
  const sonnee = () => { ici.push(Date.now()); };
  const eteinte = () => { if (ici.length && Date.now() - ici[ici.length - 1] < ANNULE) ici.pop(); };
  const marque = (ancre, info) => { css(); ancre.classList.toggle('epuise', restantes(info).n <= 0); };
  const zone = ancre => ancre.querySelector('.cloche-verif');
  function ferme(ancre) { const v = ancre && zone(ancre); if (v) v.hidden = true; if (ancre) ancre.classList.remove('verif'); }
  const ouvert = ancre => { const v = zone(ancre); return !!v && !v.hidden; };

  async function refuse(o) {
    css();
    let info = null; try { info = await o.info; } catch (e) { info = null; }
    let v = zone(o.ancre);
    if (!v) { v = el('div', 'cloche-verif'); v.setAttribute('role', 'alert'); o.ancre.append(v); }
    o.ancre.classList.add('verif'); v.hidden = false;
    const ok = el('button', null, 'J’ai compris'); ok.type = 'button'; ok.addEventListener('click', () => { ferme(o.ancre); });
    const pied = el('div', 'cloche-pied'); pied.append(ok);
    if (!o.plein) {
      v.replaceChildren(el('p', 'cloche-titre', '⚠️ Cloche non transmise'),
        el('p', null, 'Le professeur n’a pas reçu ma demande. Je clique encore une fois sur la cloche 🔔.'), pied);
      return;
    }
    const r = restantes(info);
    const lien = o.coince ? el('button', 'cloche-lien', 'Ouvrir « Ça coince ? »') : null;
    if (lien) { lien.type = 'button'; lien.addEventListener('click', () => { o.coince.open = true; o.coince.scrollIntoView({ block: 'start' }); }); }
    v.replaceChildren(el('p', 'cloche-titre', '⚠️ Plus de sonnerie pour l’instant'),
      el('p', null, 'J’ai déjà sonné ' + r.max + ' fois en une heure.' + (r.libre ? ' Prochaine sonnerie possible vers ' + heure(r.libre) + '.' : '')),
      el('p', null, 'En attendant : je relis « Ça coince ? », je demande à un autre voisin, ou j’entoure la case et je continue ailleurs.'),
      ...(lien ? [lien] : []), pied);
    if (r.n <= 0) marque(o.ancre, info);
  }
  /* Un mot pour le professeur. Le bloc n'est créé qu'une fois : rappelée toutes les 15 s, la fonction ne touche pas
     à ce que l'élève est en train de taper. Tout est écrit par textContent. */
  const MOT_MAX = 200;
  function blocMot(ancre) {
    let b = ancre.querySelector('.cloche-mot');
    if (!b) {
      b = el('div', 'cloche-mot');
      const rep = el('p', 'cloche-rep'), dit = el('p', 'cloche-note'), f = el('form'), champ = el('input'), ok = el('button', null, 'Envoyer');
      rep.hidden = true; rep.setAttribute('role', 'status'); dit.setAttribute('role', 'status');
      champ.type = 'text'; champ.maxLength = MOT_MAX; champ.autocomplete = 'off';
      champ.placeholder = 'Un mot pour le professeur (facultatif)'; champ.setAttribute('aria-label', 'Un mot pour le professeur, facultatif');
      ok.type = 'submit';
      f.append(champ, ok);
      f.addEventListener('submit', e => {
        e.preventDefault();
        const t = champ.value.trim(), envoie = b._envoie;
        if (!t || !envoie || ok.disabled) return;
        ok.disabled = true; dit.textContent = 'Envoi…';
        Promise.resolve().then(() => envoie(t)).then(() => { champ.value = ''; ok.disabled = false; dit.textContent = 'Envoyé au professeur : « ' + t + ' »'; },
          err => { ok.disabled = false; dit.textContent = String(err && err.message || err || 'Mot non transmis.').replace(/^(Exception|Error): /, ''); });
      });
      b.append(rep, f, dit);
      ancre.append(b);
    }
    return { b, rep: b.children[0], f: b.children[1], dit: b.children[2] };
  }
  function reponse(ancre, r) {
    const texte = r && (r.texte || (typeof r === 'string' ? r : ''));
    if (!ancre || !texte) return;
    css();
    const x = blocMot(ancre);
    if (x.rep.dataset.texte === texte) return;      // déjà affichée (ou fermée par l'élève) : on n'y revient pas
    const fermer = el('button', null, '✕'); fermer.type = 'button'; fermer.setAttribute('aria-label', 'Fermer la réponse du professeur');
    fermer.addEventListener('click', () => { x.rep.hidden = true; });
    x.rep.dataset.texte = texte; x.rep.replaceChildren(fermer, 'Le professeur : ' + texte); x.rep.hidden = false;
  }
  function mot(ancre, o) {
    if (!ancre) return;
    const deja = ancre.querySelector('.cloche-mot');
    if (!o) { if (deja) { deja._envoie = null; deja.children[1].hidden = true; deja.children[2].textContent = ''; if (deja.children[0].hidden) deja.remove(); } return; }
    css();
    const x = blocMot(ancre);
    x.b._envoie = o.envoie; x.f.hidden = false;
    if (o.mot && !x.dit.textContent) x.dit.textContent = 'Envoyé au professeur : « ' + o.mot + ' »';
    if (o.reponse) reponse(ancre, o.reponse);
  }
  const oublie = ancre => { const b = ancre && ancre.querySelector('.cloche-mot'); if (b) b.remove(); };
  css();
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.verif').forEach(ferme); });
  return { MAX, ANNULE, MOT_MAX, refuse, ferme, ouvert, sonnee, eteinte, restantes, marque, heure, mot, reponse, oublie };
})();
