// Bar + gramado da esquina — Av. Tiradentes. Procedural. Metros, origem no centro do alinhamento frontal, +z = rua.
import * as THREE from 'three';
import {tex,noise,paver,M,box,reboco} from '../shared/facade.js';
export function buildBarEsquina(base='./'){
 const G=new THREE.Group(),W=22,x0=-11,x1=11,LX=1;// gramado x0..1, bar 1..x1
 let seed=11;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 // gramado
 const grama=tex(512,512,(g,w,h)=>{noise(g,w,h,'#5f8f3a',.15,30000);for(let i=0;i<200;i++){g.fillStyle=`rgba(${120+R()*60},${150+R()*40},60,.18)`;g.beginPath();g.arc(R()*w,R()*h,5+R()*20,0,7);g.fill();}},4,4);
 const ch=new THREE.Mesh(new THREE.PlaneGeometry(LX-x0,24),M({map:grama,roughness:1}));ch.rotation.x=-Math.PI/2;ch.position.set((x0+LX)/2,.02,-12);ch.receiveShadow=true;G.add(ch);
 // mureta baixa de tijolo vermelho na beira da calçada
 const tij=M({color:0xa04a32});box(LX-x0,.18,.18,tij,(x0+LX)/2,.09,-.1,G);box(.18,.18,24,tij,x0+.09,.09,-12,G);
 // árvores
 const casca=M({color:0x5a4636}),folha=[M({color:0x3f6e2a,flatShading:true}),M({color:0x4f7d30,flatShading:true}),M({color:0x2f5a22,flatShading:true})];
 function arvore(x,z,h,r,cal=false){const t=new THREE.Group();t.position.set(x,0,z);G.add(t);
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.14,.22,h,8),casca);tr.position.y=h/2;tr.rotation.z=(R()-.5)*.15;tr.castShadow=true;t.add(tr);
  if(cal){const p=new THREE.Mesh(new THREE.CylinderGeometry(.235,.25,1.1,10),M({color:0xf2b6c8}));p.position.y=.55;t.add(p);}
  for(let i=0;i<9;i++){const f=new THREE.Mesh(new THREE.IcosahedronGeometry(r*(.45+R()*.35),1),folha[i%3]);f.position.set((R()-.5)*r*1.6,h+(R()-.3)*r*.6,(R()-.5)*r*1.6);f.scale.y=.6;f.castShadow=true;t.add(f);}}
 arvore(-9.5,-3,4,3);arvore(-6,-10,5,3.2);arvore(-2,-15,5.5,3);arvore(-8,-17,5,3);arvore(-3.5,-6,4.5,2.6);
 arvore(2.4,-.6,4.6,3,true);// árvore grande na frente da varanda, tronco pintado
 // arbustos ao fundo
 const ab=M({color:0x3d6b2c,flatShading:true});for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.7+R()*.5,1),ab);b.scale.y=.7;b.position.set(-6+R()*7,.5,-19-R()*3);b.castShadow=true;G.add(b);}
 // banco baixo de concreto no gramado
 box(1.6,.25,.4,M({color:0xb8b2a8}),-9,.13,-1.5,G);
 // ===== BAR =====
 const bx0=LX,bx1=x1,bw=bx1-bx0,cx=(bx0+bx1)/2,zf=-4.5,D=9,H=3.1;
 // piso cerâmico claro
 const piso=tex(256,256,(g,w,h)=>{g.fillStyle='#bdb3a6';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=64)for(let x=0;x<w;x+=64){const s=200+R()*25;g.fillStyle=`rgb(${s},${s-8},${s-20})`;g.fillRect(x+1,y+1,62,62);}},8,4);
 box(bw,.12,-zf,M({map:piso}),cx,.06,zf/2,G);
 // corpo: parede frontal branca com barrado vermelho
 const branco=M({map:reboco('#eeece6',2)}),verm=M({color:0xc0282c}),marrom=M({color:0x4a3a32});
 const fx0=bx0+.5,fx1=bx0+7.2;// trecho branco do balcão
 const wallZ=zf;
 // parede esq. (porta escura entre 1.5..)
 box(fx1-fx0,H,.2,branco,(fx0+fx1)/2,H/2,wallZ-.1,G);
 // abertura de balcão: pinta escuro + balcão
 box(1.9,1.0,.05,M({color:0x2a2420}),fx0+4.6,1.6,wallZ+.01,G);
 box(5.6,1.0,.06,verm,fx0+2.9,.5,wallZ+.02,G);// barrado vermelho
 box(2.1,.08,.5,M({color:0xe8e4dc}),fx0+4.6,1.05,wallZ+.25,G);// tampo do balcão
 // placa lisa (letras ilegíveis na foto: só "DO" e "CENT..." visíveis -> deixada lisa)
 box(2.4,.7,.04,M({color:0xf4f4f0}),fx0+3.2,2.45,wallZ+.03,G);
 // porta escura aberta
 box(1.1,2.2,.05,M({color:0x181614}),fx1-.7,1.1,wallZ+.01,G);
 // trecho direito: parede marrom escura com painel branco
 box(bx1-fx1,H,.2,marrom,(fx1+bx1)/2,H/2,wallZ-.1,G);
 box(2.3,1.9,.04,M({color:0xf2f0ea}),fx1+2.1,1.3,wallZ+.02,G);
 box(bw,.4,.15,verm,cx,.2,wallZ+.02,G);
 // laterais e fundo
 box(.2,H,D,branco,bx0+.1,H/2,wallZ-D/2,G);box(.2,H,D,branco,bx1-.1,H/2,wallZ-D/2,G);box(bw,H,.2,branco,cx,H/2,wallZ-D,G);
 box(bw+.4,.2,D+(-zf)+.4,M({color:0xd8d4cc}),cx,H+.1,(wallZ-D+.4)/2,G);// laje/teto baixo
 box(bw+.4,.35,.12,branco,cx,H-.05,.2,G);// viga frontal branca
 // pilares listrados vermelho/branco
 const list=tex(64,256,(g,w,h)=>{for(let y=0;y<h;y+=32){g.fillStyle=(y/32)%2?'#c0282c':'#f2f0ea';g.fillRect(0,y,w,32);}g.fillStyle='#c0282c';g.fillRect(0,0,8,h);g.fillRect(w-8,0,8,h);},1,1);
 const pm=M({map:list});for(const x of [bx0+.3,bx0+1.1,bx0+7.3,bx1-.3])box(.18,H,.18,pm,x,H/2,.1,G);
 // mesa de sinuca
 const sn=new THREE.Group();sn.position.set(bx0+4.4,0,-2.6);G.add(sn);box(2.2,.15,1.2,M({color:0xe8e4dc}),0,.8,0,sn);box(2,.02,1,M({color:0x1f7a3a}),0,.885,0,sn);box(1.6,.73,.8,M({color:0xd8d4cc}),0,.36,0,sn);
 // cadeiras/mesas plásticas
 const cores=[0xd02828,0xe8c820,0x2850c8];
 function cadeira(x,z,c,ry){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;G.add(g);const m=M({color:c,roughness:.5});box(.45,.05,.45,m,0,.45,0,g);box(.45,.45,.05,m,0,.7,-.22,g);for(const a of[-.2,.2])for(const b of[-.2,.2])box(.04,.45,.04,m,a,.22,b,g);}
 function mesa(x,z,c){const m=M({color:c,roughness:.5});const t=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.04,16),m);t.position.set(x,.72,z);t.castShadow=true;G.add(t);box(.06,.7,.06,m,x,.36,z,G);}
 mesa(bx0+1.6,-1.3,0xe8e4dc);cadeira(bx0+1,-1,0xe8c820,.5);cadeira(bx0+2.2,-.9,0x2850c8,-.6);cadeira(bx0+1.4,-2,0x2850c8,3);
 mesa(bx0+8.4,-2.5,0xd02828);cadeira(bx0+7.8,-2.4,0xd02828,1.5);cadeira(bx0+9,-2.6,0xd02828,-1.5);cadeira(bx0+8.5,-3.3,0xd02828,3.1);
 cadeira(bx0+.3,-3.5,0xd02828,.3);
 // grupo de cadeiras no gramado
 mesa(-6,-4.5,0xd02828);for(let i=0;i<6;i++){const a=i/6*6.28;cadeira(-6+Math.cos(a)*.9,-4.5+Math.sin(a)*.9,i%3?0xd02828:0x2850c8,-a-1.57);}
 // lixeira verde perto da guia
 const lx=new THREE.Mesh(new THREE.CylinderGeometry(.3,.26,.9,12),M({color:0x2f8a3a}));lx.position.set(-.3,.53,1.0);lx.castShadow=true;G.add(lx);
 // vaso de planta
 const vs=new THREE.Mesh(new THREE.CylinderGeometry(.3,.25,.4,10),M({color:0x7a5a40}));vs.position.set(bx0-.3,.2,-.4);G.add(vs);const pl=new THREE.Mesh(new THREE.IcosahedronGeometry(.4,1),ab);pl.position.set(bx0-.3,.6,-.4);G.add(pl);
 // calçada paver + guia
 const S=3.2;box(W,.08,S,M({map:paver(16,3),roughness:1}),0,.04,S/2+.1,G);box(W,.16,.15,M({color:0xb0aaa0}),0,.03,S+.15,G);
 return G;}
