// SKY / Kadu Som / Centro Da Moda — imagem aprovada pelo usuário (610x1024), ~60 px/m, largura ~10 m.
// Parte esquerda (px 0..300) é parede em ângulo; dobra no pilar sob o meio da varanda (x=0).
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,paver} from '../shared/facade.js';
export async function buildSky(url='./fachada_sky.jpg'){
 const G=new THREE.Group();G.name='sky';const ANG=0.28,PLAT=.35; // ~16°, plataforma elevada 35 cm
 const F=await fotoTex(url,skyAzul,.45);const {wx,wy,face}=mapper({PX:60,GX:300,GY:790,W:610,H:1024});
 const verde=M({color:0xd5e3c4}),ver2=M({color:0xa9bf86}),cinza=M({color:0x4a4b4d}),branco=M({color:0xf4f4f2,roughness:.5});
 const R=new THREE.Group(),L=new THREE.Group();G.add(R,L);L.rotation.y=-ANG; // esquerda avança para a rua
 const bodyD=8, yb=wy(540), ytop=wy(345);
 for(const [P,a,b] of [[L,0,300],[R,300,600]]){
  face(F,a,345,b,790,0,P);
  const x0=wx(a),x1=wx(b),w=x1-x0;
  box(w,ytop,bodyD,verde,(x0+x1)/2,ytop/2,-bodyD/2-.06,P);                 // volume
  box(w+.02,.25,1.4,ver2,(x0+x1)/2,ytop+.12,.55,P);                       // beiral grosso
  box(w,.12,.5,ver2,(x0+x1)/2,yb-.06,.25,P);                                // borda da laje (varanda/gradil vêm da foto)
 }
  box(.3,wy(640),.3,cinza,wx(588),wy(640)/2,.15,R);                          // quina da parede cinza escura (face pintada na foto)
 // plataforma de piso + degraus em zigue-zague
 const pis=M({color:0xd9c6b3}),conc=M({color:0xa8a49e});
 box(10.4,PLAT,1.6,pis,0,PLAT/2,.8,G);
 box(5,PLAT*.5,.8,conc,2.6,PLAT*.25,2,G);box(5,PLAT*.5,.5,conc,-2,PLAT*.25,1.85,G);
 const c=new THREE.Mesh(new THREE.PlaneGeometry(12,2.6),M({map:paver(10,2)}));c.rotation.x=-Math.PI/2;c.position.set(0,.01,3.4);c.receiveShadow=true;G.add(c);
 box(12,.15,.2,M({color:0xb9b5ad}),0,.075,4.7,G);box(1.6,.152,.21,M({color:0xd9b24a}),-.5,.076,4.7,G);
 return G;}
