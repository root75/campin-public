/* Vues de démo COMMUNES à tous les cours — « 👀 Regarde comment faire ». Une vue = un seul code :
   la modifier ici la change dans tous les cours (Vincent, 12/11/2026). Un cours ne garde dans son demos.js
   que ses listes d'images (les données) et, s'il n'en existe pas encore ici, ses vues propres.
   À charger après pas-a-pas/demo-lecteur.js et avant le demos.js du cours. Le style est dans ce fichier
   (injecté une fois) : la page n'a rien à ajouter à son CSS.

   Dans le demos.js du cours :
     const DEMOS = { …, cote: DemosCommuns.vueFractionnee({ … }) };
     const ecran = f => DemosCommuns.ecran(f) || ecranDuCours(f);
   et, pour montrer le bouton DROIT de la souris sur une maquette du cours : DemosCommuns.souris(e).
   Une page qui n'existe que dans un cours garde la fenêtre commune : DemosCommuns.chrome({ onglets, adresse,
   contenu: [nœuds] }) ; un bureau Windows à compléter (une fenêtre ouverte) : DemosCommuns.bureau(f), puis
   remplir son .md-win-fond.

   Les vues (champ `vue` de l'image) :
     ch-fractionnee  Chrome, vue fractionnée (créée par vueFractionnee)
     ch-onglets      Chrome : des onglets et une page (onglets: [[texte, id, actif]], titre, bord: 'word')
     ch-nouvel       Chrome : un nouvel onglet, Google et le rond du profil (connecte: lettre du prénom ;
                     menu = menu du profil, nom = prénom du profil de l'école)
     g-gaufre        Google : la gaufre ⋮⋮⋮ en haut à droite (menu = les applications ouvertes)
     win-bureau      Windows 11 : bureau et barre des tâches (taches: [[icône, id]] en plus ; demarrer, saisie,
                     resultat: [nom, id, icône] — sans icône, le logo de Chrome ; clicdroit: ligne surlignée
                     du menu du clic droit sur Démarrer, droit = la souris DROIT)
     cr-devoir       Classroom : la page d'un devoir et « Vos devoirs » (créée par devoir) : menu « Ajouter ou
                     créer », picker 1 / 2 (Google Drive, fichier pas encore / déjà choisi), joint, piece (nom
                     de la pièce jointe, sinon o.fichier), confirme (« Rendre le devoir ? »), remis, note
     ol-liste        Outlook : dossiers et messages (messages, nonlu: n°, parti: n°, menu + hi = clic droit, droit)
     ol-lu           Outlook : un message ouvert et la carte du fichier joint (objet, de, fichier, texte, survol, menu + hi)
     ol-redac        Outlook : la rédaction (ruban, a: [noms], cc: [noms], objet, cci: [noms], tape, props: [[texte, id, hi]],
                     dans: ligne de la saisie 'a' | 'cc' | 'cci' (défaut 'cci'),
                     jointe: nom du fichier, menu: 'joindre' + hi)
     ol-selecteur    Outlook : le sélecteur OneDrive (fichier, coche, menu + hi = Partager le lien ▾)
     ol-accueil      Outlook : l'onglet Accueil et son ruban, simplifié ou agrandi (grand, bulle = infobulle de la flèche)
   Les cibles : data-c des nœuds (« ligne-a », « cci », « carte », « fleche », « joindre », « item-<libellé> »…).

   Vue fractionnée de Chrome (le cours et le document côte à côte, dans la même fenêtre) : Rat de ville,
   Labo 07, Messagerie 03. Menu de l'onglet : « Ajouter l'onglet à une nouvelle vue fractionnée » relevé
   à l'écran ; les trois autres lignes sont celles des maquettes du Rat et du Labo 07.
   Chrome, Windows et Classroom : libellés relevés avec un compte élève de test le 08/11/2026
   (memoire/ref_docs_eleves.md). Non relevés : le bouton du sélecteur Google Drive (bouton bleu sans texte),
   les applications de la gaufre, le menu du clic droit sur Démarrer (celui du Labo 07).
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
.md-ch-outils{display:flex;align-items:center;gap:8px;padding:6px 8px}
.md-ch-adresse{flex:1;min-width:0;background:#f1f3f4;border-radius:14px;padding:3px 12px;font-size:11px;color:#5f6368;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.md-ch-points{font-size:16px;color:#5f6368;padding:0 2px}
.md-profil{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#e8eaed;font-size:15px;flex:none}.md-profil.ecole{background:#1e8e3e;color:#fff;font-weight:700}
.md-ch-corps.page{gap:10px;padding:10px 16px;align-content:start}
.md-ch-corps.nouvel{justify-items:center;gap:12px;padding:28px 10px}
.md-google{font-size:26px;font-weight:700;color:#4285f4;padding:20px 24px}.md-ch-corps .md-google{padding:0}
.md-recherche{width:70%;height:30px;border:1px solid #dadce0;border-radius:16px}
.md-pmenu{position:absolute;right:8px;top:72px;width:230px;background:#fff;border:1px solid #c9d3db;border-radius:10px;box-shadow:0 4px 14px #0003;padding:6px 0;z-index:3}
.md-pmenu .md-item,.md-cr-menu .md-item,.md-win-menu .md-item{padding:5px 14px;font-size:13px}.md-pmenu .md-item.hi,.md-cr-menu .md-item.hi,.md-win-menu .md-item.hi{background:#e8f0fe;font-weight:700}
.md-pmenu-titre{font-weight:700;padding:4px 14px 6px;border-bottom:1px solid #eee}
.md-pmenu-carte{margin:4px 8px 6px;padding:8px;border-radius:8px;background:#f1f3f4;font-size:11px;color:#5f6368}
.md-pmenu-sep{border-top:1px solid #eee;margin:4px 0}
.md-logo-chrome{display:inline-block;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle,#4285f4 0 30%,#fff 31% 42%,transparent 43%),conic-gradient(from -60deg,#db4437 0 120deg,#f4b400 0 240deg,#0f9d58 0)}
.md-logo-edge{display:inline-block;width:22px;height:22px;border-radius:50% 50% 50% 20%;background:radial-gradient(circle at 65% 70%,#fff 0 18%,transparent 19%),linear-gradient(140deg,#37c6f4 0,#0c59a4 55%,#50c35f 100%)}
.md-g-gaufre .md-google{padding:30px}
.md-gaufre-ico{position:absolute;right:16px;top:16px;font-size:18px;letter-spacing:-3px;padding:4px 8px}
.md-apps{position:absolute;right:14px;top:52px;display:grid;grid-template-columns:repeat(2,84px);gap:8px;background:#fff;border:1px solid #c9d3db;border-radius:12px;padding:10px;box-shadow:0 4px 14px #0003}
.md-app{text-align:center;padding:10px 4px;border-radius:8px;background:#f1f3f4;font-weight:700;font-size:12px}
.md-app-docs{color:#1a73e8}.md-app-drive{color:#188038}.md-app-classroom{color:#137333}.md-app-agenda{color:#1967d2}
.md-win-bureau{background:linear-gradient(160deg,#cfe0f1,#e8eff7)}
.md-win-fond{position:absolute;inset:0 0 42px;padding:14px;display:grid;place-items:start center}
.md-win-barre{position:absolute;left:0;right:0;bottom:0;height:42px;background:#eef2f6ee;border-top:1px solid #c9d3db;display:flex;justify-content:center;align-items:center;gap:10px;border-radius:0 0 10px 10px}
.md-win-ico{width:32px;height:32px;display:grid;place-items:center;border-radius:6px;font-size:17px}.md-win-start{color:#0067c0;font-size:20px;font-weight:700}
.md-win-cherche{background:#fff;border:1px solid #c9d3db;border-radius:14px;padding:3px 12px;font-size:12px;color:#5f6368;white-space:nowrap}
.md-win-start-menu{position:absolute;left:50%;transform:translateX(-50%);bottom:50px;width:min(330px,88%);background:#f3f3f3ee;border:1px solid #c9d3db;border-radius:10px;padding:12px;display:grid;gap:8px;box-shadow:0 6px 20px #0003;z-index:3;box-sizing:border-box}
.md-win-recherche{background:#fff;border:1px solid #c9d3db;border-bottom:2px solid #0067c0;border-radius:16px;padding:6px 12px;min-height:20px}
.md-win-meilleur{font-weight:700;font-size:12px}
.md-win-res{display:flex;align-items:center;gap:10px;background:#fff;border-radius:8px;padding:8px}.md-win-res .md-logo-chrome{width:30px;height:30px}.md-win-res small{display:block;color:#5f6368}
.md-win-app{width:30px;height:30px;border-radius:6px;background:#e8eaed;display:grid;place-items:center;font-weight:700;font-size:13px}
.md-win-epingles{display:flex;gap:10px;flex-wrap:wrap}.md-win-epingles span{display:grid;justify-items:center;gap:2px;font-size:11px;background:#fff;border-radius:6px;padding:6px 8px;min-width:44px}
.md-win-menu{position:absolute;left:calc(50% - 75px);bottom:46px;background:#fff;border:1px solid #c9d3db;border-radius:8px;box-shadow:0 4px 14px #0003;padding:4px 0;z-index:3;min-width:190px}
.md-cr-devoir{display:grid;grid-template-columns:1fr minmax(170px,210px);gap:14px;padding:14px;align-items:start;align-content:start;min-height:320px}
.md-cr-sujet{display:grid;gap:4px;align-content:start}.md-cr-icone{width:34px;height:34px;border-radius:50%;background:#1e8e3e;display:grid;place-items:center;font-size:16px}
.md-cr-titre{font-size:17px;color:#137333}.md-cr-meta{color:#5f6368;font-size:12px}
.md-cr-consigne{height:60px;margin-top:6px;background:repeating-linear-gradient(#fff 0 10px,#e8eaed 10px 18px)}
.md-cr-lien{color:#1a73e8;font-weight:700;margin-top:6px;width:max-content}
.md-cr-droite{display:grid;gap:10px;align-content:start}
.md-cr-carte{border:1px solid #dadce0;border-radius:8px;padding:12px;display:grid;gap:8px;box-shadow:0 1px 3px #0002;position:relative}
.md-cr-tete{display:flex;justify-content:space-between;align-items:center;gap:6px}.md-cr-statut{color:#137333;font-size:12px}.md-cr-statut.remis{font-weight:700}.md-cr-statut.note{font-weight:700;font-size:14px;color:#1f1f1f}
.md-cr-ajouter,.md-cr-btn{border:1px solid #dadce0;border-radius:4px;padding:6px 10px;text-align:center;color:#1a73e8;font-weight:700}
.md-cr-plein{background:#1a73e8;border-color:#1a73e8;color:#fff}.md-cr-plein.eteint{background:#c5d6f2;border-color:#c5d6f2}.md-cr-sans{min-width:60px}
.md-cr-piece{border:1px solid #dadce0;border-radius:4px;padding:6px;font-size:12px;overflow-wrap:anywhere}
.md-cr-menu{position:absolute;left:12px;right:12px;top:72px;max-height:240px;overflow:hidden;background:#fff;border:1px solid #c9d3db;border-radius:8px;box-shadow:0 4px 14px #0003;padding:4px 0;z-index:3}
.md-cr-sous{padding:6px 14px 2px;font-size:11px;font-weight:700;color:#5f6368;border-top:1px solid #eee;margin-top:4px}
.md-cr-prive{gap:4px}.md-cr-prive small{color:#1967d2}.md-cr-msg{font-size:12px;background:#f1f3f4;border-radius:6px;padding:6px}
.md-cr-picker,.md-cr-dialogue{position:absolute;inset:18px 6%;background:#fff;border-radius:8px;box-shadow:0 6px 24px #0005;padding:12px;display:grid;gap:8px;align-content:start;z-index:4}
.md-cr-dialogue{inset:40px 14%}.md-cr-dialogue small{color:#5f6368}
.md-cr-ptitre{font-weight:700}.md-cr-fichiers{display:grid;gap:4px}.md-cr-f{padding:6px 8px;border-radius:6px;overflow-wrap:anywhere}.md-cr-f.choisi{background:#e8f0fe;outline:2px solid #1a73e8}.md-cr-f.autre{opacity:.6}
.md-cr-ppied{display:flex;justify-content:flex-end;gap:8px}
@media(max-width:560px){.md-cr-devoir{grid-template-columns:1fr;min-height:430px}.md-cr-picker,.md-cr-dialogue{inset:10px 3%}}
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

  /* ——— Chrome : la fenêtre (onglets, barre d'adresse, rond du profil, ⋮) ———
     o : onglets [[texte, id, actif]] ou nœuds déjà construits, adresse, profil (texte du rond, sinon pas de rond),
         ecole (rond vert du profil de l'école), corps (classe en plus du corps), contenu [nœuds]. */
  function fenetre(o) {
    const e = el('div', 'md md-chrome'), ong = el('div', 'md-ch-onglets');
    o.onglets.forEach(x => {
      if (x instanceof Node) { ong.append(x); return; }
      const [t, id, actif] = x, s = el('span', 'md-ch-onglet' + (actif ? ' actif' : ''), t); ong.append(id ? c(s, id) : s);
    });
    ong.append(el('span', 'md-ch-plus', '+'));
    const outils = el('div', 'md-ch-outils'); outils.append(el('span', 'md-ch-adresse', o.adresse || ''));
    if (o.profil) outils.append(c(el('span', 'md-profil' + (o.ecole ? ' ecole' : ''), o.profil), 'profil'));
    outils.append(el('span', 'md-ch-points', '⋮'));
    const corps = el('div', 'md-ch-corps' + (o.corps ? ' ' + o.corps : '')); (o.contenu || []).forEach(n => corps.append(n));
    e.append(ong, outils, corps);
    return e;
  }

  function fractionnee(f) {
    const o = f.o;
    const tc = c(el('span', 'md-ch-onglet actif', o.cours), 'ch-cours');
    const td = c(el('span', 'md-ch-onglet' + (f.split ? ' actif' : ''), o.doc), 'ch-doc');
    let onglets = [tc, td];
    if (f.split) { const duo = el('span', 'md-ch-duo'); duo.append(tc, td); onglets = [duo]; }
    const cours = el('div', 'md-ch-vol md-ch-cours'); cours.append(el('b', null, o.coursTitre));
    (o.coursLignes || []).forEach(t => cours.append(el('span', 'md-ch-case', t)));
    cours.append(el('span', 'md-ch-barre'), el('span', 'md-ch-barre court'));
    const contenu = [cours];
    if (f.split) {
      const d = c(el('div', 'md-ch-vol md-ch-doc'), 'vol-doc'); d.append(el('b', null, o.doc));
      (o.docLignes || []).forEach(t => d.append(el('span', null, t))); d.append(el('span', 'md-ch-barre'));
      contenu.push(d);
    }
    const e = fenetre({ onglets, adresse: f.split ? 'Vue fractionnée : deux onglets dans la même fenêtre' : o.adresse, corps: f.split ? 'split' : '', contenu });
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
    const page = el('div', 'md-ch-vol' + (f.bord ? ' md-ch-' + f.bord : '')); page.append(el('b', null, f.titre));
    (f.lignes || []).forEach(t => page.append(el('span', null, t))); page.append(el('span', 'md-ch-barre'), el('span', 'md-ch-barre'), el('span', 'md-ch-barre court'));
    return fenetre({ onglets: f.onglets, adresse: f.adresse, contenu: [page] });
  }

  /* ——— Chrome : un nouvel onglet, et le menu du rond du profil (relevé le 08/11/2026) ——— */
  function nouvel(f) {
    const e = fenetre({ onglets: [['Nouvel onglet', '', 1]], adresse: 'Demandez à Google ou saisissez une URL', profil: f.connecte || '👤', ecole: !!f.connecte,
      corps: 'nouvel', contenu: [el('div', 'md-google', 'Google'), el('div', 'md-recherche')] });
    if (f.menu) {
      const m = el('div', 'md-pmenu');
      m.append(el('div', 'md-pmenu-carte', 'Connectez-vous pour accéder à vos mots de passe, vos favoris et plus'),
        el('div', 'md-pmenu-titre', 'Autres profils Chrome'),
        c(el('div', 'md-item', '🟢 ' + (f.nom || 'Prénom') + ' (arcampin.be)'), 'p-ecole'),
        el('div', 'md-item', '👤 Personne 1'),
        el('div', 'md-pmenu-sep'),
        c(el('div', 'md-item hi', '➕ Ajouter un profil Chrome'), 'p-ajouter'),
        el('div', 'md-item', 'Ouvrir le profil invité'),
        el('div', 'md-item', 'Gérer les profils Chrome'));
      e.append(m);
    }
    return e;
  }

  /* ——— Google : la gaufre ⋮⋮⋮ (« 9 points »), en haut à droite ——— */
  const APPS = [['Drive', 'app-drive'], ['Docs', 'app-docs'], ['Classroom', 'app-classroom'], ['Agenda', 'app-agenda']];
  function gaufre(f) {
    const e = el('div', 'md md-g-gaufre');
    e.append(el('div', 'md-google', 'Google'), c(el('span', 'md-gaufre-ico', '⋮⋮⋮'), 'gaufre'));
    if (f.menu) { const g = el('div', 'md-apps'); APPS.forEach(([t, id]) => g.append(c(el('span', 'md-app md-app-' + t.toLowerCase(), t), id))); e.append(g); }
    return e;
  }

  /* ——— Windows 11 : le bureau, la barre des tâches, Démarrer ———
     Démarrer ▸ « chrome » ▸ « Meilleure correspondance » ▸ Google Chrome, Application : relevé le 08/11/2026. */
  const logo = n => el('span', 'md-logo-' + n);
  const MENU_WINX = ['Applications installées', 'Gestion de l’ordinateur', 'Gestionnaire des tâches', 'Paramètres', 'Explorateur de fichiers', 'Rechercher'];
  function bureau(f) {
    const e = el('div', 'md md-win-bureau'), b = el('div', 'md-win-barre');
    const ch = c(el('span', 'md-win-ico'), 'ico-chrome'); ch.append(logo('chrome')); ch.title = 'Google Chrome';
    b.append(c(el('span', 'md-win-ico md-win-start', '⊞'), 'demarrer'), el('span', 'md-win-cherche', '🔍 Rechercher'), c(el('span', 'md-win-ico', '📁'), 'explorateur'), ch);
    (f.taches || []).forEach(([t, id]) => b.append(c(el('span', 'md-win-ico', t), id)));
    e.append(el('div', 'md-win-fond'), b);
    if (f.demarrer) {
      const m = el('div', 'md-win-start-menu');
      m.append(c(el('div', 'md-win-recherche', '🔍 ' + (f.saisie || '')), 'recherche'));
      if (f.resultat) {
        const [nom, id, ico] = f.resultat, r = c(el('div', 'md-win-res'), id), t = el('span');
        t.append(el('b', null, nom), el('small', null, 'Application'));
        r.append(ico ? el('span', 'md-win-app', ico) : logo('chrome'), t);
        m.append(el('div', 'md-win-meilleur', 'Meilleure correspondance'), r);
      } else {
        const g = el('div', 'md-win-epingles'), ed = el('span'); ed.append(logo('edge'), el('small', null, 'Edge')); g.append(ed);
        ['Word', 'Excel', 'Outlook'].forEach(t => g.append(el('span', null, t)));
        m.append(el('div', 'md-win-meilleur', 'Épinglé'), g);
      }
      e.append(m);
    }
    if (f.clicdroit) {
      const m = el('div', 'md-win-menu');
      MENU_WINX.forEach(t => m.append(c(el('div', 'md-item' + (t === f.clicdroit ? ' hi' : ''), t), 'item-' + t)));
      e.append(m);
    }
    if (f.droit) souris(e);
    return e;
  }

  /* ——— Classroom : la page d'un devoir, « Vos devoirs » à droite (relevé le 08/11/2026) ———
     Sans pièce jointe « Marquer comme terminé », avec « Rendre le devoir » ▸ « Rendre le devoir ? » ▸ « Remis »
     + « Annuler l'envoi ». Il n'existe aucun bouton « Remettre ». Le bouton du sélecteur Drive n'est pas relevé.
     o : titre, meta [lignes sous le titre], instructions (lien « Afficher les instructions »), fichier (le
         fichier de l'élève), autre (un second fichier dans Drive), prive (carte « Commentaires privés »),
         note (« 8/10 ») et message (du professeur, sous Commentaires privés) quand l'image a note: 1.
     Dans le demos.js du cours : const rendre = DemosCommuns.devoir({ … }); puis rendre({ joint: 1, cible, legende }). */
  const devoir = o => etat => ({ vue: 'cr-devoir', o, ...etat });
  function crDevoir(f) {
    const o = f.o, nomPiece = '📄 ' + (f.piece || o.fichier), e = el('div', 'md md-cr-devoir');
    const sujet = el('div', 'md-cr-sujet');
    sujet.append(el('div', 'md-cr-icone', '📋'), el('div', 'md-cr-titre', o.titre));
    (o.meta || ['M. Louviaux']).forEach(t => sujet.append(el('div', 'md-cr-meta', t)));
    sujet.append(o.instructions ? c(el('span', 'md-cr-lien', 'Afficher les instructions'), 'instructions') : el('div', 'md-cr-consigne'));
    if (o.prive) sujet.append(el('div', 'md-cr-meta', '👥 Commentaires ajoutés au cours'));
    const carte = el('div', 'md-cr-carte'), tete = el('div', 'md-cr-tete');
    tete.append(el('b', null, 'Vos devoirs'), c(el('span', 'md-cr-statut' + (f.note ? ' note' : f.remis ? ' remis' : ''), f.note ? o.note : f.remis ? 'Remis' : 'Attribué'), 'statut'));
    carte.append(tete);
    if (f.joint) carte.append(c(el('div', 'md-cr-piece', nomPiece), 'piece'));
    if (!f.remis) carte.append(c(el('span', 'md-cr-ajouter', '+ Ajouter ou créer'), 'ajouter'));
    if (f.menu) {
      const m = el('div', 'md-cr-menu');
      [['🟢 Google Drive', 'gdrive'], ['🔗 Lien', ''], ['📎 Fichier', '']].forEach(([t, id]) => m.append(id ? c(el('div', 'md-item hi', t), id) : el('div', 'md-item', t)));
      m.append(el('div', 'md-cr-sous', 'Créer'));
      ['Docs', 'Slides', 'Sheets', 'Drawings', 'Vids'].forEach(t => m.append(el('div', 'md-item', t)));
      carte.append(m);
    }
    if (!f.note) carte.append(f.remis ? el('span', 'md-cr-btn', 'Annuler l’envoi') : c(el('span', 'md-cr-btn md-cr-plein', f.joint ? 'Rendre le devoir' : 'Marquer comme terminé'), 'rendre'));
    const droite = el('div', 'md-cr-droite'); droite.append(carte);
    if (o.prive) {
      const prive = c(el('div', 'md-cr-carte md-cr-prive'), 'prive'); prive.append(el('b', null, 'Commentaires privés'));
      if (f.note && o.message) prive.append(el('div', 'md-cr-msg', o.message));
      prive.append(el('small', null, 'Ajouter un commentaire pour…'));
      droite.append(prive);
    }
    e.append(sujet, droite);
    if (f.picker) {
      const p = el('div', 'md-cr-picker'), liste = el('div', 'md-cr-fichiers');
      liste.append(c(el('div', 'md-cr-f' + (f.picker === 2 ? ' choisi' : ''), '📄 ' + o.fichier), 'fichier'));
      if (o.autre) liste.append(el('div', 'md-cr-f autre', '📄 ' + o.autre));
      const pied = el('div', 'md-cr-ppied');
      pied.append(el('span', 'md-cr-btn', 'Annuler'), c(el('span', 'md-cr-btn md-cr-plein md-cr-sans' + (f.picker === 2 ? '' : ' eteint'), ' '), 'inserer'));
      p.append(el('div', 'md-cr-ptitre', 'Google Drive'), liste, pied); e.append(p);
    }
    if (f.confirme) {
      const dlg = el('div', 'md-cr-dialogue'), pied = el('div', 'md-cr-ppied');
      pied.append(el('span', 'md-cr-btn', 'Annuler'), c(el('span', 'md-cr-btn md-cr-plein', 'Rendre le devoir'), 'confirmer'));
      dlg.append(el('b', null, 'Rendre le devoir ?'), el('small', null, '1 pièce jointe sera envoyée pour « ' + o.titre + ' ».'), el('div', 'md-cr-piece', nomPiece), pied);
      e.append(dlg);
    }
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
    // tape / props : la saisie en cours et les propositions d'Outlook, dans la ligne `dans` ('a', 'cc' ou 'cci' ; 'cci' par défaut).
    const dans = f.dans || 'cci';
    const saisie = (l, id) => {
      if (id !== dans) return l;
      if (f.tape) l.querySelector('.ol-r-puces').append(el('span', 'ol-r-tape', f.tape));
      if (f.props) { const m = el('div', 'ol-menu ol-menu-sous'); f.props.forEach(([t, pid, hi]) => { const p = el('div', 'ol-item' + (hi ? ' hi' : ''), t); m.append(pid ? c(p, pid) : p); }); l.append(m); }
      return l;
    };
    e.append(haut, saisie(ligne('ligne-a', 'À', f.a, f.cci ? null : c(el('span', 'ol-r-cci', 'Cci'), 'cci')), 'a'), saisie(ligne('ligne-cc', 'Cc', f.cc), 'cc'));
    if (f.cci) e.append(saisie(ligne('ligne-cci', 'Cci', f.cci), 'cci'));
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
  const VUES = { 'ch-fractionnee': fractionnee, 'ch-onglets': onglets, 'ch-nouvel': nouvel, 'g-gaufre': gaufre, 'win-bureau': bureau, 'cr-devoir': crDevoir, 'ol-liste': liste, 'ol-lu': lu, 'ol-redac': redac, 'ol-selecteur': selecteur, 'ol-accueil': accueil };
  function ecran(f) {
    return VUES[f.vue] ? VUES[f.vue](f) : null;
  }

  return { vueFractionnee, devoir, ecran, souris, chrome: fenetre, bureau };
})();
