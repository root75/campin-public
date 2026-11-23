// node tests/python-bugs.cjs — chaque version de chaque preuve de « La chasse aux bugs », avec le vrai Python
// et le lanceur de la fiche. Le programme de départ doit vraiment avoir le bug annoncé, la réparation de
// référence doit passer, une fausse réparation doit être refusée, et la bonne réponse d'une prédiction doit
// être ce que Python affiche.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const contenu = fs.readFileSync('python-bugs/pas-a-pas/fiche.js', 'utf8');
const s = contenu + fs.readFileSync('pas-a-pas/blocs.js', 'utf8');
const ctx = vm.createContext({});
vm.runInContext(s.slice(0, s.indexOf('/* ===== Python dans la page')) + '\nconst APERCU = true;\n' +
  s.slice(s.indexOf('const apercuV ='), s.indexOf('\nfunction barre()')) +
  '\nglobalThis.bloc = (i,v) => { apercuV[i-1]=v; return blocVu(i-1); };' +
  '\nglobalThis.N = BLOCS.length; globalThis.FIN_ = FIN; globalThis.FAMILLES_ = FAMILLES; globalThis.SCORE_ = SCORE;', ctx);
const LANCEUR = fs.readFileSync('pas-a-pas/python-editeur.js', 'utf8').match(/const LANCEUR = `([\s\S]*?)`;/)[1];

function lance(code, entrees = []) {
  const prog = LANCEUR + `
import io, contextlib
_tampon = io.StringIO()
with contextlib.redirect_stdout(_tampon):
    _r = _lance(${JSON.stringify(code)}, ${JSON.stringify(JSON.stringify(entrees))})
_d = json.loads(_r); _d["sortie"] = _tampon.getvalue(); _d["code"] = ${JSON.stringify(code)}
print(json.dumps(_d))`;
  const r = spawnSync('python3', ['-I', '-c', prog], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout.trim().split('\n').pop());
}
function execute(Q, code) {
  if (!Q.essais) return lance(code);
  const tous = Q.essais.map(e => lance(code, e));
  return Object.assign({}, tous[0], { essais: tous, erreur: (tous.find(x => x.erreur) || {}).erreur || null });
}
const derniere = r => r.sortie.trim().split('\n').pop().replace(/\s+/g, ' ').trim();
const html = t => t.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

assert.equal(ctx.N, 10, 'dix blocs (cours.json : etapes 10)');
const catalogue = JSON.parse(fs.readFileSync('pas-a-pas/cours.json', 'utf8')).cours.find(c => c.id === 'python-bugs');
assert.ok(catalogue, 'python-bugs au catalogue');
assert.equal(catalogue.etapes, ctx.N);
assert.equal(catalogue.chemin, 'python-bugs/pas-a-pas/');

/* Réparations de référence, par bloc et par version : [réparation, type d'erreur du départ ou null, fausse réparation]. */
const R = {
  1: [['vies = 3\nprint("Il te reste", vies, "vies")', 'SyntaxError', 'print("Il te reste 3 vies")'],
      ['score = 50\nprint("Ton score :", score)', 'SyntaxError', 'print("Ton score : 50")'],
      ['pieces = 4\nprint("Tu as", pieces, "pièces")', 'SyntaxError', 'print("Tu as 4 pièces")']],
  2: [['score = 40\nbonus = 10\nscore = score + bonus\nprint(score)', 'NameError', 'score = 40\nbonus = 10\nbonnus = 10\nscore = score + bonnus\nprint(score)'],
      ['vies = 3\ndegats = 1\nvies = vies - degats\nprint(vies)', 'NameError', 'vies = 3\nVies = 3\ndegats = 1\nvies = Vies - degats\nprint(vies)'],
      ['pieces = 6\nprix = 2\nreste = pieces - prix\nprint(reste)', 'NameError', 'pieces = 6\nprix = 2\npris = 2\nreste = pieces - pris\nprint(reste)']],
  3: [['pieces = int(input("Combien de pièces ? "))\nscore = pieces + 5\nprint(score)', 'TypeError', 'pieces = input("Combien de pièces ? ")\nprint(12)'],
      ['vies = int(input("Combien de vies ? "))\nvies = vies - 1\nprint(vies)', 'TypeError', 'vies = input("Combien de vies ? ")\nprint(2)'],
      ['score = int(input("Ton score ? "))\nprint("Score final :", score)', 'TypeError', 'score = int(input("Ton score ? "))\nprint("Score final : 40")']],
  5: [['vies = 5\ndegats = 2\nvies = vies - degats\nprint(vies)', null, 'vies = 5\ndegats = 2\nvies = 3\nprint(vies)'],
      ['score = 20\nscore = score * 2\nprint(score)', null, 'score = 20\nscore = 40\nprint(score)'],
      ['pieces = 8\nbonus = 3\ntotal = pieces + bonus\nprint(total)', null, 'pieces = 8\nbonus = 3\ntotal = 11\nprint(total)']],
  7: [['pieces = int(input("Combien de pièces ? "))\nscore = pieces * 10\nprint("Score :", score)', 'SyntaxError', 'pieces = input("Combien de pièces ? ")\nscore = pieces * 10\nprint("Score :", score)'],
      ['vies = int(input("Combien de vies ? "))\nvies = vies - 1\nprint("Il te reste", vies)', 'NameError', 'vies = int(input("Combien de vies ? "))\nvies = vies + 1\nprint("Il te reste", vies)'],
      ['pieces = int(input("Combien de pièces ? "))\nbonus = 5\ntotal = pieces + bonus\nprint("Total :", total)', 'SyntaxError', 'pieces = int(input("Combien de pièces ? "))\nbonus = 5\ntotal = pieces - bonus\nprint("Total :", total)']]
};

let total = 0;
for (let n = 1; n <= ctx.N; n++) {
  const nv = ctx.bloc(n, 1)._n;
  assert.equal(nv, 3, `bloc ${n} : trois versions`);
  const reponses = new Set();
  for (let v = 1; v <= nv; v++) {
    const b = ctx.bloc(n, v), Q = b.q;
    assert.ok(b.titre && b.fais && b.veux && b.coince && b.coince.length, `${n}/${v}: titre, but, cases, Ça coince`);
    assert.ok(!/undefined|NaN/.test(JSON.stringify(b, (k, x) => typeof x === 'function' ? undefined : x)), `${n}/${v}: aucun trou dans le texte`);
    if (Q.type === 'code') {
      const [bon, erreur, faux] = R[n][v - 1];
      const depart = execute(Q, Q.depart);
      if (erreur) assert.equal(depart.erreur && depart.erreur.type, erreur, `${n}/${v}: le départ doit crier ${erreur}`);
      else assert.equal(depart.erreur, null, `${n}/${v}: le départ est silencieux`);
      assert.notEqual(Q.test(depart), true, `${n}/${v}: le départ ne doit pas passer`);
      assert.equal(typeof Q.test(depart), 'string');
      const ok = execute(Q, bon);
      assert.equal(Q.test(ok), true, `${n}/${v}: la réparation de référence doit passer\n${bon}\n${JSON.stringify(ok.essais || ok)}`);
      assert.notEqual(Q.test(execute(Q, faux)), true, `${n}/${v}: une fausse réparation doit être refusée\n${faux}`);
      // ce que l'encadré annonce est ce que Python affiche
      const annonces = [...b.extra.matchAll(/affiche(?:r)? <b>(.*?)<\/b>/g)].map(m => m[1]);
      assert.ok(annonces.length >= 1, `${n}/${v}: l'encadré annonce le résultat attendu`);
      (ok.essais || [ok]).forEach((x, i) => assert.equal(derniere(x), annonces[i], `${n}/${v}: résultat annoncé, essai ${i + 1}`));
      reponses.add(bon);
    } else if (Q.type === 'qcm') {
      assert.equal(new Set(Q.c).size, Q.c.length, `${n}/${v}: choix distincts`);
      assert.ok(Q.c.length >= 4, `${n}/${v}: quatre choix au moins`);
      assert.equal(Q.p.length, Q.c.length, `${n}/${v}: un retour par choix`);
      reponses.add(Q.c[0]);
    } else if (Q.type === 'ordre') {
      const ok = lance(Q.lignes.join('\n'));
      assert.equal(Q.test(ok), true, `${n}/${v}: les lignes dans l'ordre donné doivent passer`);
      const annonce = b.extra.match(/afficher <b>(.*?)<\/b>/)[1];
      assert.equal(derniere(ok), annonce, `${n}/${v}: résultat annoncé`);
      const l = Q.lignes.slice(); [l[1], l[2]] = [l[2], l[1]];   // deux calculs échangés
      const r1 = lance(l.join('\n'));
      assert.notEqual(Q.test(r1), true, `${n}/${v}: deux calculs échangés`);
      const fin = Q.lignes.slice(); fin.splice(2, 0, fin.pop());   // le print avant le dernier calcul : silencieux
      const r2 = lance(fin.join('\n'));
      assert.equal(r2.erreur, null); assert.notEqual(Q.test(r2), true, `${n}/${v}: le print trop tôt`);
      // un seul ordre donne le bon résultat
      const perm = a => a.length < 2 ? [a] : a.flatMap((x, i) => perm(a.filter((_, j) => j !== i)).map(p => [x, ...p]));
      const bons = perm(Q.lignes).filter(p => { const r = lance(p.join('\n')); return Q.test(r) === true; });
      assert.equal(bons.length, 1, `${n}/${v}: un seul ordre juste`);
      reponses.add(Q.lignes.join('\n'));
    } else if (Q.type === 'trous') {
      assert.equal((Q.texte.match(/___/g) || []).length, Q.mots.length, `${n}/${v}: un mot par trou`);
      Q.pieges.forEach(p => assert.ok(!Q.mots.includes(p), `${n}/${v}: un piège n'est pas une réponse`));
      reponses.add(Q.mots.join('|'));
    } else if (Q.type === 'rapport') {
      reponses.add(b.extra);
    } else assert.fail(`${n}/${v}: type inattendu ${Q.type}`);
    total++;
  }
  assert.equal(reponses.size, nv, `bloc ${n} : trois versions, trois bonnes réponses distinctes`);
}
console.log(`${total} versions de preuve vérifiées sur ${ctx.N} blocs.`);

/* Bloc 4 : la bonne réponse de la prédiction est ce que Python affiche ; le « piège » est le calcul attendu. */
for (let v = 1; v <= 3; v++) {
  const b = ctx.bloc(4, v), code = html(b.extra.match(/<pre class="code">([\s\S]*?)<\/pre>/)[1]);
  const tape = b.q.q.match(/on tape (\d+)/)[1], r = lance(code, [tape]);
  assert.equal(r.erreur, null, `4/${v}: bug silencieux`);
  assert.equal(derniere(r), b.q.c[0], `4/${v}`);
  assert.equal(derniere(lance(code.replace('input(', 'int(input(').replace('")', '"))'), [tape])), b.q.c[1], `4/${v}: avec int( )`);
}
/* Bloc 8 : la famille annoncée est celle du bug, vérifiée sur « Le score ». */
assert.equal(derniere(lance(ctx.SCORE_, ['7'])), '70', '« Le score » sans bug : 7 → 70');
const attendu8 = [[3, r => !r.erreur && derniere(r) === '17'], [2, r => !r.erreur && derniere(r) === '7777777777'], [1, r => r.erreur && r.erreur.type === 'NameError']];
for (let v = 1; v <= 3; v++) {
  const b = ctx.bloc(8, v), ligne = b.q.q.match(/il a écrit (.*?)\. De quelle/)[1];
  const lignes = ctx.SCORE_.split('\n'), i = ligne.startsWith('pieces') ? 0 : ligne.startsWith('score') ? 1 : 2;
  lignes[i] = ligne;
  const [famille, verifie] = attendu8[v - 1];
  assert.equal(b.q.c[0], ctx.FAMILLES_[famille], `8/${v}: famille`);
  assert.ok(verifie(lance(lignes.join('\n'), ['7'])), `8/${v}: le bug fait ce que le retour annonce`);
  assert.ok(b.fais.includes('02_Le-bug_Nom.py') && b.fais.includes('Enregistrer sous'), `8/${v}: une copie, pas l'original`);
}
/* Bloc 9 : la même phrase libre pour les trois versions. */
assert.equal(new Set([1, 2, 3].map(v => ctx.bloc(9, v).q.phrase)).size, 1, 'bloc 9 : une seule phrase libre');
/* Bloc 10 : rendu Classroom, grille sur 5, le nombre annoncé est ce que « Le score » affiche. */
for (let v = 1; v <= 3; v++) {
  const b = ctx.bloc(10, v), pts = [...b.extra.matchAll(/<td>(\d)<\/td>/g)].map(m => Number(m[1]));
  assert.equal(b.q.type, 'rapport');
  assert.equal(pts.length, 5); assert.equal(pts.reduce((a, x) => a + x, 0), 5, `10/${v}: grille sur 5`);
  const [, n, r] = b.extra.match(/on tape <b>(\d+)<\/b>[\s\S]*?affiche <b>(\d+)<\/b>/);
  assert.equal(derniere(lance(ctx.SCORE_, [n])), r, `10/${v}: ${n} → ${r}`);
  assert.ok(/0 sur 5, pour les deux fichiers/.test(b.extra), `10/${v}: copier-coller du voisin = 0`);
  assert.ok(b.fais.includes('Python — La chasse aux bugs') && b.fais.includes('02_Le-bug_') && b.fais.includes('Rendre le devoir ▸ Rendre le devoir'), `10/${v}: chemin de clics`);
}
console.log('OK prédictions, familles et grille sur 5.');

/* Aucun if : le cours vient avant « Si… alors ». Des méthodes variées. */
assert.ok(!/\bif\b[^\n]*:/.test(contenu.replace(/\/\*[\s\S]*?\*\//g, '')), 'aucun if dans les programmes');
const types = Array.from({ length: ctx.N }, (_, i) => ctx.bloc(i + 1, 1).q.type);
assert.ok(types.filter(t => t === 'qcm').length <= 2, 'trop de QCM : ' + types.join(' '));
['code', 'qcm', 'ordre', 'trous', 'rapport'].forEach(t => assert.ok(types.includes(t), 'méthode absente : ' + t));
assert.ok(ctx.FIN_.citation.auteur && ctx.FIN_.citation.source, 'citation finale avec auteur et source');
console.log('OK méthodes : ' + types.join(' · '));

// Au moins un mot-clé en gras par case à cocher ; aucune interdiction dans une case.
{const casesDe=(racine)=>{const vus=new Set(),cases=[];const lis=o=>{if(typeof o==='string'){for(const m of o.matchAll(/type="checkbox">(?:<span>)?([\s\S]*?)<\/label>/g))cases.push(m[1]);}else if(o&&typeof o==='object'&&!vus.has(o)){vus.add(o);Object.values(o).forEach(lis);}};lis(racine);return cases;};
const cases=casesDe((()=>{const src=fs.readFileSync(__dirname+'/../python-bugs/pas-a-pas/fiche.js','utf8');
 return new Function('norm',src.slice(0,src.indexOf('/* ===== Python dans la page'))+';return BLOCS;')(x=>x);})());
assert.ok(cases.length>=40,'Chasse aux bugs : '+cases.length+' cases lues');
cases.forEach(c=>assert.ok(/<b[\s>]/.test(c),'case sans mot en gras : '+c.replace(/<[^>]+>/g,'').slice(0,70)));
const interdit=/(?:^|[.;:!?]\s+)(?:Ne|N[’'])\s?\S+ (?:pas|jamais|ni|aucun|rien)/,sansB=c=>c.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
cases.forEach(c=>assert.ok(!interdit.test(sansB(c)),'une interdiction dans une case : '+sansB(c).slice(0,70)));
console.log('OK Chasse aux bugs : '+cases.length+' cases, chacune avec son mot-clé en gras.');}

/* La fiche ne redéclare aucun nom des scripts communs chargés avant elle ou après elle (une page blanche, sinon). */
{const declare = src => new Set([...src.matchAll(/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map(m => m[1]));
 const miens = declare(contenu);
 for (const f of ['python-editeur.js', 'blocs.js', 'cloche.js', 'demo-lecteur.js', 'demos-communs.js', 'demos-python.js', 'phrase-fin.js', 'recompense.js', 'sequence-eleve.js']) {
   for (const n of declare(fs.readFileSync('pas-a-pas/' + f, 'utf8'))) assert.ok(!miens.has(n), `« ${n} » est déjà déclaré dans pas-a-pas/${f}`);
 }
 console.log('OK aucun nom en double avec les scripts communs.');}
