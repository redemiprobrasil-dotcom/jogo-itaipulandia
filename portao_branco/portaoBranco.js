// Casa térrea cinza com portão branco ripado — Av. Tiradentes, após GARAGEM. Imagem 705x555, ~85 px/m (gradil 1.8 m, lote ~7.7 m).
// Pilar rosa e poste à esquerda são do vizinho (excluídos). Lote termina na ponta da casa (px 705).
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,paver} from '../shared/facade.js';
export async function buildPortaoBranco(url='./fachada_portao_branco.jpg'){
 const G=new THREE.Group();G.name='portaoBranco';const REC=3;
 const F=await fotoTex(url,skyAzul,.45);const {wx,wy,face}=mapper({PX:85,GX:376,GY:442,W:705,H:555});
 const x0=wx(48),x1=wx(705),cinza=M({color:0xb3b5b4}),eave=wy(190);
 // casa: parte superior da imagem (telhado+varanda acima do gradil) no plano z=-REC; corpo procedural
 const H=new THREE.Group();H.scale.set(1.2,1.2,1);G.add(H);   // casa 3 m atrás: compensa a perspectiva da foto
 face(F,95,78,655,290,-REC,H,true);
 box(wx(655)-wx(95),wy(290),.1,cinza,(wx(95)+wx(655))/2,wy(290)/2,-REC-.06,H);          // parte baixa da frente (atrás do gradil)
 box(wx(645)-wx(110),eave,9,cinza,(wx(110)+wx(645))/2,eave/2,-REC-1.6-4.5,H);           // corpo (varanda 1.6 m)
 // telhado 4 águas terracota
 const d=wx(650)-wx(95)+.4,w=10.4,rh=1.4,r=d/2,hw=w/2,hd=d/2,rl=Math.max(hw-r,.01);
 const v=[-hw,0,hd,hw,0,hd,hw,0,-hd,-hw,0,-hd,-rl,rh,0,rl,rh,0],idx=[0,1,5,0,5,4,2,3,4,2,4,5,1,2,5,3,0,4];
 let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g=g.toNonIndexed();g.computeVertexNormals();
 const rf=new THREE.Mesh(g,M({color:0xc4673e,roughness:.85,side:THREE.DoubleSide}));rf.position.set((wx(95)+wx(650))/2,eave,0);rf.rotation.y=Math.PI/2;rf.position.z=-REC-w/2-.15+.5;rf.castShadow=true;H.add(rf);
 // piso: concreto da entrada e terra do lote
 const pis=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,REC),M({color:0xc9c4bb}));pis.rotation.x=-Math.PI/2;pis.position.set((x0+x1)/2,.01,-REC/2);G.add(pis);
 // gradil branco de ripas horizontais 3D (painel fixo, portãozinho, portão de correr)
 const br=M({color:0xf2f2f0,roughness:.5,metalness:.2}),FH=wy(288),ns=14;
 for(const [p0,p1] of [[48,400],[405,490],[490,705]]){const a=wx(p0),b=wx(p1),L=b-a;
  for(let i=0;i<ns;i++)box(L,.07,.03,br,(a+b)/2,.12+i*(FH-.2)/(ns-1),0,G);
  for(const x of[a+.03,b-.03])box(.06,FH,.06,br,x,FH/2,0,G);box(L,.05,.06,br,(a+b)/2,FH-.02,0,G);}
 box(.05,FH,.05,br,wx(228),FH/2,0,G);
 const ad=face(F,428,322,465,358,.03,G);                                                  // adesivo redondo do portão
 // canteiro de tijolo
 const tj=M({color:0xc8663e});const c0=wx(15)<x0?x0:wx(15),c1=wx(395);
 box(c1-c0,.25,.9,tj,(c0+c1)/2,.125,.55,G);const ter=new THREE.Mesh(new THREE.PlaneGeometry(c1-c0-.2,.7),M({color:0x7a4a32}));ter.rotation.x=-Math.PI/2;ter.position.set((c0+c1)/2,.26,.55);G.add(ter);
 for(let i=0;i<7;i++){const p=new THREE.Mesh(new THREE.IcosahedronGeometry(.13,0),M({color:0x5c8a3a}));p.position.set(c0+.4+i*(c1-c0-.8)/6,.36,.55);G.add(p);}
 // rampa de concreto do portão + calçada
 box(x1-wx(395),.06,1,M({color:0xbdb8b0}),(wx(395)+x1)/2,.03,.5,G);
 const c=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0+1,2.4),M({map:paver(8,2)}));c.rotation.x=-Math.PI/2;c.position.set((x0+x1)/2,.01,2.2);c.receiveShadow=true;G.add(c);
 box(x1-x0+1,.012,.25,M({color:0xd9b24a}),(x0+x1)/2,.015,1.9,G);box(x1-x0+1,.15,.2,M({color:0xb9b5ad}),(x0+x1)/2,.075,3.4,G);
 return G;}
