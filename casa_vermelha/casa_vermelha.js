// Casa vermelha térrea — Rua Castro Alves (entre Bazzar e o gramado do bar). Fachada = imagem aprovada do usuário (1079x636; coords em px da visualização 1024x604, k=1079/1024).
// Metros, origem no centro do alinhamento frontal do lote, +z = rua. Lote 16 m, casa recuada 5 m. Parede: ~51.7 px/m.
import * as THREE from 'three';
import {tex,noise,M,box,mapper,fotoTex,reboco} from '../shared/facade.js';
const k=1079/1024;
function telha(rx=3,ry=3){return tex(256,256,(g,w,h)=>{g.fillStyle='#c4532c';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=21){const s=Math.random()*25;g.fillStyle=`rgb(${215-s},${92-s*.6},${50-s*.4})`;g.fillRect(x+(y/16%2)*10,y,19,13);g.fillStyle='rgba(90,30,10,.4)';g.fillRect(x+(y/16%2)*10,y+12,19,3);}},rx,ry);}
function hip(L,D,h,mat,cx,y0,cz,p){const r=Math.max(0,(L-D)/2),a=L/2,b=D/2;
 const v=[-a,0,b, a,0,b, r,h,0, -r,h,0,  a,0,-b, -a,0,-b, -r,h,0, r,h,0,  -a,0,-b, -a,0,b, -r,h,0,  a,0,b, a,0,-b, r,h,0];
 const idx=[0,1,2,0,2,3, 4,5,6,4,6,7, 8,9,10, 11,12,13];const uv=[];for(let i=0;i<v.length;i+=3)uv.push(v[i]/2,(v[i+2]+v[i+1])/2);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,mat);mat.side=THREE.DoubleSide;m.position.set(cx,y0,cz);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
export async function buildCasaVermelha(base='./'){
 const G=new THREE.Group();G.name='casa_vermelha';const W=16,x0=-8,x1=8;
 let seed=11;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const F=await fotoTex(base+'fachada.jpg');
 const mp=mapper({PX:51.7*k,GX:541*k,GY:365*k,W:1079,H:636});
 const wx=p=>mp.wx(p*k),wy=p=>mp.wy(p*k);
 const zf=-5,hx0=wx(148),hx1=wx(715),hw=hx1-hx0,cx=(hx0+hx1)/2,H=wy(215),D=10;
 const verm=M({map:reboco('#b3231b',2)}),branco=M({color:0xf2f0ea}),tel=M({map:telha(),roughness:.8}),forro=M({color:0xece6dc});
 const luz=M({color:0xffffff,emissive:0xffd9a0,emissiveIntensity:2.5});
 // gramado do quintal
 const grama=tex(512,512,(g,w,h)=>noise(g,w,h,'#4f8a2e',.15,30000),4,4);
 const ch=new THREE.Mesh(new THREE.PlaneGeometry(W,19),M({map:grama,roughness:1}));ch.rotation.x=-Math.PI/2;ch.position.set(0,.01,-9.5);ch.receiveShadow=true;G.add(ch);
 // ===== casa principal: fachada da foto (parede y 215..365) em z=zf
 mp.face(F,148*k,215*k,715*k,365*k,zf+.005,G);
 box(hw,H,D-.02,verm,cx,H/2,zf-D/2-.01,G);
 // telhado 4 águas + beiral com forro e spots
 const ov=.7;hip(hw+2*ov,D+2*ov,2.1,tel,cx,H,zf-D/2,G);
 box(hw+2*ov,.12,.04,M({color:0xb44a28}),cx,H-.04,zf+ov,G);
 box(hw+2*ov,.03,D+2*ov,forro,cx,H-.1,zf-D/2,G);
 for(let i=0;i<9;i++){const s=new THREE.Mesh(new THREE.CircleGeometry(.05,12),luz);s.rotation.x=Math.PI/2;s.position.set(hx0+.6+i*(hw-1.2)/8,H-.12,zf+ov/2);G.add(s);}
 // ===== garagem aberta à direita: x hx1..7.7, telhado mais baixo
 const gx0=hx1,gx1=7.75,gw=gx1-gx0,gc=(gx0+gx1)/2,gD=8,gH=H-.15,gz=zf+.6;
 box(gw,.04,gD+.6,M({map:tex(256,256,(g,w,h)=>{g.fillStyle='#bdb8b0';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=64)for(let x=0;x<w;x+=64){const v=228+Math.random()*12;g.fillStyle=`rgb(${v},${v},${v-4})`;g.fillRect(x+2,y+2,60,60);}},gw/.6,(gD+.6)/.6),roughness:.35}),gc,.03,gz-gD/2-.3,G);
 box(gw,gH,.2,verm,gc,gH/2,gz-gD-.1,G);// parede do fundo
 box(.25,gH,.25,branco,gx1-.13,gH/2,gz-.13,G);// pilar branco da frente
 box(.2,1.6,gD-2.6,verm,gx1-.1,.8,gz-1.6-(gD-2.6)/2,G);// muro lateral direito (baixo)
 // portão de ripas branco ao fundo à direita
 for(let i=0;i<14;i++)box(.07,1.7,.04,branco,gx1-.12,.85,gz-gD+.3+i*.14,G);
 // porta branca e vaso no fundo
 box(1,2.15,.05,M({color:0xf4f1ea,roughness:.5}),gx0+.9,1.08,gz-gD+.03,G);box(.04,.04,.12,M({color:0xb8a060,metalness:.8}),gx0+1.3,1.05,gz-gD+.1,G);
 const vaso=new THREE.Mesh(new THREE.CylinderGeometry(.25,.18,.45,16),M({color:0x3a2a22}));vaso.position.set(gx0+2.1,.25,gz-gD+.45);G.add(vaso);
 for(let i=0;i<7;i++){const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.2,0),M({color:0x2e6a26,flatShading:true}));f.position.set(gx0+2.1+(R()-.5)*.35,.65+R()*.5,gz-gD+.45+(R()-.5)*.3);G.add(f);}
 // telhado da garagem (água única caindo p/ frente com laterais) + forro com spots
 const gt=hip(gw+.9,gD+.8,1.1,M({map:telha(2,2),roughness:.8}),gc+.2,gH+.05,gz-gD/2,G);
 box(gw+.9,.04,gD+.8,forro,gc+.2,gH,gz-gD/2,G);box(gw+.9,.14,.04,M({color:0xb44a28}),gc+.2,gH+.05,gz+.4,G);
 for(const z of[-1.5,-4,-6.5])for(const dx of[-1,1]){const s=new THREE.Mesh(new THREE.CircleGeometry(.05,12),luz);s.rotation.x=Math.PI/2;s.position.set(gc+dx*1.1,gH-.025,gz+z);G.add(s);}
 // muro lateral esquerdo e fundo do lote
 const muro=M({color:0xd8d4cc});box(.15,1.8,19,muro,x0+.08,.9,-9.5,G);box(W,1.8,.15,muro,0,.9,-19,G);box(.15,1.8,19-gD-1,muro,x1-.08,.9,-19+(19-gD-1)/2,G);
 // ===== jardim
 const fo=M({color:0x3d7a2a,roughness:.8});
 for(const [x,z] of[[-3.9,-3],[2,-3.3]]){const b=new THREE.Mesh(new THREE.SphereGeometry(.75,20,14),fo);b.position.set(x,.75,z);b.castShadow=true;G.add(b);}
 // palmeiras à esquerda
 const tronco=M({color:0x8a7656}),fp=M({color:0x4c8a30,side:THREE.DoubleSide});
 for(const [x,z,h] of[[-6.6,-3.4,3.3],[-6,-2.8,2.7],[-7.1,-2.6,2.4]]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.06,.1,h,8),tronco);t.position.set(x,h/2,z);t.castShadow=true;G.add(t);
  for(let i=0;i<9;i++){const l=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.22),fp);const a=i/9*Math.PI*2;l.position.set(x+Math.cos(a)*.6,h-.15,z+Math.sin(a)*.6);l.rotation.set(0,-a,-.45);l.rotation.order='YXZ';l.castShadow=true;G.add(l);}}
 // arbusto de flores vermelhas no centro
 const fv=M({color:0x2f6224,flatShading:true}),fl=M({color:0xd8202a,emissive:0x400000});
 for(let i=0;i<10;i++){const b=new THREE.Mesh(new THREE.ConeGeometry(.2,1,5),fv);b.position.set(-1.3+(R()-.5)*1.6,.6+R()*.4,-3.6+(R()-.5)*.8);b.rotation.set((R()-.5)*.9,0,(R()-.5)*.9);b.castShadow=true;G.add(b);}
 for(let i=0;i<14;i++){const f=new THREE.Mesh(new THREE.ConeGeometry(.08,.3,6),fl);f.position.set(-1.3+(R()-.5)*1.8,1.2+R()*.7,-3.6+(R()-.5)*.9);G.add(f);}
 // luzes de chão
 for(const [x,z] of[[-4.2,-2],[-2.2,-1.6],[1.6,-2],[3,-1.4],[-5.4,-1.8]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.12,10),M({color:0x222222}));p.position.set(x,.06,z);G.add(p);const l=new THREE.Mesh(new THREE.CircleGeometry(.05,10),luz);l.rotation.x=-Math.PI/2;l.position.set(x,.125,z);G.add(l);}
 // ===== gradil branco sobre mureta vermelha, pilar com caixa de correio/medidor, portão de correr
 const fz=-.1,gate0=4.4,bm=M({color:0xf2f2ee,roughness:.5,metalness:.2}),gH2=1.5;
 box(gate0-x0,.45,.25,M({color:0xb0221c}),(x0+gate0)/2,.225,fz,G);
 function grade(a,b,y0,z){const n=Math.round((b-a)/.13),bar=new THREE.InstancedMesh(new THREE.BoxGeometry(.04,gH2,.04),bm,n),mt=new THREE.Matrix4();
  for(let i=0;i<n;i++){mt.makeTranslation(a+.06+i*(b-a-.12)/(n-1),y0+gH2/2,z);bar.setMatrixAt(i,mt);}bar.castShadow=true;G.add(bar);
  box(b-a,.05,.05,bm,(a+b)/2,y0+.15,z,G);box(b-a,.05,.05,bm,(a+b)/2,y0+gH2-.12,z,G);}
 grade(x0,-.55,.45,fz);grade(.25,gate0,.45,fz);
 box(.8,1.95,.4,branco,-.15,.98,fz,G);box(.42,.42,.04,M({color:0xdedede,roughness:.3}),-.15,1.55,fz+.21,G);box(.34,.22,.02,M({color:0x6a7880,roughness:.2}),-.15,1.15,fz+.21,G);
 box(.15,1.95,.15,bm,gate0+.08,.98,fz,G);box(.15,1.95,.15,bm,x1-.08,.98,fz,G);
 grade(gate0+.15,x1-.15,.08,fz+.12);box(x1-gate0-.3,.08,.08,bm,(gate0+x1)/2,.06,fz+.12,G);
 box(x1-gate0,.03,.15,M({color:0x777777,metalness:.6}),(gate0+x1)/2,.015,fz+.12,G);// trilho
 // entrada da garagem (piso branco do portão até a garagem)
 box(gw,.04,5,M({color:0xd8d6d0,roughness:.5}),gc,.025,-2.5,G);
 // ===== calçada paver cinza + faixa amarela + meio-fio
 const cal=3,pv=tex(256,256,(g,w,h)=>{g.fillStyle='#4e5560';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=-32;x<w;x+=64){const o=(y/32)%2?32:0,v=110+Math.random()*25;g.fillStyle=`rgb(${v},${v+4},${v+12})`;g.fillRect(x+o+2,y+2,60,28);}},W/1.2,cal/1.2);
 box(W,.12,cal,M({map:pv,roughness:1}),0,.06,cal/2,G);box(W,.01,.3,M({color:0xe5b520}),0,.125,1.6,G);box(W,.2,.15,M({color:0xb4b2ac}),0,.05,cal+.07,G);
 return G;}
