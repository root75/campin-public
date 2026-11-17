// node tests/scene-bloc.cjs — la scène de bloc (blocs.js ▸ sceneBloc) : un décor qui réagit à juste / faux
// pour les blocs sans code. Elle ne donne jamais la réponse et ne renvoie qu'à ce que le bloc contient.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const lis = f => fs.readFileSync(__dirname + '/../' + f, 'utf8');
const moteur = lis('pas-a-pas/blocs.js');
assert.match(moteur, /function sceneBloc\(S\)/);
assert.match(moteur, /if\(scene\) scene\.joue\("juste"\)/, 'la réussite joue la scène');
assert.match(moteur, /if\(scene\) scene\.joue\("faux"\)/, 'une erreur joue la scène');
assert.match(moteur, /aria-hidden/, 'le décor est caché aux lecteurs d\'écran : le retour écrit dit la même chose');

const ATTENDU = { 'messagerie-2': 3, 'messagerie-3': 7 };
let total = 0;
for (const cours of Object.keys(ATTENDU)) {
  const src = lis(cours + '/pas-a-pas/fiche.js'), preuves = JSON.parse(lis(cours + '/pas-a-pas/preuves.json')).blocs;
  const blocs = src.slice(src.indexOf('const BLOCS = [')).split(/\n \{partie:/).slice(1);
  let n = 0;
  blocs.forEach((b, i) => {
    const m = b.match(/scene:(\{avant:\[.*?\],juste:\[.*?\],faux:\[.*?\]\}),\n/);
    if (!m) return;
    n++; total++;
    const S = vm.runInNewContext('(' + m[1] + ')'), ou = cours + ' bloc ' + (i + 1);
    for (const e of ['avant', 'juste', 'faux']) {
      assert.ok(Array.isArray(S[e]) && S[e].length === 2 && S[e][0] && S[e][1], ou + ' : ' + e + ' = [image, phrase]');
      assert.ok(S[e][1].length <= 70, ou + ' : phrase courte (' + e + ')');
    }
    // Aucune phrase ne contient une bonne réponse de la preuve (mots du texte à trous, bon choix d'un QCM).
    const reponses = [];
    preuves[i].forEach(v => { if (v.mots) reponses.push(...v.mots); if (v.type === 'qcm') reponses.push(v.c[0]); if (v.regle && typeof v.regle.egal === 'string') reponses.push(v.regle.egal); });
    const norme = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    for (const e of ['avant', 'faux']) for (const r of reponses) {
      if (norme(r).length < 4) continue;
      assert.ok(!new RegExp('\\b' + norme(r).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(norme(S[e][1])), ou + ' : la phrase « ' + e + ' » contient la réponse « ' + r + ' »');
    }
    // « Relis le tableau / l'encadré / l'exemple / le simulateur » : l'élément doit être dans le bloc.
    const renvoi = { tableau: /<table/, 'encadré': /class="repere/, exemple: /repere exemple/, simulateur: /SIMULATEUR/ };
    for (const k of Object.keys(renvoi)) if (S.faux[1].includes(k)) assert.match(b, renvoi[k], ou + ' : « ' + k + ' » cité mais absent du bloc');
  });
  assert.equal(n, ATTENDU[cours], cours + ' : ' + ATTENDU[cours] + ' scènes');
  assert.match(lis(cours + '/pas-a-pas/index.html'), /blocs\.js\?v=scene-bloc-20261117/, cours + ' charge le moteur à jour');
}
console.log('scene-bloc : OK (' + total + ' scènes)');
