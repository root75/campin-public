/* La phrase de la fin — commune à tous les cours (moteur blocs.js ou fiche autonome).
   Une citation réelle, son auteur, sa source, et une ligne qui la relie au cours.
   Une surprise pour tous, quel que soit le nombre d'erreurs : pas une récompense.
   La fiche ne donne que les données : { texte, auteur, source, lien } (\n pour aller à la ligne).
   Utilisation : PhraseFin.figure(citation) → <figure class="citation">, à placer sur l'écran de fin.
   Style par défaut ci-dessous ; une fiche peut le surcharger (.citation dans son index.html). */
const PhraseFin = (() => {
  const el = (tag, cls, t) => { const n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; };
  function style() {
    if (document.getElementById('pf-style')) return;
    const s = el('style'); s.id = 'pf-style';
    // :where() : spécificité nulle, le style propre d'un cours l'emporte toujours.
    s.textContent = ':where(.citation){margin:16px 0 0;padding:10px 14px;border-left:4px solid var(--fromage,#e3a922);'
      + 'background:var(--fromage-pale,#fbf0d4);border-radius:0 10px 10px 0;display:grid;gap:4px}'
      + ':where(.citation) blockquote{margin:0;font-size:1.15rem;font-style:italic;white-space:pre-line}'
      + ':where(.citation) figcaption{color:var(--doux,#5b6873);font-size:.95rem}'
      + ':where(.citation) p{margin:0;font-size:.95rem}';
    document.head.append(s);
  }
  function figure(c) {
    if (!c || !c.texte) return null;
    style();
    const f = el('figure', 'citation');
    f.append(el('blockquote', null, '« ' + c.texte + ' »'), el('figcaption', null, '— ' + c.auteur + (c.source ? ', ' + c.source : '')));
    if (c.lien) f.append(el('p', null, c.lien));
    return f;
  }
  return { figure };
})();
