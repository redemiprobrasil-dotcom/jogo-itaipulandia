// Choperia de esquina — Av. Tiradentes (frente) + rua lateral. Varanda aberta térrea.
// Frente: imagem 1024x576, prédio px 22-1015, ~60 px/m (coluna ≈2.9 m). Ponta direita (BRAHMA/SKOL) = esquina.
// Lateral: imagem 1024x576, prédio px 20-1015, ~74 px/m (≈13.4 m de fundo); ponta esquerda = esquina.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,paver} from '../shared/facade.js';
export async function buildChoperia(urlF='./fachada_choperia.jpg',urlL='./lateral_choperia.jpg'){
 const G=new THREE.Group();G.name='choperia';
 const F=await fotoTex(urlF,skyAzul,.5),L=await fotoTex(urlL,skyAzul,.45);
 const PX=60,{wx,wy,face}=mapper({PX,GX:518,GY:450,W:1024,H:576});
 const x0=wx(22),x1=wx(1015),HC=wy(268),D=(1015-20)/74;
 const tijolo=M({color:0xb5643f,roughness:.95}),metal=M({color:0x2f3236,metalness:.4,roughness:.6}),piso=M({color:0x7d7a74,roughness:1});
 // platibanda metálica (frente com foto, sky removido)
 face(F,22,108,1015,268,.31,G,true);
 box(x1-x0,wy(190)-HC,.3,metal,(x0+x1)/2,(wy(190)+HC)/2,.15,G);
 box(wx(1015)-wx(740),wy(110)-wy(155),.3,metal,(wx(740)+wx(1015))/2,(wy(110)+wy(155))/2,.15,G);
 // laje/cobertura sobre a varanda e chão interno
 box(x1-x0,.12,D,M({color:0x3a3c40}),(x0+x1)/2,HC+.06,-D/2,G);
 box(x1-x0,.05,D,piso,(x0+x1)/2,.025,-D/2,G);
 // fundo: interior da foto (mesas, cadeiras) como parede de fundo
 face(F,22,268,1015,450,-D+.05,G).material.side=THREE.DoubleSide;
 // colunas de tijolo 3D (frente com foto)
 for(const [p0,p1] of [[28,52],[248,280],[463,493],[713,741]]){const w=(p1-p0)/PX,cx=wx((p0+p1)/2);box(w,HC,w,tijolo,cx,HC/2,-w/2,G);face(F,p0,268,p1,450,.005,G);}
 // painel de madeira à esquerda (parede)
 box(wx(158)-wx(52),HC,.12,M({color:0x8a5a34}),(wx(52)+wx(158))/2,HC/2,-.08,G);face(F,52,268,158,450,-.015,G);
 // muretas revestidas (frente com foto)
 for(const [p0,p1] of [[493,713],[741,995]]){box(wx(p1)-wx(p0),wy(390),.2,M({color:0xcfc8bc}),wx((p0+p1)/2),wy(390)/2,-.1,G);face(F,p0,390,p1,450,.005,G);}
 // ---- lateral (plano perpendicular em x=x1, voltado para +x; x local → -z)
 const lm=mapper({PX:74,GX:20,GY:437,W:1024,H:576}),side=new THREE.Group();side.rotation.y=Math.PI/2;side.position.set(x1+.31,0,0);G.add(side);
 lm.face(L,20,145,1015,222,0,side,true);
 box(.3,HC-wy(155)+ (wy(155)-HC)+ .9,D,metal,x1+.15,HC+.45,-D/2,G);
 for(const [p0,p1] of [[32,78],[160,192],[358,397],[668,708],[960,1008]]){const w=(p1-p0)/74,z=-lm.wx((p0+p1)/2);box(w,HC,w,tijolo,x1+.3-w/2,HC/2,z,G);lm.face(L,p0,222,p1,437,.005+0,side).position.z=.005;}
 box(.2,wy(362)*0+ (437-362)/74,(975-395)/74,M({color:0xb26a4a}),x1+.2,(437-362)/148,-lm.wx(685),G);lm.face(L,395,362,975,437,.01,side);
 box(.3,(432-360)/74,(205-22)/74,M({color:0xcfc8bc}),x1+.3,(432-360)/148,-lm.wx(113),G);lm.face(L,22,360,205,432,.46,side);
 // parede de fundo lateral (interior vermelho visto pela foto)
 const fb=lm.face(L,192,222,960,362,-(x1-x0)+.4,side);fb.material.side=THREE.DoubleSide;
 // ---- calçadas de paver + meio-fio
 const cf=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0+3.5,3.2),M({map:paver(14,3)}));cf.rotation.x=-Math.PI/2;cf.position.set((x0+x1)/2+1.75,.01,1.6);G.add(cf);
 box(x1-x0+3.5,.012,.15,M({color:0xd9b24a}),(x0+x1)/2+1.75,.015,2.1,G);box(x1-x0+3.5,.15,.2,M({color:0xb9b5ad}),(x0+x1)/2+1.75,.075,3.3,G);
 const cl=new THREE.Mesh(new THREE.PlaneGeometry(3.2,D+1),M({map:paver(3,12)}));cl.rotation.x=-Math.PI/2;cl.position.set(x1+1.9,.011,-D/2+.5);G.add(cl);
 box(.2,.15,D+1,M({color:0xb9b5ad}),x1+3.4,.075,-D/2+.5,G);
 return G;}
