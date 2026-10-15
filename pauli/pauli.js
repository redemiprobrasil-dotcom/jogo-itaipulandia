// Pauli Calçados — Av. Tiradentes (ao lado do Kibarato). Imagem do usuário (coords em px de referência 818x1024), 92 px/m => ~8,5 m de frente.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,reboco,tex} from '../shared/facade.js';
export async function buildPauli(base='./'){
 const G=new THREE.Group();G.name='pauli';const PX=92,W=818,H=1024,GY=840,GX=409,D=14;
 const F=await fotoTex(base+'fachada.jpg',null);const {wx,wy,face}=mapper({PX,GX,GY,W,H});
 const L=20,R=798,xL=wx(L),xR=wx(R),HT=wy(108);
 const verm=M({map:reboco('#c8202a')}),branco=M({color:0xf2f0ea}),preto=M({color:0x1c1c1e,metalness:.6,roughness:.4});
 // quad genérico (px0..px1 da imagem) entre z0 e z1
 function quad(px0,px1,py0,py1,z0,z1){const g=new THREE.BufferGeometry(),a=wx(px0),b=wx(px1),y0=wy(py1),y1=wy(py0);
  g.setAttribute('position',new THREE.Float32BufferAttribute([a,y0,z0,b,y0,z1,b,y1,z1,a,y1,z0],3));
  const u0=px0/W,u1=px1/W,v0=1-py1/H,v1=1-py0/H;g.setAttribute('uv',new THREE.Float32BufferAttribute([u0,v0,u1,v0,u1,v1,u0,v1],2));
  g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();const m=new THREE.Mesh(g,M({map:F,roughness:.85}));m.receiveShadow=true;G.add(m);return m;}
 // corpo
 box(xR-xL,HT,D,verm,0,HT/2,-D/2-1.25,G);box(xR-xL+.1,.08,D,branco,0,HT+.04,-D/2-1.25,G);
 // ===== 2º pavimento =====
 const RB=1.2;
 face(F,L,108,R,232,0,G);                           // platibanda + beiral (borda branca)
 const sof=new THREE.Mesh(new THREE.PlaneGeometry(wx(736)-wx(82),RB),branco);sof.rotation.x=Math.PI/2;sof.position.set((wx(82)+wx(736))/2,wy(232),-RB/2);G.add(sof);
 for(const px of [181,409,637]){const l=new THREE.Mesh(new THREE.CircleGeometry(.07,16),M({color:0xffffff,emissive:0xfff2cc,emissiveIntensity:2}));l.rotation.x=Math.PI/2;l.position.set(wx(px),wy(232)-.01,-.6);G.add(l);}
 face(F,82,232,736,420,-RB,G);                      // parede do fundo c/ 3 janelas
 face(F,L,232,82,420,0,G);face(F,736,232,R,420,0,G);  // pilares laterais
 box(.05,wy(232)-wy(420),RB,verm,wx(82)+.025,(wy(232)+wy(420))/2,-RB/2,G);box(.05,wy(232)-wy(420),RB,verm,wx(736)-.025,(wy(232)+wy(420))/2,-RB/2,G);
 box(wx(736)-wx(82),.02,RB,M({color:0xb8b4ac}),(wx(82)+wx(736))/2,wy(420)+.01,-RB/2,G); // piso sacada
 // guarda-corpo 3D
 const gx0=wx(84),gx1=wx(734),gy=wy(420),gh=1.0,gz=-.12;
 box(gx1-gx0,.05,.05,preto,(gx0+gx1)/2,gy+gh,gz,G);box(gx1-gx0,.04,.04,preto,(gx0+gx1)/2,gy+.08,gz,G);
 for(let i=0;i<=6;i++){const x=gx0+(gx1-gx0)*i/6;box(.05,gh,.05,preto,x,gy+gh/2,gz,G);}
 const vid=new THREE.Mesh(new THREE.PlaneGeometry(gx1-gx0,gh-.1),M({color:0x223040,transparent:true,opacity:.25,roughness:.1}));vid.position.set((gx0+gx1)/2,gy+gh/2,gz);G.add(vid);
 // ===== térreo =====
 const zO=-.3,zI=-.9;
 face(F,L,420,R,510,0,G);                           // laje/faixa + beiral branco
 const s2=new THREE.Mesh(new THREE.PlaneGeometry(xR-xL,-zO),branco);s2.rotation.x=Math.PI/2;s2.position.set(0,wy(510),zO/2);G.add(s2);
 face(F,L,510,R,605,zO,G);                          // Pauli / CALÇADOS
 quad(L,62,605,840,zO,zO);quad(62,290,605,840,zO,zI);quad(290,528,605,840,zI,zI);quad(528,760,605,840,zI,zO);quad(760,R,605,840,zO,zO);
 const lt=new THREE.Mesh(new THREE.PlaneGeometry(wx(528)-wx(62),zO-zI),verm);lt.rotation.x=Math.PI/2;lt.position.set((wx(62)+wx(528))/2,wy(605),(zO+zI)/2);G.add(lt);
 box(wx(R)-wx(L),.04,1,M({color:0xb8b4ac}),0,.02,-.6,G);  // piso do recuo
 // calçada + meio-fio
 const c=new THREE.Mesh(new THREE.PlaneGeometry(xR-xL,3),M({map:tex(256,256,(g,w,h)=>{g.fillStyle='#9a9894';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=-64;x<w;x+=64){const o=(y/32)%2?32:0,s=190+Math.random()*20;g.fillStyle=`rgb(${s},${s-2},${s-6})`;g.fillRect(x+o+2,y+2,60,28);}},10,4)}));c.rotation.x=-Math.PI/2;c.position.set(0,.01,1.5);c.receiveShadow=true;G.add(c);
 box(xR-xL,.15,.2,M({color:0xb9b5ad}),0,.075,3,G);
 return G;}
