// Instaladora Lenz — Av. Tiradentes. Imagem 780x486, ~56 px/m (altura ~5 m da calçada ao topo do letreiro).
// Letreiro (y140-282) na frente; 4 pilares vermelhos 3D; vitrine recuada 0.35 m; bicicleta fica só na foto (pilar esq.).
// Prédio vizinho cinza à esquerda (x<35) excluído. Lado direito do letreiro é cortado na foto em x=780.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,reboco} from '../shared/facade.js';
export async function buildLenz(url='./fachada_lenz.jpg'){
 const G=new THREE.Group();G.name='lenz';const PX=56,R=.35,D=14;
 const F=await fotoTex(url,skyAzul,.3);const {wx,wy,face}=mapper({PX,GX:400,GY:418,W:780,H:486});
 const x0=wx(20),x1=wx(780),HT=wy(140),HB=wy(282),branco=M({map:reboco('#ecebe6')});
 // letreiro + platibanda
 face(F,20,140,780,282,0,G);box(x1-x0,HT-HB,.4,branco,(x0+x1)/2,(HT+HB)/2,-.2,G);
 box(x1-x0,.08,.5,M({color:0x3a3a3a}),(x0+x1)/2,HT+.04,-.2,G);
 // pilares vermelhos 3D (frente com a foto; o esquerdo inclui a bicicleta)
 const verm=M({color:0xb8262b,roughness:.7});
 const pil=[[35,62],[267,292],[502,527],[750,778]];
 for(const [p0,p1] of pil){const w=wx(p1)-wx(p0),cx=(wx(p0)+wx(p1))/2;face(F,p0,282,p1,418,0,G);box(w,HB,.4,verm,cx,HB/2,-.2,G);}
 // forro sob o letreiro entre pilares
 box(x1-x0,.05,R,M({color:0xdedcd6}),(x0+x1)/2,HB-.025,-R/2,G);
 // vitrines recuadas
 for(let i=0;i<3;i++){const p0=pil[i][1],p1=pil[i+1][0];face(F,p0,282,p1,418,-R,G).receiveShadow=false;}
 // corpo, laje
 box(x1-x0,HT,D-R-.03,branco,(x0+x1)/2,HT/2,-R-.03-(D-R-.03)/2,G);
 box(x1-x0,.1,D,M({color:0x8c8a86}),(x0+x1)/2,HT-.3,-D/2,G);
 // calçada de concreto
 box(x1-x0+1,.06,3.5,M({color:0x8a8884,roughness:1}),(x0+x1)/2,.03,1.75,G);
 box(x1-x0+1,.15,.2,M({color:0xb9b5ad}),(x0+x1)/2,.075,3.5,G);
 return G;}
