// Studio Toke Final (só o salão) — Rua Sete de Setembro. Textura 840x528 recortada da arte aprovada (vizinhos e árvore removidos), 120 px/m.
// Proporção real da foto: ~7.0 m de largura x 4.4 m até o topo do zigue-zague (a arte foi comprimida na horizontal).
// Pilares rosa salientes 0.12 m, vitrine recuada 0.4 m, 2 degraus 3D, telhas em zigue-zague 3D.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,paver,reboco} from '../shared/facade.js';
export async function buildTokeFinal(url='./fachada_toke.jpg'){
 const G=new THREE.Group();G.name='toke_final';const PX=120,W=840,H=528,GY=528,R=.4,P=.12,D=10;
 const F=await fotoTex(url,skyAzul,.06);const {wx,wy,face}=mapper({PX,GX:420,GY,W,H});
 const x0=wx(0),x1=wx(W),L=x1-x0,HT=wy(16),rosa=M({map:reboco('#e58fb0',2)}),preto=M({color:0x1a1a1a,roughness:.95});
 const SX0=185,SX1=630,SY0=182,SY1=470,ST0=160,ST1=645;
 // fachada plana (exceto pilares, vitrine e degraus)
 face(F,0,16,W,SY0,0,G,true);face(F,62,SY0,132,GY,0,G);face(F,182,SY0,SX0,SY1,0,G);face(F,SX1,SY0,W,GY,0,G);
 face(F,0,0,W,16,0,G,true);
 // pilares rosa 3D
 for(const [a,b] of [[0,62],[132,182]]){const w=(b-a)/PX;box(w,HT,P,rosa,wx((a+b)/2),HT/2,P/2,G);face(F,a,SY0-60,b,GY,P+.002,G);face(F,a,16,b,SY0-60,P+.002,G);}
 // vitrine recuada + moldura preta
 face(F,SX0,SY0,SX1,SY1,-R,G);const sx0=wx(SX0),sx1=wx(SX1),sy0=wy(SY1),sy1=wy(SY0);
 const fr=(a,b,y0,y1)=>box(b-a,y1-y0,R,preto,(a+b)/2,(y0+y1)/2,-R/2-.01,G);
 fr(sx0-.05,sx0,sy0,sy1);fr(sx1,sx1+.05,sy0,sy1);fr(sx0,sx1,sy1,sy1+.05);
 box(sx1-sx0,sy0,R,M({color:0x6d6d6b}),(sx0+sx1)/2,sy0/2,-R/2,G);
 // degraus 3D (concreto)
 const conc=M({color:0x6f6f6c,roughness:.95}),sw=wx(ST1)-wx(ST0),scx=(wx(ST0)+wx(ST1))/2;
 box(sw,sy0/2,.6,conc,scx,sy0/4,.3,G);box(sw,sy0,.3,conc,scx,sy0/2,.15,G);
 // volume
 box(L,HT,D-R-.03,rosa,(x0+x1)/2,HT/2,-R-.03-(D-R-.03)/2,G);
 const pr=(a,b,y0,y1)=>box(b-a,y1-y0,R,rosa,(a+b)/2,(y0+y1)/2,-R/2-.02,G);pr(x0,sx0-.05,0,HT);pr(sx1+.05,x1,0,HT);pr(sx0-.05,sx1+.05,sy1+.05,HT);
 // telhas zigue-zague
 const tel=M({color:0x6e6e6c,roughness:.8}),n=Math.round((L+.2)/.3),tw=(L+.2)/n;
 for(let i=0;i<n;i++){const g=new THREE.ConeGeometry(tw/2*1.41,.18,4,1);g.rotateY(Math.PI/4);const m=new THREE.Mesh(g,tel);m.scale.set(1,1,.6);m.position.set(x0-.1+tw*(i+.5),HT+.09,.05);m.castShadow=true;G.add(m);}
 box(L+.2,.05,D+.2,tel,(x0+x1)/2,HT,-D/2+.05,G);
 // calçada de paver com faixa amarela + guia
 const S=3.2;box(L+1,.08,S,M({map:paver(6,4),roughness:1}),(x0+x1)/2,.04,S/2,G);
 box(L+1,.005,.15,M({color:0xd9b12a}),(x0+x1)/2,.083,S*.55,G);
 box(L+1,.15,.2,M({color:0xb9b5ad}),(x0+x1)/2,.075,S,G);
 return G;}
