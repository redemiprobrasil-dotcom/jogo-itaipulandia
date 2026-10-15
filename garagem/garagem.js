// Muro + portão "GARAGEM" — Av. Tiradentes, após o muro perimetral do Gaúcho. Imagem 1024x576, ~76 px/m (muro 2.2 m, lote ~12.2 m).
// Poste e pilar de tijolo à esquerda pertencem ao Gaúcho (excluídos).
import * as THREE from 'three';
import {M,box,mapper,fotoTex,reboco,paver} from '../shared/facade.js';
export async function buildGaragem(url='./fachada_garagem.jpg'){
 const G=new THREE.Group();G.name='garagem';
 const F=await fotoTex(url);const {wx,wy,face}=mapper({PX:76,GX:544,GY:428,W:1024,H:576});
 const rosa=M({map:reboco('#e2b3ae')}),x0=wx(80),x1=wx(1008),HW=wy(260);
 // muro, portão recuado, pilar final
 box(wx(608)-x0,HW,.2,rosa,(x0+wx(608))/2,HW/2,-.1,G);face(F,80,260,608,428,.001,G);
 box(wx(922)-wx(608),wy(262),.06,M({color:0x8a3f2c}),(wx(608)+wx(922))/2,wy(262)/2,-.1,G);face(F,608,262,922,428,-.069,G);
 box(wx(1008)-wx(922),wy(245),.4,rosa,(wx(922)+wx(1008))/2,wy(245)/2,-.15,G);face(F,922,245,1008,435,.051,G);
 // gradil 3D sobre o muro + concertina
 const fer=M({color:0x5a3b2a,metalness:.4,roughness:.6}),FH=1.15,n=Math.floor((wx(600)-x0)/.13);
 const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.02,FH,.02),fer,n),m4=new THREE.Matrix4();
 for(let i=0;i<n;i++){m4.makeTranslation(x0+.05+i*.13,HW+FH/2,-.1);im.setMatrixAt(i,m4);}G.add(im);
 for(const y of[HW+.08,HW+FH-.15])box(wx(600)-x0,.03,.03,fer,(x0+wx(600))/2,y,-.1,G);
 for(const x of[x0+.05,wx(330),wx(598)])box(.06,FH+.1,.06,fer,x,HW+FH/2,-.1,G);
 const nc=Math.floor((wx(600)-x0)/.3),coil=new THREE.InstancedMesh(new THREE.TorusGeometry(.17,.006,4,16),M({color:0x9a9a9a,metalness:.8,roughness:.3}),nc);
 for(let i=0;i<nc;i++){m4.makeRotationY(Math.PI/2+.25);m4.setPosition(x0+.15+i*.3,HW+FH+.12,-.1);coil.setMatrixAt(i,m4);}G.add(coil);
 // telhados baixos atrás do muro (cerâmica marrom)
 const tel=M({color:0x7a4636,roughness:.9}),par=M({color:0xd8cfc4});
 function casa(cx,w,d,z,h,rh){box(w,h,d,par,cx,h/2,z,G);const g=new THREE.ConeGeometry(Math.hypot(w,d)/2*1.05,rh,4,1);g.rotateY(Math.PI/4);const r=new THREE.Mesh(g,tel);r.scale.set(w/d,1,1);r.position.set(cx,h+rh/2,z);r.castShadow=true;G.add(r);}
 casa(wx(230),4.5,7,-5.5,2.3,1.2);casa(wx(570),7.5,8,-5.5,2.4,1.1);
 // pinheiro (araucária-de-norfolk) e palmeira simples
 const pin=new THREE.Group();pin.position.set(wx(565),0,-7.5);G.add(pin);
 const tp=new THREE.Mesh(new THREE.CylinderGeometry(.1,.2,9,6),M({color:0x5a4434}));tp.position.y=4.5;pin.add(tp);
 for(let i=0;i<9;i++){const r=1.9*(1-i/10)+.25,c=new THREE.Mesh(new THREE.ConeGeometry(r,1.1,7),M({color:0x2f5a2c,flatShading:true}));c.position.y=3.2+i*.7;pin.add(c);}
 const pal=new THREE.Group();pal.position.set(wx(690),0,-6);G.add(pal);
 const pt=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,7,8),M({color:0x9a8c78}));pt.position.y=3.5;pal.add(pt);
 const fo=M({color:0x4a7a32,side:THREE.DoubleSide});for(let k=0;k<11;k++){const f=new THREE.Mesh(new THREE.PlaneGeometry(.45,2.6),fo);f.position.y=7;f.rotation.y=k*.57;f.rotateX(1.15);f.translateY(1.2);pal.add(f);}
 // chão interno + calçada
 const lt=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,14),M({color:0x857a6c}));lt.rotation.x=-Math.PI/2;lt.position.set((x0+x1)/2,.005,-7.2);G.add(lt);
 const c=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0+2,2.6),M({map:paver(10,2)}));c.rotation.x=-Math.PI/2;c.position.set((x0+x1)/2,.01,1.3);c.receiveShadow=true;G.add(c);
 box(x1-x0+2,.15,.2,M({color:0xb9b5ad}),(x0+x1)/2,.075,2.7,G);
 return G;}
