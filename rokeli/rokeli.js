// ROKELI — Av. Tiradentes (depois da Pauli). Imagem do usuário 1079x1140; coords abaixo em px da visualização 969x1024 (k=1079/969). Largura ~9.5 m (~102 px/m).
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,tex} from '../shared/facade.js';
const k=1079/969;
export async function buildRokeli(base='./'){
 const G=new THREE.Group();G.name='rokeli';
 const F=await fotoTex(base+'fachada.jpg',skyAzul,.05);
 const mp=mapper({PX:102*k,GX:484.5*k,GY:817*k,W:1079,H:1140});
 const wx=p=>mp.wx(p*k),wy=p=>mp.wy(p*k),face=(a,b,c,d,z)=>mp.face(F,a*k,b*k,c*k,d*k,z,G);
 const W=wx(969)-wx(0),D=12,R=1.5,H=wy(33),vinho=M({color:0x7a1f24}),bege=M({color:0xe9d8c4});
 // platibanda (y 33..118) e térreo + laje (y 400..817) na frente
 face(0,36,969,118,.01);face(0,400,969,817,.01);
 // parede do fundo da varanda (janelas/cortinas) recuada
 face(40,118,940,400,-R);
 // forro da varanda com spots
 box(W,.12,R,bege,0,wy(118)-.06,-R/2,G);
 const spot=M({color:0xffffff,emissive:0xffe7b0,emissiveIntensity:2});
 for(const p of[210,540,785]){const s=new THREE.Mesh(new THREE.CircleGeometry(.07,16),spot);s.rotation.x=Math.PI/2;s.position.set(wx(p),wy(118)-.125,-R/2);G.add(s);}
 // piso da varanda
 box(W,.05,R,M({color:0xcfc6b8}),0,wy(400)+.025,-R/2,G);
 // pilares vinho (laterais e central)
 const yb=wy(400),yt=wy(118);
 for(const [a,b] of[[0,40],[940,969],[405,430]])box(wx(b)-wx(a),yt-yb,R,vinho,(wx(a)+wx(b))/2,(yt+yb)/2,-R/2,G);
 // volume principal
 const pe=M({color:0xe8b48a});box(W,yb,D-.02,pe,0,yb/2,-D/2-.02,G);box(W,yt-yb,D-R-.02,pe,0,(yt+yb)/2,-R-.02-(D-R-.02)/2,G);box(W,H-yt,D-.02,pe,0,(H+yt)/2,-D/2-.02,G);
 box(W,.15,D,M({color:0x5a1a1e}),0,H+.02,-D/2,G);
 // guarda-corpo tubular branco em 2 trechos
 const br=M({color:0xf4f4f4,metalness:.3,roughness:.4}),rt=wy(297),z0=-.12;
 for(const [a,b] of[[5,405],[430,965]]){const x0=wx(a),x1=wx(b),w=x1-x0,c=(x0+x1)/2;
  for(let i=0;i<5;i++){const y=yb+.1+(rt-yb-.1)*i/4,m=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,w,8),br);m.rotation.z=Math.PI/2;m.position.set(c,y,z0);G.add(m);}
  const n=Math.max(2,Math.round(w/1.4));for(let i=0;i<=n;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,rt-yb,8),br);m.position.set(x0+.04+(w-.08)*i/n,(rt+yb)/2,z0);G.add(m);}}
 // vasos com plantas
 const pt=M({color:0x1e1e1e}),fo=M({color:0x2f6b2a});
 for(const p of[48,377,928]){const x=wx(p),v=new THREE.Mesh(new THREE.CylinderGeometry(.2,.16,.3,16),pt);v.position.set(x,yb+.2,-.45);G.add(v);
  for(let i=0;i<5;i++){const s=new THREE.Mesh(new THREE.IcosahedronGeometry(.17,0),fo);s.position.set(x+(Math.random()-.5)*.25,yb+.48+Math.random()*.2,-.45+(Math.random()-.5)*.25);G.add(s);}}
 // calçada paver cinza + faixa amarela + meio-fio
 const cal=3,pv=tex(256,256,(g,w,h)=>{g.fillStyle='#4e5560';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=-32;x<w;x+=64){const o=(y/32)%2?32:0,v=95+Math.random()*25;g.fillStyle=`rgb(${v},${v+6},${v+18})`;g.fillRect(x+o+2,y+2,60,28);}},W/1.2,cal/1.2);
 const ca=new THREE.Mesh(new THREE.PlaneGeometry(W,cal),M({map:pv}));ca.rotation.x=-Math.PI/2;ca.position.set(0,.12,cal/2);ca.receiveShadow=true;G.add(ca);
 const fa=new THREE.Mesh(new THREE.PlaneGeometry(W,.25),M({color:0xe0a030}));fa.rotation.x=-Math.PI/2;fa.position.set(0,.125,1.9);G.add(fa);
 box(W,.15,.15,M({color:0xb5b2aa}),0,.075,cal+.07,G);
 return G;}
