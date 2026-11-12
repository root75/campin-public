/* Vues de démo COMMUNES à tous les cours — « 👀 Regarde comment faire ». Une vue = un seul code :
   la modifier ici la change dans tous les cours (Vincent, 12/11/2026). Un cours ne garde dans son demos.js
   que ses listes d'images (les données) et, s'il n'en existe pas encore ici, ses vues propres.
   À charger après pas-a-pas/demo-lecteur.js et avant le demos.js du cours. Le style est dans ce fichier
   (injecté une fois) : la page n'a rien à ajouter à son CSS.

   Dans le demos.js du cours :
     const DEMOS = { …, cote: DemosCommuns.vueFractionnee({ … }) };
     const ecran = f => DemosCommuns.ecran(f) || ecranDuCours(f);
   et, pour montrer le bouton DROIT de la souris sur une maquette du cours : DemosCommuns.souris(e).

   Les vues (champ `vue` de l'image) :
     ch-fractionnee  Chrome, vue fractionnée (créée par vueFractionnee)
     ch-onglets      Chrome : des onglets et une page (onglets: [[texte, id, actif]], titre, bord: 'word')
     ol-liste        Outlook : dossiers et messages (messages, nonlu: n°, parti: n°, menu + hi = clic droit, droit)
     ol-lu           Outlook : un message ouvert et la carte du fichier joint (objet, de, fichier, texte, survol, menu + hi)
     ol-redac        Outlook : la rédaction (ruban, a: [noms], objet, cci: [noms], tape, props: [[texte, id, hi]],
                     jointe: nom du fichier, menu: 'joindre' + hi)
     ol-selecteur    Outlook : le sélecteur OneDrive (fichier, coche, menu + hi = Partager le lien ▾)
     ol-accueil      Outlook : l'onglet Accueil et son ruban, simplifié ou agrandi (grand, bulle = infobulle de la flèche)
   Les cibles : data-c des nœuds (« ligne-a », « cci », « carte », « fleche », « joindre », « item-<libellé> »…).

   Vue fractionnée de Chrome (le cours et le document côte à côte, dans la même fenêtre) : Rat de ville,
   Labo 07, Messagerie 03. Menu de l'onglet : « Ajouter l'onglet à une nouvelle vue fractionnée » relevé
   à l'écran ; les trois autres lignes sont celles des maquettes du Rat et du Labo 07.
   Outlook web de l'école : libellés relevés le 20/10/2026 et le 12/11/2026 (memoire/seq_activites_info_04_messagerie.md).
   Une ligne de menu non relevée est une barre grise, sans texte inventé. Rien n'est enregistré. */
const DemosCommuns = (() => {
  const { el, c } = DemoLecteur;

  const CSS = `
.md-chrome{position:relative;min-height:250px;font-size:12px}
.md-ch-onglets{display:flex;align-items:end;gap:4px;background:#dee3ea;padding:6px 8px 0;border-radius:10px 10px 0 0}
.md-ch-onglet{background:#cfd6df;border-radius:8px 8px 0 0;padding:4px 10px;font-size:11px;max-width:40%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.md-ch-onglet.actif{background:#fff}
.md-ch-duo{display:flex;gap:2px;max-width:85%;outline:2px solid #1a73e8;border-radius:8px 8px 0 0}.md-ch-duo .md-ch-onglet{max-width:50%}
.md-ch-plus{padding:2px 8px;color:#5f6368}
.md-ch-adresse{margin:6px 8px;background:#f1f3f4;border-radius:14px;padding:3px 12px;font-size:11px;color:#5f6368;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.md-ch-corps{display:grid;gap:6px;padding:8px;min-height:170px}.md-ch-corps.split{grid-template-columns:1fr 1fr}
.md-ch-vol{border:1px solid #dadce0;border-radius:8px;padding:10px;display:grid;gap:6px;align-content:start;overflow:hidden}
.md-ch-doc{background:#f8fafd}.md-ch-doc span{font-size:11px}
.md-ch-barre{height:8px;background:#e3e8ec;border-radius:4px}.md-ch-barre.court{width:60%}
.md-ch-menu{position:absolute;left:28%;top:34px;background:#fff;border:1px solid #c9d3db;border-radius:8px;box-shadow:0 4px 14px #0003;padding:4px 0;z-index:3;max-width:70%}
.md-ch-menu .md-item{padding:4px 14px;font-size:12px}.md-ch-menu .md-item.hi{background:#edebe9;font-weight:700}
.md-ch-word{border-top:4px solid #185abd}
.ol-boite{display:grid;grid-template-columns:34% 1fr;min-height:270px}.ol-dossiers{background:#f3f2f1;padding:10px 8px;display:grid;align-content:start;gap:4px}.ol-dossier{padding:5px 8px;border-radius:6px}.ol-dossier.on{background:#e1dfdd;font-weight:700}
.ol-liste{padding:8px;display:grid;align-content:start;gap:6px}.ol-msg{display:grid;padding:6px 8px 6px 12px;border-bottom:1px solid #e1dfdd;border-left:4px solid transparent}.ol-msg b{font-weight:400}.ol-msg.nonlu{border-left-color:#0f6cbd}.ol-msg.nonlu b,.ol-msg.nonlu span{font-weight:700}.ol-msg.nonlu span{color:#0f6cbd}
.ol-menu{position:absolute;background:#fff;border:1px solid #c8c6c4;border-radius:8px;box-shadow:0 6px 18px #0003;padding:4px 0;font-size:12px;z-index:3;text-align:left;font-weight:400;color:#1f1f1f}.ol-menu hr{border:0;border-top:1px solid #e1dfdd;margin:2px 0}.ol-item{padding:3px 12px;white-space:nowrap}.ol-item.hi{background:#edebe9;font-weight:700}.ol-item.grise{color:#a19f9d}.ol-gris{height:8px;margin:7px 12px;border-radius:4px;background:#e6eaee}
.ol-menu-message{left:40%;top:6px;width:min(58%,250px)}.ol-menu-sous{left:0;top:100%;margin-top:4px;min-width:220px}.ol-menu-dessus{right:0;bottom:100%;margin-bottom:4px;min-width:160px}
.ol-lu{padding:12px 14px;display:grid;align-content:start;gap:8px;min-height:320px}.ol-l-objet{font-size:16px;font-weight:700}.ol-l-de{color:#605e5c}.ol-l-texte{margin:6px 0 0}
.ol-carte{position:relative;display:inline-flex;align-items:center;gap:8px;justify-self:start;border:1px solid #c8c6c4;border-radius:6px;padding:6px 10px;background:#fff;margin:6px 10px}.ol-carte.survol{background:#f3f2f1}.ol-ico{background:#185abd;color:#fff;font-weight:700;border-radius:3px;padding:0 5px;font-size:12px}.ol-carte-fleche{padding:0 6px;border-left:1px solid #c8c6c4;font-size:14px}
.ol-redac{display:grid;align-content:start;min-height:270px}.ol-r-onglets{display:flex;gap:14px;padding:6px 10px 0}.ol-r-onglets span{padding:2px 2px 4px}.ol-r-onglets .on{border-bottom:3px solid #0f6cbd;font-weight:600}.ol-ruban{display:flex;flex-wrap:wrap;gap:6px;padding:6px 10px;background:#faf9f8;border-bottom:1px solid #e1dfdd}.ol-bouton{position:relative;padding:3px 8px;border-radius:4px}
.ol-r-haut{padding:8px 10px;border-bottom:1px solid #e1dfdd}.ol-envoyer{display:inline-block;background:#0f6cbd;color:#fff;border-radius:4px;padding:4px 14px;font-weight:600}
.ol-r-ligne{position:relative;display:flex;align-items:center;gap:8px;padding:7px 10px;border-bottom:1px solid #e1dfdd;min-height:22px}.ol-r-nom{border:1px solid #c8c6c4;border-radius:4px;padding:1px 8px;min-width:24px;text-align:center}.ol-r-puces{display:flex;flex-wrap:wrap;gap:4px;flex:1}.ol-puce{background:#e8f1fa;border-radius:12px;padding:1px 10px}.ol-r-tape{border-right:2px solid #1f1f1f;padding-right:2px}.ol-r-cci{margin-left:auto;padding:2px 6px;color:#0f6cbd}
.ol-r-objet{padding:8px 10px;border-bottom:1px solid #e1dfdd}.ol-r-objet.vide{color:#605e5c}.ol-r-corps{min-height:50px}.ol-r-ligne .ol-menu{left:60px}
.ol-selecteur{display:grid;grid-template-columns:34% 1fr;grid-template-rows:1fr auto;min-height:270px}.ol-s-gauche{background:#f3f2f1;padding:10px 8px;display:grid;align-content:start;gap:4px}.ol-s-gauche div{padding:4px 8px;border-radius:6px}.ol-s-gauche .on{background:#e1dfdd;font-weight:700}
.ol-s-liste{padding:10px;display:grid;align-content:start;gap:6px}.ol-s-titre{font-weight:700}.ol-s-fic{display:flex;align-items:center;gap:8px;padding:6px;border-radius:6px}.ol-s-fic i{display:block;height:8px;width:60%;border-radius:4px;background:#e6eaee}.ol-s-fic.coche{background:#e8f1fa}.ol-s-case{width:14px;height:14px;border:1px solid #8a8886;border-radius:3px;display:grid;place-items:center;font-size:11px}.ol-s-fic.coche .ol-s-case{background:#0f6cbd;color:#fff;border-color:#0f6cbd}
.ol-s-bas{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;padding:8px 10px;border-top:1px solid #e1dfdd}.ol-s-partager{position:relative;display:inline-flex;background:#0f6cbd;color:#fff;border-radius:4px}.ol-s-partager>span{padding:4px 10px}.ol-s-fleche{border-left:1px solid #fff8}
.ol-accueil{min-height:230px}.ol-a-ruban{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:6px 30px 6px 10px;background:#faf9f8;border-bottom:1px solid #e1dfdd}.ol-a-ruban.grand{align-items:start;padding-bottom:20px;gap:2px}
.ol-a-b{display:grid;justify-items:center;gap:2px;padding:3px 6px;border-radius:4px;font-size:11px;text-align:center}.ol-a-b i{font-style:normal;font-size:16px;line-height:1}.ol-a-ruban:not(.grand) .ol-a-b b{display:none}.ol-a-b b{font-weight:400;max-width:70px}.ol-a-ruban .ol-envoyer{font-size:12px}
.ol-a-fleche{position:absolute;right:6px;bottom:2px;font-size:17px;font-weight:700;line-height:1;padding:1px 5px;border-radius:3px}.ol-bulle{position:absolute;right:2px;top:calc(100% + 4px);background:#323130;color:#fff;font-size:11px;padding:3px 8px;border-radius:4px;white-space:nowrap;z-index:3}
.ol-a-bas{display:grid;grid-template-columns:34% 1fr;min-height:120px}.ol-a-bas>div{padding:10px;display:grid;align-content:start;gap:8px}.ol-a-bas>div:first-child{background:#f3f2f1}.ol-a-bas i{display:block;height:8px;border-radius:4px;background:#e6eaee}
.md-souris{position:absolute;right:10px;bottom:10px;display:grid;justify-items:center;gap:2px;z-index:4;background:#fff8;border-radius:10px;padding:4px}.md-souris b{color:#c2410c;font-size:15px;letter-spacing:.06em}
`;
  function style() {
    if (document.getElementById('demos-communs-css')) return;
    const s = el('style', null, CSS); s.id = 'demos-communs-css'; document.head.append(s);
  }
  style();

  /* La souris dont le bouton DE DROITE s'allume : beaucoup d'élèves confondent les deux boutons. */
  const SOURIS = '<svg viewBox="0 0 60 90" width="54" height="81" aria-hidden="true"><rect x="3" y="3" width="54" height="84" rx="27" fill="#fff" stroke="#1f1f1f" stroke-width="4"/><path d="M30 3v34H3V30A27 27 0 0 1 30 3z" fill="#fff"/><path d="M30 3a27 27 0 0 1 27 27v7H30z" fill="#e8590c"/><line x1="30" y1="3" x2="30" y2="37" stroke="#1f1f1f" stroke-width="4"/><line x1="3" y1="37" x2="57" y2="37" stroke="#1f1f1f" stroke-width="4"/></svg>';
  function souris(e) {
    const s = el('div', 'md-souris'); s.innerHTML = SOURIS; s.append(el('b', null, 'DROIT'));
    e.append(s);
  }

  /* Vue fractionnée. o :
       titre       titre de l'animation
       cours       texte de l'onglet du cours (« 🐭 Mes cours – Le rat de ville »)
       coursTitre  titre du volet du cours, coursLignes : 1 ou 2 lignes de consigne (« ☐ … »)
       doc         texte de l'onglet et du volet du document ; quoi : « mon document », « Courrier »…
       docLignes   lignes du document une fois côte à côte ; adresse : barre d'adresse avant
       fin         légende de la dernière image */
  function vueFractionnee(o) {
    const v = { vue: 'ch-fractionnee', o };
    return { titre: o.titre, images: [
      { ...v, cible: 'ch-cours', legende: 'En haut de Chrome, je clique sur l’onglet du cours.' },
      { ...v, droit: 1, cible: 'ch-doc', legende: 'Clic DROIT sur l’onglet de ' + o.quoi + ' : le bouton de droite de la souris, sous mon majeur.' },
      { ...v, droit: 1, menu: 1, cible: 'item-split', legende: 'Un menu s’ouvre. Je clique, avec le bouton gauche cette fois, sur « Ajouter l’onglet à une nouvelle vue fractionnée ».' },
      { ...v, split: 1, cible: 'vol-doc', ok: 1, legende: o.fin }
    ] };
  }

  function chrome(f) {
    const o = f.o, e = el('div', 'md md-chrome');
    const ong = el('div', 'md-ch-onglets');
    const tc = c(el('span', 'md-ch-onglet actif', o.cours), 'ch-cours');
    const td = c(el('span', 'md-ch-onglet' + (f.split ? ' actif' : ''), o.doc), 'ch-doc');
    if (f.split) { const duo = el('span', 'md-ch-duo'); duo.append(tc, td); ong.append(duo); } else ong.append(tc, td);
    ong.append(el('span', 'md-ch-plus', '+'));
    const cours = el('div', 'md-ch-vol md-ch-cours'); cours.append(el('b', null, o.coursTitre));
    (o.coursLignes || []).forEach(t => cours.append(el('span', 'md-ch-case', t)));
    cours.append(el('span', 'md-ch-barre'), el('span', 'md-ch-barre court'));
    const corps = el('div', 'md-ch-corps' + (f.split ? ' split' : '')); corps.append(cours);
    if (f.split) {
      const d = c(el('div', 'md-ch-vol md-ch-doc'), 'vol-doc'); d.append(el('b', null, o.doc));
      (o.docLignes || []).forEach(t => d.append(el('span', null, t))); d.append(el('span', 'md-ch-barre'));
      corps.append(d);
    }
    e.append(ong, el('div', 'md-ch-adresse', f.split ? 'Vue fractionnée : deux onglets dans la même fenêtre' : o.adresse), corps);
    if (f.menu) {
      const m = el('div', 'md-ch-menu');
      [['Nouvel onglet à droite', ''], ['Ajouter l’onglet à une nouvelle vue fractionnée', 'item-split'], ['Ajouter l’onglet au groupe', ''], ['Fermer', '']]
        .forEach(([t, id]) => m.append(id ? c(el('div', 'md-item hi', t), id) : el('div', 'md-item', t)));
      e.append(m);
    }
    if (f.droit) souris(e);
    return e;
  }

  /* ——— Chrome : des onglets et une page ——— */
  function onglets(f) {
    const e = el('div', 'md md-chrome'), ong = el('div', 'md-ch-onglets');
    f.onglets.forEach(([t, id, actif]) => { const o = el('span', 'md-ch-onglet' + (actif ? ' actif' : ''), t); ong.append(id ? c(o, id) : o); });
    ong.append(el('span', 'md-ch-plus', '+'));
    const page = el('div', 'md-ch-vol' + (f.bord ? ' md-ch-' + f.bord : '')); page.append(el('b', null, f.titre));
    (f.lignes || []).forEach(t => page.append(el('span', null, t))); page.append(el('span', 'md-ch-barre'), el('span', 'md-ch-barre'), el('span', 'md-ch-barre court'));
    const corps = el('div', 'md-ch-corps'); corps.append(page);
    e.append(ong, corps);
    return e;
  }

  /* ——— Outlook web ——— */
  const item = (t, hi) => t === '—' ? el('hr') : !t ? el('div', 'ol-gris')
    : Array.isArray(t) ? el('div', 'ol-item grise', t[0]) : c(el('div', 'ol-item' + (t === hi ? ' hi' : ''), t), 'item-' + t);
  const menu = (cls, lignes, hi) => { const m = el('div', 'ol-menu ' + cls); lignes.forEach(t => m.append(item(t, hi))); return m; };
  const fichier = (nom, id) => { const p = c(el('div', 'ol-carte'), id); p.append(el('span', 'ol-ico', 'W'), el('span', null, nom)); return p; };
  // Clic droit sur un message de la liste (relevé le 12/11/2026, raccourci : les sous-menus ▸ sont omis).
  const MENU_MESSAGE = ['Répondre', 'Répondre à tous', 'Transférer', '—', 'Supprimer', 'Archiver', '—', 'Marquer comme non lu', 'Épingler', '—', 'Signaler du courrier indésirable', 'Signaler un hameçonnage', 'Bloquer'];
  // Flèche ▾ de la carte d'un fichier reçu (20/10/2026) ; la ligne « application de bureau » n'a pas été vue pour un .docx.
  const MENU_CARTE = ['Aperçu', 'Modifier dans le navigateur', 0, 'Enregistrer sur OneDrive', 'Copier', 'Télécharger'];
  // Trombone « Joindre un fichier » ▾ (20/10/2026) ; « Lien » est grisé.
  const MENU_JOINDRE = ['Parcourir cet ordinateur', 'OneDrive', 'Charger et partager', ['Lien']];

  function liste(f) {
    const e = el('div', 'md ol-boite');
    const dossiers = el('div', 'ol-dossiers');
    [['dos-reception', 'Boîte de réception'], ['dos-envoyes', 'Éléments envoyés'], ['dos-brouillons', 'Brouillons'], ['dos-indesirable', 'Courrier indésirable']]
      .forEach(([id, t], k) => dossiers.append(c(el('div', 'ol-dossier' + (k === 0 ? ' on' : ''), t), id)));
    const l = el('div', 'ol-liste');
    f.messages.forEach((m, k) => {
      if (f.parti === k) return;
      const ligne = c(el('div', 'ol-msg' + (m.nonlu || f.nonlu === k ? ' nonlu' : '')), 'msg-' + k);
      ligne.append(el('b', null, m.de), el('span', null, m.objet));
      l.append(ligne);
    });
    e.append(dossiers, l);
    if (f.menu) e.append(menu('ol-menu-message', MENU_MESSAGE, f.hi));
    if (f.droit) souris(e);
    return e;
  }

  function lu(f) {
    const e = el('div', 'md ol-lu');
    e.append(el('div', 'ol-l-objet', f.objet), el('div', 'ol-l-de', f.de));
    const carte = fichier(f.fichier, 'carte'); if (f.survol) carte.classList.add('survol');
    if (f.survol) carte.append(c(el('span', 'ol-carte-fleche', '▾'), 'fleche'));
    if (f.menu) carte.append(menu('ol-menu-sous', MENU_CARTE, f.hi));
    e.append(carte, el('p', 'ol-l-texte', f.texte || ''));
    if (f.droit) souris(e);
    return e;
  }

  function redac(f) {
    const e = el('div', 'md ol-redac');
    if (f.ruban) {
      const o = el('div', 'ol-r-onglets');
      [['onglet-message', 'Message'], ['onglet-inserer', 'Insérer'], ['onglet-options', 'Options']].forEach(([id, t], k) => o.append(c(el('span', k === 0 ? 'on' : '', t), id)));
      const r = el('div', 'ol-ruban'), joindre = c(el('span', 'ol-bouton', '📎 Joindre un fichier ▾'), 'joindre');
      if (f.menu === 'joindre') joindre.append(menu('ol-menu-sous', MENU_JOINDRE, f.hi));
      r.append(joindre, el('span', 'ol-bouton', '🔗 Lien'), el('span', 'ol-bouton', '✒️ Signature ▾'));
      e.append(o, r);
    }
    const haut = el('div', 'ol-r-haut'); haut.append(el('span', 'ol-envoyer', 'Envoyer'));
    const ligne = (id, nom, puces, fin) => {
      const l = c(el('div', 'ol-r-ligne'), id); l.append(el('span', 'ol-r-nom', nom));
      const z = el('span', 'ol-r-puces'); (puces || []).forEach(p => z.append(el('span', 'ol-puce', p))); l.append(z);
      if (fin) l.append(fin);
      return l;
    };
    // « Cci » est tout à droite de la ligne À, jusqu'à ce qu'on l'ajoute.
    e.append(haut, ligne('ligne-a', 'À', f.a, f.cci ? null : c(el('span', 'ol-r-cci', 'Cci'), 'cci')), ligne('ligne-cc', 'Cc', []));
    if (f.cci) {
      const l = ligne('ligne-cci', 'Cci', f.cci);
      if (f.tape) l.querySelector('.ol-r-puces').append(el('span', 'ol-r-tape', f.tape));
      if (f.props) { const m = el('div', 'ol-menu ol-menu-sous'); f.props.forEach(([t, id, hi]) => { const p = el('div', 'ol-item' + (hi ? ' hi' : ''), t); m.append(id ? c(p, id) : p); }); l.append(m); }
      e.append(l);
    }
    e.append(c(el('div', 'ol-r-objet' + (f.objet ? '' : ' vide'), f.objet || 'Ajouter un objet'), 'objet'));
    if (f.jointe) e.append(fichier(f.jointe, 'piece'));
    e.append(el('div', 'ol-r-corps'));
    return e;
  }

  function selecteur(f) {
    const e = el('div', 'md ol-selecteur');
    const gauche = el('div', 'ol-s-gauche');
    ['Récents', 'Fichiers', 'Partagés avec vous', 'Groupes', 'Pièces jointes récentes'].forEach((t, k) => gauche.append(el('div', k === 0 ? 'on' : '', t)));
    const l = el('div', 'ol-s-liste'); l.append(el('div', 'ol-s-titre', 'Récents'));
    const fic = c(el('div', 'ol-s-fic' + (f.coche ? ' coche' : '')), 'fichier');
    fic.append(el('span', 'ol-s-case', f.coche ? '✓' : ''), el('span', 'ol-ico', 'W'), el('span', null, f.fichier));
    l.append(fic);
    [1, 2].forEach(() => { const g = el('div', 'ol-s-fic'); g.append(el('span', 'ol-s-case'), el('i')); l.append(g); });
    const bas = el('div', 'ol-s-bas'), partager = el('span', 'ol-s-partager');
    partager.append(el('span', null, 'Partager le lien'), c(el('span', 'ol-s-fleche', '▾'), 'fleche-partager'));
    if (f.menu) partager.append(menu('ol-menu-dessus', ['Partager le lien', 'Joindre'], f.hi));
    bas.append(partager, el('span', 'ol-bouton', 'Annuler'));
    e.append(gauche, l, bas);
    return e;
  }

  /* L'onglet Accueil : simplifié, le ruban tient sur une ligne et les boutons n'ont pas de nom ; agrandi (« Changer de
     disposition », la petite flèche tout en bas à droite, relevée le 12/11/2026), chaque bouton a son nom dessous. */
  const BOUTONS_ACCUEIL = [['🗑', 'Supprimer'], ['🗄', 'Archiver'], ['⚠', 'Signaler'], ['↩', 'Répondre'], ['↩↩', 'Répondre à tous'], ['↪', 'Transférer'], ['📁', 'Déplacer'], ['✉', 'Lu / non lu']];
  function accueil(f) {
    const e = el('div', 'md ol-accueil');
    const o = el('div', 'ol-r-onglets');
    ['Fichier', 'Accueil', 'Afficher', 'Aide'].forEach((t, k) => o.append(el('span', k === 1 ? 'on' : '', t)));
    const r = c(el('div', 'ol-a-ruban' + (f.grand ? ' grand' : '')), 'ruban');
    r.append(c(el('span', 'ol-envoyer', 'Nouveau message'), 'nouveau'));
    BOUTONS_ACCUEIL.forEach(([i, t]) => { const b = el('span', 'ol-a-b'); b.append(el('i', null, i), el('b', null, t)); r.append(b); });
    const fl = c(el('span', 'ol-a-fleche', f.grand ? '˄' : '˅'), 'fleche-ruban');
    if (f.bulle) fl.append(el('span', 'ol-bulle', 'Changer de disposition'));
    r.append(fl);
    const bas = el('div', 'ol-a-bas'), g = el('div'), d = el('div');
    g.append(el('b', null, 'Boîte de réception'), el('i'), el('i')); d.append(el('i'), el('i'), el('i'));
    bas.append(g, d);
    e.append(o, r, bas);
    return e;
  }

  /* La maquette d'une image commune, ou null : le cours dessine alors la sienne. */
  const VUES = { 'ch-fractionnee': chrome, 'ch-onglets': onglets, 'ol-liste': liste, 'ol-lu': lu, 'ol-redac': redac, 'ol-selecteur': selecteur, 'ol-accueil': accueil };
  function ecran(f) {
    return VUES[f.vue] ? VUES[f.vue](f) : null;
  }

  return { vueFractionnee, ecran, souris };
})();
