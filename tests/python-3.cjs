// node tests/python-3.cjs — chaque version de chaque preuve de Python 03, avec le vrai Python
// et le lanceur de la fiche (input() simulé, essais). Une solution de référence doit passer,
// le code de départ doit échouer, et la bonne réponse d'un QCM doit être ce que Python affiche.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const contenu = fs.readFileSync('python-3/pas-a-pas/fiche.js', 'utf8');
const s = contenu + fs.readFileSync('pas-a-pas/blocs.js', 'utf8');
const ctx = vm.createContext({});
vm.runInContext(s.slice(0, s.indexOf('/* ===== Python dans la page')) + '\nconst APERCU = true;\n' +
  s.slice(s.indexOf('const apercuV ='), s.indexOf('\nfunction barre()')) +
  '\nglobalThis.bloc = (i,v) => { apercuV[i-1]=v; return blocVu(i-1); };' +
  '\nglobalThis.N = BLOCS.length; globalThis.LVde = () => LV;', ctx);
const LANCEUR = fs.readFileSync('pas-a-pas/python-editeur.js', 'utf8').match(/const LANCEUR = `([\s\S]*?)`;/)[1];

/* Le même _lance que la page, dans le Python du poste : la sortie est capturée à part. */
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

assert.equal(ctx.N, 16, 'seize blocs (cours.json : etapes 16)');
const catalogue = JSON.parse(fs.readFileSync('pas-a-pas/cours.json', 'utf8')).cours.find(c => c.id === 'python-3');
assert.equal(catalogue.etapes, ctx.N);
const conducteur = JSON.parse(fs.readFileSync('pas-a-pas/sequences.json', 'utf8'))['python-3'];
const couverts = new Set();
conducteur.moments.filter(m => m.blocs).forEach(m => { for (let i = m.blocs[0]; i <= m.blocs[1]; i++) couverts.add(i); });
assert.equal(couverts.size, ctx.N, 'le conducteur couvre chaque bloc');

/* Solutions de référence : (bloc vu) → code. */
const nombres = code => code.match(/\d+(\.\d+)?/g).map(Number);
const SOLUTIONS = {
  3: b => b.q.depart.replace(/"/g, ''),
  5: b => { const [l1, l2] = b.q.depart.split('\n'); const nom = l1.split(' = ')[0]; const texte = l2.match(/"(.*?) : "/)[1]; return `${l1}\nprint("${texte} :", ${nom})`; },
  7: b => b.q.depart + `print("${b.q.q.match(/affiche (\S+) et/)[1]}", prenom)`,
  8: b => 'mot = input()\n' + 'print(mot)\n'.repeat(b.q.depart.split('\n').length),
  10: b => b.q.depart.replace('input("Un nombre ? ")', 'int(input("Un nombre ? "))'),
  13: () => '# on demande le nombre de pièces\npieces = int(input("Combien de pièces ? "))\n# on calcule\nscore = pieces * 10\n# on affiche\nprint("Score :", score)',
  16: b => b.q.depart + 'degats = int(input("Dégâts ? "))\nvies = vies - degats\nprint("Il reste", vies, "vies")'
};

let total = 0;
for (let n = 1; n <= ctx.N; n++) {
  const nv = ctx.bloc(n, 1)._n;
  const reponses = new Set();
  for (let v = 1; v <= nv; v++) {
    const b = ctx.bloc(n, v), Q = b.q;
    assert.ok(b.titre && b.fais && b.coince && b.coince.length, `${n}/${v}: titre, cases, Ça coince`);
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
      reponses.add(String(Q.q));
    } else if (Q.type === 'rapport') {
      reponses.add(b.extra);   // la grille porte les nombres de la version
    }
    total++;
  }
  if (nv > 1) assert.equal(reponses.size, nv, `bloc ${n} : trois versions, trois bonnes réponses distinctes`);
}

/* Les QCM de prédiction : la bonne réponse est ce que Python affiche vraiment. */
const derniere = r => r.sortie.trim().split('\n').pop();
for (let v = 1; v <= 3; v++) {
  const b2 = ctx.bloc(2, v); const expr = b2.q.q.match(/print\((.*)\) \?/)[1];
  assert.equal(derniere(lance(`print(${expr})`)), b2.q.c[0], `bloc 2/${v}`);
  const b4 = ctx.bloc(4, v); const e4 = b4.q.q.match(/print\((.*)\) \?/)[1];
  assert.equal(derniere(lance(`print(${e4})`)), b4.q.c[0], `bloc 4/${v}`);
  const b6 = ctx.bloc(6, v); const c6 = b6.extra.match(/<pre class="code">([\s\S]*?)<\/pre>/)[1];
  assert.equal(derniere(lance(c6)), b6.q.c[0], `bloc 6/${v}`);
  const b9 = ctx.bloc(9, v); const c9 = b9.extra.match(/<pre class="code">([\s\S]*?)<\/pre>/)[1].replace(/&quot;/g, '"');
  const tape9 = b9.extra.match(/on tape <b>(\d+)<\/b>/)[1];
  assert.equal(derniere(lance(c9, [tape9])), b9.q.c[0], `bloc 9/${v}`);
  const b12 = ctx.bloc(12, v), n12 = b12.q.q.match(/taperas (\d+)/)[1];
  const r12 = lance(SOLUTIONS[13](), [n12]);
  assert.ok(b12.q.ok(derniere(r12).replace('Score : ', '')), `bloc 12/${v}`);
  const b14 = ctx.bloc(14, v), t14 = b14.q.q.match(/tapes (\S+?)[,.]/)[1];
  const r14 = lance(SOLUTIONS[13](), [t14]);
  if (r14.erreur) assert.ok(b14.q.c[0].includes(r14.erreur.type), `bloc 14/${v}: ${r14.erreur.type}`);
  else assert.ok(b14.q.c[0].includes(derniere(r14).replace('Score : ', '')), `bloc 14/${v}: ${derniere(r14)}`);
  console.log(`OK prédictions version ${v} : ${b2.q.c[0]} · ${b4.q.c[0]} · ${b6.q.c[0]} · ${b9.q.c[0]} · ${b12.q.q.match(/taperas (\d+)/)[1]} → ${derniere(r12)} · ${t14} → ${r14.erreur ? r14.erreur.type : derniere(r14)}`);
}
console.log(`${total} versions de preuve vérifiées sur ${ctx.N} blocs.`);

/* print( contient « int( » : le test doit regarder int( comme un mot. */
const b13 = ctx.bloc(13, 1);
const sansInt = execute(b13.q, 'pieces = input("Combien de pièces ? ")\nscore = pieces * 10\nprint(score)');
assert.match(b13.q.test(sansInt), /Il manque int/);
const b10 = ctx.bloc(10, 1);
assert.match(b10.q.test(execute(b10.q, b10.q.depart)), /Utilise int/);
console.log('OK sans int( ) : le retour le dit, malgré le print(.');

/* Bloc 15 : rendu Classroom de 02_Le-score_Nom.py, grille sur 5 avec les nombres de la version de l'élève
   (les mêmes qu'au bloc 12, par cle:"score"), sur le modèle du bloc 11 de Python 02.
   Il vient AVANT le défi (bloc 16) : la cote ne dépend pas d'un bloc facultatif. */
assert.equal(ctx.bloc(16, 1).cle, 'vies', 'le défi est le dernier bloc');
assert.equal(ctx.bloc(15, 1).cle, ctx.bloc(12, 1).cle, 'bloc 15 : même tirage que le bloc 12');
for (let v = 1; v <= 3; v++) {
  const b = ctx.bloc(15, v), pts = [...b.extra.matchAll(/<td>(\d)<\/td>/g)].map(m => Number(m[1]));
  assert.equal(b.q.type, 'rapport');
  assert.equal(pts.length, 5); assert.equal(pts.reduce((a, x) => a + x, 0), 5, `15/${v}: grille sur 5`);
  const n = ctx.bloc(12, v).q.q.match(/taperas (\d+)/)[1];
  const r = lance(SOLUTIONS[13](), [n]);
  assert.ok(b.extra.includes(`on tape <b>${n}</b>`) && b.extra.includes(`affiche <b>${derniere(r).match(/\d+/)[0]}</b>`), `15/${v}: la grille annonce ce que Python affiche pour ${n}`);
  assert.ok(/0 sur 5, pour les deux fichiers/.test(b.extra), `15/${v}: copier-coller du voisin = 0`);
  assert.ok(b.fais.includes('Python 03 — Le score') && b.fais.includes('02_Le-score_') && b.fais.includes('Rendre le devoir ▸ Rendre le devoir'), `15/${v}: chemin de clics`);
  assert.ok(b.q.confirmation.includes('02_Le-score') && !/\$\{|undefined/.test(b.extra + b.fais));
}
console.log('OK Python 3 bloc 15 : rendu Classroom, grille sur 5, trois versions.');

// Au moins un mot-clé en gras par case à cocher : l'œil accroche le geste avant de lire la phrase (Vincent, 13/11/2026).
{const casesDe=(racine)=>{const vus=new Set(),cases=[];const lis=o=>{if(typeof o==='string'){for(const m of o.matchAll(/type="checkbox">(?:<span>)?([\s\S]*?)<\/label>/g))cases.push(m[1]);}else if(o&&typeof o==='object'&&!vus.has(o)){vus.add(o);if(Array.isArray(o.gestes))cases.push(...o.gestes);Object.values(o).forEach(lis);}};lis(racine);return cases;};
const cases=casesDe((()=>{const s=require('node:fs').readFileSync(__dirname+'/../python-3/pas-a-pas/fiche.js','utf8');const vide=()=>{};
 return new Function('norm','echangeGuide',s.slice(0,s.indexOf('/* ===== Python dans la page'))+';return BLOCS;')(x=>x,vide);})());assert.ok(cases.length>=57,'Python 3 : '+cases.length+' cases lues');
cases.forEach(c=>assert.ok(/<b[\s>]/.test(c),'Python 3, case sans mot en gras : '+c.replace(/<[^>]+>/g,'').slice(0,70)));
console.log('OK Python 3 : '+cases.length+' cases, chacune avec son mot-clé en gras.');}
