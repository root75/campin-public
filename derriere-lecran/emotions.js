(() => {
/* Derrière l'écran — les huit personnages et la roue des émotions, dessinés pour ce site (SVG, aucun fichier image).
   Un personnage = un petit écran sur pattes, dont le visage dit l'émotion. La roue = huit pétales cliquables
   (R. Plutchik, 1980 : huit familles) ; au centre, le personnage de la famille choisie.
   Tout sort en texte SVG : la page « je m'entraîne » (jeu.js) et le cours (pas-a-pas/fiche.js) s'en servent tels quels.
   Les clics sont écoutés une fois pour toute la page : une roue ajoutée plus tard par le moteur marche aussi. */
const TRAIT = '#1f2a33', FOND = '#fffdf5';
const ech = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cle = nom => String(nom).toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
const l = (d, w = 3.2) => '<path d="' + d + '" fill="none" stroke="' + TRAIT + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>';
const rond = (x, y, r, f = TRAIT) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"/>';
const oeil = (x, y, r, dx = 0, dy = 0) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" stroke="' + TRAIT + '" stroke-width="2"/>' + rond(x + dx, y + dy, r * .42);

/* Le visage de chaque famille, dans un écran de 60 × 46 (x 20 à 80, y 22 à 68). bras : haut, bas, hanches, joues. */
const VISAGES = {
  neutre:       { bras: 'bas', traits: rond(38, 42, 3.4) + rond(62, 42, 3.4) + l('M41 57 h18') },
  joie:         { bras: 'haut', traits: l('M32 44 q6 -8 12 0') + l('M56 44 q6 -8 12 0') + '<path d="M36 52 q14 17 28 0 z" fill="' + TRAIT + '"/>' + rond(29, 53, 3.2, '#f4a6b4') + rond(71, 53, 3.2, '#f4a6b4') },
  confiance:    { bras: 'bas', traits: rond(38, 42, 3.4) + rond(62, 42, 3.4) + l('M38 54 q12 9 24 0') + '<path d="M50 30 c-3 -5 -9 -1 -5 4 l5 5 l5 -5 c4 -5 -2 -9 -5 -4z" fill="#e0607a"/>' },
  peur:         { bras: 'joues', traits: l('M30 32 l12 -4', 2.6) + l('M70 32 l-12 -4', 2.6) + oeil(38, 43, 6.5) + oeil(62, 43, 6.5) + l('M38 60 q3 -4 6 0 t6 0 t6 0 t6 0', 2.6) + '<path d="M83 24 q5 8 0 10 q-5 -2 0 -10z" fill="#4aa8d8"/>' },
  surprise:     { bras: 'haut', traits: l('M31 31 q7 -6 14 0', 2.6) + l('M55 31 q7 -6 14 0', 2.6) + oeil(38, 43, 5.5) + oeil(62, 43, 5.5) + '<ellipse cx="50" cy="59" rx="5" ry="6.5" fill="' + TRAIT + '"/>' },
  tristesse:    { bras: 'bas', traits: l('M30 37 l12 -5', 2.6) + l('M70 37 l-12 -5', 2.6) + rond(38, 44, 3.4) + rond(62, 44, 3.4) + l('M38 61 q12 -9 24 0') + '<path d="M34 49 q4 7 0 9 q-4 -2 0 -9z" fill="#4aa8d8"/>' },
  degout:       { bras: 'hanches', traits: l('M30 34 l13 3', 2.6) + l('M70 31 l-13 6', 2.6) + l('M32 43 h12') + l('M56 43 h12') + l('M36 59 q6 -6 12 0 q6 6 14 -3') + '<path d="M44 60 q4 8 8 1z" fill="#e0607a"/>' },
  colere:       { bras: 'hanches', traits: l('M29 32 l14 6', 4) + l('M71 32 l-14 6', 4) + rond(38, 44, 3.4) + rond(62, 44, 3.4) + l('M38 61 q12 -8 24 0', 3.6) + l('M86 18 l5 -5 M90 24 h7', 2.4) },
  anticipation: { bras: 'bas', traits: l('M31 34 h12', 2.6) + l('M56 30 q7 -5 13 0', 2.6) + oeil(38, 43, 5.5, 1.8, -1.8) + oeil(62, 43, 5.5, 1.8, -1.8) + l('M42 57 q9 7 19 -3') + '<path d="M87 16 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z" fill="#e3a922"/>' }
};
const BRAS = {
  bas: 'M12 46 q-8 8 -5 18 M88 46 q8 8 5 18',
  haut: 'M12 40 q-9 -8 -6 -20 M88 40 q9 -8 6 -20',
  hanches: 'M12 42 q-11 8 0 18 M88 42 q11 8 0 18',
  joues: 'M12 52 q-8 -2 -2 -14 M88 52 q8 -2 2 -14'
};
/** Le dessin d'un personnage, sans la balise svg : pour le poser dans un autre dessin (le centre de la roue). */
function corps(id, couleur) {
  const v = VISAGES[id] || VISAGES.neutre;
  return '<g class="emo-perso"><path d="' + BRAS[v.bras] + ' M38 78 v10 h-7 M62 78 v10 h7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="12" y="14" width="76" height="64" rx="17" fill="' + ech(couleur || '#9aa7b1') + '" stroke="' + TRAIT + '" stroke-width="2.5"/>' +
    '<rect x="20" y="22" width="60" height="48" rx="11" fill="' + FOND + '" stroke="' + TRAIT + '" stroke-width="1.5"/>' + v.traits + '</g>';
}
/** Un personnage. nom : lu par un lecteur d'écran ; sans nom, le dessin est décoratif. */
function visage(id, couleur, taille = 56, nom) {
  return '<svg class="emo-visage" viewBox="0 0 100 100" width="' + taille + '" height="' + taille + '" ' +
    (nom ? 'role="img" aria-label="' + ech(nom) + '"' : 'aria-hidden="true"') + '>' + corps(id, couleur) + '</svg>';
}
const clair = hex => { const n = parseInt(hex.slice(1), 16), r = n >> 16, v = n >> 8 & 255, b = n & 255; return (r * 299 + v * 587 + b * 114) / 1000 > 125; };
const pt = (r, a) => (170 + r * Math.cos(a * Math.PI / 180)).toFixed(1) + ' ' + (170 + r * Math.sin(a * Math.PI / 180)).toFixed(1);
/** La roue. emotions : [{id, nom, couleur, nuances, exemple?}], dans l'ordre de la roue. choisir : ajoute le bouton « Je choisis ». */
function roue(emotions, options = {}) {
  const pas = 360 / emotions.length, R1 = 60, R2 = 162, jeu = 1.6;
  const parts = emotions.map((e, i) => {
    const a = -90 - pas / 2 + i * pas + jeu, b = -90 + pas / 2 + i * pas - jeu, m = -90 + i * pas;
    return '<g class="emo-part" data-emo="' + ech(e.id) + '" data-nom="' + ech(e.nom) + '" data-couleur="' + ech(e.couleur) + '" data-nuances="' + ech(e.nuances) + '" data-exemple="' + ech(e.exemple || '') +
      '" role="button" tabindex="0" aria-pressed="false" aria-label="' + ech(e.nom + ' : ' + e.nuances) + '">' +
      '<path d="M' + pt(R1, a) + ' L' + pt(R2, a) + ' A' + R2 + ' ' + R2 + ' 0 0 1 ' + pt(R2, b) + ' L' + pt(R1, b) + ' A' + R1 + ' ' + R1 + ' 0 0 0 ' + pt(R1, a) + 'Z" fill="' + ech(e.couleur) + '"/>' +
      '<text x="' + pt(114, m).split(' ')[0] + '" y="' + (parseFloat(pt(114, m).split(' ')[1]) + 4.5).toFixed(1) + '" text-anchor="middle" fill="' + (clair(e.couleur) ? TRAIT : '#fff') + '">' + ech(e.nom) + '</text></g>';
  }).join('');
  return '<div class="emo-roue"' + (options.choisir ? ' data-choisir="1"' : '') + '>' +
    '<svg class="emo-disque" viewBox="0 0 340 340" role="group" aria-label="La roue des émotions : huit familles">' + parts +
    '<g class="emo-centre" transform="translate(120 120)">' + corps('neutre') + '</g></svg>' +
    '<p class="emo-detail" role="status">Clique sur une famille de la roue.</p>' +
    (options.choisir ? '<button class="btn emo-valider" type="button" hidden></button>' : '') + '</div>';
}
/** Les huit personnages côte à côte, pour égayer un titre : décoratif. */
function bande(emotions, taille = 44) {
  return '<span class="emo-bande" aria-hidden="true">' + emotions.map(e => visage(e.id, e.couleur, taille)).join('') + '</span>';
}
/* Les huit familles, pour qui n'a pas situations.json sous la main (le tableau du professeur). Mêmes textes que
   situations.json et que FAMILLES dans pas-a-pas/fiche.js : tests/vie-en-ligne-01.cjs le vérifie. */
const FAMILLES = [
  { id: 'joie', nom: 'Joie', couleur: '#e3a922', nuances: 'content, fier, soulagé, amusé' },
  { id: 'confiance', nom: 'Confiance', couleur: '#7fbf5a', nuances: 'en sécurité, soutenu, reconnu' },
  { id: 'peur', nom: 'Peur', couleur: '#2e7d4f', nuances: 'inquiet, nerveux, pas en sécurité' },
  { id: 'surprise', nom: 'Surprise', couleur: '#4aa8d8', nuances: 'étonné, perdu, pris de court' },
  { id: 'tristesse', nom: 'Tristesse', couleur: '#7a5ea8', nuances: 'déçu, seul, mis à l’écart' },
  { id: 'degout', nom: 'Dégoût', couleur: '#d46a9c', nuances: 'mal à l’aise, choqué' },
  { id: 'colere', nom: 'Colère', couleur: '#c8402f', nuances: 'agacé, frustré, traité injustement' },
  { id: 'anticipation', nom: 'Anticipation', couleur: '#e07b28', nuances: 'curieux, impatient, dans l’attente' }
];
if (typeof module !== 'undefined') module.exports = { visage, roue, bande, corps, cle, VISAGES, FAMILLES };
if (typeof document === 'undefined') return;
window.Emotions = { visage, roue, bande, corps, cle, FAMILLES };

const style = document.createElement('style');
style.textContent = [
  '.emo-visage{flex:none;vertical-align:middle;overflow:visible;color:inherit}',
  '.emo-bande{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}',
  '.emo-bande .emo-visage:hover .emo-perso,.emo-pop .emo-perso{animation:emo-saut .5s ease}',
  '.emo-perso{transform-box:fill-box;transform-origin:50% 100%}',
  '.emo-roue{display:grid;gap:8px;justify-items:center;text-align:center}',
  '.emo-disque{width:100%;max-width:21rem;height:auto;overflow:visible;color:inherit}',
  '.emo-part{cursor:pointer;transform-box:fill-box;transform-origin:center;transition:transform .15s ease,opacity .15s ease;outline:none}',
  '.emo-part text{font:700 13px "Atkinson Hyperlegible","Segoe UI",Arial,sans-serif;pointer-events:none}',
  '.emo-part path{stroke:transparent;stroke-width:3}',
  '.emo-part:hover{transform:scale(1.04)}',
  '.emo-part:focus-visible path{stroke:#1f2a33;stroke-dasharray:6 4}',
  '.emo-roue.emo-choix .emo-part{opacity:.45}',
  '.emo-roue.emo-choix .emo-part[aria-pressed="true"]{opacity:1;transform:scale(1.07)}',
  '.emo-roue.emo-fige .emo-part{cursor:default;pointer-events:none}',
  '.emo-detail{margin:0;min-height:3em;max-width:30rem}',
  '.emo-detail b{font-size:1.1em}',
  '@keyframes emo-saut{0%{transform:translateY(0) scale(1)}35%{transform:translateY(-7px) scale(1.06,.96)}70%{transform:translateY(0) scale(.97,1.04)}100%{transform:none}}',
  '@media (prefers-reduced-motion:reduce){.emo-part{transition:none}.emo-part:hover,.emo-roue.emo-choix .emo-part[aria-pressed="true"]{transform:none}.emo-perso{animation:none!important}}'
].join('\n');
document.head.appendChild(style);

/** Une famille est choisie sur une roue : le personnage vient au centre, les nuances s'écrivent dessous. */
function montre(part) {
  const zone = part.closest('.emo-roue'); if (!zone || zone.classList.contains('emo-fige')) return;
  const d = part.dataset, centre = zone.querySelector('.emo-centre'), detail = zone.querySelector('.emo-detail');
  zone.querySelectorAll('.emo-part').forEach(p => p.setAttribute('aria-pressed', p === part ? 'true' : 'false'));
  zone.classList.add('emo-choix');
  centre.innerHTML = corps(d.emo, d.couleur);
  centre.classList.remove('emo-pop'); void centre.getBoundingClientRect(); centre.classList.add('emo-pop');
  detail.replaceChildren();
  const b = document.createElement('b'); b.textContent = d.nom;
  detail.append(b, document.createTextNode(' — je me sens ' + d.nuances + '.' + (d.exemple ? ' En ligne, par exemple : ' + d.exemple + '.' : '')));
  const bouton = zone.querySelector('.emo-valider');
  if (bouton) { bouton.hidden = false; bouton.textContent = 'Je choisis : ' + d.nom.toLowerCase(); bouton.dataset.emo = d.emo; }
}
document.addEventListener('click', e => {
  const part = e.target.closest && e.target.closest('.emo-part'); if (part) return montre(part);
  const bouton = e.target.closest && e.target.closest('.emo-valider');
  if (bouton) { const zone = bouton.closest('.emo-roue'); zone.classList.add('emo-fige'); zone.querySelectorAll('.emo-part').forEach(p => p.setAttribute('tabindex', '-1')); bouton.hidden = true;
    zone.dispatchEvent(new CustomEvent('emotion-choisie', { bubbles: true, detail: { id: bouton.dataset.emo } })); }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const part = e.target.closest && e.target.closest('.emo-part'); if (part) { e.preventDefault(); montre(part); }
});
})();
