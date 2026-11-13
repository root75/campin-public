// Python 01 : forme des cases à cocher. Les essais avec le vrai Python sont dans python-echange.cjs et python-editeur.cjs.
const assert=require('node:assert/strict');
// Au moins un mot-clé en gras par case à cocher : l'œil accroche le geste avant de lire la phrase (Vincent, 13/11/2026).
{const casesDe=(racine)=>{const vus=new Set(),cases=[];const lis=o=>{if(typeof o==='string'){for(const m of o.matchAll(/type="checkbox">(?:<span>)?([\s\S]*?)<\/label>/g))cases.push(m[1]);}else if(o&&typeof o==='object'&&!vus.has(o)){vus.add(o);if(Array.isArray(o.gestes))cases.push(...o.gestes.map(g=>typeof g==='string'?g:g.geste));Object.values(o).forEach(lis);}};lis(racine);return cases;};
const cases=casesDe((()=>{const s=require('node:fs').readFileSync(__dirname+'/../python-1/pas-a-pas/fiche.js','utf8');const vide=()=>{};
 return new Function('norm','echangeGuide',s.slice(0,s.indexOf('/* ===== Python dans la page'))+';return BLOCS;')(x=>x,vide);})());assert.ok(cases.length>=59,'Python 1 : '+cases.length+' cases lues');
cases.forEach(c=>assert.ok(/<b[\s>]/.test(c),'Python 1, case sans mot en gras : '+c.replace(/<[^>]+>/g,'').slice(0,70)));
// Un « ne fais pas » = un encadré ⚠️ à côté du geste, jamais dans le texte d'une case (règle du 12/11/2026, comme le Labo 07).
const interdit=/(?:^|[.;:!?]\s+)(?:Ne|N[’'])\s?\S+ (?:pas|jamais|ni|aucun|rien)/,sansB=c=>c.replace(/<[^>]+>/g,'').replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
cases.forEach(c=>assert.ok(!interdit.test(sansB(c))&&!/^⚠|class="attention"/.test(sansB(c)+c),'Python 1, une interdiction dans une case : '+sansB(c).slice(0,70)));
console.log('OK Python 1 : '+cases.length+' cases, chacune avec son mot-clé en gras.');}
