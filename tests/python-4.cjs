// node tests/python-4.cjs — chaque version de chaque preuve de Python 04 (si… alors, sinon), avec le vrai
// Python et le lanceur de la fiche (input() simulé, essais). Une solution de référence doit passer, le code
// de départ doit échouer, et la bonne réponse d'une prédiction doit être ce que Python affiche.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const contenu = fs.readFileSync('python-4/pas-a-pas/fiche.js', 'utf8');
const s = contenu + fs.readFileSync('pas-a-pas/blocs.js', 'utf8');
const ctx = vm.createContext({});
vm.runInContext(s.slice(0, s.indexOf('/* ===== Python dans la page')) + '\nconst APERCU = true;\n' +
  s.slice(s.indexOf('const apercuV ='), s.indexOf('\nfunction barre()')) +
  '\nglobalThis.bloc = (i,v) => { apercuV[i-1]=v; return blocVu(i-1); };' +
  '\nglobalThis.N = BLOCS.length; globalThis.LVde = () => LV; globalThis.FIN_ = FIN;', ctx);
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
const html = t => t.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"');
const codeDe = b => html(b.extra.match(/<pre class="code">([\s\S]*?)<\/pre>/)[1]);
const derniere = r => r.sortie.trim().split('\n').pop();

assert.equal(ctx.N, 15, 'quinze blocs (cours.json : etapes 15)');
const catalogue = JSON.parse(fs.readFileSync('pas-a-pas/cours.json', 'utf8')).cours.find(c => c.id === 'python-4');
assert.equal(catalogue.etapes, ctx.N);
const conducteur = JSON.parse(fs.readFileSync('pas-a-pas/sequences.json', 'utf8'))['python-4'];
const couverts = new Set();
conducteur.moments.filter(m => m.blocs).forEach(m => { for (let i = m.blocs[0]; i <= m.blocs[1]; i++) couverts.add(i); });
assert.equal(couverts.size, ctx.N, 'le conducteur couvre chaque bloc');
assert.ok(/^L'élève est capable de/.test(conducteur.objectif), 'objectif formulé en « L\'élève est capable de… »');

/* Solutions de référence : (bloc vu) → code. */
const SOLUTION_BONUS = 'pieces = int(input("Combien de pièces ? "))\n# le bonus si le score dépasse 50\nscore = pieces * 10\nif score > 50:\n    # décalée : seulement si la condition est vraie\n    score = score + 100\n# collée à gauche : toujours\nprint(score)';
const SOLUTIONS = {
  5: b => { const [, bonus, seuil] = b.q.q.match(/bonus de (\d+) si energie > (\d+)/); return b.q.depart.replace('\n\n', `\nif energie > ${seuil}:\n    energie = energie + ${bonus}\n`); },
  7: b => `vies = int(input("Vies ? "))\nif vies == 0:\n    print("${b.q.q.match(/Il affiche (.*?) quand/)[1]}")`,
  8: b => { const [, bon, oui, , non] = b.vois.match(/On tape (.*?) : la console affiche (.*?)\. On tape (.*?) : (.*)$/);
             const nom = b.q.depart.split(' = ')[0];
             return b.q.depart + `if ${nom} == "${bon}":\n    print("${oui}")\nelse:\n    print("${non}")`; },
  9: b => b.q.depart + 'if vies <= 0:\n    print("Game over")\nelse:\n    print("Il te reste", vies, "vies")',
  12: () => SOLUTION_BONUS,
  15: b => b.q.depart + 'pieces = int(input("Combien de pièces ? "))\nif pieces >= prix:\n    print("Voici ta boisson")\n    print("Monnaie :", pieces - prix)\nelse:\n    print("Il manque", prix - pieces)'
};

let total = 0;
for (let n = 1; n <= ctx.N; n++) {
  const nv = ctx.bloc(n, 1)._n;
  const reponses = new Set();
  for (let v = 1; v <= nv; v++) {
    const b = ctx.bloc(n, v), Q = b.q;
    assert.ok(b.titre && b.fais && b.coince && b.coince.length, `${n}/${v}: titre, cases, Ça coince`);
    assert.ok(!/\{[DKR]\}|undefined|NaN/.test(JSON.stringify(b, (k, x) => typeof x === 'function' ? undefined : x)), `${n}/${v}: aucun trou dans le texte`);
    if (Q.type === 'code') {
      const ok = execute(Q, SOLUTIONS[n](b));
      assert.equal(Q.test(ok), true, `${n}/${v}: la solution de référence doit passer\n${ok.code}\n${JSON.stringify(ok.essais || ok)}`);
      if (Q.depart) { const ko = execute(Q, Q.depart); assert.notEqual(Q.test(ko), true, `${n}/${v}: le départ ne doit pas passer`); }
      reponses.add(SOLUTIONS[n](b) + JSON.stringify(Q.essais));
    } else if (Q.type === 'qcm') {
      assert.equal(new Set(Q.c).size, Q.c.length, `${n}/${v}: choix distincts`);
      assert.equal(Q.p.length, Q.c.length, `${n}/${v}: un retour par choix`);
      reponses.add(Q.c[0]);
    } else if (Q.type === 'saisie') {
      reponses.add(String(Q.q) + (b.extra || ''));
    } else if (Q.type === 'rapport') {
      reponses.add(b.extra);
    }
    total++;
  }
  if (nv > 1) assert.equal(reponses.size, nv, `bloc ${n} : trois versions, trois bonnes réponses distinctes`);
}
console.log(`${total} versions de preuve vérifiées sur ${ctx.N} blocs.`);

/* Aucun encadré ne donne la réponse d'une preuve d'écriture : l'exemple est pris dans un autre jeu. */
for (const n of [5, 8]) for (let v = 1; v <= 3; v++) {
  const b = ctx.bloc(n, v), modele = html((b.extra.match(/<pre class="code">([\s\S]*?)<\/pre>/) || [, ''])[1]);
  assert.ok(!SOLUTIONS[n](b).includes(modele.split('\n')[0]), `bloc ${n}/${v} : l'encadré recopie la réponse`);
}
/* Les prédictions : la bonne réponse est ce que Python affiche vraiment. */
const choixDe = sortie => { const l = sortie.trim().split('\n').filter(Boolean);
  return l.length === 2 ? 'Tu joues, puis Fin du tour' : l.length === 0 ? 'Rien du tout' : l[0] === 'Fin du tour' ? 'Fin du tour, seulement' : 'Tu joues, seulement'; };
for (let v = 1; v <= 3; v++) {
  const b1 = ctx.bloc(1, v), t1 = b1.extra.match(/on tape <b>(\d+)<\/b>/)[1];
  assert.equal(derniere(lance(codeDe(b1), [t1])), b1.q.c[0], `bloc 1/${v}`);
  const b2 = ctx.bloc(2, v), s2 = lance(codeDe(b2)).sortie.trim().split('\n');
  assert.equal(`${s2[0]}, puis ${s2[1]}`, b2.q.c[0], `bloc 2/${v}`);
  const b3 = ctx.bloc(3, v), [, op, seuil] = html(b3.extra).match(/score (>=?) (\d+)/);
  const r3 = derniere(lance(`n = 0\nwhile not (n * 10 ${op} ${seuil}):\n    n += 1\nprint(n)`));
  assert.ok(b3.q.ok(r3) && !b3.q.ok(String(Number(r3) - 1)) && !b3.q.ok(String(Number(r3) + 1)), `bloc 3/${v}: ${r3}`);
  const b4 = ctx.bloc(4, v);
  assert.equal(derniere(lance(codeDe(b4))), b4.q.c[0], `bloc 4/${v}`);
  const b6 = ctx.bloc(6, v);
  assert.equal(choixDe(lance(codeDe(b6)).sortie), b6.q.c[0], `bloc 6/${v}`);
  const b11 = ctx.bloc(11, v), n11 = b11.q.q.match(/taperas (\d+)/)[1];
  const r11 = derniere(lance(SOLUTION_BONUS, [n11]));
  assert.ok(b11.q.ok(r11), `bloc 11/${v}: ${n11} → ${r11}`);
  const b13 = ctx.bloc(13, v), tape = b13.q.q.match(/il tape (\d+)/)[1];
  const modif = b13.q.q.includes('>=') ? SOLUTION_BONUS.replace('score > 50', 'score >= 50')
              : b13.q.q.includes('décale') ? SOLUTION_BONUS.replace('\nprint(score)', '\n    print(score)')
              : SOLUTION_BONUS.replace('score + 100', 'score + 10');
  const r13 = lance(modif, [tape]), apres = r13.sortie.trim().split('\n').slice(1).join('\n');
  assert.ok(!r13.erreur, `bloc 13/${v}: ${JSON.stringify(r13.erreur)}`);
  assert.equal(apres === '' ? 'Rien' : apres, b13.q.c[0], `bloc 13/${v}`);
  console.log(`OK prédictions version ${v} : ${b1.q.c[0]} · ${b2.q.c[0]} · ${r3} · ${b4.q.c[0]} · ${b6.q.c[0]} · ${n11} → ${r11} · ${b13.q.c[0]}`);
}

/* Le bloc 12 refuse le >= (5 pièces → 150) et la ligne du bonus non décalée. */
const b12 = ctx.bloc(12, 1);
assert.match(b12.q.test(execute(b12.q, SOLUTION_BONUS.replace('score > 50', 'score >= 50'))), /pas >=/);
assert.match(b12.q.test(execute(b12.q, 'pieces = int(input("? "))\nscore = pieces * 10\nif score > 50:\n    pass\nscore = score + 100\nprint(score)')), /décalée/);
/* Le bloc 5 refuse le résultat écrit en dur et le >= . */
const b5 = ctx.bloc(5, 1);
assert.match(b5.q.test(execute(b5.q, b5.q.depart.replace('\n\n', '\nif energie >= 60:\n    energie = energie + 50\n'))), /pas >=/);
/* Le bloc 8 explique le nombre comparé sans guillemets (input rend un texte). */
const b8 = ctx.bloc(8, 2);
assert.match(b8.q.test(execute(b8.q, b8.q.depart + 'if code == 1234:\n    print("Trésor !")\nelse:\n    print("Code faux.")')), /guillemets/);
console.log('OK retours ciblés : >=, décalage, guillemets.');

/* Bloc 14 : rendu Classroom de 03_Le-bonus_Nom.py, grille sur 5 avec les nombres du bloc 11 (cle:"bonus"),
   AVANT le défi (bloc 15) : la cote ne dépend pas d'un bloc facultatif. */
assert.equal(ctx.bloc(14, 1).cle, ctx.bloc(11, 1).cle, 'bloc 14 : même tirage que le bloc 11');
assert.equal(ctx.bloc(15, 1).partie, 'F — Défi', 'le défi est le dernier bloc');
for (let v = 1; v <= 3; v++) {
  const b = ctx.bloc(14, v), pts = [...b.extra.matchAll(/<td>(\d)<\/td>/g)].map(m => Number(m[1]));
  assert.equal(b.q.type, 'rapport');
  assert.equal(pts.length, 5); assert.equal(pts.reduce((a, x) => a + x, 0), 5, `14/${v}: grille sur 5`);
  const n = ctx.bloc(11, v).q.q.match(/taperas (\d+)/)[1];
  assert.ok(b.extra.includes(`on tape <b>${n}</b>`) && b.extra.includes(`affiche <b>${derniere(lance(SOLUTION_BONUS, [n]))}</b>`), `14/${v}: la grille annonce ce que Python affiche pour ${n}`);
  assert.ok(b.extra.includes(`affiche <b>${derniere(lance(SOLUTION_BONUS, ['5']))}</b>`), `14/${v}: le cas limite 5 → 50`);
  assert.ok(/0 sur 5, pour les deux fichiers/.test(b.extra), `14/${v}: copier-coller du voisin = 0`);
  assert.ok(b.fais.includes('Python 04 — Le bonus') && b.fais.includes('03_Le-bonus_') && b.fais.includes('Rendre le devoir ▸ Rendre le devoir'), `14/${v}: chemin de clics`);
}
console.log('OK Python 4 bloc 14 : rendu Classroom, grille sur 5, trois versions.');

/* Différenciation : un appui (indices) et un approfondissement (volet facultatif) dans les blocs d'écriture. */
for (const n of [5, 8, 9, 11, 15]) {
  const b = ctx.bloc(n, 1);
  assert.ok(b.indices, `bloc ${n} : indices progressifs (appui)`);
  assert.ok(/Pour aller plus loin/.test(b.extra || ''), `bloc ${n} : volet d'approfondissement`);
}
assert.ok(ctx.FIN_.citation.auteur && ctx.FIN_.citation.source, 'citation finale avec auteur et source');
console.log('OK différenciation : appui et approfondissement dans les blocs d\'écriture.');

// Au moins un mot-clé en gras par case à cocher (Vincent, 13/11/2026) ; aucune interdiction dans une case (12/11/2026).
{const casesDe=(racine)=>{const vus=new Set(),cases=[];const lis=o=>{if(typeof o==='string'){for(const m of o.matchAll(/type="checkbox">(?:<span>)?([\s\S]*?)<\/label>/g))cases.push(m[1]);}else if(o&&typeof o==='object'&&!vus.has(o)){vus.add(o);Object.values(o).forEach(lis);}};lis(racine);return cases;};
const cases=casesDe((()=>{const src=fs.readFileSync(__dirname+'/../python-4/pas-a-pas/fiche.js','utf8');
 return new Function('norm',src.slice(0,src.indexOf('/* ===== Python dans la page'))+';return BLOCS;')(x=>x);})());
assert.ok(cases.length>=55,'Python 4 : '+cases.length+' cases lues');
cases.forEach(c=>assert.ok(/<b[\s>]/.test(c),'Python 4, case sans mot en gras : '+c.replace(/<[^>]+>/g,'').slice(0,70)));
const interdit=/(?:^|[.;:!?]\s+)(?:Ne|N[’'])\s?\S+ (?:pas|jamais|ni|aucun|rien)/,sansB=c=>c.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
cases.forEach(c=>assert.ok(!interdit.test(sansB(c)),'Python 4, une interdiction dans une case : '+sansB(c).slice(0,70)));
console.log('OK Python 4 : '+cases.length+' cases, chacune avec son mot-clé en gras.');}
