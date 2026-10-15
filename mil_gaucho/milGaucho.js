// Mil e Uma Utilidades (2 pav., px 75-515) + Loja do Gaúcho (térrea, px 515-1010) — Rua Rui Barbosa. ~48 px/m.
// A árvore da calçada foi removida da textura (inpainting) e é 3D aqui; o poste também é 3D.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,reboco,paver} from '../shared/facade.js';
let BASE='./';
export async function buildMilGaucho(url='./fachada_mil_gaucho.jpg'){
 BASE=url.replace(/[^\/]*$/,'');
 const G=new THREE.Group();G.name='milGaucho';const PX=48;
 const F=await fotoTex(url,skyAzul,.45);const {wx,wy,face}=mapper({PX,GX:542,GY:452,W:1024,H:576});
 const rosa=M({map:reboco('#e9a3a2')}),D=14;
 // ---- Mil e Uma: térreo + pav. superior com varanda recuada 1.5 m
 const a0=wx(75),a1=wx(515);
 box(a1-a0,wy(228),D,rosa,(a0+a1)/2,wy(228)/2,-D/2-.02,G);
 face(F,75,228,515,452,0,G);                                    // térreo (letreiro, vitrines, porta)
 box(a1-a0,wy(50)-wy(228),D-1.5,rosa,(a0+a1)/2,(wy(50)+wy(228))/2,-1.5-(D-1.5)/2,G);
 face(F,85,95,505,228,-1.49,G);                                 // parede recuada da varanda
 face(F,75,50,515,95,.01,G);box(a1-a0,wy(50)-wy(95),1.5,rosa,(a0+a1)/2,(wy(50)+wy(95))/2,-.75,G); // viga/platibanda
 for(const p of[[228,245],[365,380]])box((p[1]-p[0])/PX,wy(95)-wy(228),.25,M({color:0xb9c3cf}),wx((p[0]+p[1])/2),(wy(95)+wy(228))/2,-.15,G); // colunas varanda
 box(.25,wy(95)-wy(228),1.5,rosa,a0+.12,(wy(95)+wy(228))/2,-.75,G);box(.25,wy(95)-wy(228),1.5,rosa,a1-.12,(wy(95)+wy(228))/2,-.75,G);
 // guarda-corpo 3D
 const fer=M({color:0x2e3338,metalness:.5,roughness:.5}),RH=.95,y0=wy(228),bars=Math.floor((a1-a0)/.12);
 const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.018,RH,.018),fer,bars),m4=new THREE.Matrix4();
 for(let i=0;i<bars;i++){m4.makeTranslation(a0+.1+i*.12,y0+RH/2,-.08);im.setMatrixAt(i,m4);}G.add(im);box(a1-a0-.1,.04,.05,fer,(a0+a1)/2,y0+RH,-.08,G);
 // degraus de entrada 3D
 for(let i=0;i<3;i++){const h=.16*(3-i);box(wx(362)-wx(232),h,.3,M({color:0x8a5a46}),(wx(232)+wx(362))/2,h/2,.15+.3*i,G);}
 // ---- Loja do Gaúcho: térrea, telhado metálico baixo
 const b0=wx(515),b1=wx(1010),hb=wy(282);
 box(b1-b0,hb,D,rosa,(b0+b1)/2,hb/2,-D/2-.02,G);face(F,515,228,1012,452,0,G,true);
 const rf=box(b1-b0+.4,.08,D+.6,M({color:0x5c6064,metalness:.4,roughness:.6}),(b0+b1)/2,hb+.45,-D/2+.1,G);rf.rotation.x=.06;
 // ---- Gaúcho 2º pavimento (recuado 2 m da frente) + fachada lateral (Av. Tiradentes) com imagem
 await lateral(G,b0,b1,hb,rosa);
 // ---- árvore 3D (copa grande sobre a frente do Gaúcho) e poste
 const tr=new THREE.Group();tr.position.set(wx(797),0,1.9);G.add(tr);
 const tronco=new THREE.Mesh(new THREE.CylinderGeometry(.13,.2,3.4,8),M({color:0x7a6a58}));tronco.position.y=1.7;tronco.castShadow=true;tr.add(tronco);
 const folha=M({color:0x6a9a3a,roughness:1,flatShading:true});const rnd=(a)=>(Math.random()-.5)*a;
 for(let i=0;i<70;i++){const s=new THREE.Mesh(new THREE.IcosahedronGeometry(.45+Math.random()*.45,0),folha);const a=Math.random()*6.28,rr=Math.sqrt(Math.random());s.position.set(Math.cos(a)*rr*3.3,5.2+rnd(3.2)*(1-rr*.4),Math.sin(a)*rr*1.8);s.castShadow=true;tr.add(s);}
 box(2.4,.15,1.0,M({color:0xbdb8ae}),wx(805),.075,1.9,G);                     // canteiro
 const poste=new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,9,10),M({color:0x9a9890}));poste.position.set(wx(35),4.5,2.9);poste.castShadow=true;G.add(poste);
 box(1.4,.1,.1,M({color:0x7a6650}),wx(35),8.4,2.9,G);
 // ---- calçada
 const c=new THREE.Mesh(new THREE.PlaneGeometry(b1-a0+4,3.2),M({map:paver(14,3)}));c.rotation.x=-Math.PI/2;c.position.set((a0+b1)/2,.01,1.6);c.receiveShadow=true;G.add(c);
 box(b1-a0+4,.012,.3,M({color:0xd9b24a}),(a0+b1)/2,.015,.9,G);box(b1-a0+4,.15,.2,M({color:0xb9b5ad}),(a0+b1)/2,.075,3.3,G);
 return G;}

// Lateral do Gaúcho: plano perpendicular na ponta direita (x=b1), voltado para +x. Imagem 1024x576, prédio px 45-865, ~41 px/m (≈20 m).
async function lateral(G,b0,b1,hb,rosa){
 const PX=41,L=(865-45)/PX,HT=(437-127)/PX;const S=await fotoTex(BASE+'lateral_gaucho.jpg',(r,g,b)=>b>160&&b-r>12&&g>r,.42);
 const m=mapper({PX,GX:45,GY:437,W:1024,H:576});
 box(b1-b0,hb,L,rosa,(b0+b1)/2,hb/2,-L/2-.03,G);                         // térreo até o fundo
 box(b1-b0,HT-hb,L-2,rosa,(b0+b1)/2,hb+(HT-hb)/2,-2-(L-2)/2,G);           // pav. superior recuado
 const side=new THREE.Group();side.rotation.y=Math.PI/2;side.position.set(b1+.02,0,0);G.add(side);
 m.face(S,45,78,865,437,0,side,true);                                    // fachada lateral (x local → -z)
 // muro perimetral rosa + gradil + arbusto, após o fim do prédio
 const W0=-L,W1=-L-(1024-865)/PX*1.6,wl=W0-W1;
 box(.25,1.2,wl,rosa,b1-.12,.6,(W0+W1)/2,G);
 const fer=M({color:0x3d2c24,metalness:.4,roughness:.6}),n=Math.floor(wl/.12),im=new THREE.InstancedMesh(new THREE.BoxGeometry(.02,1.2,.02),fer,n),m4=new THREE.Matrix4();
 for(let i=0;i<n;i++){m4.makeTranslation(b1-.12,1.8,W0-.05-i*.12);im.setMatrixAt(i,m4);}G.add(im);box(.04,.04,wl,fer,b1-.12,2.4,(W0+W1)/2,G);
 const fol=M({color:0x4f7d2e,roughness:1,flatShading:true});
 for(let i=0;i<45;i++){const r=.4+Math.random()*.5,s=new THREE.Mesh(new THREE.IcosahedronGeometry(r,0),fol),a=Math.random()*6.28,rr=Math.sqrt(Math.random());s.position.set(b1-1.5+Math.cos(a)*rr*1.4,1.2+Math.random()*3.8,W0-1.8+Math.sin(a)*rr*1.8);s.castShadow=true;G.add(s);}
 const tc=new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,2,6),M({color:0x6b5a48}));tc.position.set(b1-1.5,1,W0-1.8);G.add(tc);
 // calçada lateral
 const c=new THREE.Mesh(new THREE.PlaneGeometry(3.2,L+6),M({map:paver(3,14)}));c.rotation.x=-Math.PI/2;c.position.set(b1+1.6,.01,-L/2-2);G.add(c);
 box(.2,.15,L+6,M({color:0xb9b5ad}),b1+3.3,.075,-L/2-2,G);}
