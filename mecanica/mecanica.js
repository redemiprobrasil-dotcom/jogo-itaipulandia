// Mecânica do Chico — Av. Tiradentes. Imagem 1024x576 (telefone corrigido p/ 98828-2705), ~75.5 px/m (altura 4.5 m, largura ~12 m).
// Cerca branca (esq.) e vegetação (dir.) excluídas. Dois boxes abertos com 6 m de fundo; interior da foto no fundo de cada box.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,reboco,paver} from '../shared/facade.js';
export async function buildMecanica(url='./fachada_mecanica.jpg'){
 const G=new THREE.Group();G.name='mecanica';const PX=75.5,BD=6,D=14;
 const F=await fotoTex(url,skyAzul,.3);const {wx,wy,face}=mapper({PX,GX:520,GY:440,W:1024,H:576});
 const parede=M({map:reboco('#dcdad2')}),esc=M({color:0x2c2a28,roughness:1}),x0=wx(65),x1=wx(975),HT=wy(98),HB=wy(250);
 // faixa superior (platibanda + letreiros) e pilares, todos na frente
 face(F,65,98,975,250,0,G);box(x1-x0,HT-HB,.4,parede,(x0+x1)/2,(HT+HB)/2,-.2,G);
 for(const [p0,p1] of [[65,143],[432,572],[882,975]]){face(F,p0,250,p1,442,0,G);box(wx(p1)-wx(p0),HB,.4,parede,(wx(p0)+wx(p1))/2,HB/2,-.2,G);}
 // boxes: fundo com a imagem do interior, laterais, teto e piso escuros
 for(const [p0,p1] of [[143,432],[572,882]]){const a=wx(p0),b=wx(p1),w=b-a,cx=(a+b)/2;
  face(F,p0,250,p1,440,-BD,G);
  box(w,HT-HB,BD,esc,cx,(HT+HB)/2,-BD/2-.2,G);                                   // teto
  const pi=new THREE.Mesh(new THREE.PlaneGeometry(w,BD),M({color:0x4a4844,roughness:.8}));pi.rotation.x=-Math.PI/2;pi.position.set(cx,.01,-BD/2);G.add(pi);}
 // paredes divisórias dentro (continuação dos pilares para o fundo)
 for(const [p0,p1] of [[65,143],[432,572],[882,975]])box(wx(p1)-wx(p0),HT,BD,M({color:0x5a5752}),(wx(p0)+wx(p1))/2,HT/2,-.4-BD/2+.2,G);
 // corpo atrás dos boxes
 box(x1-x0,HT,D-BD,parede,(x0+x1)/2,HT/2,-BD-(D-BD)/2,G);
 box(x1-x0,.1,D,M({color:0x8c8a86}),(x0+x1)/2,HT-.3,-D/2,G);                 // laje
 // braços de luminária 3D (hastes finas inclinadas + cabeça)
 const fer=M({color:0x6a6a6a,metalness:.7,roughness:.4});
 for(const [bx,tx] of [[277,238],[744,773]]){const a=new THREE.Vector3(wx(bx),HT,.1),b=new THREE.Vector3(wx(tx),wy(42),.1),L=a.distanceTo(b);
  const r=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,L,6),fer);r.position.copy(a).add(b).multiplyScalar(.5);r.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());G.add(r);
  box(.22,.12,.18,M({color:0xb8b8b8,metalness:.5,roughness:.4}),b.x,b.y-.05,.15,G);}
 // pátio de concreto manchado + meio-fio + calçada de paver
 box(x1-x0+1,.06,1.8,M({color:0x7f7d78,roughness:1}),(x0+x1)/2,.03,.9,G);
 box(x1-x0+1,.15,.2,M({color:0xb9b5ad}),(x0+x1)/2,.075,1.9,G);
 const c=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0+1,3),M({map:paver(10,2)}));c.rotation.x=-Math.PI/2;c.position.set((x0+x1)/2,.01,3.5);c.receiveShadow=true;G.add(c);
 return G;}
