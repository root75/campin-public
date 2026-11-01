const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Node{
 constructor(text=''){this.text=text;this.children=[];this.dataset={}}
 get textContent(){return this.children.length?this.children.map(n=>n.textContent).join(''):this.text}
 set textContent(t){this.text=t;this.children=[]}
 replaceChildren(...c){this.children=c} append(...c){this.children.push(...c)}
 matches(){return true}
}
const samples=['print("<script>& bonjour")\n\t# commentaire\n  vies = 3\n', 'if True:\n    print(3.14)\n\n', 'message = """deux\nlignes"""\n'];
for(const source of samples){
 const pre=new Node(source);let update;
 const doc={createTextNode:t=>new Node(t),createElement:()=>new Node(),head:new Node(),body:new Node(),querySelector:()=>null,querySelectorAll:()=>[pre]};
 vm.runInNewContext(fs.readFileSync('pas-a-pas/python-couleurs.js','utf8'),{document:doc,location:{pathname:'/python-1/'},MutationObserver:class{constructor(f){update=f}observe(){}}});
 assert.equal(pre.textContent,source);assert.ok(pre.children.some(n=>n.className==='py-chaine'||n.className==='py-mot'));
 const children=pre.children;update();assert.equal(pre.children,children);
 pre.textContent='print(42)\n';update();assert.equal(pre.textContent,'print(42)\n');
}
console.log('Coloration : texte exact, indentation, chaînes HTML, multilignes, mise à jour et stabilité vérifiés.');
