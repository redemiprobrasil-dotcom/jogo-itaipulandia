// Bazzar + garagem com toldo — Rua Castro Alves. Fachada aprovada 1280x720 (~82.5 px/m; porta ~2.5 m). Coordenadas abaixo em px de 1024x576 (k=1.25).
// Loja turquesa: fachada da foto num volume. Garagem: oitão preto da foto + toldo, pilares, paredes e fundo em 3D (pilar central na posição da foto REAL, ~35% da largura).
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyCinza,paver,tex,noise,reboco} from '../shared/facade.js';
const k=1.25;
export async function buildBazzar(base='./'){
 const G=new THREE.Group();G.name='bazzar';
 const F=await fotoTex(base+'fachada_v1.jpg',skyCinza,.3);
 const mp=mapper({PX:66*k,GX:513*k,GY:493*k,W:1280,H:720});
 const wx=p=>mp.wx(p*k),wy=p=>mp.wy(p*k),face=(a,b,c,d,z)=>mp.face(F,a*k,b*k,c*k,d*k,z,G,true);
 const D=12,amar=M({map:reboco('#b8962e',3)}),preto=M({color:0x1b1b1b}),cinza=M({color:0x8d9192,roughness:.7,metalness:.3});
 // ---- loja turquesa (x 8..458)
 const lx0=wx(8),lx1=wx(458),lw=lx1-lx0,lc=(lx0+lx1)/2;
 face(8,100,458,493,.13);
 const turq=M({map:reboco('#14a8b8',3)});box(lw,wy(220),D,turq,lc,wy(220)/2,-D/2,G);
 // empena e telhado 2 águas cinza
 const ga=wy(130)-wy(220),hw=lw/2+.3,sl=Math.hypot(hw,ga),ang=Math.atan2(ga,hw);
 for(const s of[-1,1]){const t=box(sl,.06,D+.3,cinza,lc+s*hw/2,wy(220)+ga/2+.05,-D/2+.15,G);t.rotation.z=-s*ang;}
 const sh=new THREE.Shape();sh.moveTo(-lw/2,0);sh.lineTo(lw/2,0);sh.lineTo(0,ga);sh.closePath();
 const emp=new THREE.Mesh(new THREE.ShapeGeometry(sh),turq);emp.position.set(lc,wy(220),-D+.01);emp.rotation.y=Math.PI;G.add(emp);
 // interior escuro atrás da porta (x 262..395) e vitrine
 const dx0=wx(262),dx1=wx(395);box(dx1-dx0,.02,3,M({color:0xb8b4ac}),(dx0+dx1)/2,.01,-1.5,G);
 box(dx1-dx0,wy(320),.05,M({color:0x2a2a2a}),(dx0+dx1)/2,wy(320)/2,-3,G);
 // ---- garagem (x 458..1018)
 const gx0=wx(458),gx1=wx(1018),gw=gx1-gx0,gc=(gx0+gx1)/2,gh=wy(245);
 face(462,110,1018,245,.02); // oitão preto da foto
 const vg=box(gw,.25,.2,preto,gc,gh-.12,-.1,G); // viga sob oitão
 const gh2=wy(110)-wy(245);
 for(const s of[-1,1]){const h2=gw/2+.3,a2=Math.atan2(gh2,h2),t=box(Math.hypot(h2,gh2),.06,D+.3,cinza,gc+s*h2/2,gh+gh2/2+.05,-D/2+.15,G);t.rotation.z=-s*a2;}
 const sh2=new THREE.Shape();sh2.moveTo(-gw/2,0);sh2.lineTo(gw/2,0);sh2.lineTo(0,gh2);sh2.closePath();
 const e2=new THREE.Mesh(new THREE.ShapeGeometry(sh2),preto);e2.position.set(gc,gh,-D+.01);e2.rotation.y=Math.PI;G.add(e2);
 // forro
 box(gw,.05,D,M({color:0x4a4740}),gc,gh-.02,-D/2,G);
 // paredes laterais amarelas com rodapé preto, fundo
 for(const x of[gx0+.08,gx1-.08]){box(.16,gh,D,amar,x,gh/2,-D/2-.1,G);box(.18,.5,D,preto,x,.25,-D/2-.1,G);}
 box(gw,gh,.16,amar,gc,gh/2,-D+.08,G);
 // muro baixo de azulejo branco no fundo (x 515..677 na arte)
 const az=tex(256,128,(g,w,h)=>{g.fillStyle='#9a9a98';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32){g.fillStyle='#f1f0ec';g.fillRect(x+1,y+1,30,30);}},4,1);
 box(wx(677)-wx(515),1.1,.25,M({map:az,roughness:.4}),(wx(515)+wx(677))/2,.55,-D+1.5,G);
 // parede recuada à direita com janela gradeada (x 868..988)
 const rx0=wx(868),rx1=gx1-.16;box(rx1-rx0,gh,.16,amar,(rx0+rx1)/2,gh/2,-2.2,G);box(rx1-rx0,.5,.18,preto,(rx0+rx1)/2,.25,-2.2,G);
 const jx=(wx(885)+wx(985))/2,jw=wx(985)-wx(885),jy=(wy(328)+wy(405))/2,jh=wy(328)-wy(405);
 box(jw,jh,.05,M({color:0x3a3d40}),jx,jy,-2.11,G);const bar=M({color:0xf0f0f0,metalness:.4,roughness:.5});
 for(let i=0;i<=8;i++)box(.025,jh,.03,bar,jx-jw/2+i*jw/8,jy,-2.08,G);for(let i=0;i<=3;i++)box(jw,.025,.03,bar,jx,jy-jh/2+i*jh/3,-2.08,G);
 // piso cerâmico
 const pc=tex(256,256,(g,w,h)=>{g.fillStyle='#6f6d68';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=64)for(let x=0;x<w;x+=64){const s=150+Math.random()*20;g.fillStyle=`rgb(${s},${s-4},${s-12})`;g.fillRect(x+1,y+1,62,62);}},gw/1.2,D/1.2);
 const pi=new THREE.Mesh(new THREE.PlaneGeometry(gw,D),M({map:pc,roughness:.5}));pi.rotation.x=-Math.PI/2;pi.position.set(gc,.03,-D/2);pi.receiveShadow=true;G.add(pi);
 // pilares amarelos base preta (frente): central a ~35% (foto real) + direito
 const pa=M({color:0xe8c33c});
 for(const x of[gx0+.35*gw,gx1-.2]){box(.3,gh-.9,.3,pa,x,.9+(gh-.9)/2,-.2,G);box(.32,.9,.32,preto,x,.45,-.2,G);}
 // toldo de lona creme com babado recortado
 const lona=M({color:0xeee3c6,roughness:1,side:THREE.DoubleSide}),tz=1.5,ty0=wy(242),ty1=wy(290);
 const tl=new THREE.Mesh(new THREE.PlaneGeometry(gw+.1,Math.hypot(tz,ty0-ty1)),lona);tl.rotation.x=-Math.PI/2+Math.atan2(ty0-ty1,tz);tl.position.set(gc,(ty0+ty1)/2,tz/2);tl.castShadow=true;G.add(tl);
 const bt=tex(512,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#ece0c2';g.fillRect(0,0,w,h*.45);for(let x=0;x<w;x+=32){g.beginPath();g.arc(x+16,h*.45,16,0,Math.PI);g.fill();}},gw/2.6,1);
 const ba=new THREE.Mesh(new THREE.PlaneGeometry(gw+.1,.3),M({map:bt,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));ba.position.set(gc,ty1-.15,tz);G.add(ba);
 for(const x of[gx0+.05,gx1-.05]){const ar=box(.03,.03,tz,cinza,x,(ty0+ty1)/2,tz/2,G);ar.rotation.x=Math.atan2(ty0-ty1,tz);}
 // calçada paver cinza + faixa amarela + meio-fio
 const W=gx1-lx0,cx=(lx0+gx1)/2,cal=3;
 const pv=tex(256,256,(g,w,h)=>{g.fillStyle='#6c6a66';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=-32;x<w;x+=64){const o=(y/32)%2?32:0,v=140+Math.random()*30;g.fillStyle=`rgb(${v},${v-2},${v-6})`;g.fillRect(x+o+2,y+2,60,28);}},W/1.2,cal/1.2);
 const ca=new THREE.Mesh(new THREE.PlaneGeometry(W,cal),M({map:pv}));ca.rotation.x=-Math.PI/2;ca.position.set(cx,.12,cal/2);ca.receiveShadow=true;G.add(ca);
 const fa=new THREE.Mesh(new THREE.PlaneGeometry(W,.3),M({color:0xc9a43a}));fa.rotation.x=-Math.PI/2;fa.position.set(cx,.125,1.2);G.add(fa);
 box(W,.15,.15,M({color:0xb5b2aa}),cx,.075,cal+.07,G);
 return G;}
