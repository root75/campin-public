/* Même tableau, catalogue et contrôles d'accès. Le repère n'appelle jamais piloter(). */
(function(){
  const cours='rat-de-ville-formatif';
  let repere=null, demande=0;
  const entetes=[...$('lignes').closest('table').querySelectorAll('thead th')], titres=entetes.map(n=>n.textContent);
  const option=(v,t)=>{const o=txt('option',null,t);o.value=v;return o;};
  ETAPES_RAT.forEach((e,i)=>$('repere-etape').append(option(i+1,(i+1)+'. '+e.titre)));
  function appel(valeur){return new Promise((ok,ko)=>google.script.run.withSuccessHandler(ok).withFailureHandler(ko).repereFormatif(cours,$('repere-classe').value,valeur));}
  function statut(t){$('repere-statut').textContent=t;}
  function presentation(actif){
    $('formatif-prof').hidden=!actif;
    for(const id of ['humeurs','blocs','avis'])$(id).closest('section').hidden=actif;
    const labels=actif?['Élève','Classe','Actions déclarées','Ma place','Étapes terminées','Moi (C1–C4)','Blocage','Dernière action']:titres;
    entetes.forEach((n,i)=>n.textContent=labels[i]);
  }
  async function lire(){
    repere=null;$('repere-projeter').disabled=true;
    if(!$('repere-classe').value)return;
    const n=++demande,classe=$('repere-classe').value;
    try{
      const r=SUIVI?await appel(null):{etape:1,rappel:'Sélectionner avant de cliquer.'};
      if(n!==demande||classe!==$('repere-classe').value)return;
      repere=r;$('repere-etape').value=r.etape;$('repere-rappel').value=r.rappel;$('repere-projeter').disabled=false;statut(SUIVI?'Repère retrouvé.':'Aperçu : repère fictif, aucune donnée scolaire.');
    }catch(e){statut('Repère indisponible : '+e.message+' Vérifie la mise à jour Apps Script.');}
  }
  async function charge(){
    const actif=$('cours').value===cours;presentation(actif);if(!actif)return;
    const n=++demande;repere=null;$('repere-projeter').disabled=true;
    try{
      const d=SUIVI?await new Promise((ok,ko)=>google.script.run.withSuccessHandler(ok).withFailureHandler(ko).classesEtCours()):{classes:{'Aperçu':[]}};
      if(n!==demande||$('cours').value!==cours)return;
      const avant=$('repere-classe').value;$('repere-classe').replaceChildren(...Object.keys(d.classes).map(c=>option(c,c)));
      if(Object.hasOwn(d.classes,avant))$('repere-classe').value=avant;
      await lire();
    }catch(e){statut('Classes indisponibles : '+e.message);}
  }
  $('repere-classe').addEventListener('change',lire);
  $('repere-enregistrer').addEventListener('click',async()=>{
    const valeur={etape:Number($('repere-etape').value),rappel:$('repere-rappel').value},n=++demande,classe=$('repere-classe').value;
    $('repere-enregistrer').disabled=true;$('repere-projeter').disabled=true;
    try{const r=SUIVI?await appel(valeur):valeur;if(n!==demande||classe!==$('repere-classe').value)return;repere=r;statut(SUIVI?'Repère enregistré. Les places personnelles sont conservées.':'Aperçu : repère sans sauvegarde scolaire.');$('repere-projeter').disabled=false;}
    catch(e){statut('Non enregistré : '+e.message);}
    finally{$('repere-enregistrer').disabled=false;}
  });
  for(const id of ['repere-etape','repere-rappel'])$(id).addEventListener('input',()=>{$('repere-projeter').disabled=true;statut('Enregistre le repère avant de le projeter.');});
  $('repere-projeter').addEventListener('click',()=>{
    if(!repere)return;const e=ETAPES_RAT[repere.etape-1];
    $('repere-periode').textContent='Le rat de ville · Période '+e.periode+' · Étape visée';
    $('repere-titre').textContent=repere.etape+'. '+e.titre;$('repere-message').textContent=repere.rappel;
    $('repere-projection').hidden=false;document.body.style.overflow='hidden';
  });
  $('repere-fermer').addEventListener('click',async()=>{if(document.fullscreenElement)await document.exitFullscreen();$('repere-projection').hidden=true;document.body.style.overflow='';});
  $('repere-plein').addEventListener('click',()=>$('repere-projection').requestFullscreen().catch(()=>statut('Plein écran indisponible.')));
  function dessine(d){
    const eleves=(d.declaratif?d.eleves:[]).slice().sort((a,b)=>Number(!!b.aide)-Number(!!a.aide)||a.position-b.position);
    $('chiffres').replaceChildren(...[['Élèves',eleves.length],['Blocages signalés',eleves.filter(e=>e.aide).length],['Ont tout déclaré terminé',eleves.filter(e=>e.fini).length]].map(([t,v])=>{const n=txt('div','chiffre');n.append(txt('b',null,v),txt('span',null,t));return n;}));
    const tb=$('lignes');tb.replaceChildren();
    if(!eleves.length){const tr=txt('tr'),td=txt('td',null,SUIVI?'Aucune action sur cette période. Choisis une séance précédente pour consulter son suivi.':'Aperçu du formatif : aucune donnée scolaire.');td.colSpan=8;tr.append(td);tb.append(tr);}
    eleves.forEach(e=>{
      const tr=txt('tr',e.aide?'aide':''),td=t=>{const n=txt('td',null,t);tr.append(n);return n;};td(nom(e.email)).title=e.email;td(e.classe);const cases=td(e.cochees+' / 35 cases');
      const detail=txt('details'),sum=txt('summary',null,'Détail des actions');detail.append(sum);
      ETAPES_RAT.forEach((etape,i)=>{const z=txt('p',null,(i+1)+'. '+etape.titre);detail.append(z);const ul=txt('ul');etape.actions.forEach((a,j)=>ul.append(txt('li',null,(e.cases[(i+1)+'.'+(j+1)]?'☑ ':'☐ ')+a)));detail.append(ul);});cases.append(detail);
      td().append(lienBloc(e.position,e.position+' / 9'));td(e.atteint+' / 9');td([1,2,3,4].map(i=>e.moi[i]||'—').join(' · '));td(e.aide?'Je bloque · étape '+e.aide.bloc+' · '+ilya(d.maintenant-e.aide.depuis):e.fini?'Tout déclaré terminé — copie à vérifier':'En cours');td(ilya(d.maintenant-e.derniere));tb.append(tr);
    });
    $('maj').textContent='Suivi déclaratif · mis à jour à '+new Date(d.maintenant).toLocaleTimeString('fr-BE');
    $('titre-classe').textContent=choisie().classe?choisie().classe+' · ':'';
  }
  globalThis.FormatifProf={charge,presentation,dessine};
  if($('cours').value===cours)charge();
})();
