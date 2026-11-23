/* Vie en ligne 01 — Derrière l'écran. DONNÉES seulement : le moteur est pas-a-pas/blocs.js.
   Questions de preuve : preuves.json (3 variantes par bloc, tirées et corrigées par le serveur).
   Pour la 1re (FMTTN, volet Numérique) : ce qu'un message fait ressentir, ce qui le déclenche, comment réagir.
   Trois verbes : percevoir, comprendre, ajuster. La démarche s'inspire du jeu « ConnectÉmoi » (Fédération
   Wallonie-Bruxelles, e-classe) ; les situations, les textes et les dessins sont écrits pour ce site.
   Les phrases libres des blocs 2 et 6 s'affichent au tableau (« Leurs phrases ») : c'est la mise en commun.
   Fiche prof : campin-pedagogique, cours/s1-fmttn/sequences/04-derriere-lecran/PROF.md. */
const COURS = 'vie-en-ligne-1';
const VERSION_PARCOURS = 'v1';
const PRESENTATION = 'missions';
const PREUVES = 'https://root75.github.io/campin-public/derriere-lecran/pas-a-pas/preuves.json?v=20261123';
const HORS_SUIVI = 'Entraînement libre : rien n’est transmis au professeur. En classe, ouvre Mes cours avec ton compte scolaire.';
const SEQUENCE = { contenus:true };

const echappe = s => String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Une discussion dessinée. messages : ['Hugo','16:42','texte'], ['moi:Sacha','17:05','texte'] (bulle à droite),
   ['brouillon:Jeanne','22:41','texte'] (pas encore envoyé), ou une simple chaîne = une ligne d'information. */
function discussion(lieu, detail, messages){
  return '<div class="ecran-dessin" role="group" aria-label="Une discussion en ligne"><div class="haut"><b>'+echappe(lieu)+'</b><span>'+echappe(detail)+'</span></div><div class="fil">'+
    messages.map(m => {
      if(typeof m === 'string') return '<span class="info-fil">'+echappe(m)+'</span>';
      const genre = /^(moi|brouillon):/.exec(m[0]), nom = m[0].replace(/^(moi|brouillon):/,'');
      return '<span class="bulle-msg'+(genre?' moi':'')+(genre&&genre[1]==='brouillon'?' brouillon':'')+'"><span class="qui">'+echappe(nom)+'</span>'+echappe(m[2])+'<span class="heure">'+echappe(m[1])+'</span></span>';
    }).join('')+'</div></div>';
}
function publication(compte, texte, bas){
  return '<div class="ecran-dessin" role="group" aria-label="Une publication en ligne"><div class="haut"><b>'+echappe(compte)+'</b><span>publication</span></div><div class="publi"><span class="texte">'+echappe(texte)+'</span><span class="bas">'+echappe(bas)+'</span></div></div>';
}

/* La roue des émotions (R. Plutchik, 1980) : huit familles. Les mêmes que derriere-lecran/situations.json. */
const FAMILLES = [
  ['Joie','#e3a922','content, fier, soulagé, amusé','un compliment, une bonne nouvelle'],
  ['Confiance','#7fbf5a','en sécurité, soutenu, reconnu','un message de soutien, un groupe où je me sens bien'],
  ['Peur','#2e7d4f','inquiet, nerveux, pas en sécurité','un message bizarre, un inconnu qui insiste'],
  ['Surprise','#4aa8d8','étonné, perdu, pris de court','une nouvelle inattendue'],
  ['Tristesse','#7a5ea8','déçu, seul, mis à l’écart','pas de réponse, un ton froid'],
  ['Dégoût','#d46a9c','mal à l’aise, choqué','un propos déplacé ou méchant'],
  ['Colère','#c8402f','agacé, frustré, traité injustement','une moquerie, une accusation'],
  ['Anticipation','#e07b28','curieux, impatient, dans l’attente','j’attends une réponse, une notification']
];
const ROUE = '<table class="lettre"><tr><th>La famille</th><th>Je me sens…</th><th>En ligne, par exemple</th></tr>'+
  FAMILLES.map(f => '<tr><td><span class="pastille-emo" style="background:'+f[1]+'" aria-hidden="true"></span><b>'+f[0]+'</b></td><td>'+f[2]+'</td><td>'+f[3]+'</td></tr>').join('')+
  '</table><p>Plusieurs émotions peuvent exister <b>en même temps</b>. Et deux personnes peuvent ressentir deux émotions différentes devant le même message.</p>';

const BLOCS = [
 {partie:'A — Je perçois', titre:'La roue des émotions', min:5,
  veux:'Trouver le mot juste pour dire ce que je ressens devant un écran.',
  avant:ROUE,
  gestes:['Lis les <b>huit familles</b> d’émotions, ligne par ligne.','Pense au dernier message qui t’a fait quelque chose : trouve <b>sa famille</b> dans le tableau.','Clique sur ✅ C’est vérifié : un <b>texte à compléter</b> t’attend.'],
  vois:'Tu as trouvé dans le tableau la famille de ton émotion.',
  coince:['Je ne trouve pas mon émotion : lis la colonne « Je me sens… », pas seulement le nom de la famille.','J’en ressens deux à la fois : c’est normal. Choisis la plus forte.','« Anticipation » : c’est quand on attend quelque chose, avec envie ou avec inquiétude.'],
  q:{serveur:true}},
 {partie:'A — Je perçois', titre:'Un message, deux lectures', min:6,
  veux:'Voir qu’un même message peut se comprendre de deux façons.',
  avant:discussion('Lina et Tom','discussion privée',[['moi:Lina','18:20','Tom, désolée pour ce matin, je n’aurais pas dû parler de ta note devant les autres. Tu m’en veux ?'],['Tom','18:47','Ok.']]),
  essai:{q:'Tom est-il encore fâché ?', choix:[['Oui, il est fâché','C’est une lecture possible : le message est très sec.'],['Non, c’est pardonné','C’est une autre lecture possible : « Ok » veut aussi dire « d’accord ».'],['Je ne sais pas','C’est la réponse la plus prudente : avec ce message seul, on ne peut pas savoir.']],
    apres:'<p>À l’écrit, on n’entend pas la <b>voix</b> et on ne voit pas le <b>visage</b>. Un message très court peut se lire de plusieurs façons : c’est un <b>message ambigu</b>.</p><p>Lina peut donc ressentir de la confiance (c’est pardonné) ou de la peur (il m’en veut encore). Pour un seul et même « Ok. ».</p>', suite:'👉 À toi'},
  coince:['« Ambigu » : qui peut se comprendre de plusieurs façons.','Pour la phrase à écrire : imagine que tu es Tom, et que tu n’es plus fâché. Que dirais-tu en face ?'],
  q:{serveur:true}},
 {partie:'B — Je comprends', titre:'Qu’est-ce qui déclenche l’émotion ?', min:6,
  veux:'Trouver ce qui, dans une situation en ligne, fait monter l’émotion.',
  avant:publication('@alerte_info_direct','🚨 URGENT 🚨 Toutes les écoles ferment demain ! Ils ne veulent pas que ça se sache. PARTAGEZ avant que ce soit supprimé !!!','3 214 partages')+
    '<aside class="repere"><h3>🔎 Trois déclencheurs fréquents en ligne</h3><ul><li>Le <b>silence</b> : « Vu », et pas de réponse.</li><li>L’<b>urgence</b> : « vite », « partagez », des majuscules.</li><li>Le <b>public</b> : tout le groupe voit, et réagit.</li></ul></aside>',
  essai:{q:'Pourquoi cette publication donne-t-elle envie de partager tout de suite ?', choix:[['Elle donne sa source','Regarde bien : elle ne dit ni qui parle, ni où vérifier.'],['Elle joue sur l’urgence et le secret','Oui : majuscules, « URGENT », « avant que ce soit supprimé ».'],['Je ne sais pas','Normal : relis l’encadré des trois déclencheurs.']],
    apres:'<p>Cette publication cherche une <b>émotion forte</b> : surprise, peur, ou même joie. Quand l’émotion monte, on réfléchit moins : c’est le but.</p><p>Une vraie information de l’école arrive <b>par l’école</b>. Je vérifie d’abord.</p>', suite:'👉 À toi'},
  coince:['« Déclencher » : faire démarrer. Ici : ce qui fait démarrer l’émotion.','Beaucoup de partages ne prouvent rien : une fausse nouvelle circule souvent plus vite qu’une vraie.'],
  q:{serveur:true}},
 {partie:'C — J’ajuste', titre:'Je suis témoin', min:6,
  veux:'Choisir ce que je fais quand je vois quelqu’un se faire blesser en ligne.',
  avant:discussion('Groupe « La classe »','24 membres',[['Hugo','16:42','Devinez qui a ENCORE oublié son cours d’histoire ? Inès bien sûr 😂'],'5 personnes ont réagi 😂','Inès ne répond pas.']),
  essai:{q:'Tu es dans ce groupe. Ajouter toi aussi un 😂, est-ce que ça change quelque chose ?', choix:[['Non, c’est juste un émoji','Pour Inès, c’est une personne de plus qui rit d’elle, devant toute la classe.'],['Oui, ça aggrave','Oui : chaque réaction rend la moquerie plus lourde.'],['Je ne sais pas','Normal : mets-toi à la place d’Inès, qui lit les réactions une par une.']],
    apres:'<p>Un témoin n’est jamais neutre. Il a trois chemins :</p><ul><li><b>Rire avec</b> : ça aggrave.</li><li><b>Se taire</b> : ça laisse faire. Pour Inès, le silence ressemble à un accord.</li><li><b>Soutenir</b> : un message en privé à Inès, et un adulte prévenu si ça continue. Ça apaise.</li></ul>', suite:'👉 À toi'},
  coince:['J’ai peur qu’on se moque de moi si je réagis : un message en privé à la personne blessée ne se voit pas dans le groupe.','Prévenir un adulte, ce n’est pas rapporter : c’est protéger quelqu’un.'],
  q:{serveur:true}},
 {partie:'C — J’ajuste', titre:'Avant d’envoyer, et quand ça me dépasse', min:6,
  veux:'Connaître trois réflexes pour bien réagir en ligne.',
  avant:'<aside class="repere"><h3>🧭 Trois réflexes</h3><ol><li><b>J’attends.</b> En colère, j’écris demain : la colère passe, le message reste.</li><li><b>Je relis</b> mon message comme si je le recevais, sans ma voix ni mon visage.</li><li><b>Ça me dépasse ?</b> Je bloque, je signale, et j’en parle à une personne qui me connaît : un parent, un ami, un éducateur, un professeur.</li></ol></aside>',
  gestes:['Lis les <b>trois réflexes</b>.','Repère celui que tu <b>utilises déjà</b>.','Clique sur ✅ C’est vérifié : une <b>situation</b> t’attend.'],
  vois:'Tu as lu les trois réflexes et repéré celui que tu utilises déjà.',
  coince:['« Signaler » et « Bloquer » : deux boutons que presque toutes les applications proposent, souvent derrière les trois points ⋮ ou ⋯ d’un message ou d’un profil.','Une IA peut donner des idées, mais elle ne te connaît pas et ne ressent rien : quand ça ne va pas, parle à une personne.'],
  q:{serveur:true}},
 {partie:'D — Notre règle', titre:'Une règle pour le groupe de la classe', min:6,
  veux:'Proposer une règle qui rend un groupe de discussion plus agréable pour tout le monde.',
  avant:'<aside class="repere"><h3>🤝 La nétiquette</h3><p>La <b>nétiquette</b>, ce sont les règles de politesse d’internet. Un groupe de discussion en a besoin aussi : ce qu’on y écrit, tout le groupe le lit.</p></aside>',
  gestes:['Repense aux <b>situations</b> de ce cours : le « Ok. », la moquerie dans le groupe, le « Vu » sans réponse.','Choisis <b>une règle</b> qui aurait évité un de ces problèmes.','Clique sur ✅ C’est vérifié, complète le texte, puis <b>écris ta règle</b>.'],
  vois:'Ta règle est écrite : elle s’affichera au tableau de la classe, sans ton nom.',
  coince:['Je n’ai pas d’idée : commence par « Dans notre groupe, on… » ou « Avant d’envoyer, je… ».','Une règle se dit en une phrase, et tout le monde peut la suivre.'],
  q:{serveur:true}}
];

/* L'auto-évaluation de fin (grille « Moi » du moteur) : une question par critère de la grille « Sécurité » (U4),
   intitulé exact du critère sous la question. A = je vais plus loin que demandé, B = je fais seul ce qui est demandé,
   C = avec de l'aide ou pas à chaque fois, D = pas encore. Non cotée. */
const GRILLE = {
  intro: '<p><b>Avant de partir : où en es-tu ?</b> Quatre questions. Pour chacune, lis les quatre phrases, de A à D, et clique sur celle qui te ressemble le plus. Ce n’est pas coté : ta réponse t’aide à voir ce qu’il te reste à travailler, et ton professeur voit où t’aider. ★ = le plus important.</p>',
  niveaux: { A:'', B:'', C:'', D:'' },
  criteres: [
    { n:'1. Sais-tu repérer ce qui fait monter une émotion en ligne ?', inc:false, regarde:'Critère : Repérage des risques et des informations sensibles',
      A:'Je repère le déclencheur (silence, urgence, public) et je trouve moi-même d’autres exemples.',
      B:'Je repère le déclencheur dans une situation qu’on me montre.',
      C:'Je nomme l’émotion, mais je ne vois pas toujours ce qui la déclenche.',
      D:'Je ne vois pas encore de quoi il s’agit.' },
    { n:'2. Fais-tu attention aux autres quand tu écris dans un groupe ?', inc:true, regarde:'Critère : Mise en œuvre de comportements de protection',
      A:'Je relis mes messages en pensant à celui qui les reçoit, et j’aide le groupe à garder ses règles.',
      B:'Je relis mes messages en pensant à celui qui les reçoit, et je n’envoie rien sous le coup de la colère.',
      C:'J’y pense, mais pas à chaque fois.',
      D:'Je n’y avais pas encore pensé.' },
    { n:'3. Sais-tu quoi faire quand une situation en ligne tourne mal ?', inc:true, regarde:'Critère : Réaction face aux situations problématiques',
      A:'Je sais soutenir, bloquer, signaler et prévenir un adulte, et je choisis selon la situation.',
      B:'Je sais que je peux soutenir la personne, bloquer, signaler, et prévenir un adulte.',
      C:'Je connais une de ces réactions, pas les autres.',
      D:'Je ne sais pas encore quoi faire.' },
    { n:'4. Sais-tu expliquer pourquoi tu réagis ainsi ?', inc:false, regarde:'Critère : Communication et justification',
      A:'J’explique mon choix, et aussi pourquoi les autres réactions aggraveraient la situation.',
      B:'J’explique mon choix avec les trois verbes : percevoir, comprendre, ajuster.',
      C:'Je sais quoi faire, sans savoir l’expliquer.',
      D:'Je ne sais pas encore l’expliquer.' },
  ]
};
const FIN = {
  titre:'Bravo : tu sais regarder derrière l’écran',
  bulle:'Parcours terminé !',
  texte:'Nommer l’émotion, trouver ce qui la déclenche, choisir ta réaction : percevoir, comprendre, ajuster.',
  revision:{titre:'Derrière l’écran — je m’entraîne ↗', texte:'L’essentiel du cours, et dix situations à jouer en trois temps.', url:'https://root75.github.io/campin-public/derriere-lecran/'},
  citation:{texte:'Ne fais pas à autrui ce que tu ne voudrais pas qu’on te fasse.', auteur:'Règle d’or', source:'Proverbe', lien:'En ligne aussi : derrière chaque écran, il y a quelqu’un.'},
  plus:'En attendant la mise en commun : ouvre « Derrière l’écran — je m’entraîne » et joue une manche de situations.',
  lien:'<a href="https://root75.github.io/campin-public/derriere-lecran/" target="_blank" rel="noopener">la page « Derrière l’écran »</a>'
};

if(typeof module!=='undefined') module.exports = { BLOCS, FIN, GRILLE, COURS, FAMILLES };
