// Lote com portão preto — Rua Castro Alves. Fachada aprovada 745x553 (recorte do usuário), ~65 px/m (muro ~1.8 m, lote ~11.5 m).
// Muros brancos com textura da foto; gradil, portão de barras, poste de madeira, árvores e casa do fundo em 3D simples.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,paver,tex,noise} from '../shared/facade.js';
export async function buildLotePortao(url='./fachada_lote_portao.jpg'){
 const G=new THREE.Group();G.name='lote_portao';
 const F=await fotoTex(url,skyAzul,.55);const {wx,wy,face}=mapper({PX:65,GX:372,GY:418,W:745,H:553});
 const x0=wx(0),x1=wx(745),W=x1-x0,D=22,T=.18,branco=M({color:0xd8d4cc});
 // muros (face da foto + volume)
 face(F,0,325,243,418,.001,G);box(wx(243)-x0,wy(325),T,branco,(x0+wx(243))/2,wy(325)/2,-T/2,G);
 face(F,243,280,267,418,.001,G);box(wx(267)-wx(243),wy(280),T+.06,branco,(wx(243)+wx(267))/2,wy(280)/2,-T/2,G);
 face(F,562,280,590,418,.001,G);box(wx(590)-wx(562),wy(280),T+.06,branco,(wx(562)+wx(590))/2,wy(280)/2,-T/2,G);
 face(F,606,300,745,418,.001,G);box(x1-wx(606),wy(300),T,branco,(wx(606)+x1)/2,wy(300)/2,-T/2,G);
 box(wx(606)-wx(590),wy(300),T,branco,(wx(590)+wx(606))/2,wy(300)/2,-T/2,G);
 // gradil branco de pickets sobre o muro esquerdo
 const gb=M({color:0xf2f2ee}),ry0=wy(325),ry1=wy(290);
 for(let x=x0+.08;x<wx(243);x+=.13)box(.035,ry1-ry0,.035,gb,x,(ry0+ry1)/2,-T/2,G);
 for(const y of[ry0+.08,ry1-.08])box(wx(243)-x0,.04,.03,gb,(x0+wx(243))/2,y,-T/2,G);
 // poste de madeira
 const pm=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,wy(265),8),M({color:0x5e4a38}));pm.position.set(wx(598),wy(265)/2,.05);pm.castShadow=true;G.add(pm);
 // portão preto de barras (duas folhas como na foto aprovada)
 const fe=M({color:0x262626,roughness:.5,metalness:.6}),gx0=wx(267),gx1=wx(562),gy1=wy(284),gz=-T/2;
 for(const y of[.05,gy1-.04,gy1*.55])box(gx1-gx0,.07,.06,fe,(gx0+gx1)/2,y,gz,G);
 for(const x of[gx0+.04,(gx0+gx1)/2,gx1-.04])box(.08,gy1,.08,fe,x,gy1/2,gz,G);
 for(let x=gx0+.16;x<gx1-.1;x+=.15)box(.025,gy1,.025,fe,x,gy1/2,gz,G);
 // quintal de terra
 const terra=tex(512,512,(g,w,h)=>noise(g,w,h,'#9a7a52',.12,20000),4,4);
 const ch=new THREE.Mesh(new THREE.PlaneGeometry(W,D),M({map:terra,roughness:1}));ch.rotation.x=-Math.PI/2;ch.position.set((x0+x1)/2,.01,-D/2);ch.receiveShadow=true;G.add(ch);
 // casinha de tijolo ao fundo (~15 m), telhado de barro 2 águas
 const tij=tex(256,256,(g,w,h)=>{g.fillStyle='#6e4232';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=12)for(let x=-24;x<w;x+=48){const o=(y/12)%2?24:0,s=Math.random()*20;g.fillStyle=`rgb(${140+s},${80+s/2},60)`;g.fillRect(x+o+1,y+1,46,10);}},3,2);
 const hz=-15,hw=wx(510)-wx(318),hd=6,hh=2.7,hx=(wx(318)+wx(510))/2;box(hw,hh,hd,M({map:tij}),hx,hh/2,hz-hd/2,G);
 const dk=M({color:0x2a1c16});for(const x of[-2,-.4])box(.9,1.1,.05,dk,hx+x,1.5,hz+.02,G);box(1.6,1.9,.05,dk,hx+1.7,.95,hz+.02,G);
 const tm=M({color:0xa8502e,side:THREE.DoubleSide}),rh=1.2,sl=Math.hypot(hd/2+.4,rh);
 for(const s of[-1,1]){const r=new THREE.Mesh(new THREE.PlaneGeometry(hw+.6,sl),tm);r.rotation.order='YXZ';r.rotation.x=-Math.PI/2+s*Math.atan2(rh,hd/2+.4);r.position.set(hx,hh+rh/2,hz-hd/2+s*(hd/4+.2));r.castShadow=true;G.add(r);}
 const emp=new THREE.Shape([new THREE.Vector2(-hd/2,0),new THREE.Vector2(hd/2,0),new THREE.Vector2(0,rh)]);
 for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.ShapeGeometry(emp),M({map:tij,side:THREE.DoubleSide}));e.rotation.y=Math.PI/2;e.position.set(hx+s*hw/2,hh,hz-hd/2);G.add(e);}
 // árvores simples
 const tronco=M({color:0x5a4636}),folha=M({color:0x3f6b2a,flatShading:true}),folha2=M({color:0x6f9a48,flatShading:true});
 function arvore(x,z,h,r,rt,f){const t=new THREE.Mesh(new THREE.CylinderGeometry(rt*.7,rt,h*.55,8),tronco);t.position.set(x,h*.275,z);t.castShadow=true;G.add(t);
  let s=3;const rn=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  for(let i=0;i<7;i++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(r*(.55+rn()*.3),1),f);b.position.set(x+(rn()-.5)*r,h*.55+r*.6+(rn()-.3)*r*.9,z+(rn()-.5)*r*.8);b.castShadow=true;G.add(b);}}
 arvore(wx(610),-2.5,wy(30),2.3,.22,folha);           // árvore grande logo atrás do portão (à direita)
 arvore(wx(62),1.0,wy(195),.9,.05,folha2);             // arvorezinha no canteiro da calçada
 // calçada de paver, canteiro e guia
 const S=2.9,mid=(x0+x1)/2;box(W,.08,S,M({map:paver(12,3),roughness:1}),mid,.04,S/2,G);
 box(1.2,.1,.8,M({color:0xb8b2a8}),wx(62),.05,1.0,G);box(1.0,.11,.6,M({color:0x6a4a32}),wx(62),.06,1.0,G);
 box(W,.16,.15,M({color:0xb0aaa0}),mid,.03,S+.07,G);
 return G;}
