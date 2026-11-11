/* Même tableau, catalogue et contrôles d'accès. Aucun appel à piloter(). */
(function(){
  const cours='rat-de-ville-formatif';
  /* Étapes repérées par leur id (clés « 6.1 », Journal) ; affichées par leur place. Terminé = calculé ici. */
  const numero=id=>{const k=ETAPES_RAT.findIndex(e=>e.id===Number(id));return k>=0?k+1:id;};
  const finies=e=>ETAPES_RAT.filter(et=>et.actions.every((_,j)=>e.cases[et.id+'.'+(j+1)])).length;
  const entetes=[...$('lignes').closest('table').querySelectorAll('thead th')], titres=entetes.map(n=>n.textContent);
  function presentation(actif){
    $('formatif-prof').hidden=!actif;
    const labels=actif?['Élève','Classe','Actions déclarées','Ma place','Étapes terminées','Moi (C1–C4)','Blocage','Dernière action']:titres;
    entetes.forEach((n,i)=>n.textContent=labels[i]);
  }
  function chargeFormatif(){presentation($('cours').value===cours);}
  /* Cloche : la demande la plus ancienne en haut, comme dans le tableau des autres cours. */
  const ordre=(a,b)=>Number(!!b.aide)-Number(!!a.aide)||(a.aide&&b.aide?a.aide.depuis-b.aide.depuis:a.position-b.position);
  function boutonCloche(e){
    const b=txt('button','btn vide','Réinitialiser la cloche');b.type='button';b.setAttribute('aria-label','Réinitialiser la cloche de '+nom(e.email));
    b.addEventListener('click',()=>{
      if(b.disabled)return;b.disabled=true;b.textContent='Enregistrement…';
      if(!SUIVI){b.textContent='Aperçu : rien n’est enregistré';return;}
      google.script.run.withSuccessHandler(()=>{b.textContent='✓ Cloche réinitialisée';charge();})
        .withFailureHandler(err=>{b.disabled=false;b.textContent='Réessayer : réinitialiser';erreur(err);})
        .reinitialiserClocheFormatif(cours,e.email,e.aide.depuis);
    });
    return b;
  }
  function dessine(d){
    const eleves=(d.declaratif?d.eleves:[]).slice().sort(ordre);
    eleves.forEach(e=>{e.cases=e.cases||{};e.atteint=finies(e);e.fini=e.atteint===ETAPES_RAT.length;});
    $('chiffres').replaceChildren(...[['Élèves',eleves.length],['Blocages signalés',eleves.filter(e=>e.aide).length],['Ont tout déclaré terminé',eleves.filter(e=>e.fini).length]].map(([t,v])=>{const n=txt('div','chiffre');n.append(txt('b',null,v),txt('span',null,t));return n;}));
    const tb=$('lignes');tb.replaceChildren();
    if(!eleves.length){const tr=txt('tr'),td=txt('td',null,SUIVI?'Aucune action sur cette période. Choisis une séance précédente pour consulter son suivi.':'Aperçu du formatif : aucune donnée scolaire.');td.colSpan=8;tr.append(td);tb.append(tr);}
    eleves.forEach(e=>{
      const tr=txt('tr',e.aide?'aide':''),td=t=>{const n=txt('td',null,t);tr.append(n);return n;};const n1=td(nom(e.email));n1.title=e.email;n1.className='nom';n1.append(caseRecompense(e));td(e.classe);const cases=td(e.cochees+' / '+ETAPES_RAT.reduce((n,x)=>n+x.actions.length,0)+' cases');
      const detail=txt('details'),sum=txt('summary',null,'Détail des actions');detail.append(sum);
      ETAPES_RAT.forEach((etape,i)=>{const z=txt('p',null,(i+1)+'. '+etape.titre);detail.append(z);const ul=txt('ul');etape.actions.forEach((a,j)=>ul.append(txt('li',null,(e.cases[etape.id+'.'+(j+1)]?'☑ ':'☐ ')+a.replace(/\[\[(.+?)\]\]/g,'« $1 »'))));detail.append(ul);});cases.append(detail);
      td().append(lienBloc(e.position,numero(e.position)+' / '+ETAPES_RAT.length));td(e.atteint+' / '+ETAPES_RAT.length);td([1,2,3,4].map(i=>e.moi[i]||'—').join(' · '));
      const etat=td(e.aide?'🔔 Je bloque · étape '+numero(e.aide.bloc)+' · '+ilya(d.maintenant-e.aide.depuis):e.fini?'Tout déclaré terminé — copie à vérifier':'En cours');
      if(e.aide){etat.append(document.createElement('br'),boutonCloche(e));}
      td(ilya(d.maintenant-e.derniere));tb.append(tr);
    });
    $('maj').textContent='Suivi déclaratif · mis à jour à '+new Date(d.maintenant).toLocaleTimeString('fr-BE');
    $('titre-classe').textContent=choisie().classe?choisie().classe+' · ':'';
  }
  globalThis.FormatifProf={charge:chargeFormatif,presentation,dessine};
  if($('cours').value===cours)chargeFormatif();
})();
