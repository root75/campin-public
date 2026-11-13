// Se connecter : forme des cases à cocher (page statique).
const assert=require('node:assert/strict'),fs=require('node:fs');
const page=fs.readFileSync(__dirname+'/../se-connecter/index.html','utf8');
// Au moins un mot-clé en gras par case à cocher : l'œil accroche le geste avant de lire la phrase (Vincent, 13/11/2026).
// Un bouton (span.btn) ne compte pas : le mot en gras dit où regarder ou quel écran attendre.
const cases=[...page.matchAll(/type="checkbox"\s*\/?>(?:<span>)?([\s\S]*?)<\/label>/g)].map(m=>m[1]);
assert.ok(cases.length>=31,'cases lues : '+cases.length);
cases.forEach(c=>assert.ok(/<b[\s>]/.test(c),'case sans mot en gras : '+c.replace(/<[^>]+>/g,'').slice(0,70)));
// Un « ne fais pas » = un encadré ⚠️ à côté du geste, jamais dans le texte d'une case (règle du 12/11/2026, comme le Labo 07).
const interdit=/(?:^|[.;:!?]\s+)(?:Ne|N[’'])\s?\S+ (?:pas|jamais|ni|aucun|rien)/,sansB=c=>c.replace(/<[^>]+>/g,'').replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
cases.forEach(c=>assert.ok(!interdit.test(sansB(c))&&!/^⚠|class="attention"/.test(sansB(c)+c),'Se connecter, une interdiction dans une case : '+sansB(c).slice(0,70)));
console.log('OK Se connecter : '+cases.length+' cases, chacune avec son mot-clé en gras.');
