// PRÉDIO CINZA — Av. Tiradentes (depois da Rokeli). Imagem do usuário 1079x809; coords em px da visualização 1024x768 (k=1079/1024). Largura ~13 m (~76.5 px/m).
import * as THREE from 'three';
import {M,box,mapper,fotoTex,tex} from '../shared/facade.js';
const k=1079/1024;
export async function buildPredioCinza(base='./'){
 const G=new THREE.Group();G.name='predio_cinza';
 const F=await fotoTex(base+'fachada.jpg');
 const mp=mapper({PX:76.5*k,GX:512*k,GY:600*k,W:1079,H:809});
 const wx=p=>mp.wx(p*k),wy=p=>mp.wy(p*k),face=(a,b,c,d,z)=>mp.face(F,a*k,b*k,c*k,d*k,z,G);
 const D=16,R=1.5,P=.4,cz=M({color:0xa9a8ad}),cl=M({color:0x9a9a9a}),bc=M({color:0xeeeeee}),forro=M({color:0xe4e2dc});
 const spot=M({color:0xffffff,emissive:0xffe7b0,emissiveIntensity:2});
 const luz=(x,y,z)=>{const s=new THREE.Mesh(new THREE.CircleGeometry(.07,16),spot);s.rotation.x=Math.PI/2;s.position.set(x,y-.001,z);G.add(s);};
 // bloco: retângulo em px -> caixa de profundidade [z0,z1]
 const blk=(a,b,c,d,z0,z1,m=cz)=>{const x0=wx(a),x1=wx(c),y0=wy(d),y1=wy(b);return box(x1-x0,y1-y0,z0-z1,m,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,G);};
 // ---- faces planas da fachada (z=0) + casca de 1.5 m atrás delas
 const planos=[[22,93,198,362],[22,362,45,600],[198,70,460,145],[198,145,262,315],[418,145,460,315],[460,70,1008,128],[460,128,502,272],[688,128,1008,270],[968,270,1008,612]];
 for(const r of planos){face(...r,.01);const t=r[1]==93?80:r[1]==70&&r[0]==198?45:r[1]==70?17:r[1];blk(r[0],t,r[2],r[3],0,-R);}
 // ---- massa principal atrás (z<-R), com o corredor vazado
 blk(22,80,45,600,-R,-D);                 // pilar esquerdo
 blk(45,80,195,362,-R,-D);                // laje sobre o corredor
 blk(195,45,460,600,-R,-D);               // centro
 blk(460,17,1008,600,-R,-D);              // bloco alto direito
 // fundo das varandas (recuadas R) + forro com spots + piso
 face(262,145,418,315,-R+.01);box(wx(418)-wx(262),.1,R,forro,(wx(262)+wx(418))/2,wy(145)-.05,-R/2,G);
 for(const p of[300,380])luz(wx(p),wy(145)-.1,-R/2);
 face(502,128,688,272,-R+.01);box(wx(688)-wx(502),.1,R,forro,(wx(502)+wx(688))/2,wy(128)-.05,-R/2,G);
 for(const p of[575,640])luz(wx(p),wy(128)-.1,-R/2);
 box(wx(688)-wx(502),.05,R,M({color:0xb8b4ac}),(wx(502)+wx(688))/2,wy(272)+.025,-R/2,G);
 // ---- molduras brancas salientes (frente da foto em z=P + laterais/topo em volume)
 face(195,315,460,600,P+.01);face(460,270,968,612,P+.01);
 blk(195,315,198,600,P,0,bc);blk(457,315,460,600,P,0,bc);blk(195,315,460,318,P,0,bc);
 blk(455,270,460,612,P,0,bc);blk(965,270,968,612,P,0,bc);blk(455,270,968,273,P,0,bc);
 box(wx(968)-wx(455),.02,P,bc,(wx(455)+wx(968))/2,wy(270)+.01,P/2,G);
 // ---- brises (pontas de viga escuras) no topo do bloco esquerdo
 const vg=M({color:0x3a3a3a});for(let i=0;i<8;i++){const x=wx(22+i*24.5);box(.14,.2,.45,vg,x,wy(148),.22,G);}
 // ---- corredor coberto à esquerda (aberto até o fundo)
 const x0=wx(45),x1=wx(195),cw=x1-x0,cx=(x0+x1)/2,ch=wy(362);
 const pisoT=tex(256,256,(g,w,h)=>{g.fillStyle='#cdbfa8';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,0,0,.18)';for(let i=0;i<=w;i+=64){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}},cw/1.2,D/1.2);
 const pi=new THREE.Mesh(new THREE.PlaneGeometry(cw,D),M({map:pisoT,roughness:.5}));pi.rotation.x=-Math.PI/2;pi.position.set(cx,.13,-D/2);pi.receiveShadow=true;G.add(pi);
 const fc=new THREE.Mesh(new THREE.PlaneGeometry(cw,D),forro);fc.rotation.x=Math.PI/2;fc.position.set(cx,ch-.01,-D/2);G.add(fc);
 for(let z=-1;z>-D;z-=2.5)luz(cx,ch-.02,z);
 const lamp=new THREE.PointLight(0xffe7b0,4,8);lamp.position.set(cx,ch-.4,-3);G.add(lamp);
 // ---- topo, laterais e calçada
 const pl=M({color:0x6e6e6e});
 box(wx(195)-wx(22),.12,D,pl,(wx(22)+wx(195))/2,wy(80)+.06,-D/2,G);
 box(wx(460)-wx(195),.12,D,pl,(wx(195)+wx(460))/2,wy(45)+.06,-D/2,G);
 box(wx(1008)-wx(460),.12,D,pl,(wx(460)+wx(1008))/2,wy(17)+.06,-D/2,G);
 const W=wx(1008)-wx(15),XC=(wx(15)+wx(1008))/2,cal=3;
 blk(15,470,22,600,.0,-D,M({color:0xd8d6d0}));   // muro baixo à esquerda
 const pv=tex(256,256,(g,w,h)=>{g.fillStyle='#3e434c';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=-32;x<w;x+=64){const o=(y/32)%2?32:0,v=70+Math.random()*25;g.fillStyle=`rgb(${v},${v+5},${v+15})`;g.fillRect(x+o+2,y+2,60,28);}},W/1.2,cal/1.2);
 const ca=new THREE.Mesh(new THREE.PlaneGeometry(W,cal),M({map:pv}));ca.rotation.x=-Math.PI/2;ca.position.set(XC,.12,cal/2);ca.receiveShadow=true;G.add(ca);
 const fa=new THREE.Mesh(new THREE.PlaneGeometry(W,.22),M({color:0xe09a40}));fa.rotation.x=-Math.PI/2;fa.position.set(XC,.125,2.1);G.add(fa);
 box(W,.15,.15,M({color:0xb5b2aa}),XC,.075,cal+.07,G);
 return G;}
