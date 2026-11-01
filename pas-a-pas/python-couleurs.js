/* Coloration commune, sans HTML issu du programme et sans modifier son texte. */
(function(){
  const mots = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
  const motif = /#[^\n]*|"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b/g;
  function colorer(n){
    const source = n.textContent;
    if(n.dataset.pythonSource === source) return;
    const fragments = []; let debut = 0;
    for(const m of source.matchAll(motif)){
      fragments.push(document.createTextNode(source.slice(debut,m.index)));
      const t=m[0], cls=t[0]==='#'?'commentaire':/^["']/.test(t)?'chaine':/^\d/.test(t)?'nombre':mots.has(t)?'mot':/^(print|input|str|int|float|range|len)$/.test(t)?'fonction':'';
      const span=document.createElement('span'); span.textContent=t; if(cls) span.className='py-'+cls;
      fragments.push(span); debut=m.index+t.length;
    }
    fragments.push(document.createTextNode(source.slice(debut)));
    n.dataset.pythonSource=source; n.replaceChildren(...fragments);
  }
  function actualise(){
    const python = /python-/.test(location.pathname) || document.querySelector('#cours')?.value.startsWith('python-');
    document.querySelectorAll('.sq-programme, pre.programme-projete, pre.code').forEach(n=>{
      if(python || n.matches('.sq-programme')) colorer(n);
    });
  }
  const style=document.createElement('style');
  style.textContent='pre[data-python-source]{white-space:pre;overflow-x:auto;tab-size:4;background:#111827;color:#e5e7eb}pre .py-commentaire{color:#a8b5c8}pre .py-chaine{color:#a7f3a0}pre .py-nombre{color:#fcd34d}pre .py-mot{color:#d8b4fe}pre .py-fonction{color:#7dd3fc}';
  document.head.append(style);
  new MutationObserver(actualise).observe(document.body,{childList:true,subtree:true});
  actualise();
})();
