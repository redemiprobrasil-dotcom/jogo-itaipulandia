// iCell — Rua Sete de Setembro. Textura recomposta 701x444 (arte gerada, paredes pretas encurtadas; letreiro/banner/porta sem escala).
// ~121 px/m: 5.7 m de largura x 3.5 m do chão ao topo do zigue-zague. Porta recuada 0.3 m; telhas em zigue-zague 3D.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,paver} from '../shared/facade.js';
export async function buildIcell(url='./fachada_icell.jpg'){
 const G=new THREE.Group();G.name='icell';const PX=121,R=.3,D=10,W=695;
 const F=await fotoTex(url,skyAzul,.15);const {wx,wy,face}=mapper({PX,GX:350,GY:444,W,H:444});
 const x0=wx(0),x1=wx(W),L=x1-x0,HT=wy(45),preto=M({color:0x1a1a1a,roughness:.95});
 // fachada (exceto porta) com a textura
 const DX0=403,DX1=620,DY=205;
 face(F,0,0,W,DY,0,G,true);face(F,0,DY,DX0,444,0,G);face(F,DX1,DY,W,444,0,G);
 // porta recuada + batentes
 face(F,DX0,DY,DX1,444,-R,G);const dw=(DX1-DX0)/PX,dh=wy(DY);
 for(const x of [wx(DX0),wx(DX1)]){}
 // volume preto
 box(L,HT,D-R-.03,preto,(x0+x1)/2,HT/2,-R-.03-(D-R-.03)/2,G);
 const fr=(a,b,y0,y1)=>box(b-a,y1-y0,R,preto,(a+b)/2,(y0+y1)/2,-.01-R/2,G);
 fr(x0,wx(DX0),0,HT);fr(wx(DX1),x1,0,HT);fr(wx(DX0),wx(DX1),dh,HT);
 // telhas zigue-zague (prismas)
 const tel=M({color:0x6e6e6c,roughness:.8}),n=Math.round(L/.42),sw=L/n;
 for(let i=0;i<n;i++){const g=new THREE.ConeGeometry(sw/2*1.41,.25,4,1);g.rotateY(Math.PI/4);const m=new THREE.Mesh(g,tel);m.scale.set(1,1,.6);m.position.set(x0+sw*(i+.5),HT+.12,-.1);m.castShadow=true;G.add(m);}
 box(L+.1,.05,D,tel,(x0+x1)/2,HT,-D/2,G);
 // calçada de paver com faixa amarela
 const S=3.2;box(L+1,.08,S,M({map:paver(6,4),roughness:1}),(x0+x1)/2,.04,S/2,G);
 box(L+1,.005,.15,M({color:0xd9b12a}),(x0+x1)/2,.083,S*.55,G);
 box(L+1,.15,.2,M({color:0xb9b5ad}),(x0+x1)/2,.075,S,G);
 return G;}
