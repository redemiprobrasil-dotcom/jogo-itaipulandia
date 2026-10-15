// Lote vazio — Rua Castro Alves. Tudo procedural. Metros, origem no alinhamento frontal (centro), +z = rua.
import * as THREE from 'three';
import {tex,noise,paver,M,box} from '../shared/facade.js';
export function buildLoteVazio(){
 const G=new THREE.Group(),W=20,D=25,x0=-W/2,x1=W/2;
 // chão de terra
 const terra=tex(512,512,(g,w,h)=>{noise(g,w,h,'#8a5a3e',.12,20000);for(let i=0;i<300;i++){g.fillStyle=`rgba(${100+Math.random()*60},${60+Math.random()*30},40,.25)`;g.beginPath();g.arc(Math.random()*w,Math.random()*h,3+Math.random()*12,0,7);g.fill();}},4,5);
 const ch=new THREE.Mesh(new THREE.PlaneGeometry(W,D),M({map:terra,roughness:1}));ch.rotation.x=-Math.PI/2;ch.position.set(0,.01,-D/2);ch.receiveShadow=true;G.add(ch);
 // moitas de mato baixas (concentradas no fundo e à direita, como na foto)
 const mato=M({color:0x6f8a3c}),mato2=M({color:0x8a9a4a});
 for(let i=0;i<140;i++){const fundo=Math.random()<.5,x=x0+.5+Math.random()*(W-1),z=fundo?-D+.6+Math.random()*4:-2-Math.random()*(D-4);
  if(!fundo&&x<0&&Math.random()<.6)continue;const r=.15+Math.random()*.35,m=new THREE.Mesh(new THREE.SphereGeometry(r,6,4),Math.random()<.5?mato:mato2);m.scale.y=.35+Math.random()*.3;m.position.set(x,0,z);m.castShadow=true;G.add(m);}
 // montinho de terra à esquerda
 const mt=new THREE.Mesh(new THREE.SphereGeometry(1.4,16,8,0,Math.PI*2,0,Math.PI/2),M({color:0x8e5c40,flatShading:true}));mt.scale.set(1.3,.35,1);mt.position.set(x0+2.2,0,-9);mt.castShadow=mt.receiveShadow=true;G.add(mt);
 // muro de tijolo ao fundo com pilares
 const tij=tex(256,256,(g,w,h)=>{g.fillStyle='#7a5446';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=-32;x<w;x+=64){const o=(y/16)%2?32:0,s=Math.random()*25;g.fillStyle=`rgb(${150+s},${85+s/2},${70})`;g.fillRect(x+o+2,y+2,60,13);}},10,2);
 const mm=M({map:tij}),zw=-D;box(W,1.8,.15,mm,0,.9,zw,G);
 for(let x=x0;x<=x1+.01;x+=2.5)box(.3,1.9,.3,M({color:0x8a5444}),x,.95,zw,G);
 // gradil enferrujado sobre mureta de tijolo (frente esquerda, ~7 m)
 const gx0=x0,gx1=x0+7,gz=-.25,fer=M({color:0x6e3424,roughness:.7,metalness:.4});
 box(7,.15,.25,M({map:tij,color:0xc08070}),(gx0+gx1)/2,.075,gz,G);
 box(7,.04,.04,fer,(gx0+gx1)/2,.25,gz,G);box(7,.04,.04,fer,(gx0+gx1)/2,1.05,gz,G);
 for(let x=gx0+.06;x<=gx1;x+=.12)box(.018,.9,.018,fer,x,.6,gz,G);
 for(let x=gx0;x<=gx1+.01;x+=2.33)box(.05,1,.05,fer,x,.6,gz,G);
 // árvore seca (~7 m) à direita do centro
 const casca=M({color:0x9a9086}),tr=new THREE.Group();tr.position.set(3,0,-9);G.add(tr);
 function galho(p,len,r,dep){const g=new THREE.Mesh(new THREE.CylinderGeometry(r*.6,r,len,6),casca);g.position.y=len/2;g.castShadow=true;p.add(g);const e=new THREE.Group();e.position.y=len;p.add(e);
  if(dep>0){const n=dep>3?2:3;for(let i=0;i<n;i++){const s=new THREE.Group();s.rotation.set((Math.random()-.5)*1.3,Math.random()*6.3,(Math.random()*.5+.35)*(Math.random()<.5?-1:1));e.add(s);galho(s,len*(.62+Math.random()*.15),r*.6,dep-1);}}}
 let seed=7;const rnd=Math.random;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 galho(tr,3.6,.14,5);Math.random=rnd;
 // calçada de paver com borda cor de tijolo + guia
 const S=3.2,mid=(x0+x1)/2;box(W,.08,S,M({map:paver(14,3),roughness:1}),mid,.04,S/2+.1,G);
 const borda=M({color:0xa85a3c});box(W,.085,.3,borda,mid,.045,.25,G);box(W,.085,.25,borda,mid,.045,S-.2,G);
 box(W,.16,.15,M({color:0xb0aaa0}),mid,.03,S+.15,G);
 return G;}
