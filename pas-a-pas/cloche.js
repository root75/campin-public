/* Cloche « J'attends de l'aide » — limiteur commun à tous les cours (Rat de ville, blocs.js, Messagerie 01).
   Avant de sonner : « ⚠️ Attention, avant de sonner », trois cases à cocher (consigne relue,
   « Ça coince ? » lu, voisin consulté) ; « 🔔 Je sonne » n'est actif qu'une fois les trois cochées.
   Au plus 3 sonneries par heure glissante : le serveur compte (Code.gs, CLOCHE_MAX_) et refuse la 4e ;
   la page affiche ce qu'il reste. Sans serveur (aperçu) ou avec un serveur qui ne compte pas encore,
   le compte est tenu dans la page ouverte. Se débloquer ne passe jamais par ce panneau.

     Cloche.verifie({ ancre, etape, info, sonne, coince })
       ancre  : la zone de la cloche (#aide) ; le panneau s'ouvre dedans
       etape  : texte après « J'ai relu la consigne », par ex. « de l'étape 3 »
       info   : { cloches, clocheMax, clocheLibre } du serveur, ou une promesse, ou rien
       sonne  : appelé quand l'élève a tout coché et clique « Je sonne »
       coince : le <details> « Ça coince ? » de la page (facultatif)
     Cloche.sonnee()          à appeler quand une sonnerie est confirmée (compte local)
     Cloche.phrase(info)      « Il me reste 2 sonneries sur 3 cette heure. »
     Cloche.marque(ancre, info)  cloche en pointillés quand il ne reste rien
     Cloche.ferme(ancre), Cloche.ouvert(ancre)
   Rien n'est enregistré sur le poste. */
const Cloche = (() => {
  const MAX = 3, HEURE = 3600 * 1000, ici = [];
  const el = (tag, cls, t) => { const n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; };
  const heure = t => new Date(t).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' });
  let style = false;
  function css() {
    if (style) return; style = true;
    const s = el('style');
    s.textContent = `.verif>p{display:none!important}
.epuise:not(.active)>button{opacity:.55;border-style:dashed!important}
.cloche-verif{background:var(--carte,#fff);color:var(--encre,#1f2a33);border:3px solid var(--fromage,#e3a922);border-radius:14px;padding:12px 14px;max-width:min(22rem,calc(100vw - 32px));box-shadow:0 6px 20px #0003;display:grid;gap:8px;text-align:left;font-size:1rem}
.cloche-verif p{margin:0}.cloche-titre{font-weight:800}
.cloche-liste{list-style:none;padding:0;margin:0;display:grid;gap:8px}.cloche-liste label{display:flex;gap:8px;align-items:flex-start;cursor:pointer;font-weight:600}.cloche-liste input{width:20px;height:20px;flex-shrink:0;margin:2px 0 0}
.cloche-verif .cloche-lien{background:none;border:0;padding:0;font:inherit;font-weight:700;color:var(--encre-bouton,#1d5a73);text-decoration:underline;cursor:pointer;justify-self:start}
.cloche-pied{display:flex;gap:8px;flex-wrap:wrap}.cloche-pied button{font:inherit;font-weight:700;border-radius:20px;padding:6px 14px;cursor:pointer;border:2px solid var(--encre-bouton,#1d5a73);background:var(--carte,#fff);color:var(--encre-bouton,#1d5a73)}
.cloche-pied .cloche-go{background:var(--encre-bouton,#1d5a73);color:#fff}.cloche-pied button:disabled{opacity:.4;cursor:default}
.cloche-note{font-size:.85rem;color:var(--doux,#5b6873)}`;
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
  function phrase(info) {
    const r = restantes(info);
    return r.n > 0 ? 'Il me reste ' + r.n + ' sonnerie' + (r.n > 1 ? 's' : '') + ' sur ' + r.max + ' cette heure.'
      : 'Plus de sonnerie avant ' + heure(r.libre) + '.';
  }
  const sonnee = () => { ici.push(Date.now()); };
  const marque = (ancre, info) => { css(); ancre.classList.toggle('epuise', restantes(info).n <= 0); };
  const zone = ancre => ancre.querySelector('.cloche-verif');
  function ferme(ancre) { const v = ancre && zone(ancre); if (v) v.hidden = true; if (ancre) ancre.classList.remove('verif'); }
  const ouvert = ancre => { const v = zone(ancre); return !!v && !v.hidden; };

  async function verifie(o) {
    css();
    let v = zone(o.ancre);
    if (!v) { v = el('div', 'cloche-verif'); v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', 'Avant de sonner'); o.ancre.append(v); }
    o.ancre.classList.add('verif'); v.hidden = false;
    v.replaceChildren(el('p', 'cloche-titre', '⚠️ Attention, avant de sonner'), el('p', 'cloche-note', 'Je vérifie combien de sonneries il me reste…'));
    let info = null; try { info = await o.info; } catch (e) { info = null; }
    if (v.hidden) return;   // refermé pendant l'attente
    const r = restantes(info);
    const fermer = t => { const b = el('button', null, t); b.type = 'button'; b.addEventListener('click', () => { ferme(o.ancre); }); return b; };
    const lien = o.coince ? el('button', 'cloche-lien', 'Ouvrir « Ça coince ? »') : null;
    if (lien) { lien.type = 'button'; lien.addEventListener('click', () => { o.coince.open = true; o.coince.scrollIntoView({ block: 'start' }); }); }
    const pied = el('div', 'cloche-pied');
    if (r.n <= 0) {
      pied.append(fermer('J’ai compris'));
      v.replaceChildren(el('p', 'cloche-titre', '⚠️ Plus de sonnerie pour l’instant'),
        el('p', null, 'J’ai déjà sonné ' + r.max + ' fois en une heure. Prochaine sonnerie possible vers ' + heure(r.libre) + '.'),
        el('p', null, 'En attendant : je relis « Ça coince ? », je demande à un autre voisin, ou j’entoure la case et je continue ailleurs.'),
        ...(lien ? [lien] : []), pied);
      marque(o.ancre, info); return;
    }
    const ul = el('ul', 'cloche-liste'), go = el('button', 'cloche-go', '🔔 Je sonne'); go.type = 'button'; go.disabled = true;
    ['J’ai relu la consigne ' + (o.etape || 'de mon étape') + '.',
     o.coince ? 'J’ai lu « Ça coince ? » pour mon étape.' : 'J’ai relu les explications de mon étape.',
     'J’ai demandé à mon voisin (il explique, il ne touche pas la souris).'].forEach(t => {
      const li = el('li'), lab = el('label'), cb = el('input'); cb.type = 'checkbox';
      cb.addEventListener('change', () => { go.disabled = ![...ul.querySelectorAll('input')].every(x => x.checked); });
      lab.append(cb, ' ' + t); li.append(lab); ul.append(li);
    });
    go.addEventListener('click', () => { ferme(o.ancre); o.sonne(); });
    pied.append(go, fermer('Annuler'));
    v.replaceChildren(el('p', 'cloche-titre', '⚠️ Attention, avant de sonner'), ul, ...(lien ? [lien] : []),
      el('p', 'cloche-note', phrase(info)), pied);
    ul.querySelector('input').focus();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.verif').forEach(ferme); });
  return { MAX, verifie, ferme, ouvert, sonnee, restantes, phrase, marque, heure };
})();
