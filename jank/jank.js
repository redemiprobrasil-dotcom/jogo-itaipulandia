// Panificadora Jank — Rua Rui Barbosa. Mesmo método da casa277. Imagem aprovada 1024x576 (prédio px 158..910), ~50 px/m.
// Elementos já pintados na imagem (arvorezinha, postes finos, mesas, guarda-corpo de vidro) NÃO têm duplicata 3D.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,reboco,paver} from '../shared/facade.js';
export async function buildJank(url='./fachada_jank.jpg'){
 const G=new THREE.Group();G.name='jank';const PX=50;
 const F=await fotoTex(url,(r,g,b)=>b>150&&b-r>45,.5);const {wx,wy,face,disc}=mapper({PX,GX:534,GY:497,W:1024,H:576});
 const br=M({map:reboco('#f0f0ee')}),esc=M({color:0x3a2a22}),cinza=M({color:0xc9c9c6});
 const X0=wx(160),X1=wx(910),D=14,FL=wy(462),PD=2.6;   // FL piso da varanda, PD fundo da varanda
 // base/piso da varanda
 box(wx(905)-wx(168),FL,D,cinza,(wx(168)+wx(905))/2,FL/2,.3-D/2,G);face(F,357,462,897,490,.31,G);
 // corpo térreo e superior
 box(wx(905)-wx(168),wy(312)-FL,D-PD,br,(wx(168)+wx(905))/2,(FL+wy(312))/2,-PD-(D-PD)/2,G);
 box(wx(795)-wx(178),wy(18)-wy(312),D,br,(wx(178)+wx(795))/2,(wy(18)+wy(312))/2,-.6-D/2,G);
 face(F,205,312,895,462,-PD+.01,G);                  // fundo da varanda (porta, vitrines, quadros, mesas, árvore, postes)
 face(F,180,115,795,232,-.59,G);                     // pav. superior com janelas e vidro
 box(wx(795)-wx(175),wy(232)-wy(250),.7,br,(wx(175)+wx(795))/2,(wy(232)+wy(250))/2,-.25,G);face(F,175,232,795,250,.11,G); // laje balcão
 face(F,178,18,795,115,.21,G);box(wx(795)-wx(178),wy(18)-wy(115),.8,br,(wx(178)+wx(795))/2,(wy(18)+wy(115))/2,-.2,G);   // caixa letreiro
 face(F,795,18,900,248,.26,G);box(wx(900)-wx(795),wy(18)-wy(248),.8,esc,(wx(795)+wx(900))/2,(wy(18)+wy(248))/2,-.15,G); // totem fotos
 // marquise ripada (projeta ~1 m) com letreiro
 box(X1-X0,wy(250)-wy(312),PD+1,esc,(X0+X1)/2,(wy(250)+wy(312))/2,1-(PD+1)/2,G);face(F,158,250,910,312,1.01,G);
 disc(F,848,281,30,1.05,G);
 // pilares das pontas + paredes laterais fechando a varanda
 for(const [p0,p1] of [[168,205],[895,910]]){const w=(p1-p0)/PX,h=wy(312)-FL;box(w,h,PD,br,wx((p0+p1)/2),FL+h/2,-PD/2,G);face(F,p0,312,p1,462,.01,G);}
 // escada 3D (3 degraus) + rampa e corrimão simples à esquerda
 const e0=wx(198),e1=wx(357),nd=3;for(let i=0;i<nd;i++){const h=FL*(i+1)/nd,d=.35*(nd-i);box(e1-e0,h,d,cinza,(e0+e1)/2,h/2,.3+d/2,G);}
 const rp=box(wx(198)-wx(100),.12,1.2,cinza,(wx(100)+wx(198))/2-.05,FL/2,.9,G);rp.rotation.z=Math.atan2(FL,wx(198)-wx(100));
 const inox=M({color:0xe8e8e8,metalness:.6,roughness:.3});
 for(const z of[.35,1.45]){const L=Math.hypot(wx(198)-wx(100),FL);const t=box(L,.04,.04,inox,(wx(100)+wx(198))/2,FL/2+.9,z,G);t.rotation.z=Math.atan2(FL,wx(198)-wx(100));for(const x of[wx(102),wx(150),wx(198)])box(.04,.9,.04,inox,x,FL*(x-wx(100))/(wx(198)-wx(100))+.45,z,G);}
 // calçada
 const c=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0+8,3.4),M({map:paver()}));c.rotation.x=-Math.PI/2;c.position.set(0,.01,2.4);c.receiveShadow=true;G.add(c);
 box(X1-X0+8,.012,.35,M({color:0xd9b24a}),0,.015,2.6,G);box(X1-X0+8,.15,.2,M({color:0xb9b5ad}),0,.075,4.1,G);
 return G;}
