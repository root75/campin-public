/* Lecteur commun des animations « 👀 Regarde comment faire » — tous les cours.
   Une animation = une liste d'images ; une image = un état de l'écran maquetté (ecran), l'élément que
   la souris vise (cible, l'attribut data-c d'un nœud de la maquette) et une légende. ok: 1 = étoile finale.
   Ce fichier ne contient que le lecteur (scène, curseur, légende, ◀ ▶, points, Revoir / Pause,
   prefers-reduced-motion) et le volet « Toutes les animations ». Chaque cours garde dans son propre
   demos.js ses maquettes d'écran et ses listes d'images, puis appelle :

     const L = DemoLecteur.lecteur({ demos, ecran, pas, place });
       demos : { clé: { titre?, replie?, images: [ … ] } }
       ecran(f) : construit la maquette (élément .md) d'une image f
       pas : millisecondes entre deux images (2600 par défaut)
       place(e, f) : facultatif, placer un menu déroulant de la maquette avant de viser la cible
     L.cree(clé, auto, images) → l'animation (.demo), ou null ; images = numéros (à partir de 0)
       des images à montrer, sinon toute l'animation. C'est ce qu'appelle blocs.js (champ `demos`).
     L.pour(i) → la démo d'un bloc sans champ `demos`, au-dessus des cases (fiches Python).
     DemoLecteur.volet({ … }) → le volet « Toutes les animations ».

   À charger avant le demos.js du cours. Rien n'est enregistré. */
const DemoLecteur = (() => {
  const el = (tag, cls, t) => { const n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; };
  const c = (n, id) => { n.dataset.c = id; return n; };
  const CURSEUR = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 2l16 11-7 1.5L9.5 21z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  /* Placer un menu déroulant m juste sous son ancre, sans sortir de l'écran maquetté e. */
  function sousAncre(e, m, ancre, largeur, gauche = -Infinity) {
    const a = e.getBoundingClientRect(), r = ancre.getBoundingClientRect();
    m.style.left = Math.max(gauche, Math.min(r.left - a.left, a.width - largeur)) + 'px';
    m.style.top = (r.bottom - a.top + 4) + 'px';
  }

  function lecteur(o) {
    const DEMOS = o.demos, pas = o.pas || 2600;

    /* Le lecteur : ◀ ▶, points, Revoir / Pause. Immobile si l'élève a demandé moins d'animations. */
    function cree(cle, auto = true, images) {
      const d = DEMOS[cle]; if (!d) return null;
      const frames = images ? images.map(n => d.images[n]).filter(Boolean) : d.images; if (!frames.length) return null;
      const box = el('div', 'demo'); box.setAttribute('role', 'img'); box.dataset.demo = cle;
      const scene = el('div', 'demo-scene'), curseur = el('div', 'demo-curseur'), legende = el('p', 'demo-legende');
      curseur.innerHTML = CURSEUR;
      const ctrl = el('div', 'demo-ctrl'), prec = el('button', 'demo-b', '◀'), jouer = el('button', 'demo-b demo-jouer', '▶ Revoir'), suiv = el('button', 'demo-b', '▶');
      [prec, jouer, suiv].forEach(b => { b.type = 'button'; });
      prec.setAttribute('aria-label', 'Image précédente'); suiv.setAttribute('aria-label', 'Image suivante');
      const points = el('span', 'demo-points');
      ctrl.append(prec, points, suiv, jouer); scene.append(curseur); box.append(scene, legende, ctrl);
      let k = 0, minuteur = null;
      const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
      function montre(n) {
        k = (n + frames.length) % frames.length; const f = frames[k];
        scene.querySelectorAll('.md').forEach(x => x.remove());
        const e = o.ecran(f); scene.prepend(e);
        legende.textContent = (k + 1) + '. ' + f.legende;
        box.setAttribute('aria-label', 'Démonstration : ' + frames.map(x => x.legende).join(' '));
        points.replaceChildren(...frames.map((_, j) => el('span', j === k ? 'on' : '')));
        box.classList.toggle('demo-ok', !!f.ok);
        requestAnimationFrame(() => {
          if (o.place) o.place(e, f);
          const cible = f.cible && e.querySelector('[data-c="' + f.cible + '"]'); if (!cible) return;
          const a = scene.getBoundingClientRect(), b = cible.getBoundingClientRect();
          curseur.style.transform = 'translate(' + (b.left - a.left + Math.min(b.width / 2, 40)) + 'px,' + (b.top - a.top + b.height / 2) + 'px)';
          cible.classList.add('md-vise');
          setTimeout(() => cible.classList.add('md-clic'), calme ? 0 : 700);
        });
      }
      function stop() { clearTimeout(minuteur); minuteur = null; jouer.textContent = '▶ Revoir'; }
      function joue(depuis = 0) {
        stop(); jouer.textContent = '⏸ Pause'; montre(depuis);
        const suite = () => { if (k >= frames.length - 1) { stop(); return; } minuteur = setTimeout(() => { montre(k + 1); suite(); }, pas); };
        suite();
      }
      prec.addEventListener('click', () => { stop(); montre(k - 1); });
      suiv.addEventListener('click', () => { stop(); montre(k + 1); });
      jouer.addEventListener('click', () => { minuteur ? stop() : joue(k >= frames.length - 1 ? 0 : k); });
      // Lancée une fois insérée dans la page ; immobile si l'élève a demandé moins d'animations.
      setTimeout(() => { montre(0); if (!calme && auto) joue(0); }, 60);
      box.stop = stop; box.joue = () => { if (!calme) joue(0); else montre(0); };
      return box;
    }

    /* Une démo par bloc, au-dessus des cases (blocs sans champ `demos`, fiches Python).
       Gardée d'un affichage à l'autre ; une seule joue à la fois. replie: true = indice à ouvrir. */
    const vues = {}; let enCours = null;
    function pour(i) {
      const d = DEMOS[i]; if (!d) return null;
      if (enCours !== null && enCours !== i && vues[enCours]) vues[enCours].demo.stop();
      enCours = i;
      if (vues[i]) { if (!d.replie) setTimeout(() => vues[i].demo.joue(), 80); return vues[i].emballe; }
      const demo = cree(i, !d.replie);
      let emballe;
      if (d.replie) {
        emballe = el('details', 'demo-cote'); emballe.append(el('summary', null, '💡 ' + d.titre), demo);
        emballe.addEventListener('toggle', () => { if (emballe.open) demo.joue(); else demo.stop(); });
      } else { emballe = el('section', 'demo-bloc'); emballe.append(el('p', 'demo-titre', '👀 Regarde comment faire'), demo); }
      vues[i] = { demo, emballe };
      return emballe;
    }

    return { cree, pour, cles: Object.keys(DEMOS) };
  }

  /* Le volet « Toutes les animations » : un bouton par animation, sans changer d'étape ; une seule joue.
       details : le <details> du volet ; liste, vue : où vont les boutons et l'animation choisie ;
       entrees : [[clé, libellé du bouton]] ; cree(clé, auto) : le cree du lecteur ;
       titre : true = « 👀 libellé » au-dessus de l'animation et bouton marqué enfoncé (Rat, Python) ;
               false = l'animation seule, lancée d'emblée (Labo 07). */
  function volet(o) {
    if (!o.entrees.length) { o.details.hidden = true; return; }
    let enCours = null;
    o.entrees.forEach(([cle, libelle]) => {
      const b = el('button', 'btn vide', libelle); b.type = 'button';
      if (o.titre) b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        if (enCours) enCours.stop();
        if (!o.titre) { enCours = o.cree(cle, true); o.vue.replaceChildren(enCours); return; }
        o.liste.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        enCours = o.cree(cle, false); o.vue.replaceChildren(el('p', 'demo-titre', '👀 ' + libelle), enCours);
        setTimeout(() => enCours.joue(), 80);
      });
      o.liste.append(b);
    });
    o.details.addEventListener('toggle', () => { if (!o.details.open && enCours) enCours.stop(); });
  }

  return { el, c, sousAncre, lecteur, volet };
})();
